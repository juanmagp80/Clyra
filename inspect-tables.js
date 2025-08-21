const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTasksTable() {
    try {
        console.log('🔍 Inspeccionando tabla tasks...');

        // Intentar obtener cualquier registro para ver la estructura
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .limit(1);

        if (tasksError) {
            console.log('❌ Error consultando tasks:', tasksError);
        } else {
            console.log('📋 Estructura de tasks:', tasks);
            if (tasks && tasks.length > 0) {
                console.log('🔑 Columnas encontradas:', Object.keys(tasks[0]));
            } else {
                console.log('📋 Tabla tasks está vacía');
            }
        }

        // También verificar projects
        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        if (projectsError) {
            console.log('❌ Error consultando projects:', projectsError);
        } else {
            console.log('📁 Estructura de projects:', projects);
            if (projects && projects.length > 0) {
                console.log('🔑 Columnas projects:', Object.keys(projects[0]));
            }
        }

    } catch (error) {
        console.error('💥 Error crítico:', error);
    }
}

inspectTasksTable();
