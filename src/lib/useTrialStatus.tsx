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
            console.log('🔧 Configuración Supabase:', {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
            });

            if (!supabase) {
                console.log('❌ Sin cliente Supabase');
                setError('Error de conectividad');
                setLoading(false);
                return;
            }

            // Obtener usuario autenticado
            console.log('🔍 Obteniendo usuario autenticado...');
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                console.error('❌ Error obteniendo usuario:', userError);
                throw new Error(`Error de autenticación: ${userError.message}`);
            }
            
            if (!user) {
                console.log('❌ No hay usuario autenticado');
                router.push('/login');
                return;
            }

            console.log('✅ Usuario autenticado:', { 
                id: user.id, 
                email: user.email,
                emailFromProp: userEmail 
            });

            // Sincronizar suscripción con Stripe primero
            try {
                console.log('🔄 Sincronizando con Stripe...');
                const syncResponse = await fetch('/api/stripe/sync-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userEmail: user.email || userEmail })
                });
                
                if (syncResponse.ok) {
                    const syncData = await syncResponse.json();
                    console.log('✅ Sincronización exitosa:', syncData);
                } else {
                    console.warn('⚠️ Error en sincronización:', await syncResponse.text());
                }
            } catch (syncError) {
                console.warn('⚠️ Error sincronizando con Stripe:', syncError);
            }

            // Obtener perfil del usuario desde Supabase
            console.log('📊 Consultando perfil del usuario...');
            let profile = null;
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select(`
                    id,
                    email,
                    subscription_status,
                    subscription_plan,
                    trial_started_at,
                    trial_ends_at,
                    subscription_current_period_end,
                    cancel_at_period_end,
                    stripe_subscription_id,
                    stripe_customer_id
                `)
                .eq('id', user.id)
                .maybeSingle(); // Usar maybeSingle para evitar errores si no existe

            console.log('📋 Resultado consulta perfil:', { 
                found: !!profileData,
                error: profileError?.message,
                errorCode: profileError?.code,
                profileData: profileData ? {
                    email: profileData.email,
                    status: profileData.subscription_status,
                    plan: profileData.subscription_plan,
                    cancelAtPeriodEnd: profileData.cancel_at_period_end,
                    periodEnd: profileData.subscription_current_period_end
                } : null
            });

            if (profileError) {
                console.error('❌ Error obteniendo perfil:', profileError);
                throw new Error(`Error de base de datos: ${profileError.message}`);
            }

            // Si no existe perfil, crear uno nuevo
            if (!profileData) {
                console.log('📝 Perfil no existe, creando uno nuevo...');
                
                const newProfileData = {
                    id: user.id,
                    email: user.email || userEmail,
                    subscription_status: 'trial',
                    subscription_plan: 'free',
                    trial_started_at: new Date().toISOString(),
                    trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert(newProfileData)
                    .select()
                    .single();

                if (createError) {
                    console.error('❌ Error creando perfil:', createError);
                    throw new Error(`Error creando perfil: ${createError.message}`);
                }

                console.log('✅ Perfil creado exitosamente');
                profile = newProfile;
            } else {
                profile = profileData;
            }

            console.log('📊 Perfil obtenido:', { 
                status: profile.subscription_status, 
                plan: profile.subscription_plan,
                cancelAtPeriodEnd: profile.cancel_at_period_end,
                periodEnd: profile.subscription_current_period_end
            });

            // Obtener uso actual del usuario
            let usage = { clients: 0, projects: 0, storage: 0, emails: 0 };
            try {
                const { data: usageData } = await supabase
                    .from('user_usage')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (usageData) {
                    usage = {
                        clients: usageData.clients_count || 0,
                        projects: usageData.projects_count || 0,
                        storage: usageData.storage_used_gb || 0,
                        emails: usageData.emails_sent_month || 0
                    };
                }
            } catch (usageError) {
                console.warn('⚠️ Error obteniendo uso, usando valores por defecto');
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
                usage,
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
