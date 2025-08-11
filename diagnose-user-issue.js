const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseUserIssue() {
    try {
        console.log('🔍 Diagnosticando problema de usuario...\n');

        // 1. Obtener todos los usuarios del auth
        console.log('1️⃣ Usuarios en auth.users:');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.log('❌ Error obteniendo usuarios:', authError);
            return;
        }

        if (authUsers?.users) {
            authUsers.users.forEach((user, i) => {
                console.log(`  ${i+1}. ${user.email} - ID: ${user.id}`);
                console.log(`      Creado: ${new Date(user.created_at).toLocaleString()}`);
                console.log(`      Último login: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Nunca'}`);
            });
        }

        console.log(`\n📊 Total usuarios auth: ${authUsers?.users?.length || 0}\n`);

        // 2. Obtener todos los user_id únicos en projects
        console.log('2️⃣ user_id únicos en projects:');
        const { data: projects } = await supabase
            .from('projects')
            .select('user_id, name')
            .order('user_id');

        const projectUserIds = [...new Set(projects?.map(p => p.user_id) || [])];
        
        for (const userId of projectUserIds) {
            const userProjects = projects?.filter(p => p.user_id === userId) || [];
            console.log(`  👤 Usuario: ${userId}`);
            console.log(`     Proyectos: ${userProjects.length}`);
            userProjects.forEach(p => console.log(`       - ${p.name}`));
            
            // Verificar si este user_id existe en auth
            const authUser = authUsers?.users?.find(u => u.id === userId);
            console.log(`     En auth: ${authUser ? `✅ ${authUser.email}` : '❌ No encontrado'}\n`);
        }

        // 3. Obtener todos los user_id únicos en tasks
        console.log('3️⃣ user_id únicos en tasks:');
        const { data: tasks } = await supabase
            .from('tasks')
            .select('user_id, title')
            .order('user_id');

        const taskUserIds = [...new Set(tasks?.map(t => t.user_id) || [])];
        
        for (const userId of taskUserIds) {
            const userTasks = tasks?.filter(t => t.user_id === userId) || [];
            console.log(`  👤 Usuario: ${userId}`);
            console.log(`     Tareas: ${userTasks.length}`);
            
            // Verificar si este user_id existe en auth
            const authUser = authUsers?.users?.find(u => u.id === userId);
            console.log(`     En auth: ${authUser ? `✅ ${authUser.email}` : '❌ No encontrado'}\n`);
        }

        // 4. Sugerencia de corrección
        console.log('💡 SUGERENCIAS:');
        
        if (authUsers?.users?.length === 1) {
            const singleUser = authUsers.users[0];
            console.log(`\n🎯 Tienes un solo usuario: ${singleUser.email} (${singleUser.id})`);
            console.log('   Vamos a asignar todas las tareas y proyectos a este usuario.\n');
            
            // Actualizar proyectos
            const { error: projectUpdateError } = await supabase
                .from('projects')
                .update({ user_id: singleUser.id })
                .neq('user_id', singleUser.id);
            
            if (projectUpdateError) {
                console.log('❌ Error actualizando proyectos:', projectUpdateError);
            } else {
                console.log('✅ Proyectos actualizados');
            }

            // Actualizar tareas
            const { error: taskUpdateError } = await supabase
                .from('tasks')
                .update({ user_id: singleUser.id })
                .neq('user_id', singleUser.id);
            
            if (taskUpdateError) {
                console.log('❌ Error actualizando tareas:', taskUpdateError);
            } else {
                console.log('✅ Tareas actualizadas');
            }

            console.log(`\n🎉 Todas las tareas y proyectos ahora pertenecen a: ${singleUser.email}`);
            
        } else {
            console.log('\n⚠️ Hay múltiples usuarios. Es necesario asignar manualmente.');
        }

    } catch (error) {
        console.error('💥 Error en diagnóstico:', error);
    }
}

diagnoseUserIssue();
