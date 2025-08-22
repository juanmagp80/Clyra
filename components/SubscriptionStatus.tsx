'use client';

import { Button } from '@/components/ui/Button';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { Crown, CreditCard, AlertTriangle, Calendar, X, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionStatusProps {
    userEmail?: string;
}

export default function SubscriptionStatus({ userEmail }: SubscriptionStatusProps) {
    const { trialInfo, loading } = useTrialStatus(userEmail);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    if (loading || !trialInfo) {
        return (
            <div className="p-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
            </div>
        );
    }

    const handleCancelSubscription = async () => {
        if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción? Perderás el acceso a las funciones PRO al final del período actual.')) {
            return;
        }

        setIsCancelling(true);
        try {
            const response = await fetch('/api/stripe/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail }),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Tu suscripción ha sido cancelada. Mantendrás el acceso PRO hasta el final del período actual.');
                // Recargar para actualizar el estado
                window.location.reload();
            } else {
                alert(`Error cancelando suscripción: ${result.error || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error cancelando suscripción:', error);
            alert('Error cancelando suscripción. Por favor, inténtalo de nuevo.');
        } finally {
            setIsCancelling(false);
        }
    };

    const getStatusConfig = () => {
        if (trialInfo.hasActiveSubscription || trialInfo.status === 'active') {
            return {
                icon: Crown,
                title: 'Taskelio PRO',
                subtitle: 'Suscripción Activa',
                bgColor: 'from-emerald-500 to-teal-600',
                textColor: 'text-white',
                badgeColor: 'bg-emerald-100 text-emerald-800',
                status: 'Activo'
            };
        } else if (trialInfo.status === 'cancelled') {
            const periodEndDate = trialInfo.periodEndDate ? new Date(trialInfo.periodEndDate) : null;
            const formattedDate = periodEndDate ? periodEndDate.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }) : 'Fecha no disponible';
            
            return {
                icon: AlertTriangle,
                title: 'Taskelio PRO',
                subtitle: `Cancela el ${formattedDate}`,
                bgColor: 'from-orange-500 to-amber-600',
                textColor: 'text-white',
                badgeColor: 'bg-orange-100 text-orange-800',
                status: 'Cancelado'
            };
        } else if (trialInfo.status === 'trial' && !trialInfo.isExpired) {
            return {
                icon: Calendar,
                title: 'Trial Gratuito',
                subtitle: `${trialInfo.daysRemaining || 0} días restantes`,
                bgColor: 'from-blue-500 to-indigo-600',
                textColor: 'text-white',
                badgeColor: 'bg-blue-100 text-blue-800',
                status: 'Trial'
            };
        } else {
            return {
                icon: AlertTriangle,
                title: 'Trial Expirado',
                subtitle: 'Actualiza para continuar',
                bgColor: 'from-red-500 to-red-600',
                textColor: 'text-white',
                badgeColor: 'bg-red-100 text-red-800',
                status: 'Expirado'
            };
        }
    };

    const config = getStatusConfig();
    const IconComponent = config.icon;
    const isPro = trialInfo.hasActiveSubscription || trialInfo.status === 'active';
    const isCancelled = trialInfo.status === 'cancelled';
    const canCancel = isPro && !isCancelled;

    return (
        <div className="space-y-2">
            {/* Botón principal compacto */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full p-3 rounded-lg bg-gradient-to-r ${config.bgColor} ${config.textColor} transition-all duration-300 hover:shadow-lg group`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <IconComponent className="w-4 h-4" />
                        <div className="text-left">
                            <div className="text-sm font-bold">{config.title}</div>
                            <div className="text-xs opacity-90">{config.subtitle}</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${config.badgeColor} font-medium`}>
                            {config.status}
                        </span>
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </button>

            {/* Panel expandido */}
            {isExpanded && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg space-y-3">
                    {/* Detalles del estado */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Plan:</span>
                            <span className={`text-sm font-bold ${isPro ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {isPro ? 'Taskelio PRO' : 'Trial Gratuito'}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado:</span>
                            <div className="flex items-center space-x-2">
                                {isPro ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-sm">{config.status}</span>
                            </div>
                        </div>

                        {isPro && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Precio:</span>
                                <span className="text-sm font-bold text-emerald-600">€10/mes</span>
                            </div>
                        )}

                        {isCancelled && trialInfo.periodEndDate && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cancela el:</span>
                                <span className="text-sm font-bold text-orange-600">
                                    {new Date(trialInfo.periodEndDate).toLocaleDateString('es-ES', { 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </span>
                            </div>
                        )}

                        {trialInfo.daysRemaining !== null && !isPro && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Días restantes:</span>
                                <span className={`text-sm font-bold ${(trialInfo.daysRemaining || 0) > 3 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {trialInfo.daysRemaining || 0}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Límites actuales */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                        <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Límites Actuales:</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                    {trialInfo.limits.maxClients === -1 ? '∞' : trialInfo.limits.maxClients}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">Clientes</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                    {trialInfo.limits.maxProjects === -1 ? '∞' : trialInfo.limits.maxProjects}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">Proyectos</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-slate-900 dark:text-slate-100">
                                    {trialInfo.limits.maxStorageGB === -1 ? '∞' : `${trialInfo.limits.maxStorageGB}GB`}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">Storage</div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
                        {!isPro && (
                            <Button
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                                size="sm"
                                onClick={() => window.location.href = '/subscription'}
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                Pasarse a PRO - €10/mes
                            </Button>
                        )}

                        {isCancelled && (
                            <Button
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                                size="sm"
                                onClick={() => window.location.href = '/subscription'}
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                Renovar Suscripción - €10/mes
                            </Button>
                        )}

                        {canCancel && (
                            <Button
                                variant="ghost"
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                size="sm"
                                onClick={handleCancelSubscription}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                        Cancelando...
                                    </>
                                ) : (
                                    <>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancelar Suscripción
                                    </>
                                )}
                            </Button>
                        )}

                        {isPro && (
                            <div className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    className="flex-1 text-slate-600 hover:text-slate-800"
                                    size="sm"
                                    onClick={() => window.open('https://billing.stripe.com/p/login/test_8wMbKVfYLaBZ8i4fYY', '_blank')}
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Facturación
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
