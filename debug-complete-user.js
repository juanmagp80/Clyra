const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserSession() {
    try {
        console.log('🔍 DIAGNÓSTICO COMPLETO DE USUARIO Y SESIÓN');
        console.log('================================================\n');

        // 1. Verificar todos los usuarios en el sistema
        console.log('1️⃣ USUARIOS EN EL SISTEMA:');
        const { data: allUsers, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.log('❌ Error obteniendo usuarios:', usersError);
        } else {
            console.log(`✅ Total de usuarios registrados: ${allUsers.users.length}\n`);
            allUsers.users.forEach((user, i) => {
                console.log(`  ${i + 1}. Email: ${user.email}`);
                console.log(`     ID: ${user.id}`);
                console.log(`     Creado: ${new Date(user.created_at).toLocaleDateString()}`);
                console.log(`     Último login: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Nunca'}\n`);
            });
        }

        // 2. Verificar datos por usuario
        console.log('2️⃣ DISTRIBUCIÓN DE DATOS POR USUARIO:');
        
        if (allUsers?.users) {
            for (const user of allUsers.users) {
                console.log(`\n👤 Usuario: ${user.email} (${user.id.slice(0, 8)}...)`);
                
                // Proyectos
                const { data: userProjects } = await supabase
                    .from('projects')
                    .select('id, name, created_at')
                    .eq('user_id', user.id);
                
                console.log(`   📁 Proyectos: ${userProjects?.length || 0}`);
                if (userProjects && userProjects.length > 0) {
                    userProjects.slice(0, 3).forEach((project, i) => {
                        console.log(`      ${i + 1}. ${project.name}`);
                    });
                    if (userProjects.length > 3) {
                        console.log(`      ... y ${userProjects.length - 3} más`);
                    }
                }
                
                // Tareas
                const { data: userTasks } = await supabase
                    .from('tasks')
                    .select('id, title, created_at')
                    .eq('user_id', user.id);
                
                console.log(`   ✅ Tareas: ${userTasks?.length || 0}`);
                if (userTasks && userTasks.length > 0) {
                    userTasks.slice(0, 3).forEach((task, i) => {
                        console.log(`      ${i + 1}. ${task.title}`);
                    });
                    if (userTasks.length > 3) {
                        console.log(`      ... y ${userTasks.length - 3} más`);
                    }
                }
            }
        }

        // 3. Verificar datos huérfanos (sin user_id)
        console.log('\n3️⃣ VERIFICANDO DATOS HUÉRFANOS:');
        
        const { data: orphanProjects } = await supabase
            .from('projects')
            .select('id, name')
            .is('user_id', null);
        
        console.log(`📁 Proyectos sin user_id: ${orphanProjects?.length || 0}`);
        
        const { data: orphanTasks } = await supabase
            .from('tasks')
            .select('id, title')
            .is('user_id', null);
        
        console.log(`✅ Tareas sin user_id: ${orphanTasks?.length || 0}`);

        // 4. Mostrar estructura de datos
        console.log('\n4️⃣ ESTRUCTURA DE DATOS ACTUAL:');
        
        const { data: sampleTask } = await supabase
            .from('tasks')
            .select('*')
            .limit(1)
            .single();
        
        if (sampleTask) {
            console.log('🔑 Columnas en tasks:', Object.keys(sampleTask));
            console.log('📋 Muestra de tarea:', {
                id: sampleTask.id?.slice(0, 8) + '...',
                title: sampleTask.title,
                user_id: sampleTask.user_id?.slice(0, 8) + '...',
                project_id: sampleTask.project_id?.slice(0, 8) + '...',
                status: sampleTask.status,
                priority: sampleTask.priority
            });
        }

        const { data: sampleProject } = await supabase
            .from('projects')
            .select('*')
            .limit(1)
            .single();
        
        if (sampleProject) {
            console.log('🔑 Columnas en projects:', Object.keys(sampleProject));
            console.log('📁 Muestra de proyecto:', {
                id: sampleProject.id?.slice(0, 8) + '...',
                name: sampleProject.name,
                user_id: sampleProject.user_id?.slice(0, 8) + '...'
            });
        }

        // 5. Verificar políticas RLS actuales
        console.log('\n5️⃣ ESTADO DE RLS:');
        
        try {
            const { data: rlsStatus } = await supabase
                .from('pg_tables')
                .select('tablename, rowsecurity')
                .in('tablename', ['tasks', 'projects']);
            
            if (rlsStatus) {
                rlsStatus.forEach(table => {
                    console.log(`📋 Tabla ${table.tablename}: RLS ${table.rowsecurity ? 'HABILITADO' : 'DESHABILITADO'}`);
                });
            }
        } catch (e) {
            console.log('⚠️ No se pudo verificar el estado de RLS');
        }

        console.log('\n6️⃣ RECOMENDACIONES:');
        
        if (allUsers?.users) {
            const userWithMostData = allUsers.users.reduce((max, user) => {
                return max; // Simplificado para este diagnóstico
            }, allUsers.users[0]);
            
            console.log(`💡 Usuario principal identificado: ${userWithMostData.email}`);
            console.log(`   ID: ${userWithMostData.id}`);
            console.log('\n🔧 ACCIONES SUGERIDAS:');
            console.log('   1. Verificar que estás logueado con la cuenta correcta');
            console.log('   2. Si no coincide, hacer logout y login con la cuenta correcta');
            console.log('   3. Si el problema persiste, ejecutar consolidación de datos');
        }

        console.log('\n================================================');
        console.log('🎯 DIAGNÓSTICO COMPLETADO');

    } catch (error) {
        console.error('💥 Error en diagnóstico:', error);
    }
}

// Función para mostrar el estado de la sesión desde la perspectiva del cliente
async function debugClientSession() {
    console.log('\n🌐 SIMULANDO SESIÓN DE CLIENTE (sin auth)...');
    
    // Crear cliente público (como lo haría la app)
    const publicClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    try {
        // Intentar obtener datos como lo haría la app
        const { data: tasks, error: tasksError } = await publicClient
            .from('tasks')
            .select('*')
            .limit(5);

        if (tasksError) {
            console.log('❌ Error accediendo tareas desde cliente público:', tasksError.message);
        } else {
            console.log(`✅ Tareas accesibles desde cliente público: ${tasks?.length || 0}`);
        }

        const { data: projects, error: projectsError } = await publicClient
            .from('projects')
            .select('*')
            .limit(5);

        if (projectsError) {
            console.log('❌ Error accediendo proyectos desde cliente público:', projectsError.message);
        } else {
            console.log(`✅ Proyectos accesibles desde cliente público: ${projects?.length || 0}`);
        }

    } catch (error) {
        console.log('💥 Error con cliente público:', error.message);
    }
}

// Ejecutar diagnóstico completo
console.log('🚀 Iniciando diagnóstico completo...\n');

debugUserSession()
    .then(() => debugClientSession())
    .then(() => {
        console.log('\n✅ Diagnóstico completado. Presiona Ctrl+C para salir.');
    })
    .catch(console.error);
