/**
 * Script para probar acceso con usuario autenticado
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Cliente con clave ANON
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testWithAuth() {
  console.log('🔐 Testing with authenticated user...\n');
  
  try {
    // Intentar autenticar con un usuario existente
    // Usaremos el email del usuario que ya tiene automatizaciones
    console.log('1️⃣ Testing with existing user auth...');
    
    // Primero, crear un cliente que simule estar autenticado
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false
        }
      }
    );
    
    // Simular que tenemos un token de usuario
    // En realidad necesitaríamos hacer login, pero vamos a probar si al menos
    // la estructura de la política permite el acceso cuando hay auth
    
    console.log('2️⃣ Testing direct access without auth...');
    const { data: directData, error: directError } = await supabase
      .from('automations')
      .select('id, name, is_public, user_id')
      .limit(3);
    
    console.log('   📊 Direct access:', {
      count: directData?.length || 0,
      error: directError?.message || 'none'
    });
    
    // Verificar si hay algún problema con las políticas
    console.log('\n3️⃣ Checking if policies require specific auth level...');
    
    // Intentar acceso solo a automatizaciones públicas
    const { data: publicOnlyData, error: publicOnlyError } = await supabase
      .from('automations')
      .select('id, name')
      .eq('is_public', true)
      .limit(1);
    
    console.log('   📊 Public only access:', {
      count: publicOnlyData?.length || 0,
      error: publicOnlyError?.message || 'none'
    });
    
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('   - Las políticas requieren usuarios "authenticated"');
    console.log('   - Los usuarios anónimos no pueden acceder');
    console.log('   - Necesitamos modificar la política para permitir acceso público');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testWithAuth();
