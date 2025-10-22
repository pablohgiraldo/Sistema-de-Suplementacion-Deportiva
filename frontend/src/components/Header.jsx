import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CategoryDropdown from "./CategoryDropdown";

// Componente Header según PRD - SuperGains
export default function Header({
  onCategoryClick,
  onFilterClick,
  selectedCategory,
  selectedFilter,
  user,
  isAuthenticated,
  onShowLogin,
  onShowRegister,
  onLogout,
  onOpenCart,
  cartItemsCount,
  onSearch,
  searchQuery
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Cerrar menú móvil con tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el menú está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <header className="bg-white relative z-50">
        {/* Top Bar Promocional según PRD */}
        <div className="bg-black text-white w-full">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-2 text-sm">
              <span className="mr-2">💪</span>
              <span className="font-medium">Semana de Proteínas: Disfruta 20% de descuento en proteínas</span>
            </div>
          </div>
        </div>

        {/* Header Principal */}
        <div className="bg-white py-4 px-6 border-b border-gray-200 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo SPG + SUPERGAINS */}
            <Link to="/" className="flex flex-col cursor-pointer">
              <div className="text-3xl font-bold text-black">SPG</div>
              <div className="text-xs font-bold text-black tracking-wider">SUPERGAINS</div>
            </Link>

            {/* Barra de búsqueda - Solo visible en desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8 min-w-0">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar proteínas, alimentos..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Iconos de usuario - Solo visible en desktop */}
            <div className="hidden md:flex items-center gap-4">
              {/* Perfil de usuario */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                  <Link 
                    to="/profile" 
                    title="Mi Perfil" 
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                      {user?.nombre || user?.firstName || 'Usuario'}
                    </span>
                  </Link>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <Link
                    to="/orders"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
                    title="Mis Pedidos"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Pedidos
                  </Link>
                  <button
                    onClick={onLogout}
                    className="text-xs text-gray-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1"
                    title="Cerrar sesión"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg shadow-sm"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Iconos según rol del usuario */}
              {user?.rol === 'admin' ? (
                // Iconos para administrador
                <>
                  {/* Dashboard de administración */}
                  <Link
                    to="/admin"
                    className="w-5 h-5 cursor-pointer hover:text-gray-600 relative block"
                    title="Dashboard de Administración"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </Link>
                </>
              ) : (
                // Iconos para usuarios normales
                <>
                  {/* Icono de favoritos/wishlist mejorado */}
                  <Link
                    to="/wishlist"
                    className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 group relative"
                    title="Mi Lista de Deseos"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  </Link>

                  {/* Carrito con contador mejorado */}
                  <Link
                    to="/cart"
                    className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 group relative"
                    title="Mi Carrito"
                  >
                    <svg 
                      className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                      />
                    </svg>
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-md px-1.5">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>

            {/* Iconos móviles (carrito siempre visible) */}
            <div className="md:hidden flex items-center gap-3">
              {/* Carrito móvil - Siempre visible */}
              <div className="relative">
                <Link
                  to="/cart"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative flex items-center justify-center"
                  aria-label={`Carrito de compras con ${cartItemsCount} ${cartItemsCount === 1 ? 'producto' : 'productos'}`}
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Botón hamburger para móvil */}
              <button
                className={`p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isMobileMenuOpen
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-700'
                  }`}
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Navegación Principal - Solo visible en desktop */}
        <nav className="hidden md:block bg-white border-b border-gray-200 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4 w-full">
              {/* Categorías principales con dropdowns según PRD */}
              <div className="flex items-center gap-4 lg:gap-6 overflow-x-auto min-w-0">
                {/* Categorías con submenús usando CategoryDropdown */}
                <CategoryDropdown 
                  category="Proteínas en Polvo" 
                  onFilterClick={onFilterClick}
                  onCategoryClick={onCategoryClick}
                />
                <CategoryDropdown 
                  category="Barras y Snacks" 
                  onFilterClick={onFilterClick}
                  onCategoryClick={onCategoryClick}
                />
                <CategoryDropdown 
                  category="Vitaminas y Más" 
                  onFilterClick={onFilterClick}
                  onCategoryClick={onCategoryClick}
                />
                <CategoryDropdown 
                  category="Rendimiento" 
                  onFilterClick={onFilterClick}
                  onCategoryClick={onCategoryClick}
                />
                <CategoryDropdown 
                  category="Accesorios" 
                  onFilterClick={onFilterClick}
                  onCategoryClick={onCategoryClick}
                />
                
                {/* Categorías simples sin submenú */}
                {["Promociones", "Outlet", "Objetivos", "Nosotros", "Soporte"].map((category) => (
                  <button
                    key={category}
                    className={`text-sm font-medium transition-colors duration-200 py-2 whitespace-nowrap ${
                      selectedCategory === category 
                        ? 'text-blue-600 font-semibold' 
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    onClick={() => {
                      // Mapear categorías del menú a filtros
                      const filterMap = {
                        "Promociones": "Más Vendidos",
                        "Outlet": "Outlet",
                        "Objetivos": "Todos los Productos",
                        "Nosotros": "nosotros",
                        "Soporte": "soporte"
                      };
                      const filter = filterMap[category] || "Todos los Productos";

                      if (category === "Nosotros") {
                        setTimeout(() => {
                          const nosotrosSection = document.getElementById('nosotros');
                          if (nosotrosSection) {
                            nosotrosSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      } else if (category === "Soporte") {
                        window.location.href = '/support';
                      } else {
                        onCategoryClick(filter);
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtros rápidos según PRD */}
            <div className="flex items-center gap-4 lg:gap-6 py-3 border-t border-gray-100 overflow-x-auto min-w-0">
              {["Todos los Productos", "Más Vendidos", "Proteínas", "Vitaminas y Más", "Rendimiento", "Alimentos y Snacks", "Barras de Proteína", "Outlet", "Muestras", "Vegano"].map((filter) => (
                <span
                  key={filter}
                  className={`text-xs cursor-pointer transition-colors ${selectedFilter === filter
                    ? 'text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded'
                    : 'text-gray-600 hover:text-black'
                    }`}
                  onClick={() => onFilterClick(filter)}
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>
        </nav>

        {/* Menú móvil - Mejorado */}
        <div
          id="mobile-menu"
          className={`md:hidden bg-white border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
          role="navigation"
          aria-label="Menú de navegación móvil"
        >
          <div className="px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Barra de búsqueda móvil - Mejorada */}
            <div className="relative mb-4">
              <label htmlFor="mobile-search" className="sr-only">Buscar productos</label>
              <input
                id="mobile-search"
                type="text"
                placeholder="Buscar proteínas, alimentos..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                aria-label="Buscar productos"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </span>
            </div>

            {/* Iconos de usuario móvil */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-4 w-full justify-end">

                {/* Perfil móvil */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <Link to="/profile" title="Mi Perfil" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium">{user?.nombre || user?.firstName || 'Usuario'}</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      title="Mis Pedidos"
                    >
                      Pedidos
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2 py-1"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2 py-1"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}

                {/* Iconos móviles según rol del usuario */}
                {user?.rol === 'admin' ? (
                  // Iconos para administrador móvil
                  <>
                    {/* Dashboard de administración móvil */}
                    <Link
                      to="/admin"
                      className="w-5 h-5 cursor-pointer hover:text-gray-600 relative block"
                      title="Dashboard de Administración"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </Link>
                  </>
                ) : (
                  // Icono de wishlist para usuarios normales móvil
                  <>
                    {/* Icono de favoritos/wishlist móvil */}
                    <Link
                      to="/wishlist"
                      className="w-5 h-5 cursor-pointer hover:text-gray-600 relative block"
                      title="Mi Lista de Deseos"
                    >
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Categorías móvil - Mejoradas */}
            <div className="space-y-1 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Categorías</h3>
              <nav role="navigation" aria-label="Categorías de productos">
                {["Promociones", "Proteínas en Polvo", "Vitaminas y Más", "Rendimiento", "Barras y Snacks", "Accesorios", "Outlet", "Objetivos", "Nosotros", "Soporte"].map((category) => (
                  <button
                    key={category}
                    className={`w-full text-left py-3 px-3 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selectedCategory === category
                      ? 'text-blue-600 font-semibold bg-blue-50 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    onClick={() => {
                      const filterMap = {
                        "Promociones": "Más Vendidos",
                        "Proteínas en Polvo": "Proteínas",
                        "Vitaminas y Más": "Vitaminas y Más",
                        "Rendimiento": "Rendimiento",
                        "Barras y Snacks": "Alimentos y Snacks",
                        "Accesorios": "Todos los Productos",
                        "Outlet": "Outlet",
                        "Objetivos": "Todos los Productos",
                        "Nosotros": "nosotros", // Redirigir a la sección Nosotros
                        "Soporte": "soporte" // Redirigir a página de soporte
                      };
                      const filter = filterMap[category] || "Todos los Productos";

                      if (category === "Nosotros") {
                        // Scroll a la sección Nosotros
                        setIsMobileMenuOpen(false); // Cerrar menú móvil
                        setTimeout(() => {
                          const nosotrosSection = document.getElementById('nosotros');
                          if (nosotrosSection) {
                            nosotrosSection.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      } else if (category === "Soporte") {
                        // Navegar a la página de soporte
                        setIsMobileMenuOpen(false); // Cerrar menú móvil
                        window.location.href = '/support';
                      } else {
                        onCategoryClick(filter);
                        setIsMobileMenuOpen(false); // Cerrar menú móvil
                      }
                    }}
                    aria-label={`Ver productos de ${category}`}
                  >
                    <span className="text-sm font-medium">{category}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Filtros móvil - Mejorados */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros Rápidos</h3>
              <div className="grid grid-cols-2 gap-2">
                {["Todos los Productos", "Más Vendidos", "Proteínas", "Vitaminas y Más", "Rendimiento", "Alimentos y Snacks", "Barras de Proteína", "Outlet", "Muestras", "Vegano"].map((filter) => (
                  <button
                    key={filter}
                    className={`text-xs py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selectedFilter === filter
                      ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                    onClick={() => {
                      onFilterClick(filter);
                      setIsMobileMenuOpen(false); // Cerrar menú móvil
                    }}
                    aria-label={`Filtrar por ${filter}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
