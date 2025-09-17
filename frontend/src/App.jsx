import { useState } from "react";
import ProductCard from "./components/productCard";
import ProductModal from "./components/ProductModal";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import Footer from "./components/Footer";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import ShoppingCart from "./components/ShoppingCart";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { mockProducts, heroBannerData, categories, quickFilters, interestImages } from "./data/mockData";

// Componente interno que usa los hooks de contexto
function AppContent() {
  const [products] = useState(mockProducts);
  const [loading] = useState(false);
  const [error] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedFilter, setSelectedFilter] = useState("All Products");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home"); // "home" o "category"
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hooks de contexto
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { 
    cartItems, 
    isCartOpen, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    openCart, 
    closeCart 
  } = useCart();

  // Función para filtrar productos por categoría
  const filterProductsByCategory = (category) => {
    if (category === "All Products") return products;
    if (category === "Bestsellers") return products.filter(p => p.isBestseller);
    if (category === "Proteins") return products.filter(p => p.category === "Protein Powder");
    if (category === "Vitamins & More") return products.filter(p => p.category === "Vitamins");
    if (category === "Performance") return products.filter(p => p.category === "Performance");
    if (category === "Food & Snacks") return products.filter(p => p.category === "Protein Bars");
    if (category === "Protein Bars") return products.filter(p => p.category === "Protein Bars");
    if (category === "Outlet") return products.filter(p => p.badge === "Outlet");
    if (category === "Samples") return products.filter(p => p.badge === "Sample");
    if (category === "Vegan") return products.filter(p => p.badge === "Vegan");
    return products;
  };

  // Función para manejar clics en categorías del menú
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedFilter(category);
    setCurrentView("category");
    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para manejar clics en filtros rápidos
  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    // Scroll a la sección de productos
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Función para manejar clic en producto
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Función para agregar producto al carrito
  const handleAddToCart = (product) => {
    addToCart(product);
    setIsModalOpen(false);
    // Mostrar notificación de éxito
    alert(`${product.name} agregado al carrito`);
  };

  // Función para manejar la búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);
    // Si hay una búsqueda activa, cambiar a vista de categoría para mostrar resultados
    if (query.trim()) {
      setCurrentView("category");
      setSelectedCategory("Search Results");
        } else {
      setCurrentView("home");
      setSelectedCategory("All Products");
    }
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Funciones para manejar formularios de autenticación
  const handleShowLogin = () => {
    setShowLoginForm(true);
    setShowRegisterForm(false);
  };

  const handleShowRegister = () => {
    setShowRegisterForm(true);
    setShowLoginForm(false);
  };

  const handleCloseAuthForms = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
  };

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      handleCloseAuthForms();
    }
    return result;
  };

  const handleRegister = async (userData) => {
    const result = await register(userData);
    if (result.success) {
      handleCloseAuthForms();
    }
    return result;
  };

  // Función para volver al inicio
  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedCategory("All Products");
    setSelectedFilter("All Products");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtrar productos según la selección actual y búsqueda
  const filteredProducts = (() => {
    let filtered = filterProductsByCategory(selectedFilter);
    
    // Si hay una búsqueda activa, filtrar también por el término de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  })();
  
  // Filtrar productos por categoría (mantener los existentes)
  const bestsellers = products.filter(p => p.isBestseller);
  const samples = products.filter(p => p.badge === "Sample");

  // Renderizar vista de categoría
  if (currentView === "category") {
    return (
      <div className="min-h-screen bg-white w-full">
        <div className="w-full max-w-7xl mx-auto">
          <Header 
            onCategoryClick={handleCategoryClick}
            onFilterClick={handleFilterClick}
            selectedCategory={selectedCategory}
            selectedFilter={selectedFilter}
            user={user}
            isAuthenticated={isAuthenticated}
            onShowLogin={handleShowLogin}
            onShowRegister={handleShowRegister}
            onLogout={logout}
            onOpenCart={openCart}
            cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />
          
          <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <button 
                  onClick={handleBackToHome}
                  className="hover:text-blue-600 transition-colors"
                >
                  Inicio
                </button>
                <span>›</span>
                <span className="text-gray-900 font-medium">{selectedCategory}</span>
              </nav>
            </div>

            {/* Header de la categoría */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
                {selectedCategory}
              </h1>
              <p className="text-gray-600 text-lg">
                {filteredProducts.length} productos encontrados
              </p>
            </div>

            {/* Filtros rápidos */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {["All Products", "Bestsellers", "Proteins", "Vitamins & More", "Performance", "Food & Snacks", "Protein Bars", "Outlet", "Samples", "Vegan"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedFilter === filter
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    p={product} 
                    onProductClick={handleProductClick}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No hay productos disponibles para "{selectedFilter}" en {selectedCategory}
                  </p>
                  <button 
                    onClick={() => handleFilterClick("All Products")}
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Ver todos los productos
                  </button>
                </div>
              )}
        </div>
      </main>

          <Footer />
          
          {/* Modal de producto */}
          <ProductModal 
            product={selectedProduct}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      </div>
    );
  }

  // Renderizar vista principal (home)
  return (
    <div className="min-h-screen bg-white w-full">
      <div className="w-full max-w-7xl mx-auto">
        <Header 
          onCategoryClick={handleCategoryClick}
          onFilterClick={handleFilterClick}
          selectedCategory={selectedCategory}
          selectedFilter={selectedFilter}
          user={user}
          isAuthenticated={isAuthenticated}
          onShowLogin={handleShowLogin}
          onShowRegister={handleShowRegister}
          onLogout={logout}
          onOpenCart={openCart}
          cartItemsCount={cartItems.reduce((total, item) => total + item.quantity, 0)}
          onSearch={handleSearch}
          searchQuery={searchQuery}
        />
        
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <section id="inicio">
          <HeroBanner data={heroBannerData} />
        </section>

        {/* Sección: Productos filtrados */}
        <section id="productos" className="my-12 sm:my-16 lg:my-20">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
              {selectedFilter === "All Products" ? "Our top products" : selectedFilter}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              {selectedFilter === "All Products" ? "Particularly popular" : `Showing ${filteredProducts.length} products`}
            </p>
            {selectedFilter !== "All Products" && (
              <div className="mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Filter: {selectedFilter}
                </span>
              </div>
            )}
        </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard 
                      key={product._id} 
                      p={product} 
                      onProductClick={handleProductClick}
                    />
                  ))
                ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-lg mb-2">🔍</div>
                <p className="text-gray-600">No products found for "{selectedFilter}"</p>
                <button 
                  onClick={() => handleFilterClick("All Products")}
                  className="mt-4 text-blue-600 hover:text-blue-800 underline"
                >
                  Show all products
                </button>
        </div>
      )}
          </div>
        </section>

        {/* Sección: What are you interested in? */}
        <section id="categorias" className="my-12 sm:my-16 lg:my-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-black">What are you interested in?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {interestImages.map((interest, index) => (
              <div key={index} className="relative cursor-pointer group">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <img
                    src={interest.image}
                    alt={interest.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-white text-center" style={{display: 'none'}}>
                    <div>
                      <div className="text-3xl sm:text-4xl lg:text-5xl mb-2">💪</div>
                      <h3 className="font-bold text-sm sm:text-base">{interest.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                  <h3 className="font-bold text-white text-sm sm:text-base">{interest.title}</h3>
                  <p className="text-gray-200 text-xs">{interest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección: Sample Products */}
        <section className="my-12 sm:my-16 lg:my-20">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">Are you new here?</h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Try our top picks.</p>
          </div>
          
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {samples.map(product => (
                  <ProductCard 
                    key={product._id} 
                    p={product} 
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
        </section>

        {/* Banner Promocional Outlet */}
        <section id="ofertas" className="my-12 sm:my-16 lg:my-20">
          <div className="bg-black text-white rounded-xl overflow-hidden h-64 sm:h-80 lg:h-96">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="w-full sm:w-1/2 p-6 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🏷️</div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Productos Outlet</h3>
                  <p className="text-gray-300 text-sm sm:text-base">Ofertas especiales</p>
                </div>
              </div>
              <div className="w-full sm:w-1/2 p-6 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">SUPERGAINS OUTLET:</h2>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-yellow-400">UP TO 50%</div>
                  <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 text-gray-300">Top supplements at best prices</p>
                  <button className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base lg:text-lg">
                    SAVE NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Nosotros */}
        <section id="nosotros" className="my-12 sm:my-16 lg:my-20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6">Sobre SuperGains</h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto">
              SuperGains es tu tienda de confianza para suplementos deportivos de alta calidad. 
              Ofrecemos productos premium para atletas y entusiastas del fitness que buscan 
              maximizar su rendimiento y alcanzar sus objetivos.
            </p>
          </div>
        </section>

        {/* Sección: Contacto */}
        <section id="contacto" className="my-12 sm:my-16 lg:my-20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6">Contáctanos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2 text-black">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-gray-600">info@supergains.com</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2 text-black">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Teléfono</h3>
                <p className="text-sm text-gray-600">+57 (1) 234-5678</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2 text-black">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Dirección</h3>
                <p className="text-sm text-gray-600">Bogotá, Colombia</p>
              </div>
            </div>
          </div>
        </section>
    </main>

            <Footer />
          </div>
          
              {/* Modal de producto */}
              <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddToCart={handleAddToCart}
              />

              {/* Formularios de autenticación */}
              {showLoginForm && (
                <LoginForm 
                  onClose={handleCloseAuthForms}
                  onSwitchToRegister={handleShowRegister}
                  onLogin={handleLogin}
                />
              )}
              
              {showRegisterForm && (
                <RegisterForm 
                  onClose={handleCloseAuthForms}
                  onSwitchToLogin={handleShowLogin}
                  onRegister={handleRegister}
                />
              )}

              {/* Carrito de compras */}
              <ShoppingCart
                isOpen={isCartOpen}
                onClose={closeCart}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
              />
            </div>
          );
        }

// Componente principal que envuelve todo con los providers
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}