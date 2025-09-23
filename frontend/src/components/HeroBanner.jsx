// Componente Hero Banner según PRD
export default function HeroBanner({ data }) {
  return (
    <div className="bg-gray-100 rounded-xl overflow-hidden my-8 h-80 sm:h-96 lg:h-[28rem] w-full">
      <div className="flex flex-col sm:flex-row h-full w-full">
        {/* Sección izquierda - Imagen de estilo de vida */}
        <div className="w-full sm:w-1/2 bg-gray-800 flex items-center justify-center relative">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center&auto=format&q=80"
              alt="Entrenamiento intenso"
              className="w-full h-full object-cover opacity-40"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="text-center text-white p-4 sm:p-6 lg:p-8 relative z-10">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-3 lg:mb-4"></div>
            <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2">SUPERGAINS</h2>
            <p className="text-gray-300 text-xs sm:text-sm">Impulsa tu rendimiento, conquista tus límites.</p>
          </div>
        </div>

        {/* Sección derecha - Imagen con overlay de texto */}
        <div className="w-full sm:w-1/2 flex items-center justify-center relative">
          <img
            src="https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&h=600&fit=crop&crop=center&auto=format&q=80"
            alt="ESN Designer Whey Protein"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />

          {/* Overlay con badge, título y CTA */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center p-6 sm:p-8">
            {/* Badge en esquina superior izquierda */}
            <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 rounded-full text-xs font-bold">
              NEW
            </div>

            {/* Título */}
            <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-2 sm:mb-3">
              DESIGNER WHEY PROTEIN
            </h1>

            {/* Subtítulo */}
            <p className="text-gray-200 text-sm sm:text-base text-center mb-4 sm:mb-6">
              New in: KiBa Flavor
            </p>

            {/* CTA Button */}
            <button className="bg-white text-black px-6 sm:px-8 py-2 sm:py-3 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base">
              SAVE 20%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

