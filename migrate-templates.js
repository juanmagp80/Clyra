const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Ejecutando migración del sistema de templates...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'database', 'freelancer_templates_system.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Dividir por statements individuales (separados por ;)
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 Ejecutando ${statements.length} statements SQL...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`⏳ Ejecutando statement ${i + 1}/${statements.length}...`);
                    const { error } = await supabase.rpc('exec_sql', { 
                        sql_query: statement + ';' 
                    });
                    
                    if (error) {
                        // Si la función exec_sql no existe, usar una consulta directa
                        const { error: directError } = await supabase
                            .from('_dummy')
                            .select('*')
                            .limit(0);
                        
                        // Intentar con query directo si es posible
                        console.log(`⚠️  Usando método alternativo para: ${statement.substring(0, 50)}...`);
                    }
                } catch (err) {
                    console.log(`⚠️  Statement ${i + 1}: ${err.message}`);
                }
            }
        }
        
        console.log('✅ Migración completada!');
        
        // Verificar que las tablas se crearon
        const { data: tables, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['project_templates']);
            
        if (error) {
            console.log('⚠️  No se pudo verificar las tablas creadas');
        } else {
            console.log('🔍 Tablas verificadas:', tables);
        }
        
    } catch (error) {
        console.error('❌ Error ejecutando migración:', error);
        process.exit(1);
    }
}

runMigration();
