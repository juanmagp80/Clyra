/**
 * Script para verificar si las políticas RLS han sido aplicadas correctamente
 * Ejecutar después de aplicar fix-automations-rls-real.sql en la consola de Supabase
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

async function verifyPolicies() {
  console.log('🔍 Verificando políticas RLS para automatizaciones...\n');
  
  try {
    // Test 1: Admin access (should work)
    console.log('1️⃣ Testing ADMIN access...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('automations')
      .select('id, name, is_public, user_id')
      .limit(3);
    
    console.log('   📊 Admin result:', {
      count: adminData?.length || 0,
      error: adminError?.message || 'none'
    });
    
    // Test 2: Anonymous user access (should work after policy fix)
    console.log('\n2️⃣ Testing ANON user access...');
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('automations')
      .select('id, name, is_public')
      .limit(3);
    
    console.log('   📊 Anon result:', {
      count: anonData?.length || 0,
      error: anonError?.message || 'none'
    });
    
    // Test 3: Public automations specifically
    console.log('\n3️⃣ Testing public automations access...');
    const { data: publicData, error: publicError } = await supabaseAnon
      .from('automations')
      .select('id, name, is_public')
      .eq('is_public', true);
    
    console.log('   📊 Public automations:', {
      count: publicData?.length || 0,
      error: publicError?.message || 'none'
    });
    
    // Final verification
    console.log('\n🎯 RESULTADO FINAL:');
    if (anonData && anonData.length > 0) {
      console.log('✅ ¡ÉXITO! Los usuarios pueden ver automatizaciones');
      console.log('   - Automatizaciones visibles:', anonData.length);
      console.log('   - Las políticas RLS están funcionando correctamente');
    } else {
      console.log('❌ PROBLEMA: Los usuarios aún no pueden ver automatizaciones');
      console.log('   - Error:', anonError?.message || 'Sin datos');
      console.log('   - Necesitas aplicar fix-automations-rls-real.sql en Supabase');
    }
    
  } catch (err) {
    console.error('❌ Error general:', err.message);
  }
}

verifyPolicies();
