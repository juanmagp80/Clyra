'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Zap, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface SubscriptionStatusProps {
    userEmail?: string;
}

export default function SubscriptionStatus({ userEmail }: SubscriptionStatusProps) {
    const [status, setStatus] = useState({
        is_subscribed: false,
        trial_end: null as string | null,
        subscription_end: null as string | null,
        plan_type: 'free' as string
    });
    const [loading, setLoading] = useState(true);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
    const supabase = createClientComponentClient();

    useEffect(() => {
        async function checkSubscription() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setLoading(false);
                    return;
                }

                // Establecer el email del usuario
                const email = userEmail || session.user.email || '';
                setCurrentUserEmail(email);

                // Obtener datos de suscripción
                const { data, error } = await supabase
                    .from('user_subscriptions')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error al verificar suscripción:', error);
                    // Si no existe la suscripción, crear una por defecto
                    if (error.code === 'PGRST116') {
                        const { data: newSub, error: insertError } = await supabase
                            .from('user_subscriptions')
                            .insert([
                                { 
                                    user_id: session.user.id,
                                    is_subscribed: false,
                                    trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                                    plan_type: 'trial'
                                }
                            ])
                            .select()
                            .single();
                            
                        if (!insertError && newSub) {
                            setStatus(newSub);
                        }
                    }
                } else if (data) {
                    setStatus(data);
                }
            } catch (error) {
                console.error('Error al verificar suscripción:', error);
            } finally {
                setLoading(false);
            }
        }

        checkSubscription();
    }, [supabase, userEmail]);

    if (loading) {
        return (
            <div className="p-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </div>
        );
    }

    const isTrialActive = status.trial_end && new Date(status.trial_end) > new Date();
    const isSubscribed = status.is_subscribed;
    const isPro = status.plan_type === 'pro';

    const handleSubscribe = async () => {
        try {
            const emailToUse = currentUserEmail || userEmail;
            console.log('Iniciando suscripción con userEmail:', emailToUse);
            
            if (!emailToUse) {
                throw new Error('No se pudo obtener el email del usuario');
            }
            
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: 'price_1RyeBiHFKglWYpZiSeo70KYD', // ID real de tu producto en Stripe
                    userEmail: emailToUse,
                    successUrl: `${window.location.origin}/dashboard?success=true`,
                    cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
                }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.error || `Error HTTP: ${response.status}`);
            }

            if (data.url) {
                console.log('Redirigiendo a:', data.url);
                window.location.href = data.url;
            } else {
                console.error('Respuesta sin URL:', data);
                throw new Error('No se pudo obtener la URL de pago');
            }
        } catch (error: any) {
            console.error('Error al iniciar suscripción:', error);
            toast.error('Error al iniciar la suscripción: ' + error.message);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
            return;
        }

        try {
            const response = await fetch('/api/stripe/cancel-subscription', {
                method: 'POST',
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Suscripción cancelada correctamente');
                // Actualizar el estado local
                setStatus(prev => ({
                    ...prev,
                    is_subscribed: false,
                    plan_type: 'free'
                }));
            } else {
                throw new Error(data.error || 'Error al cancelar la suscripción');
            }
        } catch (error: any) {
            console.error('Error al cancelar suscripción:', error);
            toast.error('Error al cancelar la suscripción: ' + error.message);
        }
    };

    // Función temporal para activar suscripción manualmente (solo para debug)
    const handleManualActivation = async () => {
        try {
            const response = await fetch('/api/activate-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.sql) {
                    console.log('📋 SQL para crear tabla:', result.sql);
                    toast.error('Tabla no existe. Revisa la consola para el SQL.');
                } else {
                    toast.error('Error: ' + result.error);
                }
                return;
            }

            toast.success('Suscripción activada correctamente');
            setStatus({
                is_subscribed: true,
                plan_type: 'pro',
                trial_end: null,
                subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });

        } catch (error: any) {
            console.error('Error:', error);
            toast.error('Error al activar suscripción: ' + error.message);
        }
    };

    return (
        <div className="px-3 py-2 bg-gradient-to-br from-indigo-50/50 via-violet-50/50 to-purple-50/50 dark:from-indigo-950/50 dark:via-violet-950/50 dark:to-purple-950/50 rounded-lg border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        {isTrialActive ? 'Periodo de Prueba' : 
                         isPro ? 'Plan Profesional' : 
                         'Plan Gratuito'}
                    </span>
                </div>
            </div>
            
            {isTrialActive && status.trial_end && (
                <>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                        Finaliza el {new Date(status.trial_end).toLocaleDateString()}
                    </p>
                    <Button 
                        onClick={handleSubscribe}
                        className="w-full text-[11px] h-7 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                    >
                        <CreditCard className="w-3 h-3 mr-1" />
                        Activar Plan Pro
                    </Button>
                </>
            )}
            
            {!isTrialActive && !isPro && (
                <Button 
                    onClick={handleSubscribe}
                    className="w-full text-[11px] h-7 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                >
                    <CreditCard className="w-3 h-3 mr-1" />
                    Suscribirse al Plan Pro
                </Button>
            )}
            
            {isPro && (
                <>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 mb-2">
                        {status.subscription_end ? 
                            `Suscripción activa hasta ${new Date(status.subscription_end).toLocaleDateString()}` :
                            'Suscripción activa'}
                    </p>
                    <Button 
                        onClick={handleCancelSubscription}
                        variant="destructive"
                        className="w-full text-[11px] h-7"
                    >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Cancelar Suscripción
                    </Button>
                </>
            )}
            
            {/* Botón temporal de activación manual - Solo para debug */}
            {!isPro && (
                <Button 
                    onClick={handleManualActivation}
                    className="w-full text-[10px] h-6 mt-2 bg-green-600 hover:bg-green-700 text-white"
                >
                    🔧 Activar Pro (Temporal)
                </Button>
            )}
        </div>
    );
}
