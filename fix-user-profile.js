const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixUserProfile() {
  console.log('🔍 VERIFICANDO Y CONFIGURANDO PERFIL DE USUARIO\n');

  try {
    // 1. Verificar si existe en profiles
    console.log('📊 1. Verificando tabla profiles...');
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'juangpdev@gmail.com');

    if (profileError) {
      console.log('❌ Error accediendo a profiles:', profileError.message);
      return;
    }

    console.log(`✅ Perfiles encontrados: ${profileCheck?.length || 0}`);

    if (profileCheck && profileCheck.length > 0) {
      console.log('👤 Usuario encontrado en profiles:');
      const profile = profileCheck[0];
      console.log(`   - ID: ${profile.id}`);
      console.log(`   - Email: ${profile.email}`);
      console.log(`   - Estado trial: ${profile.subscription_status || 'no configurado'}`);
      console.log(`   - Trial expira: ${profile.trial_ends_at || 'no configurado'}`);

      // Actualizar el trial si no está configurado
      if (!profile.trial_ends_at || profile.subscription_status !== 'trial') {
        console.log('\n🔄 Configurando trial...');
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            trial_started_at: new Date().toISOString(),
            trial_ends_at: trialEnd.toISOString(),
            subscription_status: 'trial',
            subscription_plan: 'free'
          })
          .eq('id', profile.id);

        if (updateError) {
          console.log('❌ Error actualizando trial:', updateError.message);
        } else {
          console.log('✅ Trial configurado correctamente');
          console.log(`   - Duración: 14 días`);
          console.log(`   - Expira: ${trialEnd.toLocaleDateString()}`);
        }
      } else {
        console.log('✅ Trial ya está configurado correctamente');
      }

      // Verificar/crear user_usage
      console.log('\n📈 2. Verificando registro de uso...');
      const { data: usage, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (usageError && usageError.code === 'PGRST116') {
        console.log('📝 Creando registro de uso...');
        const { error: createUsageError } = await supabase
          .from('user_usage')
          .insert({
            user_id: profile.id,
            clients_count: 0,
            projects_count: 0,
            storage_used_mb: 0,
            emails_sent_month: 0
          });

        if (createUsageError) {
          console.log('⚠️  Error creando uso:', createUsageError.message);
        } else {
          console.log('✅ Registro de uso creado');
        }
      } else if (usage) {
        console.log('✅ Registro de uso ya existe');
        console.log(`   - Clientes: ${usage.clients_count}`);
        console.log(`   - Proyectos: ${usage.projects_count}`);
      }

    } else {
      console.log('⚠️  Usuario no encontrado en profiles');
      console.log('💡 Esto es normal si usas Supabase Auth pero no tienes trigger automático');
      
      // Crear perfil manualmente
      console.log('\n🔄 Creando perfil...');
      const newProfile = {
        email: 'juangpdev@gmail.com',
        full_name: 'Juan GP Dev',
        trial_started_at: new Date().toISOString(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial',
        subscription_plan: 'free'
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creando perfil:', createError.message);
      } else {
        console.log('✅ Perfil creado exitosamente');
        console.log(`   - ID: ${createdProfile.id}`);
        console.log('   - Trial: 14 días activos');
      }
    }

    console.log('\n🎉 CONFIGURACIÓN COMPLETADA');
    console.log('\n🚀 PRUEBA AHORA:');
    console.log('1. Ve a http://localhost:3000/dashboard');
    console.log('2. ¡El banner de trial debería aparecer!');
    console.log('3. Si no aparece, revisa la consola del navegador');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixUserProfile();
