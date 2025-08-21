import { createSupabaseClient } from '@/src/lib/supabase-client';

// Script para diagnosticar el estado de usuarios que han pagado con Stripe
export async function diagnoseUserSubscriptionStatus(userEmail: string) {
    const supabase = createSupabaseClient();
    
    console.log('🔍 Diagnosticando estado de suscripción para:', userEmail);
    
    try {
        // 1. Verificar perfil del usuario
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail)
            .single();
            
        if (profileError) {
            console.error('❌ Error obteniendo perfil:', profileError);
            return;
        }
        
        console.log('👤 Perfil del usuario:', {
            id: profile.id,
            email: profile.email,
            subscription_status: profile.subscription_status,
            subscription_plan: profile.subscription_plan,
            stripe_customer_id: profile.stripe_customer_id,
            stripe_subscription_id: profile.stripe_subscription_id,
            trial_ends_at: profile.trial_ends_at,
            created_at: profile.created_at,
            updated_at: profile.updated_at
        });
        
        // 2. Verificar actividades recientes
        const { data: activities, error: activitiesError } = await supabase
            .from('trial_activities')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (!activitiesError && activities) {
            console.log('📋 Actividades recientes:', activities);
        }
        
        // 3. Si tiene stripe_customer_id, verificar en Stripe
        if (profile.stripe_customer_id && profile.stripe_subscription_id) {
            console.log('💳 Verificando en Stripe...');
            
            const stripeCheckResponse = await fetch('/api/stripe/check-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: profile.stripe_customer_id,
                    subscriptionId: profile.stripe_subscription_id
                })
            });
            
            if (stripeCheckResponse.ok) {
                const stripeData = await stripeCheckResponse.json();
                console.log('🔄 Estado en Stripe:', stripeData);
            }
        }
        
        return profile;
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    }
}

// Función para forzar sincronización
export async function forceSyncUser(userEmail: string) {
    console.log('🔄 Forzando sincronización para:', userEmail);
    
    try {
        const response = await fetch('/api/stripe/sync-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userEmail })
        });
        
        const result = await response.json();
        console.log('✅ Resultado de sincronización:', result);
        
        return result;
    } catch (error) {
        console.error('❌ Error forzando sincronización:', error);
    }
}
