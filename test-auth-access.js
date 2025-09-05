/**
 * Script para probar acceso con usuario autenticado
 */

// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 DEPURACIÓN DE AUTENTICACIÓN ESPECÍFICA');
console.log('==========================================');

async function debugAuth() {
    try {
        // Crear cliente administrativo
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('1. PROBANDO EMAIL ESPECÍFICO:');
        
        // Lista de emails para probar
        const testEmails = [
            'juangpdev@gmail.com',
            'juanmagp26@gmail.com', 
            'amazonjgp80@gmail.com',
            'refugestion@gmail.com'
        ];

        for (const email of testEmails) {
            console.log(`
🔸 Probando: ${email}`);
            
            // Método 1: Buscar directamente en profiles
            const { data: profileDirect, error: profileError } = await supabaseAdmin
                .from('profiles')
                .select('id, email, full_name')
                .eq('email', email)
                .single();

            if (profileError) {
                console.log(`❌ Error búsqueda directa:`, profileError.message);
            } else {
                console.log(`✅ Búsqueda directa exitosa:`, profileDirect.id);
            }

            // Método 2: Usar función get_user_id_by_email
            const { data: functionResult, error: functionError } = await supabaseAdmin
                .rpc('get_user_id_by_email', { user_email: email });

            if (functionError) {
                console.log(`❌ Error función SQL:`, functionError.message);
            } else {
                console.log(`✅ Función SQL exitosa:`, functionResult);
            }
        }

        console.log('2. SIMULANDO REQUEST DE AUTOMATIZACIÓN:');
        
        // Simular exactamente lo que hace el endpoint
        const testUserEmail = 'juangpdev@gmail.com'; // Cambia por tu email
        
        console.log(`🔸 Simulando para: ${testUserEmail}`);
        
        const { data: userId, error: userError } = await supabaseAdmin
            .rpc('get_user_id_by_email', { user_email: testUserEmail });

        if (userError) {
            console.log('❌ Error obteniendo user ID:', userError.message);
            console.log('   Detalles completos:', userError);
        } else if (!userId) {
            console.log('❌ Usuario no encontrado (NULL)');
        } else {
            console.log('✅ Usuario encontrado:', userId);
            
            // Probar inserción en ai_insights con estructura correcta
            const testInsight = {
                user_id: userId,
                insight_type: 'test_automation',
                category: 'testing',
                title: 'Test de Automatización',
                description: 'Prueba de inserción en ai_insights',
                data_points: { test: 'data' },
                confidence_score: 0.95
            };
            
            const { data: insertResult, error: insertError } = await supabaseAdmin
                .from('ai_insights')
                .insert(testInsight)
                .select();
            
            if (insertError) {
                console.log('❌ Error insertando ai_insights:', insertError.message);
                console.log('   Detalles:', insertError);
            } else {
                console.log('✅ Inserción ai_insights exitosa:', insertResult[0].id);
                
                // Limpiar test data
                await supabaseAdmin
                    .from('ai_insights')
                    .delete()
                    .eq('id', insertResult[0].id);
                console.log('🧹 Test data limpiada');
            }
        }

    } catch (error) {
        console.log('❌ Error general:', error.message);
        console.log('Stack:', error.stack);
    }
}

debugAuth();
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
