const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.8yajSVnLGwmwCz2S0SZ3Xkbfb8PlLHX7AUC_6Gd_7zU';

console.log('🔧 Conectando a Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserSubscriptionStatus() {
    const userEmail = 'amazonjgp80@gmail.com';
    
    console.log('🔍 Verificando estado actual del usuario:', userEmail);
    
    // 1. Verificar estado actual
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail)
        .single();
        
    if (profileError) {
        console.error('❌ Error obteniendo perfil:', profileError);
        return;
    }
    
    console.log('👤 Estado actual del perfil:', {
        subscription_status: profile.subscription_status,
        subscription_plan: profile.subscription_plan,
        stripe_customer_id: profile.stripe_customer_id,
        stripe_subscription_id: profile.stripe_subscription_id
    });
    
    // 2. Forzar actualización a suscripción activa
    console.log('🔄 Actualizando estado de suscripción...');
    
    const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
            subscription_status: 'active',
            subscription_plan: 'pro',
            stripe_customer_id: 'cus_SuTaFBCVBNnSvX', // ID del cliente de Stripe
            stripe_subscription_id: 'sub_1RyeIGHFKglWYpZiq7qVU3rk', // ID de la suscripción activa
            updated_at: new Date().toISOString()
        })
        .eq('email', userEmail)
        .select()
        .single();
        
    if (updateError) {
        console.error('❌ Error actualizando perfil:', updateError);
        return;
    }
    
    console.log('✅ Perfil actualizado exitosamente:', {
        subscription_status: updatedProfile.subscription_status,
        subscription_plan: updatedProfile.subscription_plan,
        stripe_customer_id: updatedProfile.stripe_customer_id,
        stripe_subscription_id: updatedProfile.stripe_subscription_id
    });
    
    // 3. Registrar actividad
    await supabase
        .from('trial_activities')
        .insert({
            user_id: profile.id,
            activity_type: 'subscription_manual_fix',
            activity_data: {
                previous_status: profile.subscription_status,
                new_status: 'active',
                stripe_subscription_id: 'sub_1RyeIGHFKglWYpZiq7qVU3rk'
            }
        });
        
    console.log('📝 Actividad registrada');
    console.log('🎉 ¡Usuario actualizado correctamente! El banner debería desaparecer ahora.');
}

fixUserSubscriptionStatus().catch(console.error);
