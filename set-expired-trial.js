const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setExpiredTrial() {
  const userEmail = 'amazonjgp80@gmail.com';
  
  // Fecha de hace 15 días (trial expirado)
  const expiredTrialDate = new Date();
  expiredTrialDate.setDate(expiredTrialDate.getDate() - 15);
  
  console.log('🔄 Configurando usuario con trial expirado y suscripción cancelada...');
  console.log('📧 Email:', userEmail);
  console.log('📅 Trial start date:', expiredTrialDate.toISOString());
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_plan: 'free',
      trial_start_date: expiredTrialDate.toISOString(),
      stripe_subscription_id: null,
      stripe_customer_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('email', userEmail)
    .select();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Usuario configurado correctamente:');
  console.log(JSON.stringify(data[0], null, 2));
  
  // Verificar estado del trial
  const trialDays = Math.floor((new Date() - expiredTrialDate) / (1000 * 60 * 60 * 24));
  console.log(`\n📊 Estado del trial:`);
  console.log(`   - Días transcurridos: ${trialDays}`);
  console.log(`   - Trial expirado: ${trialDays > 14 ? 'SÍ' : 'NO'}`);
  console.log(`   - Estado de suscripción: ${data[0].subscription_status}`);
  console.log(`   - Plan: ${data[0].subscription_plan}`);
}

setExpiredTrial().catch(console.error);
