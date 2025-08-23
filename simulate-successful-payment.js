const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulateSuccessfulPayment() {
    try {
        console.log('💳 Simulando pago exitoso para amazonjgp80@gmail.com...\n');
        
        // Simular que el webhook de Stripe se ejecutó correctamente
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1); // 1 mes de suscripción
        
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'active',
                subscription_plan: 'pro',
                stripe_customer_id: 'cus_simulated_customer',
                stripe_subscription_id: 'sub_simulated_subscription',
                subscription_current_period_start: now.toISOString(),
                subscription_current_period_end: periodEnd.toISOString(),
                updated_at: now.toISOString()
            })
            .eq('email', 'amazonjgp80@gmail.com')
            .select();

        if (error) {
            console.error('❌ Error al actualizar el perfil:', error);
            return;
        }

        console.log('✅ Usuario actualizado exitosamente como PRO!');
        console.log('📊 Nuevo estado:');
        console.log('================');
        console.log('Subscription Status:', data[0].subscription_status);
        console.log('Subscription Plan:', data[0].subscription_plan);
        console.log('Stripe Customer ID:', data[0].stripe_customer_id);
        console.log('Stripe Subscription ID:', data[0].stripe_subscription_id);
        console.log('Period Start:', data[0].subscription_current_period_start);
        console.log('Period End:', data[0].subscription_current_period_end);
        
        console.log('\n🎯 Resultado:');
        console.log('=============');
        console.log('✅ El usuario ahora tiene suscripción PRO activa');
        console.log('✅ Debería desaparecer el banner de trial expirado');
        console.log('✅ El sidebar debería mostrar "Plan Profesional"');
        console.log('✅ Todos los botones deberían funcionar normalmente');
        
        console.log('\n🔄 Para ver los cambios:');
        console.log('=======================');
        console.log('1. Refrescar la página o hacer logout/login');
        console.log('2. Verificar que desaparezca el banner de trial');
        console.log('3. Verificar que el sidebar muestre "Plan Profesional"');
        console.log('4. Probar que los botones de crear funcionen');
        
    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

simulateSuccessfulPayment();
