const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function disableRLSTemporarily() {
    try {
        console.log('🔓 Deshabilitando RLS temporalmente para debugging...');

        // Deshabilitar RLS en las tablas principales
        const tables = ['tasks', 'projects'];
        
        for (const table of tables) {
            try {
                // Intentar deshabilitar RLS usando diferentes métodos
                console.log(`📋 Procesando tabla: ${table}`);
                
                // Método 1: Usando SQL directo
                const { error: rpcError } = await supabase.rpc('exec_sql', {
                    sql_query: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
                });
                
                if (rpcError) {
                    console.log(`⚠️ Error con RPC para ${table}:`, rpcError.message);
                    
                    // Método 2: Crear política permisiva como fallback
                    const { error: policyError } = await supabase.rpc('exec_sql', {
                        sql_query: `
                            DROP POLICY IF EXISTS temp_allow_all ON ${table};
                            CREATE POLICY temp_allow_all ON ${table} 
                            FOR ALL USING (true) WITH CHECK (true);
                        `
                    });
                    
                    if (policyError) {
                        console.log(`⚠️ Error con política para ${table}:`, policyError.message);
                    } else {
                        console.log(`✅ Política permisiva creada para ${table}`);
                    }
                } else {
                    console.log(`✅ RLS deshabilitado para ${table}`);
                }
            } catch (e) {
                console.log(`❌ Error procesando ${table}:`, e.message);
            }
        }

        // Verificar datos después de cambios
        console.log('\n📊 Verificando datos después de cambios...');
        
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, user_id')
            .limit(5);
        
        console.log(`✅ Tareas visibles: ${tasks?.length || 0}`);
        if (tasks && tasks.length > 0) {
            tasks.forEach((task, i) => {
                console.log(`  ${i + 1}. ${task.title} (user: ${task.user_id})`);
            });
        }

        const { data: projects } = await supabase
            .from('projects')
            .select('id, name, user_id')
            .limit(5);
        
        console.log(`✅ Proyectos visibles: ${projects?.length || 0}`);
        if (projects && projects.length > 0) {
            projects.forEach((project, i) => {
                console.log(`  ${i + 1}. ${project.name} (user: ${project.user_id})`);
            });
        }

        console.log('\n🎉 Proceso completado!');
        console.log('💡 Ahora prueba la aplicación - deberías ver todos los datos');
        
    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

// Función para restaurar RLS después del debugging
async function restoreRLS() {
    try {
        console.log('🔒 Restaurando RLS...');
        
        const tables = ['tasks', 'projects'];
        
        for (const table of tables) {
            const { error } = await supabase.rpc('exec_sql', {
                sql_query: `
                    DROP POLICY IF EXISTS temp_allow_all ON ${table};
                    ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
                `
            });
            
            if (error) {
                console.log(`⚠️ Error restaurando RLS para ${table}:`, error.message);
            } else {
                console.log(`✅ RLS restaurado para ${table}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error restaurando RLS:', error);
    }
}

// Ejecutar
console.log('🚀 Iniciando proceso de debugging RLS...');
disableRLSTemporarily().then(() => {
    console.log('\n⏰ RLS temporalmente deshabilitado');
    console.log('🔧 Prueba la app ahora y presiona Ctrl+C cuando termines');
}).catch(console.error);
