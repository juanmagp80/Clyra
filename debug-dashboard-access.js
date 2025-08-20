// Script para verificar autenticación y acceso al dashboard
// Ejecuta este script para diagnosticar problemas de login

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAuthStatus() {
  try {
    console.log('🔍 Verificando estado de autenticación...');

    // 1. Verificar configuración
    console.log('📋 Configuración de Supabase:');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`   Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada'}`);

    // 2. Verificar conexión a Supabase
    const { data: health, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Error conectando a Supabase:', healthError.message);
      return;
    } else {
      console.log('✅ Conexión a Supabase exitosa');
    }

    // 3. Verificar usuarios existentes
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(5);

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message);
    } else {
      console.log(`👥 Usuarios en sistema: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('   Usuarios existentes:');
        users.forEach(user => {
          console.log(`   - ${user.email || 'Sin email'} (${user.full_name || 'Sin nombre'})`);
        });
      }
    }

    // 4. Intentar crear/obtener usuario de prueba
    const testEmail = 'test@clyra.com';
    const testPassword = 'test123456';

    console.log('\n🔐 Intentando autenticación de prueba...');

    // Primero intentar login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError && loginError.message.includes('Invalid login credentials')) {
      console.log('👤 Usuario de prueba no existe. Creando...');

      // Intentar registrar usuario
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Usuario de Prueba'
          }
        }
      });

      if (signupError) {
        console.error('❌ Error creando usuario de prueba:', signupError.message);

        // Sugerir URL directo al dashboard en modo demo
        console.log('\n🎯 SOLUCIÓN ALTERNATIVA:');
        console.log('=======================');
        console.log('Si tienes problemas de autenticación, puedes:');
        console.log('');
        console.log('1. Acceder directamente en modo demo:');
        console.log('   - Edita .env.local y comenta las líneas de Supabase');
        console.log('   - Reinicia el servidor: npm run dev');
        console.log('   - Ve a: http://localhost:3000/dashboard');
        console.log('');
        console.log('2. O usar autenticación manual:');
        console.log('   - Ve a: http://localhost:3000/login');
        console.log('   - Regístrate con cualquier email');
        console.log('   - Usa el dashboard normalmente');
      } else {
        console.log('✅ Usuario de prueba creado exitosamente');
        console.log(`📧 Email: ${testEmail}`);
        console.log(`🔑 Password: ${testPassword}`);
      }
    } else if (!loginError) {
      console.log('✅ Login exitoso para usuario de prueba');
      console.log(`👤 Usuario: ${loginData.user?.email}`);
    } else {
      console.error('❌ Error de login:', loginError.message);
    }

    // 5. Verificar acceso al dashboard via HTTP
    console.log('\n🌐 Verificando acceso HTTP al dashboard...');

    try {
      const response = await fetch('http://localhost:3000/dashboard');
      console.log(`📊 Respuesta del servidor: ${response.status} ${response.statusText}`);

      if (response.status === 307 || response.status === 302) {
        const location = response.headers.get('location');
        console.log(`🔄 Redirigiendo a: ${location}`);

        if (location === '/login') {
          console.log('💡 Necesitas autenticarte primero');
        }
      } else if (response.status === 200) {
        console.log('✅ Dashboard accesible');
      }
    } catch (fetchError) {
      console.error('❌ Error accediendo al dashboard:', fetchError.message);
      console.log('💡 Asegúrate de que el servidor esté ejecutándose: npm run dev');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }

  // Instrucciones finales
  console.log('\n📋 INSTRUCCIONES PARA ACCEDER AL DASHBOARD:');
  console.log('==========================================');
  console.log('1. Ve a: http://localhost:3000/login');
  console.log('2. Regístrate con cualquier email válido');
  console.log('3. O usa las credenciales de prueba:');
  console.log(`   📧 Email: ${testEmail}`);
  console.log(`   🔑 Password: ${testPassword}`);
  console.log('4. Después del login serás redirigido al dashboard');
  console.log('');
  console.log('🔧 Si sigue sin funcionar:');
  console.log('- Verifica que el servidor esté corriendo: npm run dev');
  console.log('- Limpia cookies del navegador');
  console.log('- Prueba en ventana incógnito');
}

// Ejecutar diagnóstico
checkAuthStatus();
