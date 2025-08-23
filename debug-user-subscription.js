const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserSubscription() {
    try {
        console.log('🔍 Verificando estado del usuario amazonjgp80@gmail.com...\n');
        
        // Consultar el usuario
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'amazonjgp80@gmail.com')
            .single();

        if (error) {
            console.error('❌ Error al consultar el perfil:', error);
            return;
        }

        if (!profile) {
            console.log('❌ Usuario no encontrado');
            return;
        }

        console.log('📊 Estado actual del usuario:');
        console.log('==============================');
        console.log('Email:', profile.email);
        console.log('Subscription Status:', profile.subscription_status);
        console.log('Plan Type:', profile.plan_type);
        console.log('Stripe Customer ID:', profile.stripe_customer_id);
        console.log('Stripe Subscription ID:', profile.stripe_subscription_id);
        console.log('Trial Start Date:', profile.trial_start_date);
        console.log('Trial End Date:', profile.trial_end_date);
        console.log('Created At:', profile.created_at);
        console.log('Updated At:', profile.updated_at);
        
        // Verificar si el trial ha expirado
        const now = new Date();
        let trialEnd = null;
        let isExpired = false;
        
        if (profile.trial_end_date) {
            trialEnd = new Date(profile.trial_end_date);
            isExpired = now > trialEnd;
        }
        
        console.log('\n📅 Estado del Trial:');
        console.log('===================');
        console.log('Fecha actual:', now.toISOString());
        console.log('Fin del trial:', trialEnd ? trialEnd.toISOString() : 'NO DEFINIDO');
        console.log('Trial expirado:', isExpired ? '✅ SÍ' : '❌ NO');
        
        if (isExpired && trialEnd) {
            const daysExpired = Math.floor((now - trialEnd) / (1000 * 60 * 60 * 24));
            console.log('Días desde expiración:', daysExpired);
        }
        
        // Sugerencias
        console.log('\n💡 Análisis:');
        console.log('============');
        
        if (profile.subscription_status === 'cancelled' && !profile.trial_start_date) {
            console.log('🔴 PROBLEMA IDENTIFICADO: El usuario no tiene datos de trial configurados');
            console.log('   - subscription_status está como "cancelled" en lugar de "trial" o "trial_expired"');
            console.log('   - trial_start_date y trial_end_date son undefined');
            console.log('   - No hay conexión con Stripe');
            console.log('\n🔧 SOLUCIÓN REQUERIDA:');
            console.log('   1. Restablecer los datos de trial del usuario');
            console.log('   2. Configurar fechas de trial apropiadas');
            console.log('   3. Cambiar status a "trial_expired" para activar flujo de upgrade');
        } else if (profile.subscription_status === 'trial_expired' && !profile.stripe_subscription_id) {
            console.log('🔴 El usuario tiene trial expirado pero no hay suscripción de Stripe');
            console.log('   - Esto sugiere que el webhook de Stripe no se ejecutó correctamente');
            console.log('   - O que el pago no se completó exitosamente');
        } else if (profile.stripe_subscription_id) {
            console.log('🟡 El usuario tiene Stripe Subscription ID pero subscription_status no es "active"');
            console.log('   - Esto sugiere que el webhook no actualizó correctamente el estado');
        } else {
            console.log('🔴 El usuario no tiene suscripción activa de Stripe');
        }

    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

checkUserSubscription();
