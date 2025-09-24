import { useState, useEffect } from 'react';
import { useAlertConfig, useAlertConfigMutations } from '../hooks/useAlerts';

const AlertConfigForm = ({ productId, onClose, onSuccess }) => {
    const { data: configData, isLoading, error } = useAlertConfig(productId);
    const { updateConfig, createConfig, createDefaultConfig } = useAlertConfigMutations();

    const [formData, setFormData] = useState({
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        outOfStockThreshold: 0,
        emailAlerts: {
            enabled: true,
            lowStock: true,
            criticalStock: true,
            outOfStock: true,
            recipients: []
        },
        appAlerts: {
            enabled: true,
            lowStock: true,
            criticalStock: true,
            outOfStock: true
        },
        webhookAlerts: {
            enabled: false,
            url: '',
            events: []
        },
        alertFrequency: 'immediate',
        autoRestock: {
            enabled: false,
            quantity: 50,
            supplier: ''
        },
        status: 'active'
    });

    const [newEmail, setNewEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar datos existentes cuando se obtengan
    useEffect(() => {
        if (configData?.data) {
            setFormData(configData.data);
        }
    }, [configData]);

    const handleInputChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleAddEmail = () => {
        if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setFormData(prev => ({
                ...prev,
                emailAlerts: {
                    ...prev.emailAlerts,
                    recipients: [...prev.emailAlerts.recipients, newEmail]
                }
            }));
            setNewEmail('');
        }
    };

    const handleRemoveEmail = (index) => {
        setFormData(prev => ({
            ...prev,
            emailAlerts: {
                ...prev.emailAlerts,
                recipients: prev.emailAlerts.recipients.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (configData?.data) {
                // Actualizar configuración existente
                await updateConfig.mutateAsync({
                    productId,
                    configData: formData
                });
            } else {
                // Crear nueva configuración
                await createConfig.mutateAsync({
                    productId,
                    configData: formData
                });
            }

            onSuccess?.();
            onClose?.();
        } catch (error) {
            console.error('Error saving alert config:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateDefault = async () => {
        setIsSubmitting(true);
        try {
            await createDefaultConfig.mutateAsync(productId);
            onSuccess?.();
            onClose?.();
        } catch (error) {
            console.error('Error creating default config:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-lg">Cargando configuración...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-600 mb-4">
                    Error al cargar la configuración: {error.message}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCreateDefault}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Crear Configuración por Defecto
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Configuración de Alertas de Stock</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Thresholds de Stock */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Umbrales de Stock</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Bajo
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.lowStockThreshold}
                                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Alerta cuando el stock sea menor o igual a este valor
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Crítico
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.criticalStockThreshold}
                                onChange={(e) => handleInputChange('criticalStockThreshold', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Alerta urgente cuando el stock sea menor o igual a este valor
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Agotado
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.outOfStockThreshold}
                                onChange={(e) => handleInputChange('outOfStockThreshold', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Alerta crítica cuando el stock sea menor o igual a este valor
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alertas por Email */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Alertas por Email</h3>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="emailEnabled"
                                checked={formData.emailAlerts.enabled}
                                onChange={(e) => handleInputChange('emailAlerts.enabled', e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="emailEnabled" className="text-sm font-medium text-gray-700">
                                Habilitar alertas por email
                            </label>
                        </div>

                        {formData.emailAlerts.enabled && (
                            <>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="emailLowStock"
                                            checked={formData.emailAlerts.lowStock}
                                            onChange={(e) => handleInputChange('emailAlerts.lowStock', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="emailLowStock" className="text-sm text-gray-700">
                                            Stock bajo
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="emailCriticalStock"
                                            checked={formData.emailAlerts.criticalStock}
                                            onChange={(e) => handleInputChange('emailAlerts.criticalStock', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="emailCriticalStock" className="text-sm text-gray-700">
                                            Stock crítico
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="emailOutOfStock"
                                            checked={formData.emailAlerts.outOfStock}
                                            onChange={(e) => handleInputChange('emailAlerts.outOfStock', e.target.checked)}
                                            className="mr-2"
                                        />
                                        <label htmlFor="emailOutOfStock" className="text-sm text-gray-700">
                                            Stock agotado
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Destinatarios de Email
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="admin@supergains.com"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddEmail}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Agregar
                                        </button>
                                    </div>

                                    {formData.emailAlerts.recipients.length > 0 && (
                                        <div className="space-y-1">
                                            {formData.emailAlerts.recipients.map((email, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                                    <span className="text-sm">{email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEmail(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Alertas en App */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Alertas en la Aplicación</h3>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="appEnabled"
                                checked={formData.appAlerts.enabled}
                                onChange={(e) => handleInputChange('appAlerts.enabled', e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="appEnabled" className="text-sm font-medium text-gray-700">
                                Habilitar alertas en la aplicación
                            </label>
                        </div>

                        {formData.appAlerts.enabled && (
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="appLowStock"
                                        checked={formData.appAlerts.lowStock}
                                        onChange={(e) => handleInputChange('appAlerts.lowStock', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="appLowStock" className="text-sm text-gray-700">
                                        Stock bajo
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="appCriticalStock"
                                        checked={formData.appAlerts.criticalStock}
                                        onChange={(e) => handleInputChange('appAlerts.criticalStock', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="appCriticalStock" className="text-sm text-gray-700">
                                        Stock crítico
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="appOutOfStock"
                                        checked={formData.appAlerts.outOfStock}
                                        onChange={(e) => handleInputChange('appAlerts.outOfStock', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="appOutOfStock" className="text-sm text-gray-700">
                                        Stock agotado
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Frecuencia de Alertas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Frecuencia de Alertas</h3>

                    <select
                        value={formData.alertFrequency}
                        onChange={(e) => handleInputChange('alertFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="immediate">Inmediato</option>
                        <option value="hourly">Cada hora</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                    </select>
                </div>

                {/* Auto-reabastecimiento */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Auto-reabastecimiento</h3>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="autoRestockEnabled"
                                checked={formData.autoRestock.enabled}
                                onChange={(e) => handleInputChange('autoRestock.enabled', e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="autoRestockEnabled" className="text-sm font-medium text-gray-700">
                                Habilitar auto-reabastecimiento
                            </label>
                        </div>

                        {formData.autoRestock.enabled && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cantidad de Reabastecimiento
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.autoRestock.quantity}
                                        onChange={(e) => handleInputChange('autoRestock.quantity', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Proveedor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.autoRestock.supplier}
                                        onChange={(e) => handleInputChange('autoRestock.supplier', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Estado */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Estado de la Configuración</h3>

                    <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                    </select>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AlertConfigForm;
