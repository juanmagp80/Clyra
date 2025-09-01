const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk4MDk3NSwiZXhwIjoyMDY5NTU2OTc1fQ.GXczGW7urH68hFMtlKyq8IIvAFMOhwJtjqh1dJExF3A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserData() {
    console.log('🔍 VERIFICANDO DATOS DE USUARIO...\n');

    try {
        // 1. Obtener un cliente para revisar
        const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select('id, user_id, name')
            .limit(1);

        if (clientsError) {
            console.error('❌ Error obteniendo clientes:', clientsError);
            return;
        }

        if (!clients || clients.length === 0) {
            console.log('❌ No se encontraron clientes');
            return;
        }

        const client = clients[0];
        console.log('👤 Cliente encontrado:', client);

        // 2. Obtener información del usuario usando la admin API
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(client.user_id);

        if (userError) {
            console.error('❌ Error obteniendo usuario:', userError);
        } else {
            console.log('📋 Datos del usuario:');
            console.log('   Email:', userData.user ? userData.user.email : 'N/A');
            console.log('   ID:', userData.user ? userData.user.id : 'N/A');
            console.log('   Meta data:', userData.user ? userData.user.user_metadata : 'N/A');
            console.log('   Raw meta data:', userData.user ? userData.user.raw_user_meta_data : 'N/A');
        }

        // 3. Verificar si hay datos adicionales en perfiles
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', client.user_id)
            .single();

        if (profileError) {
            console.log('⚠️ No se encontró tabla profiles o no hay datos:', profileError.message);
        } else {
            console.log('📊 Datos del perfil:', profileData);
        }

        // 4. Crear datos de prueba si no existen
        if (userData.user && (!userData.user.raw_user_meta_data || Object.keys(userData.user.raw_user_meta_data).length === 0)) {
            console.log('\n🛠️ Agregando datos de prueba al usuario...');
            
            const updateData = {
                raw_user_meta_data: {
                    full_name: 'Juan Pérez',
                    company_name: 'Clyra Solutions',
                    business_name: 'Clyra Solutions S.L.'
                }
            };

            const { data: updateResult, error: updateError } = await supabase.auth.admin.updateUserById(
                client.user_id,
                updateData
            );

            if (updateError) {
                console.log('❌ Error actualizando usuario:', updateError);
            } else {
                console.log('✅ Usuario actualizado con datos de prueba');
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

checkUserData();
