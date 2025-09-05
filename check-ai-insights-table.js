// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 VERIFICANDO ESTRUCTURA TABLA AI_INSIGHTS');
console.log('============================================');

async function checkAiInsightsTable() {
    try {
        // Crear cliente administrativo
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('\n1. VERIFICANDO COLUMNAS EXISTENTES:');
        
        // Intentar describir la tabla
        const { data: tableInfo, error: tableError } = await supabaseAdmin
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'ai_insights')
            .eq('table_schema', 'public');

        if (tableError) {
            console.log('❌ Error obteniendo información de tabla:', tableError.message);
        } else {
            console.log('✅ Columnas encontradas:');
            tableInfo.forEach(col => {
                console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        }

        console.log('\n2. INTENTANDO SELECT SIMPLE:');
        
        // Intentar un select simple para ver qué columnas existen
        const { data: sampleData, error: sampleError } = await supabaseAdmin
            .from('ai_insights')
            .select('*')
            .limit(1);

        if (sampleError) {
            console.log('❌ Error en SELECT:', sampleError.message);
        } else {
            console.log('✅ SELECT exitoso');
            if (sampleData.length > 0) {
                console.log('Columnas reales:', Object.keys(sampleData[0]));
            } else {
                console.log('Tabla vacía, pero estructura accesible');
            }
        }

        console.log('\n3. SCHEMA ESPERADO VS ACTUAL:');
        const expectedColumns = [
            'id',
            'user_id', 
            'automation_type',
            'input_data',
            'ai_response',
            'confidence_score',
            'execution_time_ms',
            'created_at'
        ];

        console.log('Columnas esperadas:', expectedColumns);
        
        if (tableInfo) {
            const actualColumns = tableInfo.map(col => col.column_name);
            const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
            const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
            
            if (missingColumns.length > 0) {
                console.log('❌ Columnas faltantes:', missingColumns);
            }
            
            if (extraColumns.length > 0) {
                console.log('ℹ️  Columnas extra:', extraColumns);
            }
            
            if (missingColumns.length === 0 && extraColumns.length === 0) {
                console.log('✅ Estructura de tabla correcta');
            }
        }

    } catch (error) {
        console.log('❌ Error general:', error.message);
    }
}

checkAiInsightsTable();
