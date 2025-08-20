const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function simulateCriticalTrial() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('❌ No hay usuario autenticado');
    return;
  }

  console.log('🟠 Simulando trial crítico (2 días restantes)...');
  
  const criticalEnd = new Date();
  criticalEnd.setDate(criticalEnd.getDate() + 2);
  
  await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      trial_ends_at: criticalEnd.toISOString(),
      subscription_status: 'trial'
    });

  console.log('✅ Trial configurado: 2 días restantes');
  console.log('🔄 Recarga /dashboard - el banner debe ser NARANJA');
}

simulateCriticalTrial();
