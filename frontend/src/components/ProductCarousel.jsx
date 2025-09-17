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
    <section className="my-12 sm:my-16 lg:my-20">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">{title}</h2>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{subtitle}</p>
          </div>
          
          {/* Controles del carrusel */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={!canGoPrev}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                canGoPrev 
                  ? 'bg-black text-white hover:bg-gray-800 hover:scale-110' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              ←
            </button>
            <button
              onClick={nextSlide}
              disabled={!canGoNext}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                canGoNext 
                  ? 'bg-black text-white hover:bg-gray-800 hover:scale-110' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              →
            </button>
          </div>
        </div>
        
        {/* Indicadores de posición */}
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: Math.ceil(products.length / currentItemsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-black w-8' : 'bg-gray-300 hover:bg-gray-400'
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
        
        {/* Botones de navegación móvil */}
        <div className="sm:hidden flex justify-center gap-3 mt-6 px-4">
          <button
            onClick={prevSlide}
            disabled={!canGoPrev}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm ${
              canGoPrev 
                ? 'bg-black text-white hover:bg-gray-800 active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            ← Anterior
          </button>
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
    </section>
  );
}
