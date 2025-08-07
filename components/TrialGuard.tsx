'use client';

import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface TrialGuardProps {
    children: React.ReactNode;
    userEmail?: string;
    allowExpired?: boolean; // Para páginas como upgrade que deben permitir acceso aunque esté expirado
}

export default function TrialGuard({ children, userEmail, allowExpired = false }: TrialGuardProps) {
    const { trialInfo, loading } = useTrialStatus(userEmail);
    const router = useRouter();

    useEffect(() => {
        if (loading || !trialInfo) return;

        // Si el trial expiró y no se permite acceso expirado, redirigir
        if (trialInfo.isExpired && !allowExpired) {
            router.push('/dashboard/upgrade');
            return;
        }

        // Si está en los últimos 3 días y no está en la página de upgrade, mostrar warning
        if (trialInfo.daysRemaining <= 3 && !window.location.pathname.includes('/upgrade')) {
            // Podrías mostrar un modal de advertencia aquí
            console.warn(`⚠️ Trial expira en ${trialInfo.daysRemaining} días`);
        }
    }, [trialInfo, loading, allowExpired, router]);

    // Mostrar loading mientras se verifica
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Si el trial expiró y no se permite acceso, mostrar mensaje
    if (trialInfo?.isExpired && !allowExpired) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Trial Expirado</h2>
                    <p className="text-slate-600 mb-6">
                        Tu período de prueba de 14 días ha terminado. Actualiza tu plan para continuar usando todas las funciones de Taskelia.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/upgrade')}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-xl transition-all duration-200"
                    >
                        Ver Planes de Suscripción
                    </button>
                </div>
            </div>
        );
    }

    // Todo está bien, mostrar contenido
    return <>{children}</>;
}
