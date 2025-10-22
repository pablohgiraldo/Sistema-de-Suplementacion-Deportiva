import { useState, useRef, useEffect } from 'react';

/**
 * Componente: CountrySelector
 * Selector de país/región con dropdown funcional
 */
export default function CountrySelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState({
        code: 'CO',
        name: 'Colombia',
        flag: '🇨🇴',
        currency: 'COP'
    });

    const dropdownRef = useRef(null);

    const countries = [
        { code: 'CO', name: 'Colombia', flag: '🇨🇴', currency: 'COP' },
        { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', currency: 'USD' },
        { code: 'MX', name: 'México', flag: '🇲🇽', currency: 'MXN' },
        { code: 'ES', name: 'España', flag: '🇪🇸', currency: 'EUR' },
        { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS' },
        { code: 'CL', name: 'Chile', flag: '🇨🇱', currency: 'CLP' },
        { code: 'PE', name: 'Perú', flag: '🇵🇪', currency: 'PEN' },
        { code: 'BR', name: 'Brasil', flag: '🇧🇷', currency: 'BRL' }
    ];

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

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        // Aquí puedes agregar lógica adicional como cambiar la moneda, idioma, etc.
        console.log('País seleccionado:', country);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón selector */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`País seleccionado: ${selectedCountry.name}`}
                aria-expanded={isOpen}
            >
                <span className="text-xl" aria-hidden="true">{selectedCountry.flag}</span>
                <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Selecciona tu región
                        </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {countries.map((country) => (
                            <button
                                key={country.code}
                                onClick={() => handleCountrySelect(country)}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                                    selectedCountry.code === country.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                }`}
                                aria-label={`Seleccionar ${country.name}`}
                            >
                                <span className="text-xl" aria-hidden="true">{country.flag}</span>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium">{country.name}</p>
                                    <p className="text-xs text-gray-500">{country.currency}</p>
                                </div>
                                {selectedCountry.code === country.code && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

