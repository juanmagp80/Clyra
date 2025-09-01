const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addUserData() {
    console.log('🛠️ AGREGANDO DATOS DE USUARIO DE PRUEBA...\n');

    try {
        // Obtener el primer cliente
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('user_id, name')
            .limit(1)
            .single();

        if (clientsError || !clients) {
            console.error('❌ Error obteniendo cliente:', clientsError);
            return;
        }

        console.log('👤 Cliente encontrado:', clients.name);
        console.log('🔑 User ID:', clients.user_id);

        // Actualizar el usuario con datos de prueba
        const { data: updateResult, error: updateError } = await supabase.auth.admin.updateUserById(
            clients.user_id,
            {
                user_metadata: {
                    full_name: 'Juan Pérez García',
                    company_name: 'Clyra Solutions',
                    business_name: 'Clyra Solutions S.L.'
                }
            }
        );

        if (updateError) {
            console.log('❌ Error actualizando usuario:', updateError);
        } else {
            console.log('✅ Usuario actualizado con datos de prueba');
            console.log('📋 Datos agregados:');
            console.log('   Nombre: Juan Pérez García');
            console.log('   Empresa: Clyra Solutions');
            console.log('\n🔄 Ahora prueba el portal del cliente para ver los cambios.');
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
    
    process.exit(0);
}

addUserData();
