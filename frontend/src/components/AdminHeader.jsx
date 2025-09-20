import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Header simplificado para el dashboard de administración
export default function AdminHeader({
    user,
    isAuthenticated,
    onLogout,
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
                                    placeholder="Buscar productos..."
                                    value={searchQuery}
                                    onChange={(e) => onSearch(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Menú de Usuario con iconos SVG */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-4">
                                    {/* Perfil */}
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm font-medium">{user?.nombre || user?.firstName || 'Usuario'}</span>
                                    </div>

                                    {/* Dashboard */}
                                    <Link
                                        to="/admin"
                                        className="w-5 h-5 cursor-pointer hover:text-gray-600 relative block"
                                        title="Dashboard de Administración"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </Link>

                                    {/* Tienda */}
                                    <Link
                                        to="/"
                                        className="w-5 h-5 cursor-pointer hover:text-gray-600 relative block"
                                        title="Ir a la Tienda"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                        </svg>
                                    </Link>

                                    {/* Cerrar Sesión */}
                                    <button
                                        onClick={onLogout}
                                        className="w-5 h-5 cursor-pointer hover:text-red-600 relative block"
                                        title="Cerrar Sesión"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                                    >
                                        Registrarse
                                    </Link>
                                </div>
                            )}

                            {/* Botón de menú móvil */}
                            <button
                                onClick={toggleMobileMenu}
                                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                <span className="sr-only">Abrir menú principal</span>
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Barra de búsqueda móvil */}
                    <div className="md:hidden mt-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => onSearch(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menú móvil */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                            {isAuthenticated ? (
                                <>
                                    {/* Perfil móvil */}
                                    <div className="flex items-center gap-2 py-3 px-3 border-b border-gray-100 mb-4">
                                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm font-medium">{user?.nombre || user?.firstName || 'Usuario'}</span>
                                    </div>

                                    {/* Dashboard móvil */}
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-2 py-3 px-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Dashboard
                                    </Link>

                                    {/* Tienda móvil */}
                                    <Link
                                        to="/"
                                        className="flex items-center gap-2 py-3 px-3 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                        </svg>
                                        Tienda
                                    </Link>

                                    {/* Cerrar Sesión móvil */}
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 w-full text-left py-3 px-3 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
