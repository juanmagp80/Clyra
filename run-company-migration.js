const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
    try {
        console.log('🚀 Ejecutando migración de configuración fiscal...');
        
        // Leer el archivo SQL
        const migrationSQL = fs.readFileSync('./database/company_settings_migration.sql', 'utf8');
        
        // Dividir por declaraciones individuales y ejecutar una por una
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        console.log(`📄 Encontradas ${statements.length} declaraciones SQL`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Saltar comentarios y declaraciones vacías
            if (statement.startsWith('COMMENT') || statement.length < 10) {
                continue;
            }
            
            try {
                console.log(`⚡ Ejecutando declaración ${i + 1}/${statements.length}...`);
                
                const { error } = await supabase.rpc('exec_sql', {
                    sql_query: statement + ';'
                });
                
                if (error && !error.message.includes('already exists')) {
                    console.log(`⚠️ Error en declaración ${i + 1}:`, error.message);
                } else {
                    console.log(`✅ Declaración ${i + 1} ejecutada correctamente`);
                }
                
            } catch (e) {
                console.log(`❌ Error ejecutando declaración ${i + 1}:`, e.message);
            }
        }
        
        // Verificar que la tabla se creó correctamente
        console.log('\n🔍 Verificando creación de tabla...');
        const { data: tableExists, error: checkError } = await supabase
            .from('company_settings')
            .select('count', { count: 'exact', head: true });
            
        if (checkError) {
            console.log('❌ Error verificando tabla:', checkError.message);
        } else {
            console.log('✅ Tabla company_settings creada correctamente');
        }
        
        console.log('\n🎉 Migración completada!');
        console.log('💡 Ahora puedes configurar los datos fiscales de tu empresa');
        
    } catch (error) {
        console.error('💥 Error crítico en migración:', error);
    }
}

console.log('🔄 Iniciando migración de configuración fiscal...');
runMigration().then(() => {
    console.log('Migración finalizada. Presiona Ctrl+C para salir.');
}).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
