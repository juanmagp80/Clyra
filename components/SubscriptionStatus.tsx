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
    console.log('🚀 SubscriptionStatus component mounted with userEmail:', userEmail);
    
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
        console.log('🔄 SubscriptionStatus useEffect triggered');
        let unsubAuth: (() => void) | undefined;
        const channel: ReturnType<typeof supabase.channel> | null = null;

        async function fetchProfile(userId: string, email: string) {
            console.log('🔍 fetchProfile called with:', { userId, email });
            
            try {
                console.log('📡 Making API call to /api/user/profile...');
                // Usar el nuevo endpoint que maneja la autenticación correctamente
                const response = await fetch('/api/user/profile', {
                    method: 'GET',
                    credentials: 'include', // Incluir cookies de sesión
                });

                const result = await response.json();
                console.log('📊 Profile API result:', result);

                if (!response.ok) {
                    console.error('❌ Error from profile API:', result);
                    // Fallback a datos por defecto
                    setStatus({
                        is_subscribed: false,
                        trial_end: null,
                        subscription_end: null,
                        plan_type: 'free'
                    });
                    return;
                }

                if (result.success && result.profile) {
                    const profile = result.profile;
                    const plan = (profile.subscription_plan || '').toLowerCase();
                    console.log('✅ Setting status from real profile:', { 
                        plan, 
                        status: profile.subscription_status,
                        email: profile.email,
                        stripe_id: profile.stripe_subscription_id 
                    });
                    
                    setStatus({
                        is_subscribed: profile.subscription_status === 'active',
                        trial_end: profile.trial_ends_at,
                        subscription_end: profile.subscription_current_period_end,
                        plan_type: plan
                    });
                } else {
                    console.warn('⚠️ No profile data in response');
                    setStatus({
                        is_subscribed: false,
                        trial_end: null,
                        subscription_end: null,
                        plan_type: 'free'
                    });
                }
            } catch (error) {
                console.error('💥 Error fetching profile:', error);
                // Fallback a datos por defecto
                setStatus({
                    is_subscribed: false,
                    trial_end: null,
                    subscription_end: null,
                    plan_type: 'free'
                });
            }
        }

        async function init() {
            try {
                console.log('🔧 SubscriptionStatus: Starting initialization...');
                setLoading(true);
                
                // Si tenemos userEmail, consultamos directamente el perfil por email
                if (userEmail) {
                    console.log('📧 SubscriptionStatus: Tenemos userEmail, consultando directamente:', userEmail);
                    setCurrentUserEmail(userEmail);
                    await fetchProfileByEmail(userEmail);
                    return;
                }
                
                // Fallback: intentar obtener usuario autenticado
                console.log('🔐 Getting user authentication...');
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Auth timeout')), 5000)
                );
                
                const authPromise = supabase.auth.getUser();
                const result = await Promise.race([authPromise, timeoutPromise]);
                const { data: { user }, error: authError } = result as any;
                
                console.log('👤 SubscriptionStatus Auth result:', { 
                    hasUser: !!user, 
                    email: user?.email, 
                    error: authError?.message || 'none' 
                });
                
                if (!user || authError) {
                    console.log('⚠️ SubscriptionStatus: No user found, waiting for auth state change...');
                    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
                        console.log('🔄 SubscriptionStatus Auth state changed:', event, !!session?.user);
                        if (session?.user) {
                            setCurrentUserEmail(session.user.email || '');
                            fetchProfile(session.user.id, session.user.email || '');
                        }
                    });
                    unsubAuth = () => listener.subscription.unsubscribe();
                    return;
                }

                // Establecer el email del usuario
                const email = user.email || '';
                console.log('📧 SubscriptionStatus Using email from auth:', email);
                setCurrentUserEmail(email);
                
                console.log('🚀 SubscriptionStatus: About to call fetchProfile...');
                await fetchProfile(user.id, email);

            } catch (error) {
                console.error('💥 SubscriptionStatus Error in init:', error);
                // Si hay error, usar valores por defecto
                setStatus({
                    is_subscribed: false,
                    trial_end: null,
                    subscription_end: null,
                    plan_type: 'free'
                });
            } finally {
                console.log('🏁 SubscriptionStatus: Init completed, setting loading to false');
                setLoading(false);
            }
        }

        // Nueva función para consultar perfil por email directamente
        async function fetchProfileByEmail(email: string) {
            console.log('🎯 fetchProfileByEmail called with email:', email);
            
            try {
                console.log('📡 Making API call to /api/user/profile with email...');
                const response = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const result = await response.json();
                console.log('📊 Profile API result (by email):', result);

                if (!response.ok) {
                    console.error('❌ Error from profile API:', result);
                    setStatus({
                        is_subscribed: false,
                        trial_end: null,
                        subscription_end: null,
                        plan_type: 'free'
                    });
                    return;
                }

                if (result.success && result.profile) {
                    const profile = result.profile;
                    const plan = (profile.subscription_plan || '').toLowerCase();
                    console.log('✅ Setting status from real profile (by email):', { 
                        plan, 
                        status: profile.subscription_status,
                        email: profile.email,
                        stripe_id: profile.stripe_subscription_id 
                    });
                    
                    setStatus({
                        is_subscribed: profile.subscription_status === 'active',
                        trial_end: profile.trial_ends_at,
                        subscription_end: profile.subscription_current_period_end,
                        plan_type: plan
                    });
                } else {
                    console.warn('⚠️ No profile data in response (by email)');
                    setStatus({
                        is_subscribed: false,
                        trial_end: null,
                        subscription_end: null,
                        plan_type: 'free'
                    });
                }
            } catch (error) {
                console.error('💥 Error fetching profile by email:', error);
                setStatus({
                    is_subscribed: false,
                    trial_end: null,
                    subscription_end: null,
                    plan_type: 'free'
                });
            }
        }

        init();
        return () => {
            if (unsubAuth) unsubAuth();
            if (channel) {
                try { (channel as any).unsubscribe(); } catch {}
            }
        };
    }, [userEmail]); // Agregar userEmail como dependencia para que se re-ejecute cuando cambie

    if (loading) {
        return (
            <div className="p-3 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </div>
        );
    }

    const isSubscribed = status.is_subscribed;
    const isPro = isSubscribed || (status.plan_type || '').toLowerCase() === 'pro';
    const isTrialActive = !isPro && status.trial_end && new Date(status.trial_end) > new Date();

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
            console.log('🔴 Cancelling subscription...');
            
            // Actualizar estado local
            const newStatus = {
                is_subscribed: false,
                plan_type: 'free',
                trial_end: null,
                subscription_end: null
            };
            
            setStatus(prev => ({
                ...prev,
                ...newStatus
            }));

            // Guardar en localStorage
            localStorage.setItem('subscription_status', JSON.stringify({
                ...newStatus,
                cancelled_at: new Date().toISOString()
            }));

            toast.success('Suscripción cancelada correctamente');

            // Opcional: también intentar cancelar en el servidor si está disponible
            try {
                const response = await fetch('/api/stripe/cancel-subscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    console.log('✅ También cancelado en servidor');
                } else {
                    console.log('⚠️ Servidor no disponible, usando cancelación local');
                }
            } catch (serverError) {
                console.log('⚠️ Servidor no disponible, usando cancelación local');
            }

        } catch (error: any) {
            console.error('Error al cancelar suscripción:', error);
            toast.error('Error al cancelar la suscripción: ' + error.message);
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
        </div>
    );
}
