// Cargar variables de entorno explícitamente
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 DETECTANDO Y REPARANDO TABLA AI_INSIGHTS');
console.log('=============================================');

async function fixAiInsightsTable() {
    try {
        // Crear cliente administrativo
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('\n1. PROBANDO INSERCIÓN CON ESTRUCTURA MÍNIMA:');
        
        // Probar con estructura básica primero
        const basicTest = {
            user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
            automation_type: 'test_basic'
        };

        const { data: basicResult, error: basicError } = await supabaseAdmin
            .from('ai_insights')
            .insert(basicTest)
            .select();

        if (basicError) {
            console.log('❌ Error inserción básica:', basicError.message);
            console.log('   Detalles:', basicError);
        } else {
            console.log('✅ Inserción básica exitosa:', basicResult[0].id);
            
            // Limpiar
            await supabaseAdmin.from('ai_insights').delete().eq('id', basicResult[0].id);
        }

        console.log('\n2. PROBANDO CADA COLUMNA INDIVIDUALMENTE:');
        
        const testColumns = [
            { name: 'input_data', value: { test: 'data' } },
            { name: 'ai_response', value: { test: 'response' } },
            { name: 'confidence_score', value: 0.95 },
            { name: 'execution_time_ms', value: 100 }
        ];

        const workingColumns = ['user_id', 'automation_type'];
        
        for (const col of testColumns) {
            const testData = {
                user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
                automation_type: 'test_column',
                [col.name]: col.value
            };

            const { data: colResult, error: colError } = await supabaseAdmin
                .from('ai_insights')
                .insert(testData)
                .select();

            if (colError) {
                console.log(`❌ Columna ${col.name} no existe:`, colError.message);
            } else {
                console.log(`✅ Columna ${col.name} funciona`);
                workingColumns.push(col.name);
                
                // Limpiar
                await supabaseAdmin.from('ai_insights').delete().eq('id', colResult[0].id);
            }
        }

        console.log('\n3. COLUMNAS QUE FUNCIONAN:', workingColumns);

        console.log('\n4. GENERANDO SQL PARA AGREGAR COLUMNAS FALTANTES:');
        
        const allColumns = ['user_id', 'automation_type', 'input_data', 'ai_response', 'confidence_score', 'execution_time_ms'];
        const missingColumns = allColumns.filter(col => !workingColumns.includes(col));
        
        if (missingColumns.length > 0) {
            console.log('\n📝 SQL PARA AGREGAR COLUMNAS FALTANTES:');
            console.log('-- Ejecutar en Supabase Dashboard > SQL Editor');
            
            missingColumns.forEach(col => {
                let sqlType = 'TEXT';
                switch (col) {
                    case 'input_data':
                    case 'ai_response':
                        sqlType = 'JSONB';
                        break;
                    case 'confidence_score':
                        sqlType = 'DECIMAL(5,4)';
                        break;
                    case 'execution_time_ms':
                        sqlType = 'INTEGER';
                        break;
                }
                
                console.log(`ALTER TABLE public.ai_insights ADD COLUMN IF NOT EXISTS ${col} ${sqlType};`);
            });
        } else {
            console.log('✅ Todas las columnas necesarias ya existen');
        }

        console.log('\n5. PROBANDO INSERCIÓN COMPLETA:');
        
        // Probar con solo las columnas que funcionan
        const completeTestData = {
            user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
            automation_type: 'test_complete'
        };

        // Agregar solo las columnas que sabemos que funcionan
        workingColumns.forEach(col => {
            if (col === 'input_data') completeTestData[col] = { test: 'input' };
            else if (col === 'ai_response') completeTestData[col] = { test: 'output' };
            else if (col === 'confidence_score') completeTestData[col] = 0.95;
            else if (col === 'execution_time_ms') completeTestData[col] = 150;
        });

        const { data: completeResult, error: completeError } = await supabaseAdmin
            .from('ai_insights')
            .insert(completeTestData)
            .select();

        if (completeError) {
            console.log('❌ Error inserción completa:', completeError.message);
        } else {
            console.log('✅ Inserción completa exitosa:', completeResult[0]);
            
            // Limpiar
            await supabaseAdmin.from('ai_insights').delete().eq('id', completeResult[0].id);
        }

    } catch (error) {
        console.log('❌ Error general:', error.message);
    }
}

fixAiInsightsTable();
