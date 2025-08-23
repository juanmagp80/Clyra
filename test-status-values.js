const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDifferentStatuses() {
    try {
        console.log('🔍 Probando diferentes valores para subscription_status...\n');
        
        const statusesToTry = [
            'active',
            'inactive', 
            'canceled',
            'cancelled',
            'trial',
            'expired',
            'free',
            'pro'
        ];
        
        for (const status of statusesToTry) {
            console.log(`🧪 Probando status: "${status}"`);
            
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .update({
                        subscription_status: status,
                        updated_at: new Date().toISOString()
                    })
                    .eq('email', 'amazonjgp80@gmail.com')
                    .select('subscription_status');

                if (error) {
                    console.log(`   ❌ Error: ${error.message}`);
                } else {
                    console.log(`   ✅ Éxito: Se pudo actualizar a "${status}"`);
                    
                    // Volver al estado original para continuar probando
                    await supabase
                        .from('profiles')
                        .update({ subscription_status: 'cancelled' })
                        .eq('email', 'amazonjgp80@gmail.com');
                }
            } catch (err) {
                console.log(`   ❌ Error: ${err.message}`);
            }
        }
        
    } catch (err) {
        console.error('❌ Error general:', err);
    }
}

testDifferentStatuses();
