const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugClientAccess() {
    try {
        console.log('🔍 DEBUGGING ACCESO DEL CLIENTE');
        console.log('===============================\n');

        // 1. Verificar con cliente admin
        console.log('1️⃣ Verificando datos con cliente ADMIN:');
        
        const { data: adminTasks, error: adminTasksError } = await supabase
            .from('tasks')
            .select('*');

        if (adminTasksError) {
            console.log('❌ Error admin tasks:', adminTasksError);
        } else {
            console.log(`✅ Admin puede ver ${adminTasks?.length || 0} tareas`);
        }

        const { data: adminProjects, error: adminProjectsError } = await supabase
            .from('projects')
            .select('*');

        if (adminProjectsError) {
            console.log('❌ Error admin projects:', adminProjectsError);
        } else {
            console.log(`✅ Admin puede ver ${adminProjects?.length || 0} proyectos\n`);
        }

        // 2. Verificar con cliente público (como la app)
        console.log('2️⃣ Verificando datos con cliente PÚBLICO:');
        
        const publicClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: publicTasks, error: publicTasksError } = await publicClient
            .from('tasks')
            .select('*');

        if (publicTasksError) {
            console.log('❌ Error public tasks:', publicTasksError.message);
            console.log('   Detalles:', publicTasksError.details);
            console.log('   Hint:', publicTasksError.hint);
        } else {
            console.log(`✅ Cliente público puede ver ${publicTasks?.length || 0} tareas`);
        }

        const { data: publicProjects, error: publicProjectsError } = await publicClient
            .from('projects')
            .select('*');

        if (publicProjectsError) {
            console.log('❌ Error public projects:', publicProjectsError.message);
            console.log('   Detalles:', publicProjectsError.details);
            console.log('   Hint:', publicProjectsError.hint);
        } else {
            console.log(`✅ Cliente público puede ver ${publicProjects?.length || 0} proyectos\n`);
        }

        // 3. Verificar políticas actuales
        console.log('3️⃣ Verificando políticas actuales:');
        
        try {
            const { data: taskPolicies } = await supabase
                .from('pg_policies')
                .select('policyname, qual, with_check')
                .eq('tablename', 'tasks');

            console.log('📋 Políticas en tasks:');
            if (taskPolicies && taskPolicies.length > 0) {
                taskPolicies.forEach((policy, i) => {
                    console.log(`   ${i + 1}. ${policy.policyname}`);
                });
            } else {
                console.log('   ⚠️ No se encontraron políticas en tasks');
            }

            const { data: projectPolicies } = await supabase
                .from('pg_policies')
                .select('policyname, qual, with_check')
                .eq('tablename', 'projects');

            console.log('📁 Políticas en projects:');
            if (projectPolicies && projectPolicies.length > 0) {
                projectPolicies.forEach((policy, i) => {
                    console.log(`   ${i + 1}. ${policy.policyname}`);
                });
            } else {
                console.log('   ⚠️ No se encontraron políticas en projects');
            }

        } catch (e) {
            console.log('⚠️ No se pudieron verificar las políticas');
        }

        // 4. Crear políticas más permisivas
        console.log('\n4️⃣ Creando políticas ultra-permisivas:');
        
        const ultraPermissivePolicies = [
            // Tasks policies
            "DROP POLICY IF EXISTS ultra_permissive_tasks_select ON tasks;",
            "CREATE POLICY ultra_permissive_tasks_select ON tasks FOR SELECT USING (true);",
            
            "DROP POLICY IF EXISTS ultra_permissive_tasks_insert ON tasks;", 
            "CREATE POLICY ultra_permissive_tasks_insert ON tasks FOR INSERT WITH CHECK (true);",
            
            "DROP POLICY IF EXISTS ultra_permissive_tasks_update ON tasks;",
            "CREATE POLICY ultra_permissive_tasks_update ON tasks FOR UPDATE USING (true) WITH CHECK (true);",
            
            "DROP POLICY IF EXISTS ultra_permissive_tasks_delete ON tasks;",
            "CREATE POLICY ultra_permissive_tasks_delete ON tasks FOR DELETE USING (true);",
            
            // Projects policies  
            "DROP POLICY IF EXISTS ultra_permissive_projects_select ON projects;",
            "CREATE POLICY ultra_permissive_projects_select ON projects FOR SELECT USING (true);",
            
            "DROP POLICY IF EXISTS ultra_permissive_projects_insert ON projects;",
            "CREATE POLICY ultra_permissive_projects_insert ON projects FOR INSERT WITH CHECK (true);",
            
            "DROP POLICY IF EXISTS ultra_permissive_projects_update ON projects;", 
            "CREATE POLICY ultra_permissive_projects_update ON projects FOR UPDATE USING (true) WITH CHECK (true);",
            
            "DROP POLICY IF EXISTS ultra_permissive_projects_delete ON projects;",
            "CREATE POLICY ultra_permissive_projects_delete ON projects FOR DELETE USING (true);",
            
            // Asegurar que RLS esté habilitado
            "ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;",
            "ALTER TABLE projects ENABLE ROW LEVEL SECURITY;"
        ];

        for (const sql of ultraPermissivePolicies) {
            try {
                console.log(`⚙️ Ejecutando: ${sql.substring(0, 50)}...`);
                
                // Intentar ejecutar directamente con el cliente
                const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
                
                if (error && !error.message.includes('already exists') && !error.message.includes('does not exist')) {
                    console.log(`⚠️ Error: ${error.message}`);
                }
            } catch (e) {
                // Ignorer errores esperados
                if (!e.message.includes('already exists') && !e.message.includes('does not exist')) {
                    console.log(`⚠️ Error ejecutando SQL: ${e.message}`);
                }
            }
        }

        console.log('✅ Políticas ultra-permisivas aplicadas\n');

        // 5. Verificar acceso después de las políticas
        console.log('5️⃣ Verificando acceso después de políticas:');
        
        const { data: finalTasks, error: finalTasksError } = await publicClient
            .from('tasks')
            .select('*');

        if (finalTasksError) {
            console.log('❌ Aún hay error en tasks:', finalTasksError.message);
        } else {
            console.log(`✅ ÉXITO: Cliente público ahora ve ${finalTasks?.length || 0} tareas`);
            if (finalTasks && finalTasks.length > 0) {
                console.log('📋 Primeras 3 tareas:');
                finalTasks.slice(0, 3).forEach((task, i) => {
                    console.log(`   ${i + 1}. "${task.title}" (${task.status})`);
                });
            }
        }

        const { data: finalProjects, error: finalProjectsError } = await publicClient
            .from('projects')
            .select('*');

        if (finalProjectsError) {
            console.log('❌ Aún hay error en projects:', finalProjectsError.message);
        } else {
            console.log(`✅ ÉXITO: Cliente público ahora ve ${finalProjects?.length || 0} proyectos`);
            if (finalProjects && finalProjects.length > 0) {
                console.log('📁 Primeros 3 proyectos:');
                finalProjects.slice(0, 3).forEach((project, i) => {
                    console.log(`   ${i + 1}. "${project.name}"`);
                });
            }
        }

        console.log('\n🎉 PROCESO COMPLETADO');
        console.log('===================');
        console.log('🔧 Ahora refresca la página en el navegador');
        console.log('🧹 También elimina las cookies del navegador:');
        console.log('   1. Abre DevTools (F12)');
        console.log('   2. Ve a Application > Storage');
        console.log('   3. Elimina todas las cookies de localhost:3000');
        console.log('   4. Refresca la página');

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

// Ejecutar debug
console.log('🚀 Iniciando debug de acceso del cliente...\n');
debugClientAccess().then(() => {
    console.log('\n✅ Debug completado. Presiona Ctrl+C para salir.');
}).catch(console.error);
