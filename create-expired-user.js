const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createExpiredTrialUser() {
  console.log('🔴 CREANDO CUENTA CON TRIAL EXPIRADO\n');

  try {
    // Crear usuario con trial expirado hace 1 día
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1); // Expiró ayer

    const trialStarted = new Date();
    trialStarted.setDate(trialStarted.getDate() - 15); // Empezó hace 15 días

    const expiredUser = {
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
    const { data: createdUser, error: createError } = await supabase
      .from('profiles')
      .insert(expiredUser)
      .select()
      .single();

    if (createError) {
      if (createError.message.includes('duplicate key')) {
        console.log('ℹ️ Usuario ya existe, actualizando trial expirado...');
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('profiles')
          .update({
            trial_started_at: trialStarted.toISOString(),
            trial_ends_at: expiredDate.toISOString(),
            subscription_status: 'trial',
            subscription_plan: 'free'
          })
          .eq('email', 'expired@test.com')
          .select()
          .single();

        if (updateError) {
          console.log('❌ Error actualizando:', updateError.message);
          return;
        }
        createdUser.data = updatedUser;
      } else {
        console.log('❌ Error creando usuario:', createError.message);
        return;
      }
    }

    const userId = createdUser.id || createdUser.data?.id;

    // Crear registro de uso simulando límites alcanzados
    console.log('📊 Configurando uso que excede límites...');
    const { error: usageError } = await supabase
      .from('user_usage')
      .upsert({
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
    console.log(`   📊 Uso actual:`);
    console.log(`      - Clientes: 12/10 ❌ (LÍMITE EXCEDIDO)`);
    console.log(`      - Proyectos: 7/5 ❌ (LÍMITE EXCEDIDO)`);
    console.log(`      - Storage: 1.2GB/1GB ❌ (LÍMITE EXCEDIDO)`);
    console.log(`      - Emails: 150/100 ❌ (LÍMITE EXCEDIDO)`);

    console.log('\n🧪 PRUEBAS A REALIZAR:');
    console.log('1. Ve a http://localhost:3000');
    console.log('2. IMPORTANTE: Cierra sesión si estás logueado');
    console.log('3. Inicia sesión con: expired@test.com');
    console.log('4. Ve a /dashboard');
    console.log('');
    console.log('🔴 LO QUE DEBERÍAS VER:');
    console.log('✅ Banner ROJO con "¡Tu trial ha expirado!"');
    console.log('✅ Botón "Actualizar Ahora" (obligatorio, sin X para cerrar)');
    console.log('✅ Banner con animación pulse (urgente)');
    console.log('✅ Estadísticas mostrando límites excedidos');
    console.log('');
    console.log('🚫 FUNCIONALIDADES QUE DEBERÍAN ESTAR BLOQUEADAS:');
    console.log('- Crear nuevos clientes');
    console.log('- Crear nuevos proyectos');
    console.log('- Subir archivos');
    console.log('- Enviar emails');
    console.log('');
    console.log('🔓 SOLO DEBERÍA FUNCIONAR:');
    console.log('- Ver dashboard');
    console.log('- Ver clientes/proyectos existentes');
    console.log('- Botón de upgrade');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createExpiredTrialUser();
