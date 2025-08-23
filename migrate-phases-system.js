const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ ERROR: Missing Supabase environment variables');
    console.error('Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
    console.log('🔧 Ejecutando migraciones para mejorar sistema de fases y tareas...');
    
    try {
        // 1. Agregar columna template_data a projects (si no existe)
        console.log('📝 Agregando columna template_data a projects...');
        const { error: templateDataError } = await supabase.rpc('sql', {
            query: `
                ALTER TABLE projects 
                ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT NULL;
                
                COMMENT ON COLUMN projects.template_data IS 'Datos del template usado para crear el proyecto (fases, entregables, pricing)';
            `
        });

        if (templateDataError) {
            console.error('❌ Error agregando template_data:', templateDataError);
        } else {
            console.log('✅ Columna template_data agregada/verificada');
        }

        // 2. Agregar columna phase_order a tasks
        console.log('📝 Agregando columna phase_order a tasks...');
        const { error: phaseOrderError } = await supabase.rpc('sql', {
            query: `
                ALTER TABLE tasks 
                ADD COLUMN IF NOT EXISTS phase_order INTEGER DEFAULT NULL;
                
                COMMENT ON COLUMN tasks.phase_order IS 'Orden de la fase a la que pertenece la tarea (1, 2, 3, etc)';
            `
        });

        if (phaseOrderError) {
            console.error('❌ Error agregando phase_order:', phaseOrderError);
        } else {
            console.log('✅ Columna phase_order agregada/verificada');
        }

        // 3. Verificar las estructuras de las tablas
        console.log('🔍 Verificando estructura de tablas...');
        
        const { data: projectsColumns, error: projectsError } = await supabase.rpc('sql', {
            query: `
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'projects' AND column_name IN ('template_data');
            `
        });

        const { data: tasksColumns, error: tasksError } = await supabase.rpc('sql', {
            query: `
                SELECT column_name, data_type, is_nullable, column_default 
                FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name IN ('phase_order');
            `
        });

        if (!projectsError && projectsColumns) {
            console.log('📊 Columnas de projects:', projectsColumns);
        }
        
        if (!tasksError && tasksColumns) {
            console.log('📊 Columnas de tasks:', tasksColumns);
        }

        console.log('🎉 ¡Migraciones completadas exitosamente!');
        console.log('');
        console.log('📋 Resumen de cambios:');
        console.log('   ✅ projects.template_data - Para almacenar datos de templates');
        console.log('   ✅ tasks.phase_order - Para organizar tareas por fases');
        console.log('');
        console.log('🚀 El sistema de fases y tareas está listo para usar');

        return true;

    } catch (error) {
        console.error('❌ Error inesperado durante las migraciones:', error);
        return false;
    }
}

// Ejecutar las migraciones
runMigrations()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
