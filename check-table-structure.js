#!/usr/bin/env node

/**
 * 🔍 Script para verificar la estructura de las tablas
 * Nos ayuda a entender qué columnas existen realmente
 */

// Cargar variables de entorno
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableStructures() {
    console.log('🔍 Verificando estructura de tablas...\n');

    const tables = ['clients', 'projects', 'contracts', 'invoices', 'calendar_events'];

    for (const table of tables) {
        console.log(`📋 Tabla: ${table}`);
        try {
            // Intentar obtener un registro para ver la estructura
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.log(`   ❌ Error: ${error.message}`);
            } else {
                if (data && data.length > 0) {
                    console.log(`   ✅ Columnas encontradas:`, Object.keys(data[0]).sort().join(', '));
                } else {
                    console.log(`   ⚠️ Tabla vacía, intentando insertar registro de prueba...`);
                    
                    // Intentar insertar un registro simple para ver qué campos son requeridos
                    const { error: insertError } = await supabase
                        .from(table)
                        .insert({ test: 'test' });
                    
                    if (insertError) {
                        console.log(`   💡 Campos requeridos: ${insertError.message}`);
                    }
                }
            }
        } catch (err) {
            console.log(`   ❌ Error general: ${err.message}`);
        }
        console.log('');
    }

    // Verificar también la tabla ai_insights
    console.log('📋 Tabla: ai_insights');
    try {
        const { data, error } = await supabase
            .from('ai_insights')
            .select('*')
            .limit(1);

        if (error) {
            console.log(`   ❌ Error: ${error.message}`);
        } else {
            if (data && data.length > 0) {
                console.log(`   ✅ Columnas encontradas:`, Object.keys(data[0]).sort().join(', '));
            } else {
                console.log(`   ⚠️ Tabla ai_insights vacía pero accesible`);
            }
        }
    } catch (err) {
        console.log(`   ❌ Error general: ${err.message}`);
    }
}

checkTableStructures().catch(console.error);
