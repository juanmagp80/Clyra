const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
    console.log('👤 CREANDO USUARIO DE PRUEBA PARA EL TRIAL\n');

    try {
        // Crear usuario directamente en profiles
        const testUser = {
            id: '00000000-0000-0000-0000-000000000001', // UUID de prueba
            email: 'juangpdev@gmail.com',
            full_name: 'Juan GP Dev',
            trial_started_at: new Date().toISOString(),
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días
            subscription_status: 'trial',
            subscription_plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('profiles')
            .insert(testUser)
            .select();

        if (error) {
            console.log('❌ Error creando usuario de prueba:', error.message);
            if (error.message.includes('duplicate key')) {
                console.log('✅ El usuario ya existe, configurando trial...');

                // Si ya existe, solo actualizar el trial
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        trial_started_at: testUser.trial_started_at,
                        trial_ends_at: testUser.trial_ends_at,
                        subscription_status: 'trial',
                        subscription_plan: 'free'
                    })
                    .eq('email', 'juangpdev@gmail.com');

                if (updateError) {
                    console.log('❌ Error actualizando trial:', updateError.message);
                } else {
                    console.log('✅ Trial actualizado para usuario existente');
                }
            }
        } else {
            console.log('✅ Usuario de prueba creado exitosamente');
        }

        // Crear registro de uso
        const { error: usageError } = await supabase
            .from('user_usage')
            .insert({
                user_id: testUser.id,
                clients_count: 0,
                projects_count: 0,
                storage_used_mb: 0,
                emails_sent_month: 0
            });

        if (usageError && !usageError.message.includes('duplicate key')) {
            console.log('⚠️  Error creando registro de uso:', usageError.message);
        } else {
            console.log('✅ Registro de uso creado');
        }

        console.log('\n🎉 USUARIO DE PRUEBA CONFIGURADO!');
        console.log('📧 Email: juangpdev@gmail.com');
        console.log('🎯 Estado: Trial activo por 14 días');
        console.log('📊 Límites: 10 clientes, 5 proyectos, 1GB');

        console.log('\n🚀 AHORA PRUEBA:');
        console.log('1. Ve a http://localhost:3000');
        console.log('2. ¡Ve directamente a /dashboard!');
        console.log('3. El hook useTrialStatus debería detectar automáticamente el trial');
        console.log('4. ¡Verás el banner azul funcionando!');

        // Verificar que se creó correctamente
        const { data: verificacion } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'juangpdev@gmail.com')
            .single();

        if (verificacion) {
            const diasRestantes = Math.ceil((new Date(verificacion.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
            console.log(`\n✅ Verificación: ${diasRestantes} días restantes de trial`);
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

createTestUser();
