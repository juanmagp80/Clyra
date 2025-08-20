const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTablesAndSetup() {
  console.log('🔍 Verificando estructura de tablas existentes...\n');

  try {
    // 1. Verificar tabla subscription_plans
    console.log('📋 Verificando subscription_plans...');
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .limit(5);

    if (plansError) {
      console.log('❌ Error accediendo a subscription_plans:', plansError.message);
    } else {
      console.log('✅ Tabla subscription_plans accesible');
      console.log('Estructura encontrada:');
      if (plans && plans.length > 0) {
        console.log('Columnas disponibles:', Object.keys(plans[0]));
        console.log('Registros existentes:', plans.length);
        console.log('Primer registro:', plans[0]);
      } else {
        console.log('Tabla vacía, pero existe');
      }
    }

    // 2. Insertar planes básicos con estructura simple
    console.log('\n📥 Insertando planes con estructura básica...');
    
    const basicPlans = [
      {
        name: 'Trial Gratuito',
        price: 0,
        features: {
          clients: 10,
          projects: 5,
          storage: '1GB',
          emails: 100,
          trial_days: 14
        },
        is_trial: true
      },
      {
        name: 'Pro',
        price: 29.99,
        features: {
          clients: 'unlimited',
          projects: 'unlimited',
          storage: '100GB',
          emails: 1000
        },
        is_trial: false
      }
    ];

    // Limpiar duplicados primero
    console.log('🧹 Limpiando registros existentes...');
    await supabase
      .from('subscription_plans')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { data: insertedPlans, error: insertError } = await supabase
      .from('subscription_plans')
      .insert(basicPlans)
      .select();

    if (insertError) {
      console.log('❌ Error insertando planes básicos:', insertError.message);
      
      // Intentar con estructura aún más simple
      console.log('🔄 Intentando con estructura mínima...');
      const minimalPlans = [
        { name: 'Trial Gratuito', is_trial: true },
        { name: 'Pro', is_trial: false }
      ];

      const { data: minimalInserted, error: minimalError } = await supabase
        .from('subscription_plans')
        .insert(minimalPlans)
        .select();

      if (minimalError) {
        console.log('❌ Error con estructura mínima:', minimalError.message);
      } else {
        console.log('✅ Planes mínimos insertados correctamente');
        console.log('Planes:', minimalInserted);
      }
    } else {
      console.log('✅ Planes básicos insertados correctamente');
      console.log('Planes:', insertedPlans);
    }

    // 3. Verificar tabla profiles
    console.log('\n👤 Verificando tabla profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.log('❌ Error accediendo a profiles:', profilesError.message);
    } else {
      console.log('✅ Tabla profiles accesible');
      if (profiles && profiles.length > 0) {
        console.log('Columnas en profiles:', Object.keys(profiles[0]));
      }
    }

    console.log('\n🎉 Verificación completada!');
    console.log('\n📊 Estado del sistema:');
    
    // Verificación final
    const { data: finalPlans } = await supabase
      .from('subscription_plans')
      .select('*');

    console.log(`✅ ${finalPlans?.length || 0} planes en la base de datos`);
    finalPlans?.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name} ${plan.is_trial ? '(Trial)' : ''}`);
    });

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkTablesAndSetup();
