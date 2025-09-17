// Componente Footer según PRD
export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sección Izquierda - Marca y Copyright */}
          <div>
            <div className="text-2xl font-bold mb-2">SUPERGAINS</div>
            <div className="text-sm text-gray-400 mb-4">SUPERGAINS ELITE SPORTS NUTRITION</div>
            <div className="text-xs text-gray-500">
              <div>© 2025 SuperGains Colombia</div>
              <div>Todos los precios incluyen IVA.</div>
            </div>
          </div>

          {/* Sección Central - Navegación */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-3">Atención al Cliente</h3>
              <div className="text-sm space-y-1">
                <a href="#contacto" className="block hover:text-blue-400 transition-colors cursor-pointer">Servicio y Preguntas Frecuentes</a>
                <a href="#contacto" className="block hover:text-blue-400 transition-colors cursor-pointer">Contacto</a>
                <a href="#" className="block hover:text-blue-400 transition-colors cursor-pointer">Rastrear mi pedido</a>
                <a href="#" className="block hover:text-blue-400 transition-colors cursor-pointer">Envíos</a>
                <a href="#" className="block hover:text-blue-400 transition-colors cursor-pointer">Devoluciones</a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">Empresa</h3>
              <div className="text-sm space-y-1">
                <a href="#nosotros" className="block hover:text-blue-400 transition-colors cursor-pointer">Acerca de Nosotros</a>
                <a href="#" className="block hover:text-blue-400 transition-colors cursor-pointer">Carreras</a>
                <a href="#" className="block hover:text-blue-400 transition-colors cursor-pointer">Aviso Legal</a>
                <a href="#" className="block hover:text-blue-400 transition-colors cursor-pointer">Política de Privacidad</a>
              </div>
            </div>
          </div>

          {/* Sección Derecha - Sociales, Pagos, Envío */}
          <div>
            <div className="mb-6">
              <h3 className="font-bold mb-3">Nuestras Redes</h3>
              <div className="flex gap-2">
                <a
                  href="https://www.instagram.com/supergains96?utm_source=ig_web_button_share_sheet&igsh=d3cybHN6cGh5cGQy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center text-black transition-colors cursor-pointer"
                  title="Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@supergains96?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center text-black transition-colors cursor-pointer"
                  title="TikTok"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-3">Opciones de Pago</h3>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-white text-black px-2 py-1 rounded text-center font-semibold">AMEX</div>
                <div className="bg-white text-black px-2 py-1 rounded text-center font-semibold">MC</div>
                <div className="bg-white text-black px-2 py-1 rounded text-center font-semibold">VISA</div>
                <div className="bg-white text-black px-2 py-1 rounded text-center font-semibold">PP</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">Envíos</h3>
              <div className="bg-yellow-400 text-red-600 px-3 py-1 rounded text-sm font-bold">
                DHL
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
