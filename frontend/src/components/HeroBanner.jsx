// Componente Hero Banner carrusel con imágenes según PRD
import { useState, useEffect } from 'react';

export default function HeroBanner({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      id: 1,
      leftImage: "https://media.istockphoto.com/id/1483552986/photo/drinking-a-protein-shake.jpg?s=1024x1024&w=is&k=20&c=BEMminsBzSYjAnT1Cm-ZMcArWFO5sLwp7tKK_FuMb-U=",
      rightImage: "https://media.istockphoto.com/id/2154155628/photo/protein-shake-and-chocolate-protein-powder-in-a-scoop-food-supplement.jpg?s=1024x1024&w=is&k=20&c=r56pimwzNv-U3pq99B4MhsGBcTgeXdLwgdtue3qQEwU=",
      title: "PROTEIN WEEK",
      subtitle: "HASTA UN -25%",
      description: "Disfruta de descuentos increíbles en nuestra colección de proteínas premium",
      cta: "COMPRA AHORA",
      badge: "NUEVO",
      discount: "-25% en Designer Whey",
      discount2: "-20% en vitaminas y performance",
      products: [
        { name: "Designer Whey", price: "$167,580", originalPrice: "$223,440" },
        { name: "Isoclear Whey", price: "$222,180", originalPrice: "$296,240" }
      ]
    },
    {
      id: 2,
      leftImage: "https://media.istockphoto.com/id/508216261/photo/man-holding-protein-bottle.jpg?s=1024x1024&w=is&k=20&c=yllU0laStOQGAEFZUIi25eQOa_u0NwFod-CV0KFD0FE=",
      rightImage: "https://media.istockphoto.com/id/2162409255/photo/pouring-chocolate-protein-powder-in-a-glass-food-supplements-dark-background-bodybuilding.jpg?s=1024x1024&w=is&k=20&c=rUbkXPNc2SEBpVpxhEpPCzxjea5oNjOxh8IibpIIKUg=",
      title: "IMMUNITY WEEK",
      subtitle: "HASTA UN -30%",
      description: "Fortalece tu sistema inmunológico con nuestros suplementos especializados",
      cta: "COMPRA AHORA",
      badge: "LIMITED",
      discount: "-30% en Immunity Collection",
      discount2: "-25% en vitaminas y performance",
      products: [
        { name: "Vitamin D3+K2", price: "$89,580", originalPrice: "$127,980" },
        { name: "Immunity Support", price: "$125,580", originalPrice: "$179,400" }
      ]
    },
    {
      id: 3,
      leftImage: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop&crop=center&auto=format&q=80",
      rightImage: "https://media.istockphoto.com/id/2166987020/photo/two-happy-sporty-friends-sitting-on-a-gym-floor-and-drinking-water-while-taking-a-break.jpg?s=1024x1024&w=is&k=20&c=JyUlIG7nx-Nz5DUVi9h8vYX4v9bRUZ9I3VC2TuQbjlw=",
      title: "CREATINE WEEK",
      subtitle: "HASTA UN -35%",
      description: "Maximiza tu rendimiento con creatina de la más alta calidad",
      cta: "COMPRA AHORA",
      badge: "BESTSELLER",
      discount: "-35% en Creatine Premium",
      discount2: "-20% en Performance",
      products: [
        { name: "Ultrapure Creatine", price: "$95,580", originalPrice: "$147,120" },
        { name: "Creatine Monohydrate", price: "$78,580", originalPrice: "$120,900" }
      ]
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);


  return (
    <div className="relative bg-black rounded-2xl overflow-hidden my-8 h-80 sm:h-96 lg:h-[32rem] w-full shadow-2xl">
      {/* Carrusel de slides */}
      <div className="relative h-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 
              index < currentSlide ? 'opacity-0 -translate-x-full' : 
              'opacity-0 translate-x-full'
            }`}
          >
            <div className="flex h-full">
              {/* Sección izquierda - Texto promocional */}
              <div className="w-full sm:w-1/2 bg-black flex flex-col justify-center px-6 sm:px-8 lg:px-12 relative">
                {/* Imagen de fondo izquierda */}
                <div className="absolute inset-0">
                  <img
                    src={slide.leftImage}
                    alt={slide.title}
                    className="w-full h-full object-cover opacity-20"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                
                {/* Contenido de texto */}
                <div className="relative z-10">
                  {/* Código promocional */}
                  <div className="flex items-center mb-4">
                    <span className="text-white text-sm mr-2">Copiar código</span>
                    <div className="bg-white text-black px-3 py-1 rounded text-sm font-bold flex items-center">
                      <span>SUPERGAINS</span>
                      <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </div>
                  </div>

                  {/* Título principal */}
                  <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 leading-tight">
                    {slide.title}
                  </h1>

                  {/* Subtítulo con descuento */}
                  <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                    {slide.subtitle}
                  </h2>

                  {/* Descuentos específicos */}
                  <div className="mb-6">
                    <p className="text-white text-lg mb-1">{slide.discount}</p>
                    <p className="text-white text-lg">{slide.discount2}</p>
                  </div>

                  {/* Descripción */}
                  <p className="text-gray-300 text-sm mb-6 max-w-md">
                    {slide.description}
                  </p>

                  {/* CTA Button */}
                  <button className="bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded font-bold text-sm sm:text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                    {slide.cta}
                  </button>
                </div>
              </div>

              {/* Sección derecha - Productos */}
              <div className="w-full sm:w-1/2 relative">
                {/* Imagen de fondo derecha */}
                <div className="absolute inset-0">
                  <img
                    src={slide.rightImage}
                    alt="Productos"
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>

                {/* Badge NUEVO */}
                <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold z-10">
                  {slide.badge}
                </div>

                {/* Productos flotantes */}
                <div className="absolute bottom-8 left-4 right-4 flex flex-wrap gap-4 z-10">
                  {slide.products.map((product, productIndex) => (
                    <div key={productIndex} className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <div className="text-black text-sm font-bold">{product.name}</div>
                      <div className="text-green-600 font-bold text-lg">{product.price}</div>
                      <div className="text-gray-500 text-xs line-through">{product.originalPrice}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

