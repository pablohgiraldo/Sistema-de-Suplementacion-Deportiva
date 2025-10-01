import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useWishlist from '../hooks/useWishlist';
import useNotifications from '../hooks/useNotifications';

const WishlistButton = ({ productId, productName, size = 'md', className = '' }) => {
    const { isAuthenticated } = useAuth();
    const { isInWishlist, toggleWishlist, isAddingOrRemoving } = useWishlist();
    const { showSuccess, showError, showWarning } = useNotifications();
    const [isHovered, setIsHovered] = useState(false);

    const inWishlist = isInWishlist(productId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            showWarning('Inicia sesión para guardar productos en tu lista de deseos');
            return;
        }

        try {
            await toggleWishlist(productId);
            if (inWishlist) {
                showSuccess(`${productName} removido de tu lista de deseos`);
            } else {
                showSuccess(`${productName} agregado a tu lista de deseos`);
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Error al actualizar lista de deseos');
        }
    };

    const sizeClasses = {
        sm: 'w-6 h-6 p-1',
        md: 'w-8 h-8 p-1.5',
        lg: 'w-10 h-10 p-2'
    };

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <button
            onClick={handleClick}
            disabled={isAddingOrRemoving}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                ${sizeClasses[size]}
                rounded-full
                transition-all
                duration-200
                flex
                items-center
                justify-center
                ${inWishlist
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }
                ${isAddingOrRemoving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            title={inWishlist ? 'Remover de lista de deseos' : 'Agregar a lista de deseos'}
            aria-label={inWishlist ? 'Remover de lista de deseos' : 'Agregar a lista de deseos'}
        >
            {isAddingOrRemoving ? (
                <svg className={`${iconSizeClasses[size]} animate-spin`} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : inWishlist ? (
                <svg className={iconSizeClasses[size]} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
            ) : (
                <svg
                    className={iconSizeClasses[size]}
                    fill={isHovered ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )}
        </button>
    );
};

export default WishlistButton;

