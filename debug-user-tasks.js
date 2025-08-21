const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserAndTasks() {
    try {
        console.log('🔍 Diagnóstico de usuario y tareas...');

        // Obtener todos los usuarios
        console.log('\n👥 Usuarios en el sistema:');
        const { data: users } = await supabase.auth.admin.listUsers();
        if (users?.users) {
            users.users.forEach((user, i) => {
                console.log(`  ${i + 1}. ID: ${user.id}`);
                console.log(`     Email: ${user.email}`);
                console.log(`     Creado: ${new Date(user.created_at).toLocaleString()}`);
                console.log('');
            });
        }

        // Obtener todas las tareas con sus user_id
        console.log('📋 Tareas en la base de datos:');
        const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, user_id, project_id, created_at');

        if (tasks) {
            tasks.forEach((task, i) => {
                console.log(`  ${i + 1}. ${task.title}`);
                console.log(`     ID: ${task.id}`);
                console.log(`     user_id: ${task.user_id}`);
                console.log(`     project_id: ${task.project_id}`);
                console.log(`     Creada: ${new Date(task.created_at).toLocaleString()}`);
                console.log('');
            });
        }

        // Obtener todos los proyectos con sus user_id
        console.log('📁 Proyectos en la base de datos:');
        const { data: projects } = await supabase
            .from('projects')
            .select('id, name, user_id, created_at');

        if (projects) {
            projects.forEach((project, i) => {
                console.log(`  ${i + 1}. ${project.name}`);
                console.log(`     ID: ${project.id}`);
                console.log(`     user_id: ${project.user_id}`);
                console.log(`     Creado: ${new Date(project.created_at).toLocaleString()}`);
                console.log('');
            });
        }

        // Verificar coincidencias
        console.log('🔗 Análisis de coincidencias:');
        if (users?.users && tasks && projects) {
            users.users.forEach(user => {
                const userTasks = tasks.filter(task => task.user_id === user.id);
                const userProjects = projects.filter(project => project.user_id === user.id);

                console.log(`👤 Usuario: ${user.email} (${user.id})`);
                console.log(`   📋 Tareas: ${userTasks.length}`);
                console.log(`   📁 Proyectos: ${userProjects.length}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('💥 Error en diagnóstico:', error);
    }
}

debugUserAndTasks();
