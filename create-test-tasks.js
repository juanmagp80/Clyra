const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestTasks() {
    try {
        console.log('🎯 Creando tareas de prueba...');
        
        // Obtener proyectos existentes
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name')
            .limit(4);
            
        if (projectsError || !projects?.length) {
            console.error('❌ No se pueden obtener proyectos:', projectsError);
            return;
        }
        
        console.log('📋 Proyectos encontrados:', projects.length);
        projects.forEach(p => console.log(`  - ${p.name} (${p.id})`));
        
        // Crear algunas tareas de prueba
        const tasksData = [
            {
                project_id: projects[0].id,
                title: 'Configurar entorno de desarrollo',
                description: 'Instalar dependencias y configurar el proyecto inicial',
                status: 'pending',
                priority: 'high',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                project_id: projects[1] ? projects[1].id : projects[0].id,
                title: 'Diseñar mockups iniciales',
                description: 'Crear wireframes y mockups de las pantallas principales',
                status: 'in_progress',
                priority: 'medium',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                project_id: projects[0].id,
                title: 'Implementar sistema de autenticación',
                description: 'Configurar login, registro y gestión de sesiones',
                status: 'pending',
                priority: 'urgent',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                project_id: projects[2] ? projects[2].id : projects[0].id,
                title: 'Crear estrategia de contenido',
                description: 'Definir línea editorial y calendario de publicaciones',
                status: 'completed',
                priority: 'medium',
                completed_at: new Date().toISOString(),
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                project_id: projects[3] ? projects[3].id : projects[0].id,
                title: 'Prototipo de interfaz móvil',
                description: 'Diseñar y validar la experiencia de usuario en dispositivos móviles',
                status: 'paused',
                priority: 'low',
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
            console.log('📋 Estructura esperada de tasks:', Object.keys(tasksData[0]));
        } else {
            console.log('✅ Tareas creadas exitosamente:', tasks.length);
            tasks.forEach(task => {
                console.log(`  - ${task.title} (${task.status}) -> ${projects.find(p => p.id === task.project_id)?.name}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

createTestTasks();
