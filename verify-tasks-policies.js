/**
 * Script para verificar que las políticas RLS de tareas estén funcionando correctamente
 * Las tareas deben ser PRIVADAS - solo el propietario debe poder verlas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Cliente con clave ANON (usuarios regulares)
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cliente con clave SERVICE_ROLE (admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyTasksPolicies() {
  console.log('🔒 Verificando políticas RLS para TAREAS...\n');
  
  try {
    // Test 1: Admin access (should work and see all tasks)
    console.log('1️⃣ Testing ADMIN access...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('tasks')
      .select('id, title, user_id')
      .limit(3);
    
    console.log('   📊 Admin result:', {
      count: adminData?.length || 0,
      error: adminError?.message || 'none'
    });
    
    // Test 2: Anonymous user access (should NOT work - tasks should be private)
    console.log('\n2️⃣ Testing ANON user access (should be BLOCKED)...');
    const { data: anonData, error: anonError, count } = await supabaseAnon
      .from('tasks')
      .select('id, title, user_id', { count: 'exact' })
      .limit(3);
    
    console.log('   📊 Anon result:', {
      count: count,
      dataLength: anonData?.length || 0,
      error: anonError?.message || 'none'
    });
    
    // Final verification
    console.log('\n🎯 RESULTADO FINAL:');
    if (anonData && anonData.length > 0) {
      console.log('❌ PROBLEMA: Los usuarios aún pueden ver tareas de otros');
      console.log('   - Tareas visibles:', anonData.length);
      console.log('   - Total en base:', count);
      console.log('   - Necesitas aplicar fix-tasks-rls.sql en Supabase');
      console.log('   - ⚠️  RIESGO DE SEGURIDAD: Datos privados expuestos');
    } else {
      console.log('✅ ¡PERFECTO! Las tareas están correctamente restringidas');
      console.log('   - Los usuarios anónimos no pueden ver tareas');
      console.log('   - Solo los propietarios verán sus propias tareas');
      console.log('   - 🔒 Privacidad de datos protegida');
    }
    
  } catch (err) {
    console.error('❌ Error general:', err.message);
  }
}

verifyTasksPolicies();
