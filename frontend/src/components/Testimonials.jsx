// Placeholder de Testimonios - Diseño minimalista según PRD
export default function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-gray-100 rounded-2xl my-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header minimalista */}
        <div className="text-center mb-12">
          <div className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            TESTIMONIOS
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Historias reales de atletas que han transformado su rendimiento con SuperGains
          </p>
        </div>

        {/* Grid de testimonios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-4 text-sm">
              "Los productos de SuperGains han transformado completamente mi rutina de entrenamiento. La calidad es excepcional."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h4 className="font-bold text-black text-sm">Carlos M.</h4>
              <p className="text-gray-600 text-xs">Culturista</p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-4 text-sm">
              "La proteína Designer Whey es increíble. Me ayuda a recuperarme más rápido y mantener mi rendimiento."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h4 className="font-bold text-black text-sm">María G.</h4>
              <p className="text-gray-600 text-xs">CrossFit</p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-4 text-sm">
              "Como entrenador, siempre busco los mejores suplementos. SuperGains nunca me ha decepcionado."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <h4 className="font-bold text-black text-sm">Diego R.</h4>
              <p className="text-gray-600 text-xs">Entrenador</p>
            </div>
          </div>

          {/* Testimonial 4 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-4 text-sm">
              "Los suplementos me han ayudado a mejorar mi resistencia. El sabor es delicioso y la digestión perfecta."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h4 className="font-bold text-black text-sm">Ana T.</h4>
              <p className="text-gray-600 text-xs">Maratonista</p>
            </div>
          </div>

          {/* Testimonial 5 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-4 text-sm">
              "La creatina de SuperGains es de la más alta calidad. He notado mejoras significativas en mi fuerza."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <h4 className="font-bold text-black text-sm">Javier P.</h4>
              <p className="text-gray-600 text-xs">Powerlifter</p>
            </div>
          </div>

          {/* Testimonial 6 */}
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-gray-800 font-medium mb-4 text-sm">
              "El servicio al cliente es excepcional y siempre encuentro lo que necesito. ¡Recomendado al 100%!"
            </p>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mb-2">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h4 className="font-bold text-black text-sm">Sofía L.</h4>
              <p className="text-gray-600 text-xs">Nutricionista</p>
            </div>
          </div>
        </div>

        {/* Stats placeholder */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">10K+</div>
            <div className="text-gray-600 text-sm">Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">4.9</div>
            <div className="text-gray-600 text-sm">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">50+</div>
            <div className="text-gray-600 text-sm">Productos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">24/7</div>
            <div className="text-gray-600 text-sm">Soporte</div>
          </div>
        </div>
      </div>
    </section>
  );
}
