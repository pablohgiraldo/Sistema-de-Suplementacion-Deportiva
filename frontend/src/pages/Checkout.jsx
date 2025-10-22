import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import useNotifications from '../hooks/useNotifications';
import LoadingSpinner from '../components/LoadingSpinner';
import LoyaltyRedeemCard from '../components/LoyaltyRedeemCard';
import { 
    FormInput, 
    FormButton, 
    FormGroup, 
    FormError, 
    FormSelect,
    AddressInput,
    CardInput,
    FormCheckbox
} from '../components/forms';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { showSuccess, showError } = useNotifications();

    // Estados del formulario
    const [formData, setFormData] = useState({
        // Información de envío
        shippingAddress: {
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Colombia',
            phone: ''
        },
        // Información de facturación (por defecto igual a envío)
        billingAddress: {
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Colombia',
            phone: ''
        },
        // Método de pago
        paymentMethod: 'credit_card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        // Opciones adicionales
        sameAsShipping: true,
        saveAddress: false,
        acceptTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    
    // Estado para descuento de loyalty
    const [loyaltyDiscount, setLoyaltyDiscount] = useState({
        pointsRedeemed: 0,
        discountAmount: 0,
        applied: false
    });

    // Handler para aplicar descuento de loyalty
    const handleLoyaltyDiscountApplied = (discountData) => {
        setLoyaltyDiscount({
            pointsRedeemed: discountData.pointsRedeemed,
            discountAmount: discountData.discountAmount,
            applied: true
        });
        showSuccess(`¡${discountData.pointsRedeemed} puntos canjeados! Descuento de $${discountData.discountAmount.toFixed(2)} USD aplicado.`);
    };

    // Ciudades por departamento
    const citiesByDepartment = {
        'Antioquia': [
            // Área Metropolitana
            'Medellín', 'Bello', 'Itagüí', 'Envigado', 'La Estrella', 'Sabaneta', 'Caldas', 'Copacabana', 'Girardota', 'Barbosa', 'Guarne', 'El Retiro', 'La Ceja', 'Marinilla',
            // Norte de Antioquia
            'Yarumal', 'Angostura', 'Belmira', 'Briceño', 'Campamento', 'Cisneros', 'Don Matías', 'Entrerríos', 'Gómez Plata', 'Guadalupe', 'Ituango', 'San Andrés de Cuerquia',
            'San José de la Montaña', 'Santa Rosa de Osos', 'Toledo', 'Valdivia', 'Yolombó',
            // Nordeste de Antioquia
            'Remedios', 'Segovia', 'Vegachí', 'Yalí', 'Yondó',
            // Occidente de Antioquia
            'Abriaquí', 'Anorí', 'Caicedo', 'Cañasgordas', 'Dabeiba', 'Frontino', 'Giraldo', 'Heliconia', 'Liborina', 'Olaya', 'Peque', 'Sabanalarga', 'San Jerónimo',
            'Santa Fe de Antioquia', 'Sopetrán', 'Uramita', 'Urrao',
            // Oriente de Antioquia
            'Alejandría', 'Concepción', 'El Peñol', 'El Santuario', 'Granada', 'Guatapé', 'La Unión', 'Nariño', 'Rionegro', 'San Carlos', 'San Rafael', 'San Vicente', 'Sonsón',
            // Suroeste de Antioquia
            'Amagá', 'Andes', 'Angelópolis', 'Betania', 'Betulia', 'Caramanta', 'Ciudad Bolívar', 'Concordia', 'Fredonia', 'Hispania', 'Jardín', 'Jericó',
            'La Pintada', 'Montebello', 'Pueblorrico', 'Salgar', 'Santa Bárbara', 'Támesis', 'Tarso', 'Titiribí', 'Venecia',
            // Urabá Antioqueño
            'Apartadó', 'Arboletes', 'Carepa', 'Chigorodó', 'Murindó', 'Mutatá', 'Necoclí', 'San Juan de Urabá', 'San Pedro de Urabá', 'Turbo', 'Vigía del Fuerte',
            // Magdalena Medio
            'Caucasia', 'El Bagre', 'Nechí', 'Tarazá', 'Cáceres', 'Puerto Berrío', 'Puerto Nare', 'Puerto Triunfo', 'Caracolí', 'Maceo', 'San Luis',
            'Cocorná', 'San Francisco', 'Carmen de Viboral', 'Nuevo Colón', 'Retiro', 'San Pedro', 'San Roque', 'Santo Domingo', 'Valparaíso'
        ],
        'Bogotá D.C.': ['Bogotá'],
        'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Yumbo', 'Ginebra', 'La Unión', 'Obando', 'Restrepo', 'Riofrío', 'San Pedro', 'Trujillo', 'Vijes'],
        'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanagrande', 'Puerto Colombia', 'Galapa', 'Tubará', 'Usiacurí', 'Ponedera', 'Candelaria', 'Manatí', 'Repelón', 'Santo Tomás', 'Sabanalarga', 'Luruaco'],
        'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'San Gil', 'Barrancabermeja', 'Socorro', 'Barbosa', 'Vélez', 'Puerto Wilches', 'Sabana de Torres', 'El Playón', 'Los Santos', 'Villanueva', 'Zapatoca'],
        'Bolívar': ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'Mahates', 'San Pablo', 'Santa Rosa', 'Simití', 'Tiquisio', 'Villanueva', 'Achí', 'Altos del Rosario', 'Arenal', 'Arroyohondo', 'Calamar'],
        'Cundinamarca': ['Soacha', 'Girardot', 'Facatativá', 'Chía', 'Zipaquirá', 'Madrid', 'Mosquera', 'Fusagasugá', 'Sibaté', 'Tabio', 'Tenjo', 'Tocancipá', 'Cajicá', 'Cota', 'El Rosal'],
        'Nariño': ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'La Unión', 'Potosí', 'Aldana', 'Ancuyá', 'Arboleda', 'Barbacoas', 'Belén', 'Buesaco', 'Colón', 'Consacá', 'Contadero'],
        'Córdoba': ['Montería', 'Cereté', 'Sahagún', 'Lorica', 'Montelíbano', 'Planeta Rica', 'Puerto Libertador', 'San Andrés Sotavento', 'San Bernardo del Viento', 'San Carlos', 'San José de Uré', 'San Pelayo', 'Tierralta', 'Tuchín', 'Valencia'],
        'Tolima': ['Ibagué', 'Espinal', 'Girardot', 'Melgar', 'Guamo', 'Purificación', 'Saldaña', 'Chaparral', 'Natagaima', 'Ortega', 'Prado', 'Roncesvalles', 'San Antonio', 'Suárez', 'Villahermosa'],
        'Amazonas': ['Leticia', 'El Encanto', 'La Chorrera', 'La Pedrera', 'La Victoria', 'Miriti - Paraná', 'Puerto Alegría', 'Puerto Arica', 'Puerto Nariño', 'Puerto Santander', 'Tarapacá'],
        'Arauca': ['Arauca', 'Arauquita', 'Cravo Norte', 'Fortul', 'Puerto Rondón', 'Saravena', 'Tame'],
        'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva', 'Barbosa', 'Belén', 'Berbeo', 'Betéitiva', 'Boavita', 'Boyacá', 'Briceño', 'Buenavista', 'Busbanzá'],
        'Caldas': ['Manizales', 'La Dorada', 'Riosucio', 'Anserma', 'Aranzazu', 'Belalcázar', 'Chinchiná', 'Filadelfia', 'La Merced', 'Marmato', 'Neira', 'Pácora', 'Palestina', 'Pensilvania', 'Risaralda'],
        'Caquetá': ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'La Montañita', 'El Paujíl', 'El Doncello', 'Cartagena del Chairá', 'Curillo', 'Morelia', 'Valparaíso', 'Albania', 'Belén de los Andaquíes', 'Milán', 'San José del Fragua', 'Solano'],
        'Casanare': ['Yopal', 'Aguazul', 'Tauramena', 'Villanueva', 'Monterrey', 'Sabanalarga', 'Recetor', 'Paz de Ariporo', 'Hato Corozal', 'La Salina', 'Maní', 'Nunchía', 'Orocué', 'Pore', 'San Luis de Palenque'],
        'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía', 'Corinto', 'Miranda', 'Padilla', 'Villa Rica', 'Caldono', 'Caloto', 'Coconuco', 'Guapi', 'Inzá', 'Jambaló', 'López'],
        'Cesar': ['Valledupar', 'Aguachica', 'La Paz', 'San Diego', 'Codazzi', 'El Copey', 'La Gloria', 'Manaure', 'Pailitas', 'Pelaya', 'Pueblo Bello', 'Río de Oro', 'San Alberto', 'San Martín', 'Tamalameque'],
        'Chocó': ['Quibdó', 'Istmina', 'Condoto', 'Tadó', 'Riosucio', 'Acandí', 'Alto Baudó', 'Atrato', 'Bagadó', 'Bahía Solano', 'Bajo Baudó', 'Bojayá', 'Cantón de San Pablo', 'Carmen del Darién', 'Cértegui'],
        'Guainía': ['Inírida', 'Barranco Minas', 'Mapiripana', 'San Felipe', 'Puerto Colombia', 'La Guadalupe', 'Cacahual', 'Pana Pana', 'Morichal'],
        'Guaviare': ['San José del Guaviare', 'Calamar', 'El Retorno', 'Miraflores'],
        'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre', 'Gigante', 'Palermo', 'Rivera', 'San Agustín', 'Timaná', 'Acevedo', 'Agrado', 'Aipe', 'Algeciras', 'Altamira'],
        'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'San Juan del Cesar', 'Villanueva', 'El Molino', 'Fonseca', 'Barrancas', 'Distracción', 'Hatonuevo', 'La Jagua del Pilar', 'Urumita', 'Albania', 'Dibula'],
        'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación', 'Aracataca', 'El Banco', 'Plato', 'Zona Bananera', 'Algarrobo', 'Ariguaní', 'Cerro San Antonio', 'Chivolo', 'Concordia', 'El Piñón', 'El Retén', 'Guamal'],
        'Meta': ['Villavicencio', 'Acacías', 'Granada', 'San Martín', 'Cumaral', 'Restrepo', 'El Calvario', 'El Castillo', 'El Dorado', 'Fuente de Oro', 'Guamal', 'La Macarena', 'Lejanías', 'Mesetas', 'Puerto Concordia'],
        'Norte de Santander': ['Cúcuta', 'Ocaña', 'Villa del Rosario', 'Los Patios', 'El Zulia', 'San Cayetano', 'Villa Caro', 'Abrego', 'Arboledas', 'Bochalema', 'Bucarasica', 'Cácota', 'Cáchira', 'Chinácota', 'Chitagá'],
        'Putumayo': ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'San Miguel', 'Villagarzón', 'Colón', 'Leguízamo', 'Sibundoy', 'Santiago', 'San Francisco', 'Puerto Caicedo', 'La Hormiga', 'La Dorada', 'La Pedrera'],
        'Quindío': ['Armenia', 'Calarcá', 'La Tebaida', 'Montenegro', 'Quimbaya', 'Circasia', 'Filandia', 'Genova', 'Pijao', 'Salento', 'Buenavista', 'Córdoba', 'Córdoba', 'Pueblo Tapao', 'Ulloa'],
        'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'Cartago', 'La Virginia', 'Apía', 'Balboa', 'Belén de Umbría', 'Chinchiná', 'Guática', 'La Celia', 'Marsella', 'Mistrató', 'Pueblo Rico', 'Quinchía'],
        'San Andrés y Providencia': ['San Andrés', 'Providencia'],
        'Sucre': ['Sincelejo', 'Corozal', 'Sampués', 'San Onofre', 'Coveñas', 'Galeras', 'Guaranda', 'La Unión', 'Los Palmitos', 'Majagual', 'Morroa', 'Ovejas', 'Palmito', 'San Benito Abad', 'San Juan de Betulia'],
        'Vaupés': ['Mitú', 'Caruru', 'Pacoa', 'Taraira', 'Papunaua', 'Yavaraté'],
        'Vichada': ['Puerto Carreño', 'Cumaribo', 'La Primavera', 'Santa Rosalía']
    };

    // Cargar datos del usuario si está autenticado
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                shippingAddress: {
                    ...prev.shippingAddress,
                    firstName: user.nombre || '',
                    lastName: user.apellido || '',
                    phone: user.telefono || ''
                },
                billingAddress: {
                    ...prev.billingAddress,
                    firstName: user.nombre || '',
                    lastName: user.apellido || '',
                    phone: user.telefono || ''
                }
            }));
        }
    }, [user]);

    // Si no hay items en el carrito, redirigir
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    // Formatear número de tarjeta
    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        const matches = cleaned.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return cleaned;
        }
    };

    // Formatear fecha de vencimiento
    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
    };

    // Formatear teléfono
    const formatPhone = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 3) {
            return cleaned;
        } else if (cleaned.length <= 6) {
            return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`;
        } else {
            return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
        }
    };

    // Obtener ciudades por departamento
    const getCitiesByDepartment = (department) => {
        return citiesByDepartment[department] || [];
    };

    // Filtrar ciudades por texto de búsqueda
    const filterCities = (department, searchText) => {
        const cities = getCitiesByDepartment(department);
        if (!searchText) return cities;
        return cities.filter(city =>
            city.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    // Manejar cambio de departamento
    const handleDepartmentChange = (e, section) => {
        const department = e.target.value;
        const fieldName = `${section}.state`;
        const cityFieldName = `${section}.city`;

        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                state: department,
                city: '' // Limpiar ciudad cuando cambie el departamento
            }
        }));

        // Limpiar errores
        setErrors(prev => ({
            ...prev,
            [fieldName]: '',
            [cityFieldName]: ''
        }));

        // Actualizar sugerencias de ciudades
        setCitySuggestions(getCitiesByDepartment(department));
        setShowCitySuggestions(false);
    };

    // Manejar cambio de ciudad con autocompletado
    const handleCityChange = (e, section) => {
        const value = e.target.value;
        const fieldName = `${section}.city`;

        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                city: value
            }
        }));

        // Limpiar error
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }

        // Mostrar sugerencias si hay texto y departamento seleccionado
        if (value && formData[section].state) {
            const suggestions = filterCities(formData[section].state, value);
            setCitySuggestions(suggestions);
            setShowCitySuggestions(suggestions.length > 0);
        } else {
            setShowCitySuggestions(false);
        }
    };

    // Seleccionar ciudad de las sugerencias
    const selectCity = (city, section) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                city: city
            }
        }));
        setShowCitySuggestions(false);
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let formattedValue = value;

        // Formatear campos específicos
        if (name === 'cardNumber') {
            formattedValue = formatCardNumber(value);
        } else if (name === 'expiryDate') {
            formattedValue = formatExpiryDate(value);
        } else if (name.includes('phone')) {
            formattedValue = formatPhone(value);
        }

        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: formattedValue
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : formattedValue
            }));
        }

        // Limpiar error del campo modificado
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Copiar dirección de envío a facturación
    const handleSameAsShippingChange = (checked) => {
        setFormData(prev => ({
            ...prev,
            sameAsShipping: checked,
            billingAddress: checked ? prev.shippingAddress : prev.billingAddress
        }));
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        // Validar dirección de envío
        const shippingFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
        shippingFields.forEach(field => {
            if (!formData.shippingAddress[field]) {
                newErrors[`shippingAddress.${field}`] = 'Este campo es requerido';
            }
        });

        // Validaciones específicas para dirección de envío
        if (formData.shippingAddress.firstName && formData.shippingAddress.firstName.length < 2) {
            newErrors['shippingAddress.firstName'] = 'El nombre debe tener al menos 2 caracteres';
        }
        if (formData.shippingAddress.lastName && formData.shippingAddress.lastName.length < 2) {
            newErrors['shippingAddress.lastName'] = 'El apellido debe tener al menos 2 caracteres';
        }
        if (formData.shippingAddress.address && formData.shippingAddress.address.length < 10) {
            newErrors['shippingAddress.address'] = 'La dirección debe tener al menos 10 caracteres';
        }
        if (formData.shippingAddress.zipCode && !/^\d{5,6}$/.test(formData.shippingAddress.zipCode)) {
            newErrors['shippingAddress.zipCode'] = 'El código postal debe tener 5 o 6 dígitos';
        }
        if (formData.shippingAddress.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.shippingAddress.phone)) {
            newErrors['shippingAddress.phone'] = 'Formato de teléfono inválido';
        }

        // Validar dirección de facturación si no es igual a envío
        if (!formData.sameAsShipping) {
            const billingFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
            billingFields.forEach(field => {
                if (!formData.billingAddress[field]) {
                    newErrors[`billingAddress.${field}`] = 'Este campo es requerido';
                }
            });

            // Validaciones específicas para dirección de facturación
            if (formData.billingAddress.firstName && formData.billingAddress.firstName.length < 2) {
                newErrors['billingAddress.firstName'] = 'El nombre debe tener al menos 2 caracteres';
            }
            if (formData.billingAddress.lastName && formData.billingAddress.lastName.length < 2) {
                newErrors['billingAddress.lastName'] = 'El apellido debe tener al menos 2 caracteres';
            }
            if (formData.billingAddress.address && formData.billingAddress.address.length < 10) {
                newErrors['billingAddress.address'] = 'La dirección debe tener al menos 10 caracteres';
            }
            if (formData.billingAddress.zipCode && !/^\d{5,6}$/.test(formData.billingAddress.zipCode)) {
                newErrors['billingAddress.zipCode'] = 'El código postal debe tener 5 o 6 dígitos';
            }
            if (formData.billingAddress.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.billingAddress.phone)) {
                newErrors['billingAddress.phone'] = 'Formato de teléfono inválido';
            }
        }

        // Validar método de pago
        if (formData.paymentMethod === 'credit_card') {
            if (!formData.cardNumber) {
                newErrors.cardNumber = 'Número de tarjeta requerido';
            } else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Formato de tarjeta inválido (16 dígitos)';
            }

            if (!formData.expiryDate) {
                newErrors.expiryDate = 'Fecha de vencimiento requerida';
            } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
                newErrors.expiryDate = 'Formato inválido (MM/AA)';
            }

            if (!formData.cvv) {
                newErrors.cvv = 'CVV requerido';
            } else if (!/^\d{3,4}$/.test(formData.cvv)) {
                newErrors.cvv = 'CVV debe tener 3 o 4 dígitos';
            }

            if (!formData.cardholderName) {
                newErrors.cardholderName = 'Nombre del titular requerido';
            } else if (formData.cardholderName.length < 2) {
                newErrors.cardholderName = 'Nombre del titular debe tener al menos 2 caracteres';
            }
        }

        // Para PSE y PayPal no se requieren validaciones adicionales
        // PayU manejará la validación de estos métodos

        // Validar términos y condiciones
        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showError('Por favor corrige los errores en el formulario');
            return;
        }

        setIsSubmitting(true);

        try {
            // Preparar datos para enviar al API
            const orderData = {
                paymentMethod: formData.paymentMethod,
                shippingAddress: {
                    firstName: formData.shippingAddress.firstName,
                    lastName: formData.shippingAddress.lastName,
                    street: formData.shippingAddress.address,
                    city: formData.shippingAddress.city,
                    state: formData.shippingAddress.state,
                    zipCode: formData.shippingAddress.zipCode,
                    country: formData.shippingAddress.country,
                    phone: formData.shippingAddress.phone
                },
                billingAddress: formData.sameAsShipping ? null : {
                    firstName: formData.billingAddress.firstName,
                    lastName: formData.billingAddress.lastName,
                    street: formData.billingAddress.address,
                    city: formData.billingAddress.city,
                    state: formData.billingAddress.state,
                    zipCode: formData.billingAddress.zipCode,
                    country: formData.billingAddress.country,
                    phone: formData.billingAddress.phone
                },
                notes: '' // Simplificar notes por ahora
            };

            console.log('🛒 Creando orden con datos:', orderData);

            // PASO 1: Crear la orden en el backend
            const orderResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(orderData)
            });

            const orderResult = await orderResponse.json();

            if (!orderResponse.ok) {
                console.error('❌ Error del backend:', orderResult);
                if (orderResult.details && Array.isArray(orderResult.details)) {
                    const errorMessages = orderResult.details.map(detail => detail.message || detail).join(', ');
                    throw new Error(`Error: ${errorMessages}`);
                } else {
                    throw new Error(orderResult.error || 'Error al crear la orden');
                }
            }

            console.log('✅ Orden creada:', orderResult.data);

            // PASO 2: Generar formulario de pago con PayU
            const paymentResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/payments/generate-form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    orderId: orderResult.data._id
                })
            });

            const paymentResult = await paymentResponse.json();

            if (!paymentResponse.ok) {
                console.error('❌ Error generando formulario PayU:', paymentResult);
                throw new Error(paymentResult.error || 'Error al generar formulario de pago');
            }

            console.log('💳 Formulario PayU generado:', paymentResult.data);

            // PASO 3: Crear formulario HTML y enviar a PayU
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = paymentResult.data.formUrl;
            form.target = '_self';

            // Agregar todos los campos del formulario
            Object.keys(paymentResult.data.formData).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = paymentResult.data.formData[key];
                form.appendChild(input);
            });

            // Agregar formulario al DOM y enviarlo
            document.body.appendChild(form);
            form.submit();

            // Limpiar carrito después de enviar el formulario
            clearCart();

        } catch (error) {
            console.error('❌ Error en checkout:', error);
            showError(error.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Formatear precio
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Calcular totales
    const subtotal = cartTotal;
    const shipping = subtotal > 100 ? 0 : 2.5; // Envío gratis sobre $100 USD, costo $2.50 USD
    const tax = Math.round((subtotal * 0.19) * 100) / 100; // IVA 19% sobre USD
    const loyaltyDiscountAmount = loyaltyDiscount.applied ? loyaltyDiscount.discountAmount : 0;
    const total = Math.round((subtotal + shipping + tax - loyaltyDiscountAmount) * 100) / 100;

    if (cartItems.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <LoadingSpinner text="Redirigiendo al carrito..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
                    <p className="text-gray-600 mt-2">Completa tu información para procesar el pedido</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario principal */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Información de envío */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Envío</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.firstName"
                                            value={formData.shippingAddress.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['shippingAddress.firstName'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Tu nombre"
                                        />
                                        {errors['shippingAddress.firstName'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.firstName']}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.lastName"
                                            value={formData.shippingAddress.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['shippingAddress.lastName'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Tu apellido"
                                        />
                                        {errors['shippingAddress.lastName'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.lastName']}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dirección *
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.address"
                                            value={formData.shippingAddress.address}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['shippingAddress.address'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Calle, número, apartamento"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ejemplo: Calle 123 #45-67, Apartamento 8A
                                        </p>
                                        {errors['shippingAddress.address'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.address']}</p>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ciudad *
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.city"
                                            value={formData.shippingAddress.city}
                                            onChange={(e) => handleCityChange(e, 'shippingAddress')}
                                            onFocus={() => {
                                                if (formData.shippingAddress.city && formData.shippingAddress.state) {
                                                    const suggestions = filterCities(formData.shippingAddress.state, formData.shippingAddress.city);
                                                    setCitySuggestions(suggestions);
                                                    setShowCitySuggestions(suggestions.length > 0);
                                                }
                                            }}
                                            onBlur={() => {
                                                // Delay para permitir click en sugerencias
                                                setTimeout(() => setShowCitySuggestions(false), 200);
                                            }}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['shippingAddress.city'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder={formData.shippingAddress.state ? "Escribe el nombre de la ciudad" : "Primero selecciona un departamento"}
                                            disabled={!formData.shippingAddress.state}
                                        />

                                        {/* Sugerencias de ciudades */}
                                        {showCitySuggestions && citySuggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                {citySuggestions.slice(0, 10).map((city, index) => (
                                                    <div
                                                        key={index}
                                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                        onClick={() => selectCity(city, 'shippingAddress')}
                                                    >
                                                        {city}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {errors['shippingAddress.city'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.city']}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Departamento *
                                        </label>
                                        <select
                                            name="shippingAddress.state"
                                            value={formData.shippingAddress.state}
                                            onChange={(e) => handleDepartmentChange(e, 'shippingAddress')}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['shippingAddress.state'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Selecciona un departamento</option>
                                            <option value="Amazonas">Amazonas</option>
                                            <option value="Antioquia">Antioquia</option>
                                            <option value="Arauca">Arauca</option>
                                            <option value="Atlántico">Atlántico</option>
                                            <option value="Bolívar">Bolívar</option>
                                            <option value="Boyacá">Boyacá</option>
                                            <option value="Caldas">Caldas</option>
                                            <option value="Caquetá">Caquetá</option>
                                            <option value="Casanare">Casanare</option>
                                            <option value="Cauca">Cauca</option>
                                            <option value="Cesar">Cesar</option>
                                            <option value="Chocó">Chocó</option>
                                            <option value="Córdoba">Córdoba</option>
                                            <option value="Cundinamarca">Cundinamarca</option>
                                            <option value="Guainía">Guainía</option>
                                            <option value="Guaviare">Guaviare</option>
                                            <option value="Huila">Huila</option>
                                            <option value="La Guajira">La Guajira</option>
                                            <option value="Magdalena">Magdalena</option>
                                            <option value="Meta">Meta</option>
                                            <option value="Nariño">Nariño</option>
                                            <option value="Norte de Santander">Norte de Santander</option>
                                            <option value="Putumayo">Putumayo</option>
                                            <option value="Quindío">Quindío</option>
                                            <option value="Risaralda">Risaralda</option>
                                            <option value="San Andrés y Providencia">San Andrés y Providencia</option>
                                            <option value="Santander">Santander</option>
                                            <option value="Sucre">Sucre</option>
                                            <option value="Tolima">Tolima</option>
                                            <option value="Valle del Cauca">Valle del Cauca</option>
                                            <option value="Vaupés">Vaupés</option>
                                            <option value="Vichada">Vichada</option>
                                            <option value="Bogotá D.C.">Bogotá D.C.</option>
                                        </select>
                                        {errors['shippingAddress.state'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.state']}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Código Postal *
                                        </label>
                                        <input
                                            type="text"
                                            name="shippingAddress.zipCode"
                                            value={formData.shippingAddress.zipCode}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['shippingAddress.zipCode'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Código postal"
                                        />
                                        {errors['shippingAddress.zipCode'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.zipCode']}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Teléfono *
                                        </label>
                                        <input
                                            type="tel"
                                            name="shippingAddress.phone"
                                            value={formData.shippingAddress.phone}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['shippingAddress.phone'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Número de teléfono"
                                        />
                                        {errors['shippingAddress.phone'] && (
                                            <p className="text-red-500 text-sm mt-1">{errors['shippingAddress.phone']}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Información de facturación */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Información de Facturación</h2>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.sameAsShipping}
                                            onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Igual que la dirección de envío</span>
                                    </label>
                                </div>

                                {!formData.sameAsShipping && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre *
                                            </label>
                                            <input
                                                type="text"
                                                name="billingAddress.firstName"
                                                value={formData.billingAddress.firstName}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['billingAddress.firstName'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Nombre para facturación"
                                            />
                                            {errors['billingAddress.firstName'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.firstName']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Apellido *
                                            </label>
                                            <input
                                                type="text"
                                                name="billingAddress.lastName"
                                                value={formData.billingAddress.lastName}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['billingAddress.lastName'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Apellido para facturación"
                                            />
                                            {errors['billingAddress.lastName'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.lastName']}</p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección *
                                            </label>
                                            <input
                                                type="text"
                                                name="billingAddress.address"
                                                value={formData.billingAddress.address}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['billingAddress.address'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Dirección para facturación"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Ejemplo: Calle 123 #45-67, Apartamento 8A
                                            </p>
                                            {errors['billingAddress.address'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.address']}</p>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Ciudad *
                                            </label>
                                            <input
                                                type="text"
                                                name="billingAddress.city"
                                                value={formData.billingAddress.city}
                                                onChange={(e) => handleCityChange(e, 'billingAddress')}
                                                onFocus={() => {
                                                    if (formData.billingAddress.city && formData.billingAddress.state) {
                                                        const suggestions = filterCities(formData.billingAddress.state, formData.billingAddress.city);
                                                        setCitySuggestions(suggestions);
                                                        setShowCitySuggestions(suggestions.length > 0);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    // Delay para permitir click en sugerencias
                                                    setTimeout(() => setShowCitySuggestions(false), 200);
                                                }}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['billingAddress.city'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder={formData.billingAddress.state ? "Escribe el nombre de la ciudad" : "Primero selecciona un departamento"}
                                                disabled={!formData.billingAddress.state}
                                            />

                                            {/* Sugerencias de ciudades */}
                                            {showCitySuggestions && citySuggestions.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {citySuggestions.slice(0, 10).map((city, index) => (
                                                        <div
                                                            key={index}
                                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                            onClick={() => selectCity(city, 'billingAddress')}
                                                        >
                                                            {city}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {errors['billingAddress.city'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.city']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Departamento *
                                            </label>
                                            <select
                                                name="billingAddress.state"
                                                value={formData.billingAddress.state}
                                                onChange={(e) => handleDepartmentChange(e, 'billingAddress')}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['billingAddress.state'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Selecciona un departamento</option>
                                                <option value="Amazonas">Amazonas</option>
                                                <option value="Antioquia">Antioquia</option>
                                                <option value="Arauca">Arauca</option>
                                                <option value="Atlántico">Atlántico</option>
                                                <option value="Bolívar">Bolívar</option>
                                                <option value="Boyacá">Boyacá</option>
                                                <option value="Caldas">Caldas</option>
                                                <option value="Caquetá">Caquetá</option>
                                                <option value="Casanare">Casanare</option>
                                                <option value="Cauca">Cauca</option>
                                                <option value="Cesar">Cesar</option>
                                                <option value="Chocó">Chocó</option>
                                                <option value="Córdoba">Córdoba</option>
                                                <option value="Cundinamarca">Cundinamarca</option>
                                                <option value="Guainía">Guainía</option>
                                                <option value="Guaviare">Guaviare</option>
                                                <option value="Huila">Huila</option>
                                                <option value="La Guajira">La Guajira</option>
                                                <option value="Magdalena">Magdalena</option>
                                                <option value="Meta">Meta</option>
                                                <option value="Nariño">Nariño</option>
                                                <option value="Norte de Santander">Norte de Santander</option>
                                                <option value="Putumayo">Putumayo</option>
                                                <option value="Quindío">Quindío</option>
                                                <option value="Risaralda">Risaralda</option>
                                                <option value="San Andrés y Providencia">San Andrés y Providencia</option>
                                                <option value="Santander">Santander</option>
                                                <option value="Sucre">Sucre</option>
                                                <option value="Tolima">Tolima</option>
                                                <option value="Valle del Cauca">Valle del Cauca</option>
                                                <option value="Vaupés">Vaupés</option>
                                                <option value="Vichada">Vichada</option>
                                                <option value="Bogotá D.C.">Bogotá D.C.</option>
                                            </select>
                                            {errors['billingAddress.state'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.state']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Código Postal *
                                            </label>
                                            <input
                                                type="text"
                                                name="billingAddress.zipCode"
                                                value={formData.billingAddress.zipCode}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['billingAddress.zipCode'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Código postal"
                                            />
                                            {errors['billingAddress.zipCode'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.zipCode']}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono *
                                            </label>
                                            <input
                                                type="tel"
                                                name="billingAddress.phone"
                                                value={formData.billingAddress.phone}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors['billingAddress.phone'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Número de teléfono"
                                            />
                                            {errors['billingAddress.phone'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.phone']}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Método de pago */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">💳 Método de Pago</h2>

                                <div className="space-y-4">
                                    {/* Tarjeta de Crédito/Débito */}
                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="credit_card"
                                                name="paymentMethod"
                                                value="credit_card"
                                                checked={formData.paymentMethod === 'credit_card'}
                                                onChange={handleInputChange}
                                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex items-center">
                                                <div className="flex space-x-2 mr-3">
                                                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                                                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                                                    <div className="w-8 h-5 bg-gray-800 rounded text-white text-xs flex items-center justify-center font-bold">A</div>
                                                </div>
                                                <label htmlFor="credit_card" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                    Tarjeta de Crédito/Débito
                                                </label>
                                            </div>
                                        </div>

                                        {formData.paymentMethod === 'credit_card' && (
                                            <div className="mt-4 ml-7 space-y-4 border-t pt-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Número de Tarjeta *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cardNumber"
                                                        value={formData.cardNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength="19"
                                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                    />
                                                    {errors.cardNumber && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fecha de Vencimiento *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="expiryDate"
                                                            value={formData.expiryDate}
                                                            onChange={handleInputChange}
                                                            placeholder="MM/AA"
                                                            maxLength="5"
                                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                        />
                                                        {errors.expiryDate && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            CVV *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="cvv"
                                                            value={formData.cvv}
                                                            onChange={handleInputChange}
                                                            placeholder="123"
                                                            maxLength="4"
                                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                        />
                                                        {errors.cvv && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nombre del Titular *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cardholderName"
                                                        value={formData.cardholderName}
                                                        onChange={handleInputChange}
                                                        placeholder="Nombre como aparece en la tarjeta"
                                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                    />
                                                    {errors.cardholderName && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* PayPal */}
                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="paypal"
                                                name="paymentMethod"
                                                value="paypal"
                                                checked={formData.paymentMethod === 'paypal'}
                                                onChange={handleInputChange}
                                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex items-center">
                                                <div className="w-8 h-5 bg-blue-500 rounded mr-3 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">PP</span>
                                                </div>
                                                <label htmlFor="paypal" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                    PayPal
                                                </label>
                                            </div>
                                        </div>
                                        {formData.paymentMethod === 'paypal' && (
                                            <div className="mt-4 ml-7 border-t pt-4">
                                                <p className="text-sm text-gray-600">
                                                    Serás redirigido a PayPal para completar tu pago de forma segura.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* PSE - Pagos Seguros en Línea */}
                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="pse"
                                                name="paymentMethod"
                                                value="pse"
                                                checked={formData.paymentMethod === 'pse'}
                                                onChange={handleInputChange}
                                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex items-center">
                                                <div className="w-8 h-5 bg-orange-500 rounded mr-3 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">PSE</span>
                                                </div>
                                                <label htmlFor="pse" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                    PSE - Pagos Seguros en Línea
                                                </label>
                                            </div>
                                        </div>
                                        {formData.paymentMethod === 'pse' && (
                                            <div className="mt-4 ml-7 border-t pt-4">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <h3 className="text-sm font-medium text-blue-800">
                                                                ¿Cómo funciona PSE?
                                                            </h3>
                                                            <div className="mt-2 text-sm text-blue-700">
                                                                <p>1. Selecciona tu banco</p>
                                                                <p>2. Ingresa tus datos bancarios</p>
                                                                <p>3. Confirma la transacción</p>
                                                                <p>4. ¡Listo! Tu pago se procesa al instante</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Paga directamente desde tu cuenta bancaria de forma segura y rápida.
                                                </p>
                                                
                                                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                                                    <div className="flex items-center p-2 bg-gray-50 rounded">
                                                        <div className="w-6 h-4 bg-blue-600 rounded mr-2 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">BC</span>
                                                        </div>
                                                        <span className="font-medium">Bancolombia</span>
                                                    </div>
                                                    <div className="flex items-center p-2 bg-gray-50 rounded">
                                                        <div className="w-6 h-4 bg-red-600 rounded mr-2 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">BB</span>
                                                        </div>
                                                        <span className="font-medium">BBVA</span>
                                                    </div>
                                                    <div className="flex items-center p-2 bg-gray-50 rounded">
                                                        <div className="w-6 h-4 bg-green-600 rounded mr-2 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">DV</span>
                                                        </div>
                                                        <span className="font-medium">Davivienda</span>
                                                    </div>
                                                    <div className="flex items-center p-2 bg-gray-50 rounded">
                                                        <div className="w-6 h-4 bg-purple-600 rounded mr-2 flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">CP</span>
                                                        </div>
                                                        <span className="font-medium">Colpatria</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center">
                                                        <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs text-green-700 font-medium">
                                                            Más de 20 bancos disponibles • Transacción instantánea • Sin comisiones adicionales
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Términos y condiciones */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        name="acceptTerms"
                                        checked={formData.acceptTerms}
                                        onChange={handleInputChange}
                                        className="mt-1 mr-3"
                                    />
                                    <div>
                                        <label className="text-sm text-gray-700">
                                            Acepto los{' '}
                                            <a href="#" className="text-blue-600 hover:underline">
                                                términos y condiciones
                                            </a>{' '}
                                            y la{' '}
                                            <a href="#" className="text-blue-600 hover:underline">
                                                política de privacidad
                                            </a>
                                        </label>
                                        {errors.acceptTerms && (
                                            <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumen del pedido */}
                        <div className="lg:col-span-1">
                            {/* Tarjeta de Loyalty Points */}
                            {user && (
                                <div className="mb-4">
                                    <LoyaltyRedeemCard 
                                        onDiscountApplied={handleLoyaltyDiscountApplied}
                                        currentDiscount={loyaltyDiscountAmount}
                                    />
                                </div>
                            )}

                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>

                                {/* Productos */}
                                <div className="space-y-3 mb-6">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                                                <img
                                                    src={item.imageUrl || '/placeholder-product.svg'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Cantidad: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totales */}
                                <div className="space-y-2 border-t pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Envío</span>
                                        <span className="text-gray-900">{formatPrice(shipping)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">IVA (19%)</span>
                                        <span className="text-gray-900">{formatPrice(tax)}</span>
                                    </div>
                                    {loyaltyDiscount.applied && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                Descuento Lealtad ({loyaltyDiscount.pointsRedeemed} pts)
                                            </span>
                                            <span className="text-green-600 font-medium">-{formatPrice(loyaltyDiscount.discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-gray-900">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                {/* Botón de compra */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center">
                                            <LoadingSpinner size="sm" />
                                            <span className="ml-2">Procesando...</span>
                                        </div>
                                    ) : (
                                        `Completar Pedido - ${formatPrice(total)}`
                                    )}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-3">
                                    🔒 Pago seguro y encriptado
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
