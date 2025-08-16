// Script para diagnosticar el flujo de login
// Prueba el sistema de autenticación paso a paso

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugLoginFlow() {
  try {
    console.log('🔍 DIAGNÓSTICO DEL FLUJO DE LOGIN');
    console.log('=================================');
    
    // 1. Verificar configuración de Supabase
    console.log('📋 1. VERIFICACIÓN DE CONFIGURACIÓN:');
    console.log('====================================');
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log(`URL: ${url ? url.substring(0, 20) + '...' : 'NO CONFIGURADA'}`);
    console.log(`Key: ${key ? key.substring(0, 20) + '...' : 'NO CONFIGURADA'}`);
    
    if (!url || !key) {
      console.log('❌ Supabase no está configurado correctamente');
      return;
    }
    
    console.log('✅ Configuración de Supabase correcta');
    console.log('');
    
    // 2. Verificar conexión con Supabase
    console.log('📋 2. VERIFICACIÓN DE CONEXIÓN:');
    console.log('==============================');
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (testError) {
      console.log('❌ Error conectando con Supabase:', testError.message);
      return;
    }
    
    console.log('✅ Conexión con Supabase exitosa');
    console.log('');
    
    // 3. Verificar usuarios existentes
    console.log('📋 3. USUARIOS EXISTENTES:');
    console.log('=========================');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('❌ Error obteniendo usuarios:', usersError.message);
      console.log('💡 Nota: Esto requiere service_role key, usando anon key para test básico');
    } else {
      console.log(`📊 Total de usuarios: ${users.users.length}`);
      
      users.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.email_confirmed_at ? 'Confirmado' : 'Pendiente confirmación'}`);
      });
    }
    
    console.log('');
    
    // 4. Verificar sesión actual
    console.log('📋 4. SESIÓN ACTUAL:');
    console.log('===================');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Error obteniendo sesión:', sessionError.message);
    } else if (session) {
      console.log('✅ Hay una sesión activa');
      console.log(`👤 Usuario: ${session.user.email}`);
      console.log(`⏰ Expira: ${new Date(session.expires_at * 1000).toLocaleString('es-ES')}`);
    } else {
      console.log('⚠️ No hay sesión activa');
    }
    
    console.log('');
    
    // 5. Test de login (solo si no hay sesión)
    console.log('📋 5. TEST DE LOGIN:');
    console.log('===================');
    
    // Usar credenciales de prueba
    const testEmail = 'juangpdev@gmail.com'; // Email que sabemos que existe
    const testPassword = 'password123'; // Contraseña de prueba
    
    console.log(`🧪 Probando login con: ${testEmail}`);
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('❌ Error en login:', loginError.message);
      
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('💡 Credenciales incorrectas - esto es normal para el test');
      } else if (loginError.message.includes('Email not confirmed')) {
        console.log('💡 Email no confirmado - revisar confirmación de email');
      }
    } else if (loginData.session) {
      console.log('✅ Login exitoso!');
      console.log(`👤 Usuario: ${loginData.user.email}`);
      console.log(`🆔 User ID: ${loginData.user.id}`);
      console.log(`📧 Email confirmado: ${loginData.user.email_confirmed_at ? 'Sí' : 'No'}`);
      
      // Probar logout
      console.log('');
      console.log('🧪 Probando logout...');
      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) {
        console.log('❌ Error en logout:', logoutError.message);
      } else {
        console.log('✅ Logout exitoso');
      }
    }
    
    // 6. Recomendaciones
    console.log('');
    console.log('📋 RECOMENDACIONES PARA SOLUCIONAR PROBLEMAS:');
    console.log('============================================');
    
    console.log('🔧 Si el login no funciona en la aplicación:');
    console.log('1. Reiniciar el servidor de desarrollo (npm run dev)');
    console.log('2. Limpiar cache del navegador (Ctrl+Shift+R)');
    console.log('3. Verificar que no hay errores de CORS');
    console.log('4. Revisar que el middleware no esté bloqueando la sesión');
    console.log('5. Confirmar que el email del usuario esté verificado');
    console.log('');
    console.log('🛠️ Para depurar más:');
    console.log('- Revisar Network tab en DevTools');
    console.log('- Verificar cookies de sesión de Supabase');
    console.log('- Comprobar logs del servidor Next.js');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
debugLoginFlow();
