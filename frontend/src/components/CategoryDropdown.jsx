import { useState, useRef, useEffect } from 'react';

/**
 * Componente: CategoryDropdown
 * Menú desplegable de categoría con submenús y productos destacados
 */
export default function CategoryDropdown({ category, onFilterClick, onCategoryClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Definir submenús simples para cada categoría
    const categoryMenus = {
        "Proteínas en Polvo": [
            { name: "Proteínas en Polvo", filter: "Proteínas" },
            { name: "Proteína Whey", filter: "Proteínas" },
            { name: "Proteína Isolate", filter: "Proteínas" },
            { name: "Proteína Vegana", filter: "Vegano" },
            { name: "Caseína", filter: "Proteínas" }
        ],
        "Barras y Snacks": [
            { name: "Barras y Snacks", filter: "Alimentos y Snacks" },
            { name: "Barras de Proteína", filter: "Barras de Proteína" },
            { name: "Snacks Saludables", filter: "Alimentos y Snacks" },
            { name: "Frutos Secos", filter: "Alimentos y Snacks" },
            { name: "Proteína en Barra", filter: "Barras de Proteína" }
        ],
        "Vitaminas y Más": [
            { name: "Vitaminas y Más", filter: "Vitaminas y Más" },
            { name: "Multivitamínicos", filter: "Vitaminas y Más" },
            { name: "Omega 3", filter: "Vitaminas y Más" },
            { name: "Vitamina D", filter: "Vitaminas y Más" },
            { name: "Minerales", filter: "Vitaminas y Más" }
        ],
        "Rendimiento": [
            { name: "Rendimiento", filter: "Rendimiento" },
            { name: "Pre-Workout", filter: "Rendimiento" },
            { name: "Creatina", filter: "Rendimiento" },
            { name: "BCAA", filter: "Rendimiento" },
            { name: "Glutamina", filter: "Rendimiento" }
        ],
        "Accesorios": [
            { name: "Accesorios", filter: "Todos los Productos" },
            { name: "Shakers", filter: "Todos los Productos" },
            { name: "Botellas", filter: "Todos los Productos" },
            { name: "Toallas", filter: "Todos los Productos" }
        ]
    };

    const menuData = categoryMenus[category];

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Si la categoría no tiene menú, solo mostrar el texto
    if (!menuData) {
        return (
            <button
                className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2"
                onClick={() => onFilterClick(category)}
            >
                {category}
            </button>
        );
    }

    const [buttonRect, setButtonRect] = useState(null);

    // Obtener la posición del botón cuando se abre el dropdown
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setButtonRect(rect);
        }
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de categoría */}
            <button
                onClick={() => {
                    console.log('Toggle dropdown:', category, 'Current state:', isOpen);
                    setIsOpen(!isOpen);
                }}
                className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 py-2 whitespace-nowrap ${
                    isOpen ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span>{category}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu - Usando fixed para que se superponga correctamente */}
            {isOpen && menuData && menuData.length > 0 && buttonRect && (
                <div
                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[100] animate-slideDown min-w-[220px]"
                    style={{
                        top: `${buttonRect.bottom + window.scrollY}px`,
                        left: `${buttonRect.left}px`
                    }}
                >
                    <div className="py-2">
                        {menuData.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    onFilterClick(item.filter);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 first:font-semibold first:border-b first:border-gray-100 first:mb-1"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

