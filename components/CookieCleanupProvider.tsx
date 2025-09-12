'use client';

import { useEffect } from 'react';
import { cleanSupabaseCookies, hasCorruptedSupabaseCookies } from '@/src/utils/cookie-cleanup';

// Componente que detecta y limpia cookies corruptas automáticamente
export function CookieCleanupProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Verificar cookies corruptas al montar el componente
        const checkAndCleanCookies = () => {
            if (hasCorruptedSupabaseCookies()) {
                console.warn('🍪 Auto-detected corrupted Supabase cookies, cleaning...');
                cleanSupabaseCookies();
                return true; // Indica que se limpiaron cookies
            }
            return false;
        };

        // Ejecutar limpieza inmediatamente
        const cleaned = checkAndCleanCookies();

        // Si no se limpiaron cookies, configurar un listener para errores de parsing
        if (!cleaned) {
            const handleError = (event: ErrorEvent) => {
                if (event.error?.message?.includes('Failed to parse cookie string') ||
                    event.error?.message?.includes('Unexpected token') ||
                    event.error?.message?.includes('base64-')) {
                    console.warn('🍪 Cookie parsing error detected, cleaning...');
                    cleanSupabaseCookies();
                }
            };

            window.addEventListener('error', handleError);
            return () => window.removeEventListener('error', handleError);
        }
    }, []);

    return <>{children}</>;
}
