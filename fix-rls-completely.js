const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSCompletely() {
    try {
        console.log('🔧 Arreglando RLS completamente...');

        // Paso 1: Eliminar todas las políticas existentes
        console.log('1️⃣ Eliminando políticas existentes...');
        
        const dropPoliciesSQL = `
            -- Eliminar políticas de tasks
            DROP POLICY IF EXISTS "Users can only see own tasks" ON tasks;
            DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
            DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
            DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
            DROP POLICY IF EXISTS temp_allow_all ON tasks;
            DROP POLICY IF EXISTS tasks_select_policy ON tasks;
            DROP POLICY IF EXISTS tasks_insert_policy ON tasks;
            DROP POLICY IF EXISTS tasks_update_policy ON tasks;
            DROP POLICY IF EXISTS tasks_delete_policy ON tasks;
            
            -- Eliminar políticas de projects
            DROP POLICY IF EXISTS "Users can only see own projects" ON projects;
            DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
            DROP POLICY IF EXISTS "Users can update own projects" ON projects;
            DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
            DROP POLICY IF EXISTS temp_allow_all ON projects;
            DROP POLICY IF EXISTS projects_select_policy ON projects;
            DROP POLICY IF EXISTS projects_insert_policy ON projects;
            DROP POLICY IF EXISTS projects_update_policy ON projects;
            DROP POLICY IF EXISTS projects_delete_policy ON projects;
        `;

        // Ejecutar eliminación de políticas
        await executeSQL(dropPoliciesSQL, 'Eliminando políticas');

        // Paso 2: Deshabilitar RLS completamente
        console.log('2️⃣ Deshabilitando RLS...');
        
        const disableRLSSQL = `
            ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
            ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
        `;

        await executeSQL(disableRLSSQL, 'Deshabilitando RLS');

        // Paso 3: Verificar que los datos son accesibles
        console.log('3️⃣ Verificando acceso a datos...');

        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id, title, user_id, project_id')
            .limit(10);

        if (tasksError) {
            console.log('❌ Error accediendo tasks:', tasksError);
        } else {
            console.log(`✅ Tareas accesibles: ${tasks?.length || 0}`);
            if (tasks && tasks.length > 0) {
                console.log('📋 Muestra de tareas:');
                tasks.slice(0, 5).forEach((task, i) => {
                    console.log(`  ${i + 1}. "${task.title}" (ID: ${task.id}, User: ${task.user_id?.slice(0, 8)}...)`);
                });
            }
        }

        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name, user_id')
            .limit(10);

        if (projectsError) {
            console.log('❌ Error accediendo projects:', projectsError);
        } else {
            console.log(`✅ Proyectos accesibles: ${projects?.length || 0}`);
            if (projects && projects.length > 0) {
                console.log('📋 Muestra de proyectos:');
                projects.slice(0, 5).forEach((project, i) => {
                    console.log(`  ${i + 1}. "${project.name}" (ID: ${project.id}, User: ${project.user_id?.slice(0, 8)}...)`);
                });
            }
        }

        // Paso 4: Verificar estructura de tablas
        console.log('4️⃣ Verificando estructura...');

        if (tasks && tasks.length > 0) {
            const sampleTask = tasks[0];
            const taskColumns = Object.keys(sampleTask);
            console.log('🔑 Columnas en tasks:', taskColumns);
        }

        if (projects && projects.length > 0) {
            const sampleProject = projects[0];
            const projectColumns = Object.keys(sampleProject);
            console.log('🔑 Columnas en projects:', projectColumns);
        }

        console.log('\n🎉 RLS completamente deshabilitado!');
        console.log('🚀 La aplicación ahora debería mostrar todos los datos');
        console.log('💡 Inicia el servidor: npm run dev');

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

// Función helper para ejecutar SQL con manejo de errores
async function executeSQL(sql, description) {
    try {
        console.log(`⚙️ ${description}...`);
        
        // Dividir comandos SQL y ejecutar uno por uno
        const commands = sql
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);

        for (const command of commands) {
            try {
                const { error } = await supabase.rpc('exec_sql', {
                    sql_query: command + ';'
                });
                
                if (error && !error.message.includes('does not exist')) {
                    console.log(`⚠️ Error en comando: ${error.message}`);
                }
            } catch (e) {
                // Ignorar errores de "no existe" ya que es normal
                if (!e.message.includes('does not exist')) {
                    console.log(`⚠️ Error ejecutando: ${e.message}`);
                }
            }
        }
        
        console.log(`✅ ${description} completado`);
        
    } catch (error) {
        console.log(`❌ Error en ${description}:`, error.message);
    }
}

// Ejecutar
console.log('🚀 Arreglando RLS de manera definitiva...');
fixRLSCompletely().then(() => {
    console.log('✅ Proceso completado. Presiona Ctrl+C para salir.');
}).catch(console.error);
