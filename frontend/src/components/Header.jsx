import { useState, useEffect } from "react";

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
            <span className="font-medium">Protein Week: Enjoy 20% off protein</span>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <div className="bg-white py-4 px-6 border-b border-gray-200 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo SPG + SUPERGAINS */}
          <div className="flex flex-col cursor-pointer">
            <div className="text-3xl font-bold text-black">SPG</div>
            <div className="text-xs font-bold text-black tracking-wider">SUPERGAINS</div>
          </div>

              {/* Barra de búsqueda - Solo visible en desktop */}
              <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-8 min-w-0">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search for Protein, Food..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </span>
                </div>
              </div>

              {/* Iconos de usuario - Solo visible en desktop */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600">
                  <span className="text-sm font-medium">CY</span>
                  <span className="text-xs">▼</span>
                </div>
            
            {/* Perfil de usuario */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="text-sm font-medium">{user?.firstName}</span>
                <button 
                  onClick={onLogout}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onShowLogin}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2 py-1"
                >
                  Iniciar sesión
                </button>
                <button 
                  onClick={onShowRegister}
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2 py-1"
                >
                  Registrarse
                </button>
              </div>
            )}
            
            <span className="text-lg cursor-pointer text-gray-500 hover:text-red-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </span>
            
            {/* Carrito con contador */}
            <div className="relative">
              <button 
                onClick={onOpenCart}
                className="text-lg cursor-pointer hover:text-blue-600 relative"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

              {/* Botón hamburger para móvil */}
              <button 
                className={`md:hidden p-2 rounded-lg transition-all duration-200 ${
                  isMobileMenuOpen 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block h-0.5 bg-current transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </button>
        </div>
      </div>

      {/* Navegación Principal - Solo visible en desktop */}
      <nav className="hidden md:block bg-white border-b border-gray-200 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 w-full">
            {/* Categorías principales según PRD */}
            <div className="flex items-center gap-4 lg:gap-8 overflow-x-auto min-w-0">
              {["Promotion", "Protein Powder", "Vitamins & More", "Performance", "Bars & Snacks", "Accessories", "Outlet", "Goals", "About us"].map((category) => (
                <div 
                  key={category} 
                  className={`flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors ${
                    selectedCategory === category ? 'text-blue-600 font-semibold' : ''
                  }`}
                  onClick={() => {
                    // Mapear categorías del menú a filtros
                    const filterMap = {
                      "Promotion": "Bestsellers",
                      "Protein Powder": "Proteins", 
                      "Vitamins & More": "Vitamins & More",
                      "Performance": "Performance",
                      "Bars & Snacks": "Food & Snacks",
                      "Accessories": "All Products",
                      "Outlet": "Outlet",
                      "Goals": "All Products",
                      "About us": "nosotros" // Redirigir a la sección Nosotros
                    };
                    const filter = filterMap[category] || "All Products";
                    
                    if (category === "About us") {
                      // Scroll a la sección Nosotros
                      setTimeout(() => {
                        const nosotrosSection = document.getElementById('nosotros');
                        if (nosotrosSection) {
                          nosotrosSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    } else {
                      onCategoryClick(filter);
                    }
                  }}
                >
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-xs">▼</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros rápidos según PRD */}
          <div className="flex items-center gap-4 lg:gap-6 py-3 border-t border-gray-100 overflow-x-auto min-w-0">
            {["All Products", "Bestsellers", "Proteins", "Vitamins & More", "Performance", "Food & Snacks", "Protein Bars", "Outlet", "Samples", "Vegan"].map((filter) => (
              <span 
                key={filter} 
                className={`text-xs cursor-pointer transition-colors ${
                  selectedFilter === filter 
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

      {/* Menú móvil */}
      <div className={`md:hidden bg-white border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
        isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Barra de búsqueda móvil */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search for Protein, Food..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
              </span>
            </div>

                {/* Iconos de usuario móvil */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">CY</span>
                    <span className="text-xs text-gray-500">▼</span>
                  </div>
                  <div className="flex items-center gap-4">
                
                {/* Perfil móvil */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    <span className="text-sm font-medium">{user?.firstName}</span>
                  </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onShowLogin}
                          className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2 py-1"
                        >
                          Iniciar sesión
                        </button>
                        <button
                          onClick={onShowRegister}
                          className="text-sm font-medium text-gray-700 hover:text-black transition-colors px-2 py-1"
                        >
                          Registrarse
                        </button>
                      </div>
                    )}
                
                <span className="text-lg cursor-pointer text-gray-500 hover:text-red-500 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </span>
                
                {/* Carrito móvil */}
                <div className="relative">
                  <button 
                    onClick={onOpenCart}
                    className="text-lg cursor-pointer hover:text-blue-600 transition-colors relative"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 shadow-sm">
                        {cartItemsCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

                {/* Categorías móvil según PRD */}
                <div className="space-y-1 mb-6">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</div>
                  {["Promotion", "Protein Powder", "Vitamins & More", "Performance", "Bars & Snacks", "Accessories", "Outlet", "Goals", "About us"].map((category) => (
                    <div 
                      key={category} 
                      className={`py-3 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCategory === category 
                          ? 'text-blue-600 font-semibold bg-blue-50 border-l-4 border-blue-600' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        const filterMap = {
                          "Promotion": "Bestsellers",
                          "Protein Powder": "Proteins", 
                          "Vitamins & More": "Vitamins & More",
                          "Performance": "Performance",
                          "Bars & Snacks": "Food & Snacks",
                          "Accessories": "All Products",
                          "Outlet": "Outlet",
                          "Goals": "All Products",
                          "About us": "nosotros" // Redirigir a la sección Nosotros
                        };
                        const filter = filterMap[category] || "All Products";
                        
                        if (category === "About us") {
                          // Scroll a la sección Nosotros
                          setIsMobileMenuOpen(false); // Cerrar menú móvil
                          setTimeout(() => {
                            const nosotrosSection = document.getElementById('nosotros');
                            if (nosotrosSection) {
                              nosotrosSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }, 100);
                        } else {
                          onCategoryClick(filter);
                          setIsMobileMenuOpen(false); // Cerrar menú móvil
                        }
                      }}
                    >
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                  ))}
                </div>

            {/* Filtros móvil */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Filters</div>
              <div className="grid grid-cols-2 gap-2">
                {["All Products", "Bestsellers", "Proteins", "Vitamins & More", "Performance", "Food & Snacks", "Protein Bars", "Outlet", "Samples", "Vegan"].map((filter) => (
                  <span 
                    key={filter} 
                    className={`text-xs py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                      selectedFilter === filter 
                        ? 'text-blue-600 font-semibold bg-blue-50 border border-blue-200' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => {
                      onFilterClick(filter);
                      setIsMobileMenuOpen(false); // Cerrar menú móvil
                    }}
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>
        </div>
      </div>
    </header>
    </>
  );
}
