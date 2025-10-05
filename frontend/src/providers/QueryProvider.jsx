import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Tiempo que los datos se consideran "frescos" (5 minutos)
                        staleTime: 5 * 60 * 1000,
                        // Tiempo que los datos se mantienen en cache (10 minutos)
                        gcTime: 10 * 60 * 1000,
                        // Reintentar automáticamente en caso de error
                        retry: (failureCount, error) => {
                            // No reintentar para errores 4xx (client errors)
                            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                                return false;
                            }
                            // Reintentar hasta 3 veces para otros errores
                            return failureCount < 3;
                        },
                        // Reintentar con backoff exponencial
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                        // Refetch automático cuando la ventana vuelve a tener foco
                        refetchOnWindowFocus: true,
                        // Refetch automático cuando se reconecta la red
                        refetchOnReconnect: true,
                        // No refetch automático en remount
                        refetchOnMount: true,
                    },
                    mutations: {
                        // Reintentar mutaciones en caso de error
                        retry: (failureCount, error) => {
                            // No reintentar para errores 4xx
                            if (error?.response?.status >= 400 && error?.response?.status < 500) {
                                return false;
                            }
                            return failureCount < 2;
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
