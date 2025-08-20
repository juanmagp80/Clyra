const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function expireCurrentUser() {
    console.log('🔴 CONFIGURANDO TU USUARIO ACTUAL CON TRIAL EXPIRADO\n');

    try {
        // Buscar tu usuario actual
        const { data: currentUser, error: findError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'juangpdev@gmail.com')
            .single();

        if (findError || !currentUser) {
            console.log('❌ No se encontró tu usuario actual');
            console.log('💡 Asegúrate de estar registrado con juangpdev@gmail.com');
            return;
        }

        console.log('✅ Usuario encontrado:', currentUser.email);
        console.log('🆔 ID:', currentUser.id);

        // Configurar trial expirado hace 2 días
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 2); // Expiró hace 2 días

        const trialStarted = new Date();
        trialStarted.setDate(trialStarted.getDate() - 16); // Empezó hace 16 días

        console.log('⏰ Configurando trial expirado...');
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                trial_started_at: trialStarted.toISOString(),
                trial_ends_at: expiredDate.toISOString(),
                subscription_status: 'trial', // Trial pero expirado
                subscription_plan: 'free'
            })
            .eq('id', currentUser.id);

        if (updateError) {
            console.log('❌ Error actualizando trial:', updateError.message);
            return;
        }

        console.log('✅ Trial configurado como expirado');

        // Configurar uso que excede límites
        console.log('📊 Configurando uso excedido...');
        const { error: usageError } = await supabase
            .from('user_usage')
            .upsert({
                user_id: currentUser.id,
                clients_count: 15, // Excede límite de 10
                projects_count: 8,  // Excede límite de 5
                storage_used_mb: 1500, // Excede 1GB
                emails_sent_month: 200, // Excede 100
                last_reset_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (usageError) {
            console.log('⚠️ Error configurando uso:', usageError.message);
        } else {
            console.log('✅ Uso configurado con límites excedidos');
        }

        // Agregar actividades de trial expirado
        console.log('📝 Registrando actividades de trial expirado...');
        const activities = [
            {
                user_id: currentUser.id,
                activity_type: 'trial_expired',
                activity_data: {
                    expired_date: expiredDate.toISOString(),
                    days_over: 2,
                    original_trial_days: 14
                }
            },
            {
                user_id: currentUser.id,
                activity_type: 'limit_reached',
                activity_data: {
                    type: 'clients',
                    count: 15,
                    limit: 10,
                    timestamp: new Date().toISOString()
                }
            },
            {
                user_id: currentUser.id,
                activity_type: 'access_attempt',
                activity_data: {
                    feature: 'create_client',
                    result: 'blocked',
                    reason: 'trial_expired'
                }
            }
        ];

        // Limpiar actividades anteriores
        await supabase
            .from('trial_activities')
            .delete()
            .eq('user_id', currentUser.id);

        const { error: activityError } = await supabase
            .from('trial_activities')
            .insert(activities);

        if (activityError) {
            console.log('⚠️ Error registrando actividades:', activityError.message);
        } else {
            console.log('✅ Actividades registradas');
        }

        // Verificación final
        const diasExpirados = Math.ceil((new Date() - new Date(expiredDate)) / (1000 * 60 * 60 * 24));

        console.log('\n🔴 TRIAL EXPIRADO CONFIGURADO:');
        console.log(`   📧 Email: ${currentUser.email}`);
        console.log(`   ⏰ Trial expiró hace: ${diasExpirados} días`);
        console.log(`   📅 Empezó: ${trialStarted.toLocaleDateString()}`);
        console.log(`   📅 Expiró: ${expiredDate.toLocaleDateString()}`);
        console.log(`   🚫 Estado: BLOQUEADO`);
        console.log('');
        console.log('📊 Límites excedidos:');
        console.log('   - Clientes: 15/10 ❌');
        console.log('   - Proyectos: 8/5 ❌');
        console.log('   - Storage: 1.5GB/1GB ❌');
        console.log('   - Emails: 200/100 ❌');

        console.log('\n🧪 AHORA PUEDES PROBAR:');
        console.log('');
        console.log('1️⃣ Ve a http://localhost:3000/dashboard');
        console.log('');
        console.log('2️⃣ DEBERÍAS VER:');
        console.log('🔴 Banner ROJO "¡Tu trial ha expirado!"');
        console.log('🔴 Animación pulse urgente');
        console.log('🔴 Botón "Actualizar Ahora" (sin X)');
        console.log('📊 Estadísticas: 15 clientes, 8 proyectos');
        console.log('');
        console.log('3️⃣ PRUEBA RESTRICCIONES:');
        console.log('🚫 Crear nuevo cliente → Debería estar bloqueado');
        console.log('🚫 Crear nuevo proyecto → Debería estar bloqueado');
        console.log('🚫 Subir archivos → Mensaje de error');
        console.log('✅ Ver contenido existente → Permitido');
        console.log('✅ Botón upgrade → Funcional');

        console.log('\n💡 PARA VOLVER AL TRIAL NORMAL:');
        console.log('   node setup-trial-service.js');

        console.log('\n🎯 ¡TRIAL EXPIRADO LISTO PARA PROBAR!');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

expireCurrentUser();
