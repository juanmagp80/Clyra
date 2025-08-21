const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Usar la clave de servicio para bypassed RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Clave de servicio con permisos completos
);

async function setupTrialWithServiceKey() {
    console.log('🔑 CONFIGURANDO TRIAL CON CLAVE DE SERVICIO\n');

    try {
        // 1. Verificar si el usuario ya existe en profiles
        console.log('📊 1. Verificando perfil existente...');
        const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'juangpdev@gmail.com')
            .single();

        let userId;

        if (checkError && checkError.code === 'PGRST116') {
            console.log('👤 Usuario no encontrado en profiles, creando...');

            // Crear perfil nuevo
            const newProfile = {
                email: 'juangpdev@gmail.com',
                full_name: 'Juan GP Dev',
                trial_started_at: new Date().toISOString(),
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_status: 'trial',
                subscription_plan: 'free',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .insert(newProfile)
                .select()
                .single();

            if (createError) {
                console.log('❌ Error creando perfil:', createError.message);
                return;
            }

            console.log('✅ Perfil creado exitosamente');
            userId = createdProfile.id;

        } else if (existingProfile) {
            console.log('✅ Perfil existente encontrado');
            userId = existingProfile.id;

            // Actualizar trial
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 14);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    trial_started_at: new Date().toISOString(),
                    trial_ends_at: trialEnd.toISOString(),
                    subscription_status: 'trial',
                    subscription_plan: 'free'
                })
                .eq('id', userId);

            if (updateError) {
                console.log('❌ Error actualizando trial:', updateError.message);
            } else {
                console.log('✅ Trial actualizado');
            }
        }

        // 2. Crear/verificar registro de uso
        console.log('\n📈 2. Configurando registro de uso...');
        const { data: existingUsage } = await supabase
            .from('user_usage')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!existingUsage) {
            const { error: usageError } = await supabase
                .from('user_usage')
                .insert({
                    user_id: userId,
                    clients_count: 0,
                    projects_count: 0,
                    storage_used_mb: 0,
                    emails_sent_month: 0
                });

            if (usageError) {
                console.log('⚠️  Error creando uso:', usageError.message);
            } else {
                console.log('✅ Registro de uso creado');
            }
        } else {
            console.log('✅ Registro de uso ya existe');
        }

        // 3. Verificación final
        console.log('\n🔍 3. Verificación final...');
        const { data: finalProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'juangpdev@gmail.com')
            .single();

        if (finalProfile) {
            const diasRestantes = Math.ceil((new Date(finalProfile.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));

            console.log('✅ CONFIGURACIÓN EXITOSA:');
            console.log(`   📧 Email: ${finalProfile.email}`);
            console.log(`   🆔 ID: ${finalProfile.id}`);
            console.log(`   🎯 Estado: ${finalProfile.subscription_status}`);
            console.log(`   📅 Trial expira en: ${diasRestantes} días`);
            console.log(`   📊 Plan: ${finalProfile.subscription_plan}`);
        }

        console.log('\n🎉 TRIAL CONFIGURADO AL 100%!');
        console.log('\n🚀 PRUEBA AHORA:');
        console.log('1. Ve a http://localhost:3000');
        console.log('2. Inicia sesión con: juangpdev@gmail.com');
        console.log('3. Ve a /dashboard');
        console.log('4. ¡Deberías ver el banner azul de trial!');

    } catch (error) {
        console.error('❌ Error general:', error.message);
        console.error('Stack:', error.stack);
    }
}

setupTrialWithServiceKey();
