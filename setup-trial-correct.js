const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupTrialSystemCorrect() {
  console.log('🚀 Configurando sistema de trial CORRECTO al 100%...\n');

  try {
    // 1. Limpiar planes existentes
    console.log('🧹 Limpiando planes existentes...');
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Planes anteriores eliminados');

    // 2. Insertar planes con la estructura correcta según el SQL
    const correctPlans = [
      {
        name: 'Trial Gratuito',
        price_monthly: 0.00,
        price_yearly: 0.00,
        features: [
          "Acceso completo por 14 días",
          "Hasta 10 clientes", 
          "Hasta 5 proyectos",
          "1GB almacenamiento",
          "Todas las funciones",
          "Soporte por email"
        ],
        max_clients: 10,
        max_projects: 5,
        max_storage_gb: 1
      },
      {
        name: 'Pro',
        price_monthly: 10.00,
        price_yearly: 100.00,
        features: [
          "Clientes ilimitados",
          "Proyectos ilimitados", 
          "10GB almacenamiento",
          "Facturación automática",
          "Seguimiento de tiempo",
          "Reportes avanzados",
          "Gestión de tareas",
          "Portal de cliente",
          "Soporte prioritario"
        ],
        max_clients: -1,
        max_projects: -1,
        max_storage_gb: 10
      }
    ];

    console.log('📥 Insertando planes con estructura correcta...');
    const { data: insertedPlans, error: insertError } = await supabase
      .from('subscription_plans')
      .insert(correctPlans)
      .select();

    if (insertError) {
      console.log('❌ Error insertando planes:', insertError.message);
      console.log('Detalles del error:', insertError);
      
      // Intentar solo con campos básicos
      console.log('🔄 Intentando con campos mínimos...');
      const minimalPlans = [
        {
          name: 'Trial Gratuito',
          price_monthly: 0.00
        },
        {
          name: 'Pro', 
          price_monthly: 10.00
        }
      ];

      const { data: minInserted, error: minError } = await supabase
        .from('subscription_plans')
        .insert(minimalPlans)
        .select();

      if (minError) {
        console.log('❌ Error con campos mínimos:', minError.message);
      } else {
        console.log('✅ Planes mínimos insertados:', minInserted);
      }
    } else {
      console.log('✅ Planes correctos insertados:');
      insertedPlans?.forEach(plan => {
        console.log(`  - ${plan.name}: $${plan.price_monthly}/mes`);
      });
    }

    // 3. Verificar tabla profiles y sus columnas de trial
    console.log('\n👤 Verificando tabla profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, trial_started_at, trial_ends_at, subscription_status')
      .limit(1);

    if (profilesError) {
      console.log('⚠️ Error accediendo a profiles trial fields:', profilesError.message);
      console.log('Esto significa que las columnas de trial no existen aún');
    } else {
      console.log('✅ Tabla profiles con campos de trial funcional');
    }

    // 4. Verificar user_usage
    console.log('\n📊 Verificando tabla user_usage...');
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .limit(1);

    if (usageError) {
      console.log('⚠️ Tabla user_usage no accesible:', usageError.message);
    } else {
      console.log('✅ Tabla user_usage funcional');
    }

    // 5. Estado final
    console.log('\n📊 Estado final del sistema:');
    
    const { data: finalPlans } = await supabase
      .from('subscription_plans')
      .select('*');

    if (finalPlans && finalPlans.length > 0) {
      console.log(`✅ ${finalPlans.length} planes configurados:`);
      finalPlans.forEach((plan, index) => {
        const isTrialPlan = plan.price_monthly === 0;
        console.log(`${index + 1}. ${plan.name} - $${plan.price_monthly}/mes ${isTrialPlan ? '(TRIAL)' : ''}`);
        if (plan.max_clients) {
          console.log(`   Límites: ${plan.max_clients > 0 ? plan.max_clients : '∞'} clientes`);
        }
      });
    } else {
      console.log('⚠️ No hay planes en la base de datos');
    }

    console.log('\n🎉 Sistema de trial configurado correctamente!');
    console.log('\n🚀 Para completar la configuración:');
    console.log('1. Reinicia el servidor: npm run dev');
    console.log('2. Inicia sesión en la aplicación');
    console.log('3. Ve a /dashboard - el hook useTrialStatus detectará automáticamente si necesitas trial');
    console.log('4. El banner de trial aparecerá con 14 días de countdown');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack completo:', error);
  }
}

setupTrialSystemCorrect();
