'use client';

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type SubscriptionPlan = 'free' | 'pro';

// Límites para usuarios PRO (ilimitados)
const PRO_LIMITS = {
    maxClients: -1,     // Ilimitado
    maxProjects: -1,    // Ilimitado
    maxStorageGB: -1    // Ilimitado
};

export interface TrialInfo {
    hasActiveSubscription: boolean;
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    daysRemaining: number | null;
    isExpired: boolean;
    trialEndsAt: string | null;
    canUseFeatures: boolean;
    cancelAtPeriodEnd: boolean;
    periodEndDate: string | null;
    usage: {
        clients: number;
        projects: number;
        storage: number;
        emails: number;
    };
    limits: {
        maxClients: number;
        maxProjects: number;
        maxStorageGB: number;
    };
}

export function useTrialStatus(userEmail?: string) {
    const [trialInfo, setTrialInfo] = useState<TrialInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createSupabaseClient();

    const checkTrialStatus = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🚀 Iniciando checkTrialStatus para:', userEmail);

            // TEMPORAL: Para el usuario de prueba, usar datos simulados directamente
            if (userEmail === 'amazonjgp80@gmail.com') {
                console.log('🧪 Usuario de prueba detectado, usando datos simulados...');
                
                const trialInfo: TrialInfo = {
                    hasActiveSubscription: true,
                    status: 'cancelled', // Estado cancelado para probar la UI
                    plan: 'pro',
                    daysRemaining: null,
                    isExpired: false,
                    trialEndsAt: null,
                    canUseFeatures: true,
                    cancelAtPeriodEnd: true,
                    periodEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                    usage: {
                        clients: 5,
                        projects: 12,
                        storage: 0,
                        emails: 23
                    },
                    limits: PRO_LIMITS
                };

                console.log('✅ Datos simulados creados para usuario cancelado:', trialInfo);
                setTrialInfo(trialInfo);
                setLoading(false);
                return;
            }

            if (!supabase) {
                console.log('❌ Sin cliente Supabase');
                setError('Error de conectividad');
                setLoading(false);
                return;
            }

            // Para otros usuarios, intentar obtener datos reales
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.log('❌ No hay usuario autenticado');
                router.push('/login');
                return;
            }

            console.log('🔍 Usuario autenticado:', user.email);

            // Obtener perfil con manejo robusto de errores
            let profile = null;
            try {
                const { data, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.warn('⚠️ Error obteniendo perfil:', profileError.message);
                    // Crear datos por defecto para trial
                    profile = {
                        subscription_status: 'trial',
                        subscription_plan: 'free',
                        trial_started_at: new Date().toISOString(),
                        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                        cancel_at_period_end: false,
                        subscription_current_period_end: null
                    };
                } else {
                    profile = data;
                }
            } catch (dbError) {
                console.error('💥 Error de base de datos:', dbError);
                // Usar datos por defecto
                profile = {
                    subscription_status: 'trial',
                    subscription_plan: 'free',
                    trial_started_at: new Date().toISOString(),
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    cancel_at_period_end: false,
                    subscription_current_period_end: null
                };
            }
                console.error('❌ Error de conectividad Supabase:', connError);
                setError('Error de conectividad con la base de datos');
                return;
            }

            // Calcular información del trial
            const now = new Date();
            const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
            const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 14;
            const isExpired = trialEnd ? now > trialEnd : false;
            const canUseFeatures = !isExpired;

            // Verificar suscripción activa
            const hasActiveSubscription = profile?.subscription_status === 'active' && profile?.subscription_plan === 'pro';

            // Determinar el estado de la suscripción
            let subscriptionStatus: SubscriptionStatus;
            if (hasActiveSubscription) {
                if (profile?.cancel_at_period_end) {
                    subscriptionStatus = 'cancelled';
                } else {
                    subscriptionStatus = 'active';
                }
            } else {
                subscriptionStatus = (profile?.subscription_status as SubscriptionStatus) || 'trial';
            }

            // Crear objeto TrialInfo
            const trialInfo: TrialInfo = {
                hasActiveSubscription,
                status: subscriptionStatus,
                plan: hasActiveSubscription ? 'pro' : 'free',
                daysRemaining: hasActiveSubscription ? null : daysRemaining,
                isExpired: hasActiveSubscription ? false : isExpired,
                trialEndsAt: hasActiveSubscription ? null : (profile?.trial_ends_at || null),
                canUseFeatures: hasActiveSubscription ? true : canUseFeatures,
                cancelAtPeriodEnd: profile?.cancel_at_period_end || false,
                periodEndDate: profile?.subscription_current_period_end || null,
                usage: {
                    clients: 0,
                    projects: 0,
                    storage: 0,
                    emails: 0
                },
                limits: hasActiveSubscription ? PRO_LIMITS : {
                    maxClients: 10,
                    maxProjects: 5,
                    maxStorageGB: 2
                }
            };

            console.log('✅ TrialInfo creado:', trialInfo);
            setTrialInfo(trialInfo);

        } catch (err) {
            console.error('💥 Error verificando trial:', err);
            // En caso de error, crear datos por defecto para evitar que la app se rompa
            const defaultTrialInfo: TrialInfo = {
                hasActiveSubscription: false,
                status: 'trial',
                plan: 'free',
                daysRemaining: 14,
                isExpired: false,
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                canUseFeatures: true,
                cancelAtPeriodEnd: false,
                periodEndDate: null,
                usage: {
                    clients: 0,
                    projects: 0,
                    storage: 0,
                    emails: 0
                },
                limits: {
                    maxClients: 10,
                    maxProjects: 5,
                    maxStorageGB: 2
                }
            };
            setTrialInfo(defaultTrialInfo);
            setError('Error de conectividad - usando datos por defecto');
        } finally {
            setLoading(false);
        }
    };
    const updateUsage = async (type: 'clients' | 'projects' | 'storage' | 'emails', increment: number = 1) => {
        if (!supabase || !trialInfo) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Simplificar: solo actualizar el estado local por ahora
            console.log(`Actualización de uso: ${type} +${increment}`);
            
            // Recargar información del trial
            await checkTrialStatus();
        } catch (error) {
            console.error('Error actualizando uso:', error);
        }
    };

    const redirectToUpgrade = () => {
        router.push('/subscription');
    };

    const hasReachedLimit = (type: 'clients' | 'projects' | 'storage' | 'emails'): boolean => {
        if (!trialInfo) return false;
        
        // Durante el trial de 14 días o con suscripción PRO, no hay límites
        if (trialInfo.status === 'trial' && !trialInfo.isExpired) {
            return false;
        }
        
        if (trialInfo.hasActiveSubscription) {
            return false;
        }

        const currentUsage = trialInfo.usage[type];
        const limit = trialInfo.limits[`max${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof trialInfo.limits];
        
        return limit !== -1 && currentUsage >= limit;
    };

    useEffect(() => {
        if (userEmail) {
            checkTrialStatus();
        }
    }, [userEmail]);

    return {
        trialInfo,
        loading,
        error,
        checkTrialStatus,
        updateUsage,
        redirectToUpgrade,
        hasReachedLimit
    };
}
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .single();

            // Verificar suscripción activa - usar datos del profile
            // TEMPORAL: Forzar usuario amazonjgp80@gmail.com como PRO
            const hasActiveSubscription = (userEmail === 'amazonjgp80@gmail.com') || 
                                        (profile?.subscription_status === 'active' && 
                                         profile?.subscription_plan === 'pro' &&
                                         profile?.stripe_subscription_id);

            console.log('📊 Subscription check detallado:', {
                hasActiveSubscription,
                profileStatus: profile?.subscription_status,
                profilePlan: profile?.subscription_plan,
                stripeSubId: profile?.stripe_subscription_id,
                stripeCustomerId: profile?.stripe_customer_id,
                email: userEmail,
                isForcedUser: userEmail === 'amazonjgp80@gmail.com'
            });

            if (profileError) {
                console.error('Error obteniendo perfil:', profileError);
                setError('Error al verificar estado de suscripción');
                return;
            }

            // Obtener uso actual
            const { data: usage, error: usageError } = await supabase
                .from('user_usage')
                .select('*')
                .eq('user_id', user.id)
                .single();

            // Si no existe registro de uso, crear uno
            if (usageError && usageError.code === 'PGRST116') {
                await supabase
                    .from('user_usage')
                    .insert({ user_id: user.id });
            }

            // Obtener límites del plan - priorizar suscripción activa
            const planName = hasActiveSubscription ? 'Plan PRO' : (profile?.subscription_plan === 'free' ? 'Trial Gratuito' : 'Plan PRO');
            const { data: planData } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('name', planName)
                .single();

            // Calcular días restantes del trial
            const now = new Date();
            const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
            const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
            
            // Determinar estado: si tiene suscripción activa, es 'active', sino verificar trial
            const actualStatus = hasActiveSubscription ? 'active' : profile?.subscription_status;
            const actualPlan = hasActiveSubscription ? 'pro' : profile?.subscription_plan;
            const isExpired = actualStatus === 'trial' && daysRemaining <= 0;
            
            // Lógica de acceso: suscripción activa de Stripe O trial no expirado
            const canUseFeatures = hasActiveSubscription || (!isExpired && (actualStatus === 'active' || actualStatus === 'trial'));

            // Límites efectivos: si tiene suscripción PRO o trial activo, sin límites
            const effectiveLimits = (hasActiveSubscription || (!isExpired && actualStatus === 'trial')) ? {
                maxClients: -1,     // Ilimitado
                maxProjects: -1,    // Ilimitado
                maxStorageGB: -1    // Ilimitado
            } : {
                maxClients: planData?.max_clients || 10,
                maxProjects: planData?.max_projects || 5,
                maxStorageGB: planData?.max_storage_gb || 2
            };

            // Determinar el estado de la suscripción teniendo en cuenta la cancelación
            let subscriptionStatus: SubscriptionStatus;
            if (hasActiveSubscription) {
                if (profile?.cancel_at_period_end) {
                    subscriptionStatus = 'cancelled';
                } else {
                    subscriptionStatus = 'active';
                }
            } else {
                subscriptionStatus = (profile?.subscription_status as SubscriptionStatus) || 'trial';
            }

            // Construcción del objeto TrialInfo con prioridad para suscripciones activas
            const trialInfo: TrialInfo = {
                hasActiveSubscription,
                status: subscriptionStatus,
                plan: hasActiveSubscription ? 'pro' : ((profile?.subscription_plan as SubscriptionPlan) || 'free'),
                daysRemaining: hasActiveSubscription ? null : daysRemaining,
                isExpired: hasActiveSubscription ? false : isExpired,
                trialEndsAt: hasActiveSubscription ? null : (profile?.trial_ends_at || null),
                canUseFeatures: hasActiveSubscription ? true : canUseFeatures,
                cancelAtPeriodEnd: profile?.cancel_at_period_end || false,
                periodEndDate: profile?.subscription_current_period_end || null,
                usage: {
                    clients: usage?.clients_count || 0,
                    projects: usage?.projects_count || 0,
                    storage: usage?.storage_used_gb || 0,
                    emails: usage?.emails_sent_month || 0
                },
                limits: hasActiveSubscription ? PRO_LIMITS : effectiveLimits
            };

            console.log('🏗️ TrialInfo construido:', {
                hasActiveSubscription,
                status: trialInfo.status,
                plan: trialInfo.plan,
                limits: trialInfo.limits,
                effectiveLimits,
                PRO_LIMITS
            });

            setTrialInfo(trialInfo);

            // Registrar actividad
            await supabase
                .from('trial_activities')
                .insert({
                    user_id: user.id,
                    activity_type: 'status_check',
                    activity_data: { 
                        days_remaining: daysRemaining,
                        status: profile?.subscription_status 
                    }
                });

        } catch (err) {
            console.error('Error verificando trial:', err);
            setError('Error al verificar estado de trial');
        } finally {
            setLoading(false);
        }
    };

    const updateUsage = async (type: 'clients' | 'projects' | 'storage' | 'emails', increment: number = 1) => {
        if (!supabase || !trialInfo) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.rpc('update_user_usage', {
                user_uuid: user.id,
                usage_type: type,
                increment_by: increment
            });

            // Recargar información del trial
            await checkTrialStatus();
        } catch (error) {
            console.error('Error actualizando uso:', error);
        }
    };

    const redirectToUpgrade = () => {
        router.push('/subscription');
    };

    const hasReachedLimit = (type: 'clients' | 'projects' | 'storage' | 'emails'): boolean => {
        if (!trialInfo) return false;
        
        // Durante el trial de 14 días, no hay límites
        if (trialInfo.status === 'trial' && !trialInfo.isExpired) {
            return false;
        }
        
        // Solo aplicar límites si el trial ha expirado Y no tiene suscripción activa
        if (trialInfo.isExpired && trialInfo.status !== 'active') {
            const { usage, limits } = trialInfo;
            
            switch (type) {
                case 'clients':
                    return limits.maxClients > 0 && usage.clients >= limits.maxClients;
                case 'projects':
                    return limits.maxProjects > 0 && usage.projects >= limits.maxProjects;
                case 'storage':
                    return usage.storage >= (limits.maxStorageGB * 1024);
                case 'emails':
                    return usage.emails >= 100;
                default:
                    return false;
            }
        }
        
        return false;
    };

    useEffect(() => {
        checkTrialStatus();
    }, [userEmail]);

    return {
        trialInfo,
        loading,
        error,
        checkTrialStatus,
        updateUsage,
        redirectToUpgrade,
        hasReachedLimit,
        // Helpers
        isTrialExpired: trialInfo?.isExpired || false,
        canUseFeatures: trialInfo?.canUseFeatures || false,
        daysRemaining: trialInfo?.daysRemaining || 0
    };
}
