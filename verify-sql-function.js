// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 VERIFICANDO Y CORRIGIENDO FUNCIÓN SQL');
console.log('========================================');

async function verifyAndFixFunction() {
    try {
        // Crear cliente administrativo
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('\n1. PROBANDO FUNCIÓN ACTUAL:');
        
        const testEmail = 'juangpdev@gmail.com';
        const { data: currentResult, error: currentError } = await supabaseAdmin
            .rpc('get_user_id_by_email', { user_email: testEmail });

        if (currentError) {
            console.log('❌ Función actual falló:', currentError.message);
            console.log('   Necesitamos actualizar la función');
        } else {
            console.log('✅ Función actual funciona:', currentResult);
        }

        console.log('\n2. VERIFICANDO DATOS EN PROFILES:');
        
        const { data: profileCheck, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('email', testEmail)
            .limit(1);

        if (profileError) {
            console.log('❌ Error accediendo profiles:', profileError.message);
        } else if (profileCheck.length > 0) {
            console.log('✅ Usuario encontrado en profiles:', profileCheck[0]);
        } else {
            console.log('❌ Usuario no encontrado en profiles');
        }

        console.log('\n3. SQL PARA ACTUALIZAR LA FUNCIÓN:');
        console.log('-- Copia y pega esto en Supabase Dashboard > SQL Editor');
        console.log(`
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM public.profiles WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        `);

        console.log('\n4. TAMBIÉN PUEDES PROBARLO MANUALMENTE:');
        console.log(`SELECT get_user_id_by_email('${testEmail}');`);

    } catch (error) {
        console.log('❌ Error general:', error.message);
    }
}

verifyAndFixFunction();
