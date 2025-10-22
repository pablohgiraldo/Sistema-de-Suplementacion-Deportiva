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
import Testimonials from './components/Testimonials';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ProductCard from './components/productCard';
import ProductGrid from './components/ProductGrid';
import PageLoader from './components/PageLoader';
import LazyErrorBoundary from './components/LazyErrorBoundary';
import TawkToChat from './components/TawkToChat';
import { NotificationProvider } from './components/ui/NotificationContainer';
import { useProducts } from './hooks/useProducts';
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
const LegalNotice = lazy(() => import('./pages/LegalNotice'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Careers = lazy(() => import('./pages/Careers'));

function AppContent() {
  const location = useLocation();
  const { isLoading: authLoading } = useAuth();
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
    <NotificationProvider>
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
            <Route 
              path="/" 
              element={<HomePage 
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                selectedFilter={selectedFilter}
              />} 
            />
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
              path="/orders/:orderId/tracking"
              element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              }
            />
            <Route path="/support" element={<Support />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/legal-notice" element={<LegalNotice />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/careers" element={<Careers />} />
          </Routes>
        </Suspense>
      </LazyErrorBoundary>
      <Footer />
    </NotificationProvider>
  );
}

function HomePage({ searchQuery, selectedCategory, selectedFilter }) {
  // Usar React Query para obtener productos con filtros
  const filters = {
    ...(searchQuery && { search: searchQuery }),
    ...(selectedCategory && selectedCategory !== "Todos los Productos" && { category: selectedCategory }),
    ...(selectedFilter && selectedFilter !== "Todos los Productos" && { filter: selectedFilter })
  };

  const { data: productsData, isLoading: loading, error } = useProducts(filters);

  // Extraer productos de la respuesta
  const products = productsData?.data || [];

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
      {/* Solo mostrar Hero Banner si NO hay búsqueda activa */}
      {!searchQuery && <HeroBanner />}
      
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
          {searchQuery ? `Resultados para "${searchQuery}"` : "Catálogo SuperGains"}
        </h1>
        {(selectedCategory !== "Todos los Productos" || selectedFilter !== "Todos los Productos") && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm">
              <span className="text-gray-600">Filtro activo:</span>
              <span className="font-semibold text-black">
                {selectedCategory !== "Todos los Productos" ? selectedCategory : selectedFilter}
              </span>
              <button 
                onClick={() => {
                  // Limpiar filtros navegando a la página principal
                  window.location.href = '/';
                }}
                className="text-gray-400 hover:text-gray-600 ml-2 transition-colors"
                title="Limpiar filtros"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {searchQuery ? `No se encontraron productos para "${searchQuery}"` : "No hay productos disponibles"}
          </div>
        ) : (
          <>
            {!searchQuery && (
              <ProductCarousel
                products={products.slice(0, 6)}
                title="Productos Destacados"
                subtitle="Los mejores suplementos para tu rendimiento"
              />
            )}
            <ProductGrid
              products={products}
              className="mt-6 sm:mt-8"
              showTitle={false}
            />
          </>
        )}
      </div>

      {/* Solo mostrar secciones adicionales si NO hay búsqueda activa */}
      {!searchQuery && (
        <>
          {/* Sección de Testimonios */}
          <Testimonials />

          {/* Sección Nosotros - Diseño minimalista según PRD */}
          <section id="nosotros" className="bg-gray-100 rounded-2xl my-8 py-16">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-12">
                <div className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                  SOBRE NOSOTROS
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">Sobre SuperGains</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Somos la tienda líder en suplementos deportivos y nutrición. Nuestra misión es ayudarte a alcanzar tus objetivos de fitness con productos de la más alta calidad.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black">Calidad Premium</h3>
                  <p className="text-gray-600">Productos de las mejores marcas del mercado con certificaciones internacionales</p>
                </div>

                <div className="text-center">
                  <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black">Envío Rápido</h3>
                  <p className="text-gray-600">Entrega en 24-48 horas en toda Colombia con seguimiento en tiempo real</p>
                </div>

                <div className="text-center">
                  <div className="bg-black w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-black">Resultados Garantizados</h3>
                  <p className="text-gray-600">Productos que realmente funcionan con garantía de satisfacción</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
          {/* Widget de chat de soporte Tawk.to */}
          <TawkToChat />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
