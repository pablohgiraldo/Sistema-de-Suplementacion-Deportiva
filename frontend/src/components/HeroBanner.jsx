// Componente Hero Banner según PRD
export default function HeroBanner({ data }) {
  return (
        <div className="bg-gray-100 rounded-xl overflow-hidden my-8 h-80 sm:h-96 lg:h-[28rem] w-full">
      <div className="flex flex-col sm:flex-row h-full w-full">
        {/* Sección izquierda - Imagen de estilo de vida */}
        <div className="w-full sm:w-1/2 bg-gray-800 flex items-center justify-center relative">
          <div className="absolute inset-0">
            <img
              src="https://media.istockphoto.com/id/1149241593/es/foto/hombre-haciendo-ejercicio-de-entrenamiento-cruzado-con-cuerda.jpg?s=612x612&w=0&k=20&c=1hgXn6oufRQ1Vk1sUp2HPKzdXtgOllNtL-ROe70BzYg="
              alt="Entrenamiento intenso"
              className="w-full h-full object-cover opacity-40"
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
            src="https://gymmarkt.at/cdn/shop/articles/esn_whey_designer_protein_330735c8-5774-4df8-8fcb-3b5c98a7aa51.png?v=1746027581&width=2048" 
            alt="ESN Designer Whey Protein"
            className="w-full h-full object-cover"
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
