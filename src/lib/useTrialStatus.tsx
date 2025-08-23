'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from './supabase';

export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due' | 'unpaid';
export type SubscriptionPlan = 'free' | 'pro';

export interface TrialInfo {
    status: SubscriptionStatus;
    plan: SubscriptionPlan;
    canUseFeatures: boolean;
    daysRemaining: number;
    planData: {
        max_clients: number;
        max_projects: number;
        max_storage_gb: number;
    };
    limits: {
        maxClients: number;
        maxProjects: number;
        maxStorageGb: number;
    };
    isExpired: boolean;
    trialEndsAt: string | null;
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
                console.log('❌ No supabase client or userEmail:', { supabase: !!supabase, userEmail });
                setLoading(false);
                return;
            }

            // Obtener información del usuario y su trial
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log('❌ No user authenticated, redirecting to login');
                router.push('/login');
                return;
            }

            console.log('👤 Usuario autenticado:', { id: user.id, email: user.email });

            // Obtener datos del perfil y suscripción
            let profile;
            
            // Primero intentar buscar por email si está disponible (datos reales)
            if (userEmail) {
                console.log('🔍 Buscando perfil por email (datos reales):', userEmail);
                try {
                    const response = await fetch(`/api/user/profile?email=${encodeURIComponent(userEmail)}`);
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.profile) {
                            profile = result.profile;
                            console.log('✅ Usando datos reales de la API:', { 
                                email: profile.email, 
                                status: profile.subscription_status, 
                                plan: profile.subscription_plan 
                            });
                        }
                    } else {
                        console.log('⚠️ API response not ok:', response.status);
                    }
                } catch (error) {
                    console.warn('⚠️ No se pudo obtener datos reales via API:', error);
                }
            }
            
            // Fallback: buscar por ID de usuario autenticado si no encontramos datos reales
            if (!profile) {
                console.log('🔍 Buscando perfil por ID de usuario:', user.id);
                const { data: existingProfile, error: profileError } = await supabase
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

                if (profileError && (profileError.code === 'PGRST116' || profileError.code === 'PGRST103')) {
                    // El perfil no existe, crearlo
                    console.log('👤 Creando perfil para usuario:', user.email);
                    const trialStartDate = new Date();
                    const trialEndDate = new Date(trialStartDate.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 días

                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({
                            id: user.id,
                            email: user.email,
                            subscription_status: 'trial',
                            subscription_plan: 'free',
                            trial_started_at: trialStartDate.toISOString(),
                            trial_ends_at: trialEndDate.toISOString(),
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .select(`
                            subscription_status,
                            subscription_plan,
                            trial_started_at,
                            trial_ends_at,
                            subscription_current_period_end
                        `)
                        .single();

                    if (createError) {
                        console.error('Error creando perfil:', createError);
                        setError('Error al crear perfil de usuario');
                        return;
                    }

                    profile = newProfile;
                    console.log('✅ Perfil creado exitosamente');
                } else if (profileError) {
                    console.error('Error obteniendo perfil:', profileError);
                    setError('Error al verificar estado de suscripción');
                    return;
                } else {
                    profile = existingProfile;
                    console.log('✅ Perfil encontrado por ID:', profile);
                }
            }

            // Derivar suscripción activa únicamente desde profiles
            const hasActiveSubscription =
                (profile?.subscription_status === 'active') && (
                    !profile?.subscription_current_period_end ||
                    new Date(profile.subscription_current_period_end) > new Date()
                );

            // Definir límites del plan
            const planData = profile?.subscription_plan === 'pro'
                ? { max_clients: -1, max_projects: -1, max_storage_gb: 10 }
                : { max_clients: 10, max_projects: 5, max_storage_gb: 1 };

            // Calcular días restantes
            const now = new Date();
            const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
            const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

            // Verificar si el trial ha expirado - incluir estado "expired"
            const isExpired = (profile?.subscription_status === 'trial' && daysRemaining <= 0) || 
                             (profile?.subscription_status === 'expired');

            // Actualizar lógica: permitir uso si tiene suscripción activa O si el trial no ha expirado
            const canUseFeatures = hasActiveSubscription || (!isExpired && (profile?.subscription_status === 'trial'));

            console.log('📊 Estado final calculado:', {
                status: profile?.subscription_status,
                plan: profile?.subscription_plan,
                hasActiveSubscription,
                canUseFeatures,
                daysRemaining,
                isExpired
            });

            const finalTrialInfo: TrialInfo = {
                status: (profile?.subscription_status as SubscriptionStatus) || 'trial',
                plan: (profile?.subscription_plan as SubscriptionPlan) || 'free',
                canUseFeatures,
                daysRemaining,
                planData,
                limits: {
                    maxClients: planData.max_clients,
                    maxProjects: planData.max_projects,
                    maxStorageGb: planData.max_storage_gb
                },
                isExpired,
                trialEndsAt: profile?.trial_ends_at || null,
            };

            setTrialInfo(finalTrialInfo);

        } catch (err) {
            console.error('Error al verificar estado de suscripción:', err);
            setError('Error al verificar estado de suscripción');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('🔄 useTrialStatus useEffect triggered:', { userEmail });
        checkTrialStatus();
    }, [userEmail]);

    const refreshTrialStatus = () => {
        checkTrialStatus();
    };

    // Función para verificar si se ha alcanzado el límite de una característica
    const hasReachedLimit = (feature: string) => {
        // Si está cargando, asumimos optimistamente que no hay límites
        if (loading) return false;
        
        if (!trialInfo) return false;
        
        // Si tiene suscripción activa (PRO), no hay límites
        if (trialInfo.status === 'active' && trialInfo.plan === 'pro') {
            return false;
        }
        
        // Si el trial ha expirado, bloquear todas las características
        if (trialInfo.isExpired) {
            return true;
        }
        
        // Para usuarios en trial, verificar límites específicos
        // Por ahora retornamos false ya que los límites se manejan en otra parte
        return false;
    };

    // Estructura de retorno que coincida con lo que espera DashboardClient
    return {
        trialInfo,
        loading,
        error,
        refreshTrialStatus,
        hasReachedLimit, // ✅ Función añadida
        // Si está cargando, asumimos optimistamente que puede usar features (evita flash de "trial expirado")
        canUseFeatures: loading ? true : (trialInfo?.canUseFeatures || false),
        // Exponemos también las propiedades individuales para TrialBanner
        status: trialInfo?.status,
        plan: trialInfo?.plan,
        daysRemaining: trialInfo?.daysRemaining,
        isExpired: trialInfo?.isExpired,
        // Estructura legacy para compatibilidad
        subscription: trialInfo ? {
            status: trialInfo.status,
            planName: trialInfo.plan === 'pro' ? 'Plan Profesional' : 'Plan Gratuito',
            canUseFeatures: trialInfo.canUseFeatures,
            daysRemaining: trialInfo.daysRemaining,
            checkStatus: () => ({
                status: trialInfo.status
            })
        } : null
    };
}

export default useTrialStatus;
