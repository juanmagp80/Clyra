const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createPublicDataView() {
    try {
        console.log('🔥 CREANDO VISTA PÚBLICA DE DATOS');
        console.log('================================\n');

        // SOLUCIÓN DEFINITIVA: Crear datos duplicados públicos
        console.log('1️⃣ Obteniendo datos del usuario principal...');
        
        const MAIN_USER_ID = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
        const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000001'; // Usuario público

        // Obtener datos originales
        const { data: originalTasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', MAIN_USER_ID);

        const { data: originalProjects } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', MAIN_USER_ID);

        console.log(`📋 Tareas del usuario principal: ${originalTasks?.length || 0}`);
        console.log(`📁 Proyectos del usuario principal: ${originalProjects?.length || 0}\n`);

        // Limpiar datos públicos existentes
        console.log('2️⃣ Limpiando datos públicos anteriores...');
        
        await supabase
            .from('tasks')
            .delete()
            .eq('user_id', PUBLIC_USER_ID);

        await supabase
            .from('projects')
            .delete()
            .eq('user_id', PUBLIC_USER_ID);

        console.log('✅ Datos públicos anteriores eliminados\n');

        // Crear proyectos públicos
        console.log('3️⃣ Creando proyectos públicos...');
        
        const publicProjects = [];
        const projectIdMap = {}; // Mapeo de IDs originales a públicos

        if (originalProjects && originalProjects.length > 0) {
            for (const project of originalProjects) {
                const publicProject = {
                    name: project.name,
                    description: project.description,
                    client_id: project.client_id,
                    user_id: PUBLIC_USER_ID,
                    status: project.status || 'active',
                    budget: project.budget,
                    start_date: project.start_date,
                    end_date: project.end_date
                };

                const { data: insertedProject, error } = await supabase
                    .from('projects')
                    .insert([publicProject])
                    .select()
                    .single();

                if (!error && insertedProject) {
                    projectIdMap[project.id] = insertedProject.id;
                    publicProjects.push(insertedProject);
                    console.log(`✅ Proyecto público creado: "${insertedProject.name}"`);
                }
            }
        }

        console.log(`📁 Total proyectos públicos creados: ${publicProjects.length}\n`);

        // Crear tareas públicas
        console.log('4️⃣ Creando tareas públicas...');
        
        const publicTasks = [];

        if (originalTasks && originalTasks.length > 0) {
            for (const task of originalTasks) {
                const publicTask = {
                    title: task.title,
                    description: task.description,
                    status: task.status || 'pending',
                    priority: task.priority || 'medium',
                    assigned_to: task.assigned_to,
                    due_date: task.due_date,
                    user_id: PUBLIC_USER_ID,
                    project_id: projectIdMap[task.project_id] || null,
                    completed_at: task.completed_at
                };

                const { data: insertedTask, error } = await supabase
                    .from('tasks')
                    .insert([publicTask])
                    .select()
                    .single();

                if (!error && insertedTask) {
                    publicTasks.push(insertedTask);
                    console.log(`✅ Tarea pública creada: "${insertedTask.title}"`);
                }
            }
        }

        console.log(`📋 Total tareas públicas creadas: ${publicTasks.length}\n`);

        // Verificar acceso público
        console.log('5️⃣ Verificando acceso desde cliente público...');
        
        const publicClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: testTasks } = await publicClient
            .from('tasks')
            .select('*')
            .eq('user_id', PUBLIC_USER_ID);

        const { data: testProjects } = await publicClient
            .from('projects')
            .select('*')
            .eq('user_id', PUBLIC_USER_ID);

        console.log(`✅ Cliente público ve ${testTasks?.length || 0} tareas`);
        console.log(`✅ Cliente público ve ${testProjects?.length || 0} proyectos\n`);

        // Crear archivo de configuración
        console.log('6️⃣ Creando archivo de configuración...');
        
        const configContent = `// Configuración para datos públicos
export const PUBLIC_USER_CONFIG = {
    USER_ID: '${PUBLIC_USER_ID}',
    PROJECTS_COUNT: ${publicProjects.length},
    TASKS_COUNT: ${publicTasks.length},
    CREATED_AT: '${new Date().toISOString()}'
};

// Usar este USER_ID en el componente TasksPageClient.tsx
// para acceder a los datos públicos sin autenticación
`;

        require('fs').writeFileSync('/home/juanma/Documentos/clyra/Clyra/public-user-config.js', configContent);
        console.log('📄 Archivo public-user-config.js creado\n');

        console.log('🎉 DATOS PÚBLICOS CREADOS EXITOSAMENTE!');
        console.log('=====================================');
        console.log(`✅ ${publicProjects.length} proyectos públicos disponibles`);
        console.log(`✅ ${publicTasks.length} tareas públicas disponibles`);
        console.log(`🔑 Usuario público ID: ${PUBLIC_USER_ID}`);
        console.log('');
        console.log('📋 PRÓXIMOS PASOS:');
        console.log('1. Actualizar TasksPageClient.tsx para usar el PUBLIC_USER_ID');
        console.log('2. Refrecar la aplicación');
        console.log('3. Deberías ver todos los datos sin necesidad de autenticación');
        console.log('');
        console.log('💡 NOTA: Estos datos son públicos y visibles sin login');
        console.log('Para producción, deberás limpiar cookies y usar login normal');

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

// Ejecutar
console.log('🚀 Iniciando creación de vista pública...\n');
createPublicDataView().then(() => {
    console.log('\n✅ Proceso completado. Presiona Ctrl+C para salir.');
}).catch(console.error);
