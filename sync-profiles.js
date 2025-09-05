// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('👥 SINCRONIZANDO USUARIOS CON TABLA PROFILES');
console.log('=============================================');

async function syncProfiles() {
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

        // 1. Verificar tabla profiles
        console.log('\n1. VERIFICANDO TABLA PROFILES:');
        const { data: profilesTest, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .limit(1);

        if (profilesError) {
            console.log('❌ Error accediendo tabla profiles:', profilesError.message);
            return;
        } else {
            console.log('✅ Tabla profiles accesible');
        }

        // 2. Obtener usuarios de autenticación
        console.log('\n2. OBTENIENDO USUARIOS DE AUTH:');
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Error obteniendo usuarios auth:', authError.message);
            return;
        }

        console.log(`✅ ${authUsers.users.length} usuarios encontrados en auth`);

        // 3. Verificar usuarios existentes en profiles
        console.log('\n3. VERIFICANDO USUARIOS EXISTENTES EN PROFILES:');
        const { data: existingProfiles, error: existingError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name')
            .order('created_at', { ascending: false });

        if (existingError) {
            console.log('❌ Error obteniendo profiles existentes:', existingError.message);
        } else {
            console.log(`✅ ${existingProfiles.length} perfiles existentes:`);
            existingProfiles.forEach((profile, index) => {
                console.log(`${index + 1}. ${profile.email} (${profile.full_name || 'Sin nombre'})`);
            });
        }

        // 4. Insertar usuarios faltantes
        console.log('\n4. INSERTANDO USUARIOS FALTANTES:');
        
        for (const authUser of authUsers.users) {
            try {
                // Verificar si ya existe
                const existingProfile = existingProfiles.find(p => p.id === authUser.id);
                
                if (existingProfile) {
                    console.log(`⏭️  Usuario ya existe: ${authUser.email}`);
                    continue;
                }

                const profileData = {
                    id: authUser.id,
                    email: authUser.email,
                    full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
                    created_at: authUser.created_at
                };

                const { data, error } = await supabaseAdmin
                    .from('profiles')
                    .upsert(profileData, { 
                        onConflict: 'id',
                        ignoreDuplicates: false 
                    })
                    .select();

                if (error) {
                    console.log(`❌ Error insertando ${authUser.email}:`, error.message);
                } else {
                    console.log(`✅ Perfil creado: ${authUser.email}`);
                }
            } catch (userError) {
                console.log(`❌ Error procesando ${authUser.email}:`, userError.message);
            }
        }

        // 5. Verificar perfiles finales
        console.log('\n5. VERIFICANDO PERFILES FINALES:');
        const { data: finalProfiles, error: finalError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, trial_ends_at, subscription_status, created_at')
            .order('created_at', { ascending: false });

        if (finalError) {
            console.log('❌ Error verificando perfiles finales:', finalError.message);
        } else {
            console.log(`✅ ${finalProfiles.length} perfiles totales:`);
            finalProfiles.forEach((profile, index) => {
                console.log(`${index + 1}. ${profile.email}`);
                console.log(`   - Nombre: ${profile.full_name || 'Sin nombre'}`);
                console.log(`   - Trial hasta: ${profile.trial_ends_at ? new Date(profile.trial_ends_at).toLocaleDateString() : 'Sin fecha'}`);
                console.log(`   - Estado: ${profile.subscription_status || 'Sin estado'}`);
            });
        }

        // 6. Probar función get_user_id_by_email
        console.log('\n6. PROBANDO FUNCIÓN GET_USER_ID_BY_EMAIL:');
        if (finalProfiles && finalProfiles.length > 0) {
            const testEmail = finalProfiles[0].email;
            const { data: functionResult, error: functionError } = await supabaseAdmin
                .rpc('get_user_id_by_email', { user_email: testEmail });

            if (functionError) {
                console.log('❌ Error en función SQL:', functionError.message);
                console.log('   Ejecuta el SQL: update-get-user-function.sql');
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

syncProfiles();
