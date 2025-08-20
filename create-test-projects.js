const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestProjects() {
    try {
        console.log('🚀 Creando proyectos de prueba...');

        // Obtener usuario actual (asumiendo que solo hay uno o tomar el primero)
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();

        if (userError || !users?.users?.length) {
            console.error('❌ No se pueden obtener usuarios:', userError);
            return;
        }

        const userId = users.users[0].id;
        console.log('👤 Usuario ID:', userId);

        // Crear algunos proyectos de prueba
        const projectsData = [
            {
                user_id: userId,
                name: 'Proyecto General',
                description: 'Proyecto por defecto para tareas generales',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: userId,
                name: 'Desarrollo Web',
                description: 'Proyecto para desarrollo de sitios web',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: userId,
                name: 'Marketing Digital',
                description: 'Campañas y estrategias de marketing',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: userId,
                name: 'Diseño UI/UX',
                description: 'Diseño de interfaces y experiencia de usuario',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        const { data, error } = await supabase
            .from('projects')
            .insert(projectsData)
            .select();

        if (error) {
            console.error('❌ Error creando proyectos:', error);
        } else {
            console.log('✅ Proyectos creados exitosamente:', data.length);
            data.forEach(project => {
                console.log(`  - ${project.name} (ID: ${project.id})`);
            });
        }

        // Crear también algunas tareas de prueba
        console.log('🎯 Creando tareas de prueba...');

        const tasksData = [
            {
                user_id: userId,
                project_id: data[0]?.id,
                title: 'Configurar entorno de desarrollo',
                description: 'Instalar dependencias y configurar el proyecto',
                status: 'pending',
                priority: 'high',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: userId,
                project_id: data[1]?.id,
                title: 'Diseñar mockups iniciales',
                description: 'Crear wireframes y mockups de la aplicación',
                status: 'in_progress',
                priority: 'medium',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: userId,
                project_id: data[0]?.id,
                title: 'Implementar sistema de autenticación',
                description: 'Configurar login y registro de usuarios',
                status: 'pending',
                priority: 'urgent',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksData)
            .select();

        if (tasksError) {
            console.error('❌ Error creando tareas:', tasksError);
        } else {
            console.log('✅ Tareas creadas exitosamente:', tasks.length);
            tasks.forEach(task => {
                console.log(`  - ${task.title} (${task.status})`);
            });
        }

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

createTestProjects();
