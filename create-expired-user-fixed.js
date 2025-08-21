const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExpiredTrialUser() {
    console.log('🔴 CREANDO CUENTA CON TRIAL EXPIRADO\n');

    try {
        // Generar UUID único para el usuario
        const userId = uuidv4();

        // Crear usuario con trial expirado hace 1 día
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 1); // Expiró ayer

        const trialStarted = new Date();
        trialStarted.setDate(trialStarted.getDate() - 15); // Empezó hace 15 días

        const expiredUser = {
            id: userId, // UUID único
            email: 'expired@test.com',
            full_name: 'Usuario Trial Expirado',
            trial_started_at: trialStarted.toISOString(),
            trial_ends_at: expiredDate.toISOString(),
            subscription_status: 'trial', // Sigue en trial pero expirado
            subscription_plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('👤 Creando usuario con trial expirado...');
        console.log(`   🆔 ID: ${userId}`);

        // Primero eliminar si existe
        await supabase
            .from('profiles')
            .delete()
            .eq('email', 'expired@test.com');

        const { data: createdUser, error: createError } = await supabase
            .from('profiles')
            .insert(expiredUser)
            .select()
            .single();

        if (createError) {
            console.log('❌ Error creando usuario:', createError.message);
            return;
        }

        console.log('✅ Usuario creado exitosamente');

        // Crear registro de uso simulando límites alcanzados
        console.log('📊 Configurando uso que excede límites...');

        // Eliminar uso anterior si existe
        await supabase
            .from('user_usage')
            .delete()
            .eq('user_id', userId);

        const { error: usageError } = await supabase
            .from('user_usage')
            .insert({
                user_id: userId,
                clients_count: 12, // Excede límite de 10
                projects_count: 7,  // Excede límite de 5
                storage_used_mb: 1200, // Excede 1GB = 1024MB
                emails_sent_month: 150, // Excede límite de 100
                last_reset_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (usageError) {
            console.log('⚠️ Error configurando uso:', usageError.message);
        } else {
            console.log('✅ Uso configurado con límites excedidos');
        }

        // Agregar algunas actividades de trial
        console.log('📝 Agregando actividades de trial...');

        // Limpiar actividades anteriores
        await supabase
            .from('trial_activities')
            .delete()
            .eq('user_id', userId);

        const activities = [
            {
                user_id: userId,
                activity_type: 'limit_reached',
                activity_data: { type: 'clients', count: 12, limit: 10 }
            },
            {
                user_id: userId,
                activity_type: 'trial_expired',
                activity_data: { expired_date: expiredDate.toISOString(), days_over: 1 }
            },
            {
                user_id: userId,
                activity_type: 'access_denied',
                activity_data: { reason: 'trial_expired', feature: 'create_client' }
            }
        ];

        const { error: activityError } = await supabase
            .from('trial_activities')
            .insert(activities);

        if (activityError) {
            console.log('⚠️ Error agregando actividades:', activityError.message);
        } else {
            console.log('✅ Actividades de trial agregadas');
        }

        // Verificación final
        const diasExpirados = Math.ceil((new Date() - new Date(expiredDate)) / (1000 * 60 * 60 * 24));

        console.log('\n🔴 USUARIO CON TRIAL EXPIRADO CREADO:');
        console.log(`   📧 Email: expired@test.com`);
        console.log(`   🆔 ID: ${userId}`);
        console.log(`   ⏰ Trial expiró hace: ${diasExpirados} día(s)`);
        console.log(`   📅 Empezó: ${trialStarted.toLocaleDateString()}`);
        console.log(`   📅 Expiró: ${expiredDate.toLocaleDateString()}`);
        console.log(`   📊 Uso actual:`);
        console.log(`      - Clientes: 12/10 ❌ (LÍMITE EXCEDIDO)`);
        console.log(`      - Proyectos: 7/5 ❌ (LÍMITE EXCEDIDO)`);
        console.log(`      - Storage: 1.2GB/1GB ❌ (LÍMITE EXCEDIDO)`);
        console.log(`      - Emails: 150/100 ❌ (LÍMITE EXCEDIDO)`);

        console.log('\n🧪 CÓMO PROBAR EL TRIAL EXPIRADO:');
        console.log('\n1️⃣ PREPARACIÓN:');
        console.log('   - Ve a http://localhost:3000');
        console.log('   - Si estás logueado, cierra sesión primero');
        console.log('   - NO TIENES QUE REGISTRARTE, el usuario ya existe');
        console.log('');
        console.log('2️⃣ INICIAR SESIÓN:');
        console.log('   - Email: expired@test.com');
        console.log('   - Contraseña: (cualquiera, el usuario ya está en la BD)');
        console.log('   - O ve directamente a /dashboard');
        console.log('');
        console.log('3️⃣ LO QUE DEBERÍAS VER:');
        console.log('🔴 Banner ROJO con "¡Tu trial ha expirado!"');
        console.log('🔴 Animación pulse (urgente)');
        console.log('🔴 Botón "Actualizar Ahora" (SIN botón X)');
        console.log('📊 Estadísticas: 12 clientes, 7 proyectos, 1.2GB');
        console.log('');
        console.log('4️⃣ FUNCIONALIDADES BLOQUEADAS:');
        console.log('🚫 Crear clientes (botón deshabilitado)');
        console.log('🚫 Crear proyectos (botón deshabilitado)');
        console.log('🚫 Subir archivos (mensaje de error)');
        console.log('🚫 Enviar emails (función bloqueada)');
        console.log('');
        console.log('5️⃣ LO QUE SÍ DEBERÍA FUNCIONAR:');
        console.log('✅ Ver dashboard');
        console.log('✅ Ver lista de clientes/proyectos');
        console.log('✅ Botón "Actualizar Ahora" → redirige a Stripe');

        console.log('\n🎯 ¡USUARIO LISTO PARA PROBAR RESTRICCIONES!');

    } catch (error) {
        console.error('❌ Error general:', error.message);
        console.error('Stack:', error.stack);
    }
}

createExpiredTrialUser();
