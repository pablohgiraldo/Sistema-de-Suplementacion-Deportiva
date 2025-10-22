// Componente Hero Banner según PRD con carrusel automático
import { useEffect, useMemo, useRef, useState } from 'react';

export default function HeroBanner({ data }) {
  const slides = useMemo(() => (
    [
      {
        id: 'slide-1',
        leftImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1600&h=1200&fit=crop&q=80',
        rightImage: 'https://images.unsplash.com/photo-1594737625785-c6683fc83fea?w=1600&h=1200&fit=crop&q=80',
        badge: 'NUEVO',
        title: 'DESIGNER WHEY PROTEIN',
        subtitle: 'Nuevo: Sabor KiBa',
        cta: 'AHORRA 20%'
      },
      {
        id: 'slide-2',
        leftImage: 'https://images.unsplash.com/photo-1623874228601-f4193c7b1818?w=1600&h=1200&fit=crop&q=80',
        rightImage: 'https://images.unsplash.com/photo-1517963628607-235ccdd5476e?w=1600&h=1200&fit=crop&q=80',
        badge: 'EDICIÓN LIMITADA',
        title: 'ISOCLEAR WHEY ISOLATE',
        subtitle: 'Bebida proteica refrescante y transparente',
        cta: 'COMPRAR AHORA'
      },
      {
        id: 'slide-3',
        leftImage: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&h=1200&fit=crop&q=80',
        rightImage: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=1600&h=1200&fit=crop&q=80',
        badge: 'MÁS VENDIDO',
        title: 'DESIGNER PROTEIN BAR',
        subtitle: 'Sin azúcar añadida. Gran sabor.',
        cta: 'PRUÉBALO'
      },
      {
        id: 'slide-4',
        leftImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&h=1200&fit=crop&q=80',
        rightImage: 'https://images.unsplash.com/photo-1593476087123-36d1de271f08?w=1600&h=1200&fit=crop&q=80',
        badge: 'NUEVA RECETA',
        title: 'VEGAN PROTEIN',
        subtitle: 'Sabor chocolate cremoso',
        cta: 'DESCUBRE'
      }
    ]
  ), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayIntervalMs = 4500;
  const containerRef = useRef(null);

  // Autoplay con pausa al interactuar
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayIntervalMs);
    return () => clearInterval(id);
  }, [isPaused, slides.length]);

  const goTo = (index) => {
    setCurrentIndex((index + slides.length) % slides.length);
  };

  // Navegación manual sólo con indicadores

  return (
    <div
      className="bg-gray-100 rounded-xl overflow-hidden my-8 min-h-[32rem] sm:h-96 lg:h-[28rem] w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative h-full w-full" ref={containerRef}>
        {/* Slides */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="min-w-full h-full">
              <div className="flex flex-col sm:flex-row h-full w-full">
                {/* Sección izquierda - Imagen de estilo de vida */}
                <div className="w-full sm:w-1/2 h-1/2 sm:h-full bg-gray-800 flex items-center justify-center relative">
                  <div className="absolute inset-0">
                    <img
                      src={slide.leftImage}
                      alt="Entrenamiento intenso"
                      className="w-full h-full object-cover opacity-40"
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = '/hero-left-1.svg'; }}
                    />
                  </div>
                  <div className="text-center text-white p-4 sm:p-6 lg:p-8 relative z-10">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2">SUPERGAINS</h2>
                    <p className="text-gray-300 text-xs sm:text-sm">Impulsa tu rendimiento, conquista tus límites.</p>
                  </div>
                </div>

                {/* Sección derecha - Imagen con overlay de texto */}
                <div className="w-full sm:w-1/2 h-1/2 sm:h-full flex items-center justify-center relative">
                  <img
                    src={slide.rightImage}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = '/hero-right-1.svg'; }}
                  />

                  {/* Overlay con badge, título y CTA */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center p-6 sm:p-8">
                    {/* Badge en esquina superior izquierda */}
                    {slide.badge && (
                      <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 rounded-full text-xs font-bold">
                        {slide.badge}
                      </div>
                    )}

                    {/* Título */}
                    <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-3">
                      {slide.title}
                    </h1>

                    {/* Subtítulo */}
                    {slide.subtitle && (
                      <p className="text-gray-200 text-sm sm:text-base text-center mb-4 sm:mb-6">
                        {slide.subtitle}
                      </p>
                    )}

                    {/* CTA Button */}
                    {slide.cta && (
                      <button className="bg-white text-black px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base">
                        {slide.cta}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controles eliminados: navegación mediante indicadores */}

        {/* Indicadores */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goTo(idx)}
              aria-label={`Ir al slide ${idx + 1}`}
              className={`${idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2'} h-2 rounded-full transition-all duration-300`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

