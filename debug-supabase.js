// Debug script para entender el problema con Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ultkqwdmphvgdcfuvypm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsdGtxd2RtcGh2Z2RjZnV2eXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMjc4NjUsImV4cCI6MjA1MDcwMzg2NX0.lPEgSKmSJPkCXc4Fc5tMm_9cJK2ksBjt-Rn3NUOz-Bo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSupabase() {
    console.log('🔍 Iniciando debug de Supabase...');
    
    try {
        // Test 1: Conectividad básica
        console.log('\n1. Probando conectividad básica...');
        const { data: healthCheck, error: healthError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        if (healthError) {
            console.error('❌ Error de conectividad:', healthError);
        } else {
            console.log('✅ Conectividad OK');
        }

        // Test 2: Estructura de la tabla profiles
        console.log('\n2. Probando estructura de tabla profiles...');
        const { data: structure, error: structError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (structError) {
            console.error('❌ Error accediendo a profiles:', structError);
        } else {
            console.log('✅ Estructura de profiles OK:', structure);
        }

        // Test 3: Buscar usuario específico
        console.log('\n3. Buscando amazonjgp80@gmail.com...');
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'amazonjgp80@gmail.com')
            .single();
        
        if (userError) {
            console.error('❌ Error buscando usuario:', userError);
            console.log('Código de error:', userError.code);
            console.log('Mensaje:', userError.message);
        } else {
            console.log('✅ Usuario encontrado:', user);
        }

        // Test 4: Listar todos los usuarios (límite 5)
        console.log('\n4. Listando usuarios existentes...');
        const { data: allUsers, error: allError } = await supabase
            .from('profiles')
            .select('id, email, subscription_status')
            .limit(5);
        
        if (allError) {
            console.error('❌ Error listando usuarios:', allError);
        } else {
            console.log('✅ Usuarios encontrados:', allUsers);
        }

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

debugSupabase();
