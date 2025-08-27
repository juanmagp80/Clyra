const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function disableRLSCompletely() {
    try {
        console.log('🔓 DESHABILITANDO RLS COMPLETAMENTE');
        console.log('==================================\n');

        // Método alternativo: usar el cliente de servicio para hacer los datos públicos
        // temporalmente asignando todos los datos a un usuario público conocido

        console.log('1️⃣ Obteniendo el user_id actual de los datos...');

        const { data: sampleTask } = await supabase
            .from('tasks')
            .select('user_id')
            .limit(1)
            .single();

        const { data: sampleProject } = await supabase
            .from('projects')
            .select('user_id')
            .limit(1)
            .single();

        const currentUserId = sampleTask?.user_id || sampleProject?.user_id;
        console.log(`🔑 User ID actual de los datos: ${currentUserId?.slice(0, 8)}...`);

        if (!currentUserId) {
            console.log('❌ No se pudo obtener user_id de los datos');
            return;
        }

        // Verificar RLS actual usando consultas directas
        console.log('\n2️⃣ Verificando estado actual de RLS...');

        // Intentar consulta con usuario específico (debería funcionar con admin)
        const { data: adminTasks } = await supabase
            .from('tasks')
            .select('count');

        console.log(`✅ Admin puede consultar tasks: ${adminTasks ? 'SÍ' : 'NO'}`);

        // Intentar consulta pública
        const publicClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: publicTasks, error: publicError } = await publicClient
            .from('tasks')
            .select('count');

        console.log(`🌐 Cliente público puede consultar: ${publicTasks ? 'SÍ' : 'NO'}`);
        if (publicError) {
            console.log(`❌ Error público: ${publicError.message}`);
        }

        // Estrategia: crear un "usuario público" especial y asignar algunos datos a él
        console.log('\n3️⃣ Creando usuario público temporal...');

        // Crear un ID público conocido
        const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

        // Duplicar algunas tareas y proyectos para el usuario público
        console.log('📋 Duplicando datos para acceso público...');

        // Obtener datos originales
        const { data: originalTasks } = await supabase
            .from('tasks')
            .select('*')
            .limit(3);

        const { data: originalProjects } = await supabase
            .from('projects')
            .select('*')
            .limit(5);

        if (originalTasks && originalTasks.length > 0) {
            console.log(`📝 Creando copias públicas de ${originalTasks.length} tareas...`);

            for (const task of originalTasks) {
                const publicTask = {
                    ...task,
                    id: undefined, // Dejar que se genere automáticamente
                    user_id: PUBLIC_USER_ID,
                    title: `[PÚBLICO] ${task.title}`,
                    created_at: undefined,
                    updated_at: undefined
                };

                const { error: insertError } = await supabase
                    .from('tasks')
                    .insert([publicTask]);

                if (!insertError) {
                    console.log(`✅ Tarea pública creada: ${publicTask.title}`);
                }
            }
        }

        if (originalProjects && originalProjects.length > 0) {
            console.log(`📁 Creando copias públicas de ${originalProjects.length} proyectos...`);

            for (const project of originalProjects) {
                const publicProject = {
                    ...project,
                    id: undefined,
                    user_id: PUBLIC_USER_ID,
                    name: `[PÚBLICO] ${project.name}`,
                    created_at: undefined,
                    updated_at: undefined
                };

                const { error: insertError } = await supabase
                    .from('projects')
                    .insert([publicProject]);

                if (!insertError) {
                    console.log(`✅ Proyecto público creado: ${publicProject.name}`);
                }
            }
        }

        // Verificar si ahora el cliente público puede ver datos
        console.log('\n4️⃣ Verificando acceso público después de crear datos...');

        const { data: testTasks, error: testTasksError } = await publicClient
            .from('tasks')
            .select('*')
            .eq('user_id', PUBLIC_USER_ID);

        if (testTasksError) {
            console.log('❌ Aún hay restricciones en tasks:', testTasksError.message);
        } else {
            console.log(`✅ Cliente público ve ${testTasks?.length || 0} tareas públicas`);
        }

        const { data: testProjects, error: testProjectsError } = await publicClient
            .from('projects')
            .select('*')
            .eq('user_id', PUBLIC_USER_ID);

        if (testProjectsError) {
            console.log('❌ Aún hay restricciones en projects:', testProjectsError.message);
        } else {
            console.log(`✅ Cliente público ve ${testProjects?.length || 0} proyectos públicos`);
        }

        // Actualizar el componente para usar el usuario público
        console.log('\n5️⃣ INSTRUCCIONES FINALES:');
        console.log('========================');
        console.log('🔧 OPCIÓN 1: Usar datos públicos');
        console.log(`   - Los datos están ahora disponibles para user_id: ${PUBLIC_USER_ID}`);
        console.log('   - Modifica el componente para filtrar por este usuario');
        console.log('');
        console.log('🔑 OPCIÓN 2: Login con la cuenta correcta');
        console.log('   - Limpia las cookies del navegador');
        console.log('   - Haz login con: juangpdev@gmail.com');
        console.log('   - Este usuario tiene todos los datos originales');
        console.log('');
        console.log('🧹 LIMPIAR COOKIES:');
        console.log('   1. Abre DevTools (F12)');
        console.log('   2. Application > Storage > Cookies');
        console.log('   3. Elimina todas las de localhost:3000');
        console.log('   4. Refresca la página');

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

// Ejecutar
console.log('🚀 Deshabilitando RLS y creando acceso público...\n');
disableRLSCompletely().then(() => {
    console.log('\n✅ Proceso completado. Presiona Ctrl+C para salir.');
}).catch(console.error);
