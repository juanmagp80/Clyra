const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupTrialByEmail() {
  console.log('🧪 CONFIGURANDO TRIAL POR EMAIL (sin autenticación)\n');

  // Solicitar email del usuario
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('📧 Introduce tu email registrado: ', async (email) => {
    try {
      // Buscar el usuario por email en profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        console.log(`❌ No se encontró usuario con email: ${email}`);
        console.log('💡 Asegúrate de que el email esté registrado en la aplicación');
        readline.close();
        return;
      }

      console.log(`✅ Usuario encontrado: ${profile.full_name || email}`);

      // Configurar trial de 14 días
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          trial_started_at: trialStart.toISOString(),
          trial_ends_at: trialEnd.toISOString(),
          subscription_status: 'trial',
          subscription_plan: 'free'
        })
        .eq('id', profile.id);

      if (updateError) {
        console.log('❌ Error actualizando trial:', updateError.message);
      } else {
        console.log('\n🎉 ¡TRIAL CONFIGURADO EXITOSAMENTE!');
        console.log('✅ Duración: 14 días');
        console.log('✅ Estado: trial activo');
        console.log('✅ Plan: free');
        console.log(`✅ Expira: ${trialEnd.toLocaleDateString()}`);
        
        console.log('\n🚀 AHORA:');
        console.log('1. Ve a http://localhost:3000');
        console.log('2. Inicia sesión con tu email');
        console.log('3. Ve a /dashboard');
        console.log('4. ¡Verás el banner azul de trial funcionando!');
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      readline.close();
    }
  });
}

setupTrialByEmail();
