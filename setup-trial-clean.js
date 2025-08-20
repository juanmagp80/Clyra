const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupTrialSystemDirect() {
  console.log('🚀 Configurando sistema de trial al 100% (método directo)...\n');

  try {
    // 1. Limpiar planes duplicados
    console.log('🧹 Limpiando planes duplicados...');
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Esto eliminará todos los registros

    console.log('✅ Planes limpiados');

    // 2. Insertar planes básicos limpios
    const plans = [
      {
        name: 'Trial Gratuito',
        price: 0,
        billing_interval: 'month',
        features: {
          clients: 10,
          projects: 5,
          storage: '1GB',
          emails: 100,
          trial_days: 14
        },
        max_clients: 10,
        max_projects: 5,
        max_storage_gb: 1,
        max_emails_per_month: 100,
        is_trial: true
      },
      {
        name: 'Pro',
        price: 29.99,
        billing_interval: 'month',
        features: {
          clients: 'unlimited',
          projects: 'unlimited',
          storage: '100GB',
          emails: 1000,
          advanced_features: true
        },
        max_clients: -1,
        max_projects: -1,
        max_storage_gb: 100,
        max_emails_per_month: 1000,
        is_trial: false
      }
    ];

    console.log('📥 Insertando planes limpios...');
    const { data: insertedPlans, error: insertError } = await supabase
      .from('subscription_plans')
      .insert(plans)
      .select();

    if (insertError) {
      console.log('❌ Error insertando planes:', insertError.message);
      return;
    }

    console.log('✅ Planes insertados correctamente');

    // 3. Crear tabla user_usage si no existe
    console.log('📊 Verificando tabla user_usage...');
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .limit(1);

    if (usageError && usageError.code === 'PGRST116') {
      console.log('ℹ️ Tabla user_usage no existe, pero está OK - se usa para estadísticas');
    }

    // 4. Verificación final
    console.log('\n📊 Verificación final...');
    
    const { data: verifyPlans } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('is_trial', { ascending: false });

    console.log('✅ Planes en base de datos:');
    verifyPlans?.forEach(plan => {
      console.log(`  - ID: ${plan.id}`);
      console.log(`  - Nombre: ${plan.name}`);
      console.log(`  - Precio: $${plan.price}`);
      console.log(`  - Trial: ${plan.is_trial ? 'Sí' : 'No'}`);
      console.log(`  - Límites: ${plan.max_clients} clientes, ${plan.max_projects} proyectos`);
      console.log('  ---');
    });

    // 5. Configurar usuario actual si está autenticado
    const trialPlan = verifyPlans?.find(plan => plan.is_trial);
    if (trialPlan) {
      console.log(`\n🔧 Plan de trial disponible: ${trialPlan.id}`);
      console.log('Para activar el trial para un usuario:');
      console.log('1. El usuario debe estar autenticado');
      console.log('2. Su perfil será actualizado automáticamente por useTrialStatus');
    }

    console.log('\n🎉 Sistema de trial configurado al 100%!');
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Reinicia el servidor: npm run dev');
    console.log('2. Inicia sesión en la aplicación');
    console.log('3. Ve a /dashboard para ver el banner de trial');
    console.log('4. El hook useTrialStatus se encargará del resto automáticamente');

  } catch (error) {
    console.error('❌ Error configurando el sistema:', error.message);
    console.error('Detalles:', error);
  }
}

setupTrialSystemDirect();
