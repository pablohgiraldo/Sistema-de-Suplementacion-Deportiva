import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { CartProvider, useCart } from './contexts/CartContext.jsx';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroBanner from './components/HeroBanner';
import ProductCarousel from './components/ProductCarousel';
import ProductModal from './components/ProductModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ProductCard from './components/productCard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import { useEffect, useState } from 'react';
import api from './services/api';

function AppContent() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("Todos los Productos");
  const [selectedFilter, setSelectedFilter] = useState("Todos los Productos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // No mostrar header en carrito, login, registro y admin
  const shouldShowHeader = !['/cart', '/login', '/register', '/admin'].includes(location.pathname);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedFilter(category);
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <AuthenticatedApp
        shouldShowHeader={shouldShowHeader}
        onCategoryClick={handleCategoryClick}
        onFilterClick={handleFilterClick}
        selectedCategory={selectedCategory}
        selectedFilter={selectedFilter}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onShowLogin={handleShowLogin}
        onShowRegister={handleShowRegister}
        setShowLogin={setShowLogin}
        setShowRegister={setShowRegister}
      />
    </div>
  );
}

function AuthenticatedApp({
  shouldShowHeader,
  onCategoryClick,
  onFilterClick,
  selectedCategory,
  selectedFilter,
  onSearch,
  searchQuery,
  onShowLogin,
  onShowRegister,
  setShowLogin,
  setShowRegister
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, openCart, getCartItemsCount, loadCartFromBackend } = useCart();

  // Cargar carrito cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromBackend();
    }
  }, [isAuthenticated]); // Solo depende de isAuthenticated

  const handleLogout = () => {
    logout();
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <>
      {shouldShowHeader && (
        <Header
          onCategoryClick={onCategoryClick}
          onFilterClick={onFilterClick}
          selectedCategory={selectedCategory}
          selectedFilter={selectedFilter}
          user={user}
          isAuthenticated={isAuthenticated}
          onShowLogin={onShowLogin}
          onShowRegister={onShowRegister}
          onLogout={handleLogout}
          onOpenCart={openCart}
          cartItemsCount={getCartItemsCount()}
          onSearch={onSearch}
          searchQuery={searchQuery}
        />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:productId"
          element={<ProductDetail />}
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        if (response.data.success && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          console.error("Formato de respuesta inesperado:", response.data);
          setError("Formato de respuesta inesperado del servidor");
        }
      } catch (err) {
        console.error("Error cargando productos:", err);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <main className="w-full p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Cargando productos...</div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full">
      <HeroBanner />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Catálogo SuperGains</h1>
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No hay productos disponibles
          </div>
        ) : (
          <>
            <ProductCarousel
              products={products.slice(0, 6)}
              title="Productos Destacados"
              subtitle="Los mejores suplementos para tu rendimiento"
            />
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {products.map(p => <ProductCard key={p._id} p={p} />)}
            </div>
          </>
        )}
      </div>

      {/* Sección Nosotros */}
      <section id="nosotros" className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sobre SuperGains</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Somos la tienda líder en suplementos deportivos y nutrición. Nuestra misión es ayudarte a alcanzar tus objetivos de fitness con productos de la más alta calidad.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Premium</h3>
              <p className="text-gray-600">Productos de las mejores marcas del mercado</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
              <p className="text-gray-600">Entrega en 24-48 horas en toda Colombia</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Resultados Garantizados</h3>
              <p className="text-gray-600">Productos que realmente funcionan</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
