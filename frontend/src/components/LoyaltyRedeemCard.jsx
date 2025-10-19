/**
 * Componente: LoyaltyRedeemCard
 * 
 * Tarjeta para canjear puntos de lealtad durante el checkout
 * Muestra el balance actual, permite calcular descuento y canjear puntos
 */

import { useState, useEffect } from 'react';
import useLoyaltyPoints from '../hooks/useLoyaltyPoints';

export default function LoyaltyRedeemCard({ onDiscountApplied, currentDiscount = 0 }) {
    const {
        currentBalance,
        loyaltyLevel,
        valueInDollars,
        isLoadingPoints,
        calculateDiscount,
        redeemPoints,
        isCalculating,
        isRedeeming,
        redeemError
    } = useLoyaltyPoints();

    const [pointsToRedeem, setPointsToRedeem] = useState('');
    const [previewDiscount, setPreviewDiscount] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Reset error when points change
    useEffect(() => {
        setErrorMessage('');
        setPreviewDiscount(null);
    }, [pointsToRedeem]);

    // Handle preview calculation
    const handleCalculateDiscount = async () => {
        const points = parseInt(pointsToRedeem);

        if (!points || points <= 0) {
            setErrorMessage('Ingresa una cantidad válida de puntos');
            return;
        }

        if (points > currentBalance) {
            setErrorMessage(`Solo tienes ${currentBalance} puntos disponibles`);
            return;
        }

        try {
            const result = await calculateDiscount(points);
            setPreviewDiscount(result);
            setErrorMessage('');
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al calcular descuento';
            setErrorMessage(msg);
            setPreviewDiscount(null);
        }
    };

    // Handle redeem
    const handleRedeem = async () => {
        const points = parseInt(pointsToRedeem);

        if (!points || points <= 0) {
            setErrorMessage('Ingresa una cantidad válida de puntos');
            return;
        }

        if (points > currentBalance) {
            setErrorMessage(`Solo tienes ${currentBalance} puntos disponibles`);
            return;
        }

        try {
            const result = await redeemPoints(points);
            
            // Notificar al componente padre sobre el descuento aplicado
            if (onDiscountApplied) {
                onDiscountApplied({
                    pointsRedeemed: result.pointsRedeemed,
                    discountAmount: result.discountAmount,
                    newBalance: result.newBalance
                });
            }

            // Mostrar mensaje de éxito
            setShowSuccess(true);
            setPointsToRedeem('');
            setPreviewDiscount(null);
            setErrorMessage('');

            setTimeout(() => setShowSuccess(false), 3000);

        } catch (error) {
            const msg = error.response?.data?.error || 'Error al canjear puntos';
            setErrorMessage(msg);
        }
    };

    // Quick select buttons
    const handleQuickSelect = (percentage) => {
        const points = Math.floor(currentBalance * percentage);
        setPointsToRedeem(points.toString());
    };

    if (isLoadingPoints) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="animate-pulse">
                    <div className="h-4 bg-blue-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-blue-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!currentBalance || currentBalance === 0) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center text-gray-500">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">No tienes puntos de lealtad disponibles</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Canjear Puntos de Lealtad
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        100 puntos = $1.00 USD de descuento
                    </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    loyaltyLevel === 'Diamante' ? 'bg-purple-100 text-purple-800' :
                    loyaltyLevel === 'Platino' ? 'bg-gray-200 text-gray-800' :
                    loyaltyLevel === 'Oro' ? 'bg-yellow-100 text-yellow-800' :
                    loyaltyLevel === 'Plata' ? 'bg-gray-100 text-gray-700' :
                    'bg-orange-100 text-orange-800'
                }`}>
                    {loyaltyLevel}
                </span>
            </div>

            {/* Balance Display */}
            <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Puntos Disponibles</p>
                <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                            {currentBalance.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">puntos</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                        ≈ ${valueInDollars} USD
                    </span>
                </div>
            </div>

            {/* Current Discount Applied */}
            {currentDiscount > 0 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-2 mb-3">
                    <p className="text-xs text-green-800 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <strong>Descuento aplicado: ${currentDiscount.toFixed(2)} USD</strong>
                    </p>
                </div>
            )}

            {/* Input & Quick Select */}
            <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                    ¿Cuántos puntos quieres canjear?
                </label>
                
                <div className="flex gap-2">
                    <input
                        type="number"
                        min="0"
                        max={currentBalance}
                        value={pointsToRedeem}
                        onChange={(e) => setPointsToRedeem(e.target.value)}
                        placeholder={`Máx: ${currentBalance}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isRedeeming}
                    />
                    <button
                        onClick={handleCalculateDiscount}
                        disabled={isCalculating || isRedeeming || !pointsToRedeem}
                        className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isCalculating ? '...' : 'Calcular'}
                    </button>
                </div>

                {/* Quick select buttons */}
                <div className="flex gap-1">
                    {[0.25, 0.5, 0.75, 1].map((percentage) => (
                        <button
                            key={percentage}
                            onClick={() => handleQuickSelect(percentage)}
                            disabled={isRedeeming}
                            className="flex-1 px-2 py-1 bg-white border border-blue-200 text-blue-600 text-xs rounded hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {percentage === 1 ? 'Todo' : `${percentage * 100}%`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview Discount */}
            {previewDiscount && (
                <div className="mt-3 bg-blue-100 border border-blue-300 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                        Vista Previa del Descuento
                    </p>
                    <div className="space-y-1 text-xs text-blue-800">
                        <div className="flex justify-between">
                            <span>Puntos a canjear:</span>
                            <strong>{previewDiscount.pointsToRedeem.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span>Descuento:</span>
                            <strong className="text-green-700">${previewDiscount.discountAmount.toFixed(2)} USD</strong>
                        </div>
                        <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                            <span>Puntos restantes:</span>
                            <strong>{previewDiscount.remainingPoints.toLocaleString()}</strong>
                        </div>
                    </div>
                    <button
                        onClick={handleRedeem}
                        disabled={isRedeeming}
                        className="w-full mt-3 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isRedeeming ? 'Canjeando...' : '✓ Aplicar Descuento'}
                    </button>
                </div>
            )}

            {/* Success Message */}
            {showSuccess && (
                <div className="mt-3 bg-green-100 border border-green-300 rounded-lg p-2 animate-pulse">
                    <p className="text-sm text-green-800 font-medium flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        ¡Puntos canjeados exitosamente!
                    </p>
                </div>
            )}

            {/* Error Message */}
            {(errorMessage || redeemError) && (
                <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-2">
                    <p className="text-sm text-red-800 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {errorMessage || redeemError?.response?.data?.error || 'Error al procesar'}
                    </p>
                </div>
            )}
        </div>
    );
}

