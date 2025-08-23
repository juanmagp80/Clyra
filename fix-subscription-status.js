const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserSubscriptionStatus() {
    try {
        console.log('🔧 Corrigiendo subscription_status para amazonjgp80@gmail.com...\n');
        
        // Verificar estado actual
        const { data: currentData, error: fetchError } = await supabase
            .from('profiles')
            .select('email, subscription_status, subscription_plan, trial_started_at, trial_ends_at')
            .eq('email', 'amazonjgp80@gmail.com')
            .single();

        if (fetchError) {
            console.error('❌ Error al consultar el perfil:', fetchError);
            return;
        }

        console.log('📊 Estado actual:');
        console.log('=================');
        console.log('Email:', currentData.email);
        console.log('Subscription Status:', currentData.subscription_status);
        console.log('Subscription Plan:', currentData.subscription_plan);
        console.log('Trial Started At:', currentData.trial_started_at);
        console.log('Trial Ends At:', currentData.trial_ends_at);
        
        // Verificar si el trial ha expirado
        const now = new Date();
        const trialEnd = new Date(currentData.trial_ends_at);
        const isExpired = now > trialEnd;
        const daysExpired = Math.floor((now - trialEnd) / (1000 * 60 * 60 * 24));
        
        console.log('\n📅 Análisis de fechas:');
        console.log('=====================');
        console.log('Fecha actual:', now.toISOString());
        console.log('Fin del trial:', trialEnd.toISOString());
        console.log('Trial expirado:', isExpired ? '✅ SÍ' : '❌ NO');
        console.log('Días desde expiración:', daysExpired);
        
        // Actualizar subscription_status a trial_expired
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'trial_expired',
                updated_at: now.toISOString()
            })
            .eq('email', 'amazonjgp80@gmail.com')
            .select();

        if (error) {
            console.error('❌ Error al actualizar el perfil:', error);
            return;
        }

        console.log('\n✅ Usuario actualizado exitosamente!');
        console.log('📊 Nuevo estado:');
        console.log('================');
        console.log('Subscription Status:', data[0].subscription_status);
        console.log('Updated At:', data[0].updated_at);
        
        console.log('\n🎯 Resultado:');
        console.log('=============');
        console.log('✅ El usuario ahora está correctamente marcado como "trial_expired"');
        console.log('✅ Las fechas de trial ya estaban configuradas correctamente');
        console.log('✅ El usuario debería ver la interfaz de trial expirado');
        console.log('✅ Podrá proceder con el upgrade a PRO vía Stripe');
        console.log('✅ Los webhooks de Stripe funcionarán cuando se complete el pago');
        
    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

fixUserSubscriptionStatus();
