const { createClient } = require('@supabase/supabase-js');

// Cliente público
const supabasePublic = createClient(
    'https://joyhaxtpmrmndmifsihn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODA5NzUsImV4cCI6MjA2OTU1Njk3NX0.77Si27sIxzCtJqmw3Z81dJDejKcgaX9pm8eZMldPr4I'
);

async function testConnection() {
    try {
        console.log('🔍 Probando conexión a Supabase...');

        // Test 1: Probar consulta básica de tareas
        console.log('\n1️⃣ Consultando tareas...');
        const { data: tasks, error: tasksError } = await supabasePublic
            .from('tasks')
            .select('id, title, status, priority')
            .limit(3);

        if (tasksError) {
            console.log('❌ Error consultando tareas:', tasksError);
        } else {
            console.log('✅ Tareas encontradas:', tasks?.length || 0);
            if (tasks && tasks.length > 0) {
                tasks.forEach(task => {
                    console.log(`  - ${task.title} (${task.status})`);
                });
            }
        }

        // Test 2: Probar consulta básica de proyectos
        console.log('\n2️⃣ Consultando proyectos...');
        const { data: projects, error: projectsError } = await supabasePublic
            .from('projects')
            .select('id, name')
            .limit(3);

        if (projectsError) {
            console.log('❌ Error consultando proyectos:', projectsError);
        } else {
            console.log('✅ Proyectos encontrados:', projects?.length || 0);
            if (projects && projects.length > 0) {
                projects.forEach(project => {
                    console.log(`  - ${project.name}`);
                });
            }
        }

        // Test 3: Probar crear una tarea de prueba
        console.log('\n3️⃣ Probando crear tarea...');
        const newTask = {
            title: `Test Task ${Date.now()}`,
            description: 'Tarea de prueba desde script',
            status: 'pending',
            priority: 'medium',
            user_id: 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
            project_id: projects && projects.length > 0 ? projects[0].id : null,
            created_at: new Date().toISOString()
        };

        if (newTask.project_id) {
            const { data: createdTask, error: createError } = await supabasePublic
                .from('tasks')
                .insert(newTask)
                .select()
                .single();

            if (createError) {
                console.log('❌ Error creando tarea:', createError);
            } else {
                console.log('✅ Tarea creada exitosamente:', createdTask?.title);

                // Limpiar: eliminar la tarea de prueba
                await supabasePublic
                    .from('tasks')
                    .delete()
                    .eq('id', createdTask.id);
                console.log('🧹 Tarea de prueba eliminada');
            }
        } else {
            console.log('⚠️ No hay proyectos disponibles para crear tarea');
        }

        console.log('\n🎉 Test de conexión completado!');

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

testConnection();
