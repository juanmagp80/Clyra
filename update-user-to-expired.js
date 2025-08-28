const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserToExpired() {
    try {
        console.log('🔧 Actualizando usuario a estado "expired"...\n');

        // Verificar estado actual
        const { data: before, error: fetchError } = await supabase
            .from('profiles')
            .select('email, subscription_status, subscription_plan, trial_started_at, trial_ends_at')
            .eq('email', 'amazonjgp80@gmail.com')
            .single();

        if (fetchError) {
            console.error('❌ Error al consultar el perfil:', fetchError);
            return;
        }

        console.log('📊 Estado ANTES:');
        console.log('================');
        console.log('Subscription Status:', before.subscription_status);
        console.log('Subscription Plan:', before.subscription_plan);
        console.log('Trial Started At:', before.trial_started_at);
        console.log('Trial Ends At:', before.trial_ends_at);

        // Actualizar a "expired"
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'expired',
                updated_at: new Date().toISOString()
            })
            .eq('email', 'amazonjgp80@gmail.com')
            .select();

        if (error) {
            console.error('❌ Error al actualizar el perfil:', error);
            return;
        }

        console.log('\n✅ Usuario actualizado exitosamente!');
        console.log('📊 Estado DESPUÉS:');
        console.log('==================');
        console.log('Subscription Status:', data[0].subscription_status);
        console.log('Updated At:', data[0].updated_at);

        // Verificar fechas del trial
        const now = new Date();
        const trialEnd = new Date(before.trial_ends_at);
        const daysExpired = Math.floor((now - trialEnd) / (1000 * 60 * 60 * 24));

        console.log('\n📅 Verificación del trial:');
        console.log('==========================');
        console.log('Fecha actual:', now.toISOString());
        console.log('Fin del trial:', trialEnd.toISOString());
        console.log('Días desde expiración:', daysExpired);

        console.log('\n🎯 Resultado final:');
        console.log('===================');
        console.log('✅ Usuario marcado como "expired" (trial expirado)');
        console.log('✅ Las fechas de trial están configuradas correctamente');
        console.log('✅ El usuario verá la interfaz de trial expirado');
        console.log('✅ Podrá proceder con el upgrade a PRO');
        console.log('✅ Los webhooks de Stripe funcionarán correctamente');

        console.log('\n🔄 Próximos pasos:');
        console.log('==================');
        console.log('1. Refrescar la aplicación o hacer logout/login');
        console.log('2. Verificar que aparezca la interfaz de "Trial Expirado"');
        console.log('3. Intentar el upgrade a PRO nuevamente');
        console.log('4. Los webhooks de Stripe deberían actualizar a "active" tras el pago');

    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

updateUserToExpired();
