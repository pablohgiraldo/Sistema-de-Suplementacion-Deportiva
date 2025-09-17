import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext.jsx';

// Hook seguro para usar el carrito
function useCartSafe() {
    try {
        return useContext(CartContext);
    } catch {
        return null;
    }
}

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const cartContext = useCartSafe();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-gray-900">SPG</span>
                            <span className="ml-2 text-sm text-gray-600">SUPERGAINS</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <span className="text-gray-700">
                                    Hola, {user?.nombre}
                                </span>
                                <Link
                                    to="/profile"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Perfil
                                </Link>
                                <Link
                                    to="/cart"
                                    className="relative text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Carrito
                                    {cartContext && cartContext.getCartItemCount() > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartContext.getCartItemCount()}
                                        </span>
                                    )}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
