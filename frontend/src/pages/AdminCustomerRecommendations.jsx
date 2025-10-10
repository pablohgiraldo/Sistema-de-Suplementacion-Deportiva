/**
 * Página de Recomendaciones por Customer
 * Muestra recomendaciones personalizadas basadas en el perfil CRM del customer
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import recommendationService from '../services/recommendationService';
import customerService from '../services/customerService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';

const AdminCustomerRecommendations = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    useEffect(() => {
        loadData();
    }, [customerId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar datos del customer y sus recomendaciones en paralelo
            const [customerData, recsData] = await Promise.all([
                customerService.getCustomerById(customerId),
                recommendationService.getCustomerRecommendations(customerId, 5)
            ]);

            setCustomer(customerData.customer);
            setRecommendations(recsData);
        } catch (err) {
            console.error('Error loading recommendations:', err);
            setError(err.response?.data?.message || 'Error al cargar las recomendaciones');
        } finally {
            setLoading(false);
        }
    };

    const getConfidenceColor = (score) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-orange-600';
    };

    const getConfidenceBadge = (score) => {
        if (score >= 0.8) return { text: 'Alta', variant: 'success' };
        if (score >= 0.6) return { text: 'Media', variant: 'warning' };
        return { text: 'Baja', variant: 'danger' };
    };

    const ProductCard = ({ product, reason }) => (
        <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                {product.stock > 0 ? (
                    <Badge variant="success">Disponible</Badge>
                ) : (
                    <Badge variant="danger">Agotado</Badge>
                )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
            
            <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-indigo-600">
                    ${(product.price || 0).toLocaleString('es-CO')}
                </span>
                {product.recommendationScore && (
                    <span className="text-xs text-gray-500">
                        Score: {product.recommendationScore.toFixed(2)}
                    </span>
                )}
            </div>

            {reason && (
                <p className="text-xs text-gray-500 mt-2 italic">{reason}</p>
            )}

            {product.categories && product.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {product.categories.slice(0, 2).map((cat, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                            {cat}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando recomendaciones...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="danger">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </Alert>
                <Button 
                    onClick={() => navigate('/admin/customers')} 
                    className="mt-4"
                >
                    Volver a Customers
                </Button>
            </div>
        );
    }

    if (!recommendations) {
        return null;
    }

    const { customer: customerInfo, recommendations: recs, metadata } = recommendations;
    const confidenceBadge = getConfidenceBadge(metadata.confidenceScore);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Recomendaciones Personalizadas
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Basadas en el perfil CRM del cliente
                    </p>
                </div>
                <Button 
                    onClick={() => navigate('/admin/customers')}
                    variant="secondary"
                >
                    Volver
                </Button>
            </div>

            {/* Customer Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Información del Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Nombre</p>
                            <p className="font-medium">{customerInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Segmento</p>
                            <Badge variant={
                                customerInfo.segment === 'VIP' ? 'purple' :
                                customerInfo.segment === 'Frecuente' ? 'success' :
                                'primary'
                            }>
                                {customerInfo.segment}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Nivel de Lealtad</p>
                            <Badge variant="warning">
                                {customerInfo.loyaltyLevel || 'N/A'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Confianza</p>
                            <Badge variant={confidenceBadge.variant}>
                                {confidenceBadge.text} ({(metadata.confidenceScore * 100).toFixed(0)}%)
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
                <CardContent className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-indigo-600">
                                {metadata.totalRecommendations}
                            </p>
                            <p className="text-sm text-gray-600">Total Recomendaciones</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {metadata.strategy}
                            </p>
                            <p className="text-sm text-gray-600">Estrategia</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">
                                Generado: {new Date(metadata.generatedAt).toLocaleString('es-CO')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Featured Products */}
            {recs.featured && recs.featured.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Productos Destacados
                            </CardTitle>
                            <Badge variant="primary">{recs.featured.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Basados en tu historial de compras
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recs.featured.map((product) => (
                                <ProductCard 
                                    key={product._id} 
                                    product={product}
                                    reason={product.recommendationReason}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cross-sell Products */}
            {recs.crossSell && recs.crossSell.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                Productos Complementarios
                            </CardTitle>
                            <Badge variant="info">{recs.crossSell.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Productos que complementan tus favoritos
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recs.crossSell.map((product) => (
                                <ProductCard 
                                    key={product._id} 
                                    product={product}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Upsell Products */}
            {recs.upsell && recs.upsell.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Productos Premium
                            </CardTitle>
                            <Badge variant="purple">{recs.upsell.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Productos de alta gama recomendados para ti
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recs.upsell.map((product) => (
                                <ProductCard 
                                    key={product._id} 
                                    product={product}
                                    reason={product.recommendationReason}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Similar Products */}
            {recs.similar && recs.similar.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Similares a tu Última Compra
                            </CardTitle>
                            <Badge variant="success">{recs.similar.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Productos similares a lo que compraste recientemente
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recs.similar.map((product) => (
                                <ProductCard 
                                    key={product._id} 
                                    product={product}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Trending Products */}
            {recs.trending && recs.trending.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Tendencias en tu Segmento
                            </CardTitle>
                            <Badge variant="warning">{recs.trending.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Lo más popular entre clientes similares a ti
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recs.trending.map((product) => (
                                <ProductCard 
                                    key={product._id} 
                                    product={product}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {metadata.totalRecommendations === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay recomendaciones disponibles
                        </h3>
                        <p className="text-gray-600">
                            Este cliente necesita más historial de compras para generar recomendaciones personalizadas.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminCustomerRecommendations;

