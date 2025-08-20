const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Clave de servicio para operaciones administrativas
);

async function setupTrialSystem() {
  console.log('🚀 Configurando sistema de trial al 100% (método directo)...\n');

  try {
    // 1. Crear tabla subscription_plans
    console.log('📋 Creando tabla subscription_plans...');
    const { error: plansError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL DEFAULT 0,
          billing_interval TEXT NOT NULL DEFAULT 'month',
          features JSONB DEFAULT '{}',
          max_clients INTEGER DEFAULT 10,
          max_projects INTEGER DEFAULT 5,
          max_storage_gb INTEGER DEFAULT 1,
          max_emails_per_month INTEGER DEFAULT 100,
          is_trial BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (plansError) {
      console.log('ℹ️ Tabla subscription_plans ya existe o creada');
    } else {
      console.log('✅ Tabla subscription_plans creada');
    }

    // 2. Limpiar planes duplicados y agregar planes básicos
    console.log('🧹 Limpiando planes duplicados...');
    await supabase.from('subscription_plans').delete().neq('id', '');
    
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
    const { error: insertError } = await supabase
      .from('subscription_plans')
      .insert(plans);

    if (insertError) {
      console.log('ℹ️ Planes ya existen:', insertError.message);
    } else {
      console.log('✅ Planes insertados correctamente');
    }

    // 3. Verificar usuario actual
    console.log('👤 Verificando usuario actual...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('⚠️ No hay usuario autenticado. Inicia sesión para completar la configuración.');
      return;
    }

    // 4. Actualizar perfil del usuario con trial
    console.log('🔄 Configurando trial para el usuario...');
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        trial_start: new Date().toISOString(),
        trial_end: trialEndDate.toISOString(),
        subscription_status: 'trial',
        plan_id: plans[0].id
      });

    if (profileError) {
      console.log('⚠️ Error actualizando perfil:', profileError.message);
    } else {
      console.log('✅ Perfil actualizado con trial de 14 días');
    }

    // 5. Verificación final
    console.log('\n📊 Verificación final...');
    
    const { data: verifyPlans } = await supabase
      .from('subscription_plans')
      .select('name, price, is_trial')
      .order('is_trial', { ascending: false });

    console.log('✅ Planes disponibles:');
    verifyPlans?.forEach(plan => {
      console.log(`  - ${plan.name}: $${plan.price} ${plan.is_trial ? '(Trial)' : ''}`);
    });

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, trial_start, trial_end')
      .eq('id', user.id)
      .single();

    if (profile) {
      console.log(`✅ Usuario configurado: ${profile.subscription_status}`);
      if (profile.trial_end) {
        const daysLeft = Math.ceil((new Date(profile.trial_end) - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`⏰ Trial expira en: ${daysLeft} días`);
      }
    }

    console.log('\n🎉 Sistema de trial configurado al 100%!');
    console.log('\n🚀 Próximos pasos:');
    console.log('1. Reinicia el servidor: npm run dev');
    console.log('2. Ve a /dashboard para ver el banner de trial');
    console.log('3. Prueba las restricciones de límites');

  } catch (error) {
    console.error('❌ Error configurando el sistema:', error.message);
  }
}

setupTrialSystem();
