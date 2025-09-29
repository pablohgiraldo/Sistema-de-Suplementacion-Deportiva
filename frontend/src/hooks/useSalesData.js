import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const useSalesData = (dateRange = '7') => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Calcular fechas según el rango seleccionado
    useEffect(() => {
        const end = new Date();
        const start = new Date();

        switch (dateRange) {
            case '7':
                start.setDate(end.getDate() - 7);
                break;
            case '30':
                start.setDate(end.getDate() - 30);
                break;
            case '90':
                start.setDate(end.getDate() - 90);
                break;
            default:
                start.setDate(end.getDate() - 7);
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    }, [dateRange]);

    // Query para obtener datos de ventas
    const {
        data: salesData,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['salesData', startDate, endDate],
        queryFn: async () => {
            if (!startDate || !endDate) return null;

            // Temporalmente apuntando al endpoint ultra básico
            const response = await api.get(`/orders/test-basic`);

            console.log('Respuesta del endpoint básico:', response.data);
            return response.data.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
    });

    // Procesar datos para el gráfico
    const chartData = salesData && salesData.statusBreakdown && salesData.statusBreakdown.orders ? [
        {
            name: 'Pendientes',
            Órdenes: salesData.statusBreakdown.orders.pending || 0,
            color: '#F59E0B'
        },
        {
            name: 'Procesando',
            Órdenes: salesData.statusBreakdown.orders.processing || 0,
            color: '#3B82F6'
        },
        {
            name: 'Enviadas',
            Órdenes: salesData.statusBreakdown.orders.shipped || 0,
            color: '#8B5CF6'
        },
        {
            name: 'Entregadas',
            Órdenes: salesData.statusBreakdown.orders.delivered || 0,
            color: '#10B981'
        },
        {
            name: 'Canceladas',
            Órdenes: salesData.statusBreakdown.orders.cancelled || 0,
            color: '#EF4444'
        }
    ] : [
        {
            name: 'Test',
            Órdenes: 1,
            color: '#10B981'
        }
    ];

    // Función para formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Función para obtener etiqueta del rango
    const getRangeLabel = () => {
        switch (dateRange) {
            case '7':
                return 'Últimos 7 días';
            case '30':
                return 'Últimos 30 días';
            case '90':
                return 'Últimos 90 días';
            default:
                return 'Últimos 7 días';
        }
    };

    return {
        salesData,
        chartData,
        isLoading,
        isError,
        error: error?.message || 'Error al cargar datos de ventas',
        refetch,
        formatCurrency,
        getRangeLabel,
        startDate,
        endDate
    };
};

export default useSalesData;
