const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDataQuick() {
    try {
        console.log('🚀 CREACIÓN RÁPIDA DE DATOS PÚBLICOS');
        console.log('===================================\n');

        const MAIN_USER_ID = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
        const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000001';

        // 1. Crear algunos proyectos de ejemplo
        console.log('1️⃣ Creando proyectos de ejemplo...');

        const sampleProjects = [
            { name: 'Proyecto Demo 1', description: 'Proyecto de demostración 1' },
            { name: 'Proyecto Demo 2', description: 'Proyecto de demostración 2' },
            { name: 'Desarrollo Web', description: 'Proyecto de desarrollo web' },
            { name: 'Aplicación Mobile', description: 'Desarrollo de app móvil' },
            { name: 'Marketing Digital', description: 'Campaña de marketing' }
        ];

        const createdProjects = [];

        for (const project of sampleProjects) {
            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    name: project.name,
                    description: project.description,
                    user_id: PUBLIC_USER_ID,
                    status: 'active'
                }])
                .select()
                .single();

            if (!error && data) {
                createdProjects.push(data);
                console.log(`✅ Proyecto creado: ${data.name}`);
            } else {
                console.log(`❌ Error creando proyecto: ${error?.message}`);
            }
        }

        // 2. Crear algunas tareas de ejemplo
        console.log('\n2️⃣ Creando tareas de ejemplo...');

        const sampleTasks = [
            {
                title: 'Diseñar landing page',
                description: 'Crear el diseño de la página de inicio',
                status: 'in_progress',
                priority: 'high'
            },
            {
                title: 'Configurar base de datos',
                description: 'Configurar la base de datos del proyecto',
                status: 'pending',
                priority: 'medium'
            },
            {
                title: 'Implementar autenticación',
                description: 'Sistema de login y registro',
                status: 'completed',
                priority: 'high'
            },
            {
                title: 'Crear documentación',
                description: 'Documentar APIs y funcionalidades',
                status: 'pending',
                priority: 'low'
            },
            {
                title: 'Testing de la aplicación',
                description: 'Pruebas unitarias y de integración',
                status: 'paused',
                priority: 'medium'
            }
        ];

        const createdTasks = [];

        for (let i = 0; i < sampleTasks.length; i++) {
            const task = sampleTasks[i];
            const project = createdProjects[i % createdProjects.length]; // Rotar proyectos

            const { data, error } = await supabase
                .from('tasks')
                .insert([{
                    title: task.title,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    user_id: PUBLIC_USER_ID,
                    project_id: project?.id || null
                }])
                .select()
                .single();

            if (!error && data) {
                createdTasks.push(data);
                console.log(`✅ Tarea creada: ${data.title}`);
            } else {
                console.log(`❌ Error creando tarea: ${error?.message}`);
            }
        }

        // 3. Verificar datos creados
        console.log('\n3️⃣ Verificando datos creados...');

        const { data: finalTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', PUBLIC_USER_ID);

        const { data: finalProjects } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', PUBLIC_USER_ID);

        console.log(`📋 Total tareas creadas: ${finalTasks?.length || 0}`);
        console.log(`📁 Total proyectos creados: ${finalProjects?.length || 0}`);

        // 4. Verificar acceso desde cliente público
        console.log('\n4️⃣ Verificando acceso público...');

        const publicClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: publicTasks, error: publicError } = await publicClient
            .from('tasks')
            .select('*')
            .eq('user_id', PUBLIC_USER_ID);

        if (publicError) {
            console.log(`❌ Error acceso público: ${publicError.message}`);
        } else {
            console.log(`✅ Cliente público puede ver: ${publicTasks?.length || 0} tareas`);
        }

        console.log('\n🎉 DATOS PÚBLICOS CREADOS EXITOSAMENTE!');
        console.log('=====================================');
        console.log(`🔑 Usuario público ID: ${PUBLIC_USER_ID}`);
        console.log(`📋 Tareas: ${finalTasks?.length || 0}`);
        console.log(`📁 Proyectos: ${finalProjects?.length || 0}`);
        console.log('');
        console.log('📋 SIGUIENTE PASO:');
        console.log('1. Cambia el import en page.tsx de TasksPageClient a TasksPageClientPublic');
        console.log('2. Refresca la aplicación');
        console.log('3. Deberías ver todos los datos sin necesidad de autenticación');

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

// Ejecutar
console.log('🚀 Iniciando creación rápida...\n');
createDataQuick().then(() => {
    console.log('\n✅ Proceso completado. Presiona Ctrl+C para salir.');
}).catch(console.error);
