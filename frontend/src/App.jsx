import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { CartProvider, useCartSafe } from './contexts/CartContext.jsx';
import Header from './components/Header';
import AdminHeader from './components/AdminHeader';
import Footer from './components/Footer';
import HeroBanner from './components/HeroBanner';
import ProductCarousel from './components/ProductCarousel';
import ProductModal from './components/ProductModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ProductCard from './components/productCard';
import ProductGrid from './components/ProductGrid';
import PageLoader from './components/PageLoader';
import LazyErrorBoundary from './components/LazyErrorBoundary';
import ErrorBoundary from './components/ErrorBoundary';
import TawkToChat from './components/TawkToChat';
import Testimonials from './components/Testimonials';
import MaintenancePage from './components/MaintenancePage';
import { useProducts } from './hooks/useProducts';
import { useMaintenanceMode } from './hooks/useMaintenanceMode';
import { preloadCriticalComponents, preloadAdminComponents, preloadProductComponents } from './utils/preloadComponents';

// Lazy loading de páginas
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Admin = lazy(() => import('./pages/Admin'));
const Reports = lazy(() => import('./pages/Reports'));
const Users = lazy(() => import('./pages/Users'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const PaymentConfirmation = lazy(() => import('./pages/PaymentConfirmation'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Support = lazy(() => import('./pages/Support'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'));
const AdminCustomerRecommendations = lazy(() => import('./pages/AdminCustomerRecommendations'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminContact = lazy(() => import('./pages/AdminContact'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));

function AppContent() {
  const location = useLocation();
  const { isLoading: authLoading } = useAuth();
  const { isMaintenanceMode } = useMaintenanceMode();
  const [selectedCategory, setSelectedCategory] = useState("Todos los Productos");
  const [selectedFilter, setSelectedFilter] = useState("Todos los Productos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Determinar qué header mostrar
  const shouldShowHeader = !['/login', '/register'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  // Preload de componentes según la ruta actual
  useEffect(() => {
    // Preload de componentes críticos siempre
    preloadCriticalComponents();

    // Preload específico según la ruta
    if (location.pathname === '/') {
      preloadProductComponents();
    } else if (location.pathname === '/admin') {
      preloadAdminComponents();
    }
  }, [location.pathname]);

  // Mostrar página de mantenimiento si está activada
  if (isMaintenanceMode) {
    return <MaintenancePage />;
  }

  // Mostrar loading mientras se valida la autenticación
  if (authLoading) {
    return <PageLoader />;
  }

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
        isAdminPage={isAdminPage}
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
  isAdminPage,
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
  const { cartItems, openCart, getCartItemsCount, loadCartFromBackend } = useCartSafe();

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
        <>
          {isAdminPage ? (
            <AdminHeader
              user={user}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              onSearch={onSearch}
              searchQuery={searchQuery}
            />
          ) : (
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
        </>
      )}
      <LazyErrorBoundary>
        <Suspense fallback={<PageLoader message="Cargando página..." />}>
          <Routes>
            <Route path="/" element={<HomePage searchQuery={searchQuery} selectedFilter={selectedFilter} />} />
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
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <Reports />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminRoute>
                  <AdminCustomers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers/:customerId/recommendations"
              element={
                <AdminRoute>
                  <AdminCustomerRecommendations />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/contact"
              element={
                <AdminRoute>
                  <AdminContact />
                </AdminRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-confirmation"
              element={
                <ProtectedRoute>
                  <PaymentConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:orderId/tracking"
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </Suspense>
      </LazyErrorBoundary>
      <Footer />
    </>
  );
}

function HomePage({ searchQuery, selectedFilter }) {
  // Usar React Query para obtener productos
  const { data: productsData, isLoading: loading, error } = useProducts();

  // Extraer productos de la respuesta
  const allProducts = productsData?.data || [];

  // Filtrar productos por búsqueda y categoría
  const products = allProducts.filter(product => {
    // Filtro de búsqueda - usando los nombres correctos de las propiedades del backend
    const searchLower = searchQuery?.toLowerCase() || '';
    const matchesSearch = !searchQuery || searchQuery.trim() === '' ||
      product.name?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower) ||
      (product.categories && product.categories.some(cat => cat.toLowerCase().includes(searchLower)));

    // Si hay búsqueda activa, solo aplicar filtro de búsqueda
    if (searchQuery && searchQuery.trim() !== '') {
      return matchesSearch;
    }

    // Si no hay búsqueda, aplicar filtro de categoría
    const filterLower = selectedFilter?.toLowerCase() || '';
    const productCategories = product.categories || [];
    const categoryMatch = productCategories.some(cat => cat.toLowerCase().includes(filterLower));

    const matchesFilter = selectedFilter === "Todos los Productos" ||
      categoryMatch ||
      (selectedFilter === "Más Vendidos" && product.stock > 50) ||
      (selectedFilter === "Proteínas" && (categoryMatch || product.name?.toLowerCase().includes("proteína") || product.name?.toLowerCase().includes("protein"))) ||
      (selectedFilter === "Vitaminas y Más" && (categoryMatch || product.name?.toLowerCase().includes("vitamina"))) ||
      (selectedFilter === "Rendimiento" && categoryMatch) ||
      (selectedFilter === "Alimentos y Snacks" && (categoryMatch || product.name?.toLowerCase().includes("snack"))) ||
      (selectedFilter === "Barras de Proteína" && (categoryMatch || product.name?.toLowerCase().includes("barra") || product.name?.toLowerCase().includes("bar"))) ||
      (selectedFilter === "Outlet" && product.price < 50000) ||
      (selectedFilter === "Vegano" && (product.name?.toLowerCase().includes("vegan") || categoryMatch));

    return matchesFilter;
  });

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
            <p>{error?.message || error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full">
      <HeroBanner />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Catálogo SuperGains</h1>
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
            <div id="products-section">
              <ProductGrid
                products={products}
                className="mt-6 sm:mt-8"
                showTitle={false}
              />
            </div>
          </>
        )}
      </div>

      {/* Sección Nosotros */}
      <section id="nosotros" className="bg-gray-100 py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Sobre SuperGains</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Somos la tienda líder en suplementos deportivos y nutrición. Nuestra misión es ayudarte a alcanzar tus objetivos de fitness con productos de la más alta calidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Calidad Premium</h3>
              <p className="text-sm sm:text-base text-gray-600">Productos de las mejores marcas del mercado</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Envío Rápido</h3>
              <p className="text-sm sm:text-base text-gray-600">Entrega en 24-48 horas en toda Colombia</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Resultados Garantizados</h3>
              <p className="text-sm sm:text-base text-gray-600">Productos que realmente funcionan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Testimonios */}
      <Testimonials />
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
            {/* Widget de chat de soporte Tawk.to */}
            <TawkToChat />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
