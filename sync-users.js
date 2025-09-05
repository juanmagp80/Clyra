// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('👥 SINCRONIZANDO USUARIOS EXISTENTES');
console.log('====================================');

async function syncUsers() {
    try {
        if (!supabaseUrl || !supabaseServiceKey) {
            console.log('❌ Variables de entorno faltantes');
            return;
        }

        // Crear cliente administrativo
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Obtener usuarios de autenticación
        console.log('\n1. OBTENIENDO USUARIOS DE AUTH:');
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Error obteniendo usuarios auth:', authError.message);
            return;
        }

        console.log(`✅ ${authUsers.users.length} usuarios encontrados en auth`);

        // 2. Insertar cada usuario en la tabla users
        console.log('\n2. INSERTANDO USUARIOS EN TABLA USERS:');
        
        for (const authUser of authUsers.users) {
            try {
                const userData = {
                    id: authUser.id,
                    email: authUser.email,
                    full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
                    created_at: authUser.created_at
                };

                const { data, error } = await supabaseAdmin
                    .from('users')
                    .upsert(userData, { 
                        onConflict: 'id',
                        ignoreDuplicates: false 
                    })
                    .select();

                if (error) {
                    console.log(`❌ Error insertando ${authUser.email}:`, error.message);
                    console.log('   Detalles:', error);
                } else {
                    console.log(`✅ Usuario sincronizado: ${authUser.email}`);
                }
            } catch (userError) {
                console.log(`❌ Error procesando ${authUser.email}:`, userError.message);
            }
        }

        // 3. Verificar usuarios insertados
        console.log('\n3. VERIFICANDO USUARIOS EN TABLA USERS:');
        const { data: usersData, error: usersError } = await supabaseAdmin
            .from('users')
            .select('id, email, full_name, trial_ends_at, subscription_status, created_at')
            .order('created_at', { ascending: false });

        if (usersError) {
            console.log('❌ Error verificando usuarios:', usersError.message);
        } else {
            console.log(`✅ ${usersData.length} usuarios en tabla users:`);
            usersData.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email}`);
                console.log(`   - Nombre: ${user.full_name}`);
                console.log(`   - Trial hasta: ${new Date(user.trial_ends_at).toLocaleDateString()}`);
                console.log(`   - Estado: ${user.subscription_status}`);
            });
        }

        // 4. Probar función get_user_id_by_email
        console.log('\n4. PROBANDO FUNCIÓN GET_USER_ID_BY_EMAIL:');
        if (usersData && usersData.length > 0) {
            const testEmail = usersData[0].email;
            const { data: functionResult, error: functionError } = await supabaseAdmin
                .rpc('get_user_id_by_email', { user_email: testEmail });

            if (functionError) {
                console.log('❌ Error en función SQL:', functionError.message);
            } else {
                console.log(`✅ Función funcionando correctamente para ${testEmail}:`);
                console.log(`   Usuario ID: ${functionResult}`);
            }
        }

    } catch (error) {
        console.log('❌ Error general:', error.message);
        console.log('Stack:', error.stack);
    }
}

syncUsers();
