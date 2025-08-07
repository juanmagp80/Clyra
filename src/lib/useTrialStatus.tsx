'use client';

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type SubscriptionPlan = 'free' | 'pro';

export interface TrialInfo {
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    daysRemaining: number;
    isExpired: boolean;
    trialEndsAt: string | null;
    canUseFeatures: boolean;
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

            if (!supabase || !userEmail) {
                setLoading(false);
                return;
            }

            // Obtener información del usuario y su trial
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                router.push('/login');
                return;
            }

            // Obtener datos del perfil
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select(`
                    subscription_status,
                    subscription_plan,
                    trial_started_at,
                    trial_ends_at,
                    subscription_current_period_end
                `)
                .eq('id', user.id)
                .single();

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

            // Obtener límites del plan
            const { data: planData } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('name', profile?.subscription_plan === 'free' ? 'Trial Gratuito' : 'Pro')
                .single();

            // Calcular días restantes
            const now = new Date();
            const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
            const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
            
            const isExpired = profile?.subscription_status === 'trial' && daysRemaining <= 0;
            const canUseFeatures = !isExpired && (profile?.subscription_status === 'active' || profile?.subscription_status === 'trial');

            const trialInfo: TrialInfo = {
                status: (profile?.subscription_status as SubscriptionStatus) || 'trial',
                plan: (profile?.subscription_plan as SubscriptionPlan) || 'free',
                daysRemaining,
                isExpired,
                trialEndsAt: profile?.trial_ends_at || null,
                canUseFeatures,
                usage: {
                    clients: usage?.clients_count || 0,
                    projects: usage?.projects_count || 0,
                    storage: usage?.storage_used_mb || 0,
                    emails: usage?.emails_sent_month || 0
                },
                limits: {
                    maxClients: planData?.max_clients || 10,
                    maxProjects: planData?.max_projects || 5,
                    maxStorageGB: planData?.max_storage_gb || 1
                }
            };

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
        router.push('/dashboard/upgrade');
    };

    const hasReachedLimit = (type: 'clients' | 'projects' | 'storage' | 'emails'): boolean => {
        if (!trialInfo) return false;
        
        const { usage, limits } = trialInfo;
        
        switch (type) {
            case 'clients':
                return limits.maxClients > 0 && usage.clients >= limits.maxClients;
            case 'projects':
                return limits.maxProjects > 0 && usage.projects >= limits.maxProjects;
            case 'storage':
                return usage.storage >= (limits.maxStorageGB * 1024);
            case 'emails':
                return usage.emails >= 100; // Límite mensual para trial
            default:
                return false;
        }
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
