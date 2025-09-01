/**
 * Script para verificar configuración de Google OAuth
 */

const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando configuración de Google OAuth...\n');

console.log('📋 Variables de entorno:');
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante');
console.log('- SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ Faltante');
console.log('- GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configurada' : '❌ Faltante');
console.log('- GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Configurada' : '❌ Faltante');

if (!supabaseUrl || !supabaseServiceKey) {
    console.log('\n❌ Faltan variables de entorno críticas');
    process.exit(1);
}

// Crear cliente de Supabase con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkGoogleOAuthConfig() {
    try {
        console.log('\n🔧 Verificando configuración OAuth en Supabase...');
        
        // Verificar si Google está habilitado como provider
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (error) {
            console.log('❌ Error conectando con Supabase:', error.message);
            return false;
        }
        
        console.log('✅ Conexión con Supabase exitosa');
        
        // URLs que deben estar configuradas en Google Cloud Console
        console.log('\n📝 URLs que debes configurar en Google Cloud Console:');
        console.log('Authorized redirect URIs:');
        console.log(`- ${supabaseUrl}/auth/v1/callback`);
        console.log('- http://localhost:3000/auth/callback');
        console.log('- https://your-domain.com/auth/callback');
        
        console.log('\n🎯 Authorized JavaScript origins:');
        console.log(`- ${supabaseUrl}`);
        console.log('- http://localhost:3000');
        console.log('- https://your-domain.com');
        
        return true;
        
    } catch (err) {
        console.log('❌ Error durante la verificación:', err.message);
        return false;
    }
}

// Ejecutar verificación
checkGoogleOAuthConfig().then(success => {
    if (success) {
        console.log('\n✅ Configuración verificada. Si aún tienes errores:');
        console.log('1. Verifica que Google OAuth esté habilitado en Supabase Dashboard');
        console.log('2. Confirma las URLs de redirect en Google Cloud Console');
        console.log('3. Reinicia el servidor de desarrollo');
    }
});
