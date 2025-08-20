const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function consolidateToMainUser() {
    try {
        console.log('🔄 Consolidando datos al usuario principal...\n');

        // Usuario principal (el que tiene más datos)
        const MAIN_USER_ID = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'; // juangpdev@gmail.com
        const MAIN_EMAIL = 'juangpdev@gmail.com';

        console.log(`🎯 Consolidando todo a: ${MAIN_EMAIL}\n`);

        // 1. Mover todos los proyectos al usuario principal
        console.log('1️⃣ Actualizando proyectos...');
        const { data: updatedProjects, error: projectError } = await supabase
            .from('projects')
            .update({ user_id: MAIN_USER_ID })
            .neq('user_id', MAIN_USER_ID)
            .select('id, name');

        if (projectError) {
            console.log('❌ Error actualizando proyectos:', projectError);
        } else {
            console.log(`✅ ${updatedProjects?.length || 0} proyectos actualizados`);
            if (updatedProjects) {
                updatedProjects.forEach(p => console.log(`   - ${p.name}`));
            }
        }

        // 2. Mover todas las tareas al usuario principal
        console.log('\n2️⃣ Actualizando tareas...');
        const { data: updatedTasks, error: taskError } = await supabase
            .from('tasks')
            .update({ user_id: MAIN_USER_ID })
            .neq('user_id', MAIN_USER_ID)
            .select('id, title');

        if (taskError) {
            console.log('❌ Error actualizando tareas:', taskError);
        } else {
            console.log(`✅ ${updatedTasks?.length || 0} tareas actualizadas`);
            if (updatedTasks) {
                updatedTasks.forEach(t => console.log(`   - ${t.title}`));
            }
        }

        // 3. Verificar estado final
        console.log('\n3️⃣ Verificando estado final...');

        const { data: finalProjects } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', MAIN_USER_ID);

        const { data: finalTasks } = await supabase
            .from('tasks')
            .select('id')
            .eq('user_id', MAIN_USER_ID);

        console.log(`📊 Estado final para ${MAIN_EMAIL}:`);
        console.log(`   🗂️  Proyectos: ${finalProjects?.length || 0}`);
        console.log(`   📝 Tareas: ${finalTasks?.length || 0}`);

        console.log(`\n🎉 Consolidación completada!`);
        console.log(`💡 Ahora inicia sesión con: ${MAIN_EMAIL}`);
        console.log(`   Y deberías ver todos los proyectos y tareas.`);

    } catch (error) {
        console.error('💥 Error en consolidación:', error);
    }
}

consolidateToMainUser();
