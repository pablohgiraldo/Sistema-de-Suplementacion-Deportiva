/**
 * Componente: LoyaltyTransactionsHistory
 * 
 * Muestra el historial completo de transacciones de puntos de lealtad
 * con paginación y detalles de cada transacción
 */

import { useState } from 'react';
import { useLoyaltyTransactions } from '../hooks/useLoyaltyPoints';

export default function LoyaltyTransactionsHistory() {
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    const {
        transactions,
        currentBalance,
        customerCode,
        loyaltyLevel,
        pagination,
        isLoading,
        isError,
        error
    } = useLoyaltyTransactions(currentPage, limit);

    // Get transaction type badge
    const getTransactionTypeBadge = (type) => {
        const badges = {
            earned: { bg: 'bg-green-100', text: 'text-green-800', label: '+ Ganados' },
            redeemed: { bg: 'bg-orange-100', text: 'text-orange-800', label: '- Canjeados' },
            expired: { bg: 'bg-red-100', text: 'text-red-800', label: '- Expirados' },
            adjusted: { bg: 'bg-blue-100', text: 'text-blue-800', label: '± Ajustados' }
        };

        const badge = badges[type] || badges.adjusted;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-b border-gray-200 pb-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-red-600">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-medium">Error al cargar el historial</p>
                    <p className="text-sm text-gray-500 mt-1">{error?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Historial de Puntos
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Cliente: <strong>{customerCode}</strong> • Nivel: <strong>{loyaltyLevel}</strong>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Balance Actual</p>
                        <p className="text-2xl font-bold text-blue-600">{currentBalance.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">puntos</p>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="p-6">
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="font-medium">No hay transacciones aún</p>
                        <p className="text-sm mt-1">Realiza tu primera compra para empezar a acumular puntos</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getTransactionTypeBadge(transaction.type)}
                                            <span className="text-xs text-gray-500">
                                                {formatDate(transaction.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium mb-1">
                                            {transaction.reason}
                                        </p>
                                        {transaction.orderId && (
                                            <p className="text-xs text-gray-500">
                                                Orden ID: {transaction.orderId}
                                            </p>
                                        )}
                                        {transaction.expirationDate && (
                                            <p className="text-xs text-orange-600">
                                                Vencen: {formatDate(transaction.expirationDate)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-lg font-bold ${
                                            transaction.type === 'earned' || transaction.points > 0 
                                                ? 'text-green-600' 
                                                : 'text-red-600'
                                        }`}>
                                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Balance: {transaction.balanceAfter}
                                        </p>
                                    </div>
                                </div>

                                {/* Metadata adicional */}
                                {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <details className="text-xs text-gray-600">
                                            <summary className="cursor-pointer hover:text-blue-600">
                                                Ver detalles
                                            </summary>
                                            <div className="mt-2 space-y-1 pl-4">
                                                {transaction.metadata.orderTotal && (
                                                    <p>Total de orden: ${transaction.metadata.orderTotal.toFixed(2)} USD</p>
                                                )}
                                                {transaction.metadata.conversionRate && (
                                                    <p>Tasa: {transaction.metadata.conversionRate} puntos/$1 USD</p>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Mostrando {transactions.length} de {pagination.total} transacciones
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                            >
                                ← Anterior
                            </button>
                            <span className="px-4 py-1 text-sm font-medium text-gray-700">
                                Página {currentPage} de {pagination.pages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                disabled={currentPage === pagination.pages}
                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

