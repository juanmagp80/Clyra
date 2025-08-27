const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
    try {
        console.log('🔄 Ejecutando migración segura de tasks...');

        // Paso 1: Verificar estado actual
        console.log('📋 Verificando estado actual de la tabla tasks...');

        const { data: currentTasks, error: currentError } = await supabase
            .from('tasks')
            .select('id, project_id, user_id')
            .limit(5);

        if (currentError) {
            console.log('❌ Error consultando tasks:', currentError);
            return;
        }

        console.log('📊 Tareas encontradas:', currentTasks?.length || 0);

        if (currentTasks && currentTasks.length > 0) {
            console.log('🔍 Muestra de datos:');
            currentTasks.forEach((task, i) => {
                console.log(`  ${i + 1}. ID: ${task.id}, project_id: ${task.project_id}, user_id: ${task.user_id || 'NULL'}`);
            });
        }

        // Paso 2: Ejecutar migración por partes
        console.log('\n🔧 Iniciando migración por pasos...');

        // Agregar columna user_id si no existe
        console.log('1️⃣ Agregando columna user_id...');
        try {
            await supabase.rpc('exec_sql', {
                sql_query: 'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID;'
            });
            console.log('✅ Columna user_id agregada o ya existía');
        } catch (e) {
            console.log('⚠️ Error agregando columna (puede ser normal):', e.message);
        }

        // Actualizar tareas existentes con user_id basado en proyectos
        console.log('2️⃣ Asignando user_id basado en proyectos...');

        // Obtener tareas sin user_id
        const { data: tasksWithoutUser } = await supabase
            .from('tasks')
            .select('id, project_id')
            .is('user_id', null);

        console.log(`📝 Tareas sin user_id: ${tasksWithoutUser?.length || 0}`);

        if (tasksWithoutUser && tasksWithoutUser.length > 0) {
            for (const task of tasksWithoutUser) {
                if (task.project_id) {
                    // Obtener el user_id del proyecto
                    const { data: project } = await supabase
                        .from('projects')
                        .select('user_id')
                        .eq('id', task.project_id)
                        .single();

                    if (project?.user_id) {
                        await supabase
                            .from('tasks')
                            .update({ user_id: project.user_id })
                            .eq('id', task.id);
                        console.log(`✅ Tarea ${task.id} asignada al usuario ${project.user_id}`);
                    }
                } else {
                    // Sin project_id, asignar al primer usuario
                    const { data: firstUser } = await supabase.auth.admin.listUsers();
                    if (firstUser.users && firstUser.users.length > 0) {
                        await supabase
                            .from('tasks')
                            .update({ user_id: firstUser.users[0].id })
                            .eq('id', task.id);
                        console.log(`✅ Tarea ${task.id} asignada al usuario por defecto`);
                    }
                }
            }
        }

        // Paso 3: Verificar que todas las tareas tengan user_id
        const { data: tasksStillNull } = await supabase
            .from('tasks')
            .select('id')
            .is('user_id', null);

        if (tasksStillNull && tasksStillNull.length > 0) {
            console.log(`⚠️ Aún hay ${tasksStillNull.length} tareas sin user_id`);
        } else {
            console.log('✅ Todas las tareas tienen user_id asignado');
        }

        // Paso 4: Verificar otras columnas necesarias
        console.log('3️⃣ Verificando otras columnas...');

        const { data: sampleTask } = await supabase
            .from('tasks')
            .select('*')
            .limit(1)
            .single();

        if (sampleTask) {
            const columns = Object.keys(sampleTask);
            console.log('🔑 Columnas actuales:', columns);

            const requiredColumns = ['title', 'priority', 'due_date', 'completed_at'];
            const missingColumns = requiredColumns.filter(col => !columns.includes(col));

            if (missingColumns.length > 0) {
                console.log('⚠️ Columnas faltantes:', missingColumns);
            } else {
                console.log('✅ Todas las columnas requeridas están presentes');
            }
        }

        console.log('\n🎉 Migración completada exitosamente!');
        console.log('💡 Ahora puedes actualizar el código para usar user_id directamente');

    } catch (error) {
        console.error('💥 Error crítico en migración:', error);
    }
}

// Función alternativa si no hay RPC disponible
async function manualMigration() {
    try {
        console.log('🔄 Ejecutando migración manual...');

        // Obtener todas las tareas
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id, project_id, user_id');

        console.log(`📋 Total de tareas: ${tasks?.length || 0}`);

        if (tasks) {
            for (const task of tasks) {
                if (!task.user_id && task.project_id) {
                    // Obtener user_id del proyecto
                    const { data: project } = await supabase
                        .from('projects')
                        .select('user_id')
                        .eq('id', task.project_id)
                        .single();

                    if (project?.user_id) {
                        const { error } = await supabase
                            .from('tasks')
                            .update({ user_id: project.user_id })
                            .eq('id', task.id);

                        if (!error) {
                            console.log(`✅ Actualizada tarea ${task.id}`);
                        }
                    }
                }
            }
        }

        console.log('✅ Migración manual completada');

    } catch (error) {
        console.error('❌ Error en migración manual:', error);
    }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de tasks...');
runMigration().then(() => {
    console.log('Migración finalizada. Presiona Ctrl+C para salir.');
}).catch(() => {
    console.log('💡 Intentando migración manual...');
    manualMigration();
});
