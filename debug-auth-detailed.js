// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN');
console.log('=========================================');

async function diagnosticAuth() {
    try {
        // 1. Verificar variables de entorno
        console.log('\n1. VARIABLES DE ENTORNO:');
        console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Falta');
        console.log('- SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ Falta');
        console.log('- SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Falta');

        if (!supabaseUrl || !supabaseKey) {
            console.log('❌ Variables de entorno faltantes');
            return;
        }

        // 2. Crear cliente público
        console.log('\n2. CLIENTE PÚBLICO:');
        const supabasePublic = createClient(supabaseUrl, supabaseKey);
        
        // Verificar conexión básica
        const { data: testData, error: testError } = await supabasePublic
            .from('users')
            .select('id, email')
            .limit(1);
        
        if (testError) {
            console.log('❌ Error conexión pública:', testError.message);
        } else {
            console.log('✅ Conexión pública exitosa');
            console.log('- Usuarios encontrados:', testData ? testData.length : 0);
        }

        // 3. Crear cliente administrativo
        if (supabaseServiceKey) {
            console.log('\n3. CLIENTE ADMINISTRATIVO:');
            const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            // Verificar usuarios existentes
            const { data: allUsers, error: usersError } = await supabaseAdmin
                .from('users')
                .select('id, email, full_name, created_at')
                .order('created_at', { ascending: false });

            if (usersError) {
                console.log('❌ Error obteniendo usuarios:', usersError.message);
            } else {
                console.log('✅ Usuarios en la base de datos:');
                allUsers.forEach((user, index) => {
                    console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
                    console.log(`   - Nombre: ${user.full_name || 'Sin nombre'}`);
                    console.log(`   - Creado: ${new Date(user.created_at).toLocaleString()}`);
                });
            }

            // 4. Verificar función get_user_id_by_email
            console.log('\n4. FUNCIÓN GET_USER_ID_BY_EMAIL:');
            
            if (allUsers && allUsers.length > 0) {
                const testEmail = allUsers[0].email;
                console.log(`Probando con email: ${testEmail}`);
                
                const { data: functionResult, error: functionError } = await supabaseAdmin
                    .rpc('get_user_id_by_email', { user_email: testEmail });

                if (functionError) {
                    console.log('❌ Error en función SQL:', functionError.message);
                    console.log('Detalles:', functionError);
                } else {
                    console.log('✅ Función SQL funcionando correctamente');
                    console.log('Resultado:', functionResult);
                }
            }

            // 5. Verificar tabla ai_insights
            console.log('\n5. TABLA AI_INSIGHTS:');
            const { data: insights, error: insightsError } = await supabaseAdmin
                .from('ai_insights')
                .select('*')
                .limit(5);

            if (insightsError) {
                console.log('❌ Error accediendo ai_insights:', insightsError.message);
            } else {
                console.log('✅ Tabla ai_insights accesible');
                console.log(`- Registros encontrados: ${insights.length}`);
            }
        }

        // 6. Prueba de autenticación simulada
        console.log('\n6. SIMULACIÓN DE AUTENTICACIÓN:');
        
        // Intentar autenticación con email ficticio
        const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
            email: 'test@example.com',
            password: 'test123'
        });

        if (authError) {
            console.log('❌ Autenticación falló (esperado):', authError.message);
        } else {
            console.log('✅ Autenticación exitosa:', authData.user?.email);
        }

    } catch (error) {
        console.log('❌ Error general:', error.message);
        console.log('Stack:', error.stack);
    }
}

diagnosticAuth();
