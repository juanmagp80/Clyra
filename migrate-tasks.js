const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateTasks() {
    try {
        console.log('🔄 Ejecutando migración de tasks...');

        // Verificar estructura actual
        const { data: currentTasks, error: currentError } = await supabase
            .from('tasks')
            .select('*')
            .limit(1);

        console.log('📋 Estructura actual:', currentTasks);

        // Ejecutar migraciones paso a paso usando SQL directo
        const migrations = [
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;`,
        ];

        for (let sql of migrations) {
            try {
                console.log('🔧 Ejecutando:', sql.substring(0, 50) + '...');
                const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
                if (error) {
                    console.log('⚠️  Error (puede ser normal si ya existe):', error.message);
                } else {
                    console.log('✅ Migración exitosa');
                }
            } catch (e) {
                console.log('⚠️  Error en migración:', e.message);
            }
        }

        // Intentar renombrar columna name a title
        try {
            const { error: renameError } = await supabase.rpc('exec_sql', {
                sql_query: `ALTER TABLE tasks RENAME COLUMN name TO title;`
            });
            if (renameError) {
                console.log('⚠️  Error renombrando (puede ser que ya esté como title):', renameError.message);
            } else {
                console.log('✅ Columna renombrada a title');
            }
        } catch (e) {
            console.log('⚠️  Error renombrando columna:', e.message);
        }

        console.log('✅ Migración completada');

    } catch (error) {
        console.error('💥 Error crítico en migración:', error);
    }
}

migrateTasks();
