const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserTrialStatus() {
    try {
        console.log('🔧 Restableciendo estado de trial para amazonjgp80@gmail.com...\n');
        
        // Calcular fechas de trial (hace 20 días empezó, hace 6 días expiró)
        const now = new Date();
        const trialStart = new Date(now);
        trialStart.setDate(trialStart.getDate() - 20); // Hace 20 días
        
        const trialEnd = new Date(now);
        trialEnd.setDate(trialEnd.getDate() - 6); // Hace 6 días (expirado)
        
        console.log('📅 Configurando fechas de trial:');
        console.log('Trial Start:', trialStart.toISOString());
        console.log('Trial End:', trialEnd.toISOString());
        console.log('Días desde expiración:', Math.floor((now - trialEnd) / (1000 * 60 * 60 * 24)));
        
        // Actualizar el usuario
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'trial_expired',
                plan_type: 'trial',
                trial_start_date: trialStart.toISOString(),
                trial_end_date: trialEnd.toISOString(),
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
        console.log('Plan Type:', data[0].plan_type);
        console.log('Trial Start Date:', data[0].trial_start_date);
        console.log('Trial End Date:', data[0].trial_end_date);
        
        console.log('\n🎯 Próximos pasos:');
        console.log('==================');
        console.log('1. ✅ El usuario ahora está correctamente marcado como "trial_expired"');
        console.log('2. ✅ Las fechas de trial están configuradas');
        console.log('3. 🔄 El usuario debería ver la interfaz de trial expirado');
        console.log('4. 🔄 Podrá proceder con el upgrade a PRO vía Stripe');
        console.log('5. 🔄 Los webhooks de Stripe funcionarán correctamente');
        
    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

fixUserTrialStatus();
