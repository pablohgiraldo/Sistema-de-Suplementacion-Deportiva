import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const PhysicalSaleModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        items: [{ product: '', quantity: 1, price: 0 }],
        customerInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: 'Colombia'
        },
        cashierInfo: {
            storeLocation: 'Tienda Principal',
            cashierName: '',
            registerNumber: 'Caja 1',
            receiptNumber: ''
        },
        paymentMethod: 'cash',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const queryClient = useQueryClient();

    // Obtener productos para el selector
    const { data: productsData } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get('/products?limit=1000');
            return response.data;
        },
        enabled: isOpen
    });

    // Mutation para crear venta física
    const createPhysicalSaleMutation = useMutation({
        mutationFn: async (saleData) => {
            const response = await api.post('/orders/physical-sale', saleData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['omnichannel-dashboard']);
            queryClient.invalidateQueries(['realtime-metrics']);
            onSuccess?.();
        },
        onError: (error) => {
            console.error('Error creating physical sale:', error);
            setErrors({ submit: error.response?.data?.message || 'Error al crear la venta' });
        }
    });

    const products = productsData?.data || [];

    useEffect(() => {
        if (isOpen) {
            // Generar número de recibo único
            const receiptNumber = `REC-${Date.now()}`;
            setFormData(prev => ({
                ...prev,
                cashierInfo: {
                    ...prev.cashierInfo,
                    receiptNumber
                }
            }));
        }
    }, [isOpen]);

    const handleInputChange = (e, section, field) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        // Limpiar errores cuando el usuario modifica
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Si se selecciona un producto, obtener su precio
        if (field === 'product') {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                newItems[index].price = selectedProduct.price;
            }
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product: '', quantity: 1, price: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar información del cliente
        if (!formData.customerInfo.firstName.trim()) {
            newErrors.firstName = 'El nombre es requerido';
        }
        if (!formData.customerInfo.lastName.trim()) {
            newErrors.lastName = 'El apellido es requerido';
        }

        // Validar items
        formData.items.forEach((item, index) => {
            if (!item.product) {
                newErrors[`item_${index}_product`] = 'Selecciona un producto';
            }
            if (item.quantity < 1) {
                newErrors[`item_${index}_quantity`] = 'La cantidad debe ser al menos 1';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Filtrar items válidos
        const validItems = formData.items.filter(item => item.product && item.quantity > 0);

        const saleData = {
            items: validItems.map(item => ({
                product: item.product,
                quantity: parseInt(item.quantity)
            })),
            customerInfo: formData.customerInfo,
            cashierInfo: formData.cashierInfo,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes
        };

        createPhysicalSaleMutation.mutate(saleData);
    };

    if (!isOpen) return null;

    const totalAmount = formData.items.reduce((sum, item) => {
        const product = products.find(p => p._id === item.product);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Registrar Venta Física</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información del Cliente */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.customerInfo.firstName}
                                    onChange={(e) => handleInputChange(e, 'customerInfo', 'firstName')}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                                <input
                                    type="text"
                                    value={formData.customerInfo.lastName}
                                    onChange={(e) => handleInputChange(e, 'customerInfo', 'lastName')}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={formData.customerInfo.email}
                                    onChange={(e) => handleInputChange(e, 'customerInfo', 'email')}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                <input
                                    type="tel"
                                    value={formData.customerInfo.phone}
                                    onChange={(e) => handleInputChange(e, 'customerInfo', 'phone')}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items de Venta */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Productos</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm"
                            >
                                Agregar Producto
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Producto</label>
                                        <select
                                            value={item.product}
                                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Selecciona un producto</option>
                                            {products.map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name} - ${product.price?.toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`item_${index}_product`] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_product`]}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Precio</label>
                                        <input
                                            type="number"
                                            value={item.price}
                                            disabled
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {errors[`item_${index}_quantity`] && (
                                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                                        )}
                                    </div>

                                    <div className="flex space-x-2">
                                        <div className="text-sm font-medium text-gray-700 pt-2">
                                            ${((products.find(p => p._id === item.product)?.price || 0) * item.quantity).toLocaleString()}
                                        </div>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Información Adicional */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="cash">Efectivo</option>
                                <option value="card_physical">Tarjeta</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ubicación de Tienda</label>
                            <input
                                type="text"
                                value={formData.cashierInfo.storeLocation}
                                onChange={(e) => handleInputChange(e, 'cashierInfo', 'storeLocation')}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notas (opcional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows="3"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Notas adicionales sobre la venta..."
                        />
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-blue-600">${totalAmount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Errores del submit */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createPhysicalSaleMutation.isPending || totalAmount === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createPhysicalSaleMutation.isPending ? 'Procesando...' : 'Registrar Venta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PhysicalSaleModal;
