import { useState, useRef, useEffect } from 'react';
import ProductCard from './productCard';

export default function ProductCarousel({ products, onProductClick, title, subtitle }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  
  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4
  };

  // Función para obtener el número de elementos por vista según el tamaño de pantalla
  const getItemsPerView = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return itemsPerView.mobile; // sm
      if (width < 768) return itemsPerView.mobile; // md
      if (width < 1024) return itemsPerView.tablet; // lg
      if (width < 1280) return itemsPerView.desktop; // xl
      return itemsPerView.large; // 2xl+
    }
    return itemsPerView.desktop;
  };

  // Efecto para manejar el redimensionamiento de la ventana
  useEffect(() => {
    const handleResize = () => {
      // Resetear el índice cuando cambie el tamaño de pantalla
      setCurrentIndex(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const currentItemsPerView = getItemsPerView();
      const itemWidth = container.offsetWidth / currentItemsPerView;
      const scrollPosition = index * itemWidth;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    const currentItemsPerView = getItemsPerView();
    const maxIndex = Math.max(0, products.length - currentItemsPerView);
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    scrollToIndex(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(prevIndex);
  };

  const currentItemsPerView = getItemsPerView();
  const canGoNext = currentIndex < Math.max(0, products.length - currentItemsPerView);
  const canGoPrev = currentIndex > 0;

  return (
    <section className="my-12 sm:my-16 lg:my-20 bg-gray-100 py-16 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">
                Productos Destacados
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                Particularmente populares
              </p>
            </div>
            
            {/* Controles del carrusel - Solo flecha derecha según PRD */}
            <div className="hidden sm:flex items-center gap-3 mt-4 sm:mt-0">
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  canGoNext 
                    ? 'bg-black text-white hover:bg-gray-800 hover:shadow-xl hover:scale-110' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Indicadores de posición */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: Math.ceil(products.length / currentItemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-black w-8' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
              />
            ))}
          </div>
        </div>
      
        {/* Contenedor del carrusel */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 lg:gap-6 xl:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2 sm:px-4 lg:px-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {products.map((product) => (
              <div key={product._id} className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 snap-start">
                <ProductCard p={product} onProductClick={onProductClick} />
              </div>
            ))}
          </div>
          
            {/* Botones de navegación móvil - Solo flecha derecha según PRD */}
            <div className="sm:hidden flex justify-center gap-3 mt-6 px-4">
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
                  canGoNext 
                    ? 'bg-black text-white hover:bg-gray-800 active:scale-95' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Siguiente →
              </button>
            </div>
        </div>
      </div>
    </section>
  );
}