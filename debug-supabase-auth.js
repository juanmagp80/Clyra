const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function diagnosticarSupabase() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE SUPABASE AUTH\n');

    try {
        // Crear cliente Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        console.log('1. ✅ Cliente Supabase creado');
        console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('   Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Presente' : '❌ Faltante');

        // Test básico de conexión
        console.log('\n2. 🧪 Probando conexión básica...');
        const testEmail = `test-${Date.now()}@test.com`;
        const testPassword = 'TestPass123!';

        console.log(`   Email de prueba: ${testEmail}`);

        // Intentar registro SIN confirmación de email primero
        console.log('\n3. 🧪 Probando registro básico...');
        
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword
        });

        if (error) {
            console.error('❌ Error en registro básico:', error);
            console.error('   Código:', error.status);
            console.error('   Mensaje:', error.message);
            
            // Analizar tipos de error
            if (error.message.includes('Email not confirmed')) {
                console.log('\n💡 CONFIRMACIÓN DE EMAIL REQUERIDA');
                console.log('   - La confirmación de email está activada en Supabase');
                console.log('   - El problema es con el envío del email de confirmación');
            }
            
            if (error.message.includes('SMTP') || error.message.includes('email')) {
                console.log('\n💡 PROBLEMA DE SMTP DETECTADO');
                console.log('   - Verificar configuración SMTP en Supabase Dashboard');
                console.log('   - URL: https://supabase.com/dashboard/project/joyhaxtpmrmndmifsihn/settings/auth');
            }
            
            if (error.message.includes('rate') || error.message.includes('429')) {
                console.log('\n💡 LÍMITE DE RATE ALCANZADO');
                console.log('   - Esperar unos minutos entre intentos');
                console.log('   - Revisar logs en Supabase Dashboard');
            }
            
        } else {
            console.log('✅ Registro exitoso');
            console.log('   Usuario ID:', data.user?.id);
            console.log('   Email confirmado:', data.user?.email_confirmed_at ? 'Sí' : 'No');
            console.log('   Sesión:', data.session ? 'Creada' : 'No creada');
        }

        // Información adicional de configuración
        console.log('\n4. 🔧 Información de configuración:');
        console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Presente' : '❌ Faltante');
        console.log('   SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'No configurado');
        
        console.log('\n5. 📋 PASOS SIGUIENTES:');
        console.log('   1. Revisar configuración SMTP en Supabase Dashboard');
        console.log('   2. Verificar que "Enable email confirmations" esté activado');
        console.log('   3. Comprobar logs de Auth en Supabase');
        console.log('   4. Considerar deshabilitar temporalmente la confirmación de email');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

diagnosticarSupabase();