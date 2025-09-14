// Verificar configuración básica primero
require('dotenv').config({ path: '.env.local' });

function checkEmailConfiguration() {
    console.log('🔍 DIAGNÓSTICO DE CONFIGURACIÓN DE EMAIL\n');

    // Verificar variables de entorno
    console.log('1. 🔧 Verificando variables de entorno:');
    console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurado' : '❌ Faltante');
    console.log('   SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurado' : '❌ Faltante');
    console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Configurado' : '❌ Faltante');
    console.log('   SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL ? '✅ Configurado' : '❌ Faltante');

    console.log('\n2. 📧 Diagnóstico del problema:');
    console.log('   Error: "Error sending confirmation email"');
    console.log('   Ubicación: app/register/page.tsx línea 165');

    console.log('\n3. 🔧 POSIBLES CAUSAS Y SOLUCIONES:');

    console.log('\n   A) ❌ SMTP no configurado correctamente en Supabase:');
    console.log('      - Ve a: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/settings/auth');
    console.log('      - Busca "SMTP Settings"');
    console.log('      - Verifica que "Enable custom SMTP" esté activado');
    console.log('      - Comprueba los datos SMTP de Resend');

    console.log('\n   B) ❌ Confirmación de email deshabilitada:');
    console.log('      - En Supabase Dashboard > Authentication > Settings');
    console.log('      - Verifica que "Enable email confirmations" esté activado');

    console.log('\n   C) ❌ URL de redirección incorrecta:');
    console.log('      - En Supabase Dashboard > Authentication > URL Configuration');
    console.log('      - Agrega: http://localhost:3000/auth/callback');
    console.log('      - Agrega: https://tu-dominio.com/auth/callback (producción)');

    console.log('\n   D) ❌ Dominio no verificado en Resend:');
    console.log('      - Ve a: https://resend.com/domains');
    console.log('      - Verifica que taskelio.app esté verificado');

    console.log('\n   E) ❌ Límites de rate en Supabase:');
    console.log('      - Espera unos minutos entre intentos');
    console.log('      - Revisa los logs en Supabase Dashboard');

    console.log('\n4. 🧪 PASOS PARA PROBAR:');
    console.log('   1. Verifica configuración SMTP en Supabase');
    console.log('   2. Activa confirmación de email si está desactivada');
    console.log('   3. Agrega URLs de redirección permitidas');
    console.log('   4. Prueba con un email real (no temporal)');
    console.log('   5. Revisa logs en Supabase > Logs > Auth');

    console.log('\n5. 📋 CHECKLIST RÁPIDO:');
    console.log('   ☐ SMTP activado en Supabase');
    console.log('   ☐ Email confirmations habilitadas');
    console.log('   ☐ URLs de redirección configuradas');
    console.log('   ☐ Dominio verificado en Resend');
    console.log('   ☐ Sin límites de rate activos');
}

console.log('🚀 Iniciando diagnóstico de configuración de email...\n');
checkEmailConfiguration();