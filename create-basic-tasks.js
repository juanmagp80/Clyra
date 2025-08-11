const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBasicTasks() {
    try {
        console.log('🎯 Creando tareas básicas...');
        
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
        
        // Crear tareas con solo las columnas que existen en la tabla
        const tasksData = [
            {
                project_id: projects[0].id,
                name: 'Configurar entorno de desarrollo',  // usar 'name' no 'title'
                description: 'Instalar dependencias y configurar el proyecto inicial',
                status: 'pending'
            },
            {
                project_id: projects[1] ? projects[1].id : projects[0].id,
                name: 'Diseñar mockups iniciales',
                description: 'Crear wireframes y mockups de las pantallas principales',
                status: 'in_progress'
            },
            {
                project_id: projects[0].id,
                name: 'Implementar sistema de autenticación',
                description: 'Configurar login, registro y gestión de sesiones',
                status: 'pending'
            },
            {
                project_id: projects[2] ? projects[2].id : projects[0].id,
                name: 'Crear estrategia de contenido',
                description: 'Definir línea editorial y calendario de publicaciones',
                status: 'completed'
            },
            {
                project_id: projects[3] ? projects[3].id : projects[0].id,
                name: 'Prototipo de interfaz móvil',
                description: 'Diseñar y validar la experiencia de usuario en dispositivos móviles',
                status: 'in_progress'
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
                console.log(`  - ${task.name} (${task.status}) -> ${projects.find(p => p.id === task.project_id)?.name}`);
            });
        }
        
    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

createBasicTasks();
