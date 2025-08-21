const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ultkqwdmphvgdcfuvypm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsdGtxd2RtcGh2Z2RjZnV2eXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMjc4NjUsImV4cCI6MjA1MDcwMzg2NX0.lPEgSKmSJPkCXc4Fc5tMm_9cJK2ksBjt-Rn3NUOz-Bo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateCancelledSubscription() {
    console.log('🧪 Simulando suscripción cancelada para amazonjgp80@gmail.com...');
    
    // Fecha de finalización del período (30 días desde ahora)
    const periodEndDate = new Date();
    periodEndDate.setDate(periodEndDate.getDate() + 30);
    
    try {
        // Actualizar el perfil para simular una suscripción cancelada
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_status: 'active', // Sigue activa hasta el final del período
                subscription_plan: 'pro',
                cancel_at_period_end: true, // ¡Cancelada pero activa hasta el final!
                subscription_current_period_end: periodEndDate.toISOString(),
                stripe_subscription_id: 'sub_test_cancelled',
                stripe_customer_id: 'cus_test_cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('email', 'amazonjgp80@gmail.com')
            .select();
        
        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ Suscripción simulada como cancelada:');
            console.log('- Estado: Activa hasta', periodEndDate.toLocaleDateString('es-ES'));
            console.log('- cancel_at_period_end: true');
            console.log('- El usuario mantiene acceso PRO hasta:', periodEndDate.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }));
            console.log('- Datos actualizados:', data);
        }
    } catch (err) {
        console.error('💥 Error simulando cancelación:', err);
    }
}

simulateCancelledSubscription();
