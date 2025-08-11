const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTasksSchema() {
    try {
        console.log('🔍 Verificando esquema de la tabla tasks...');
        
        // Obtener información del esquema
        const { data: schemaInfo, error } = await supabase
            .rpc('get_table_schema', { table_name: 'tasks' })
            .single();

        if (error) {
            console.log('❌ Error obteniendo esquema:', error);
            
            // Método alternativo: obtener una tarea para ver las columnas
            const { data: sampleTask, error: sampleError } = await supabase
                .from('tasks')
                .select('*')
                .limit(1)
                .single();

            if (sampleError) {
                console.log('❌ Error obteniendo muestra:', sampleError);
            } else {
                console.log('📊 Columnas encontradas en la tabla:');
                Object.keys(sampleTask).forEach(col => {
                    console.log(`  - ${col}: ${typeof sampleTask[col]} (${sampleTask[col]})`);
                });
            }
        } else {
            console.log('✅ Esquema obtenido:', schemaInfo);
        }

        // Verificar restricciones NOT NULL
        console.log('\n🔧 Verificando restricciones...');
        
        // Intentar insertar con user_id null para ver el error específico
        const testTask = {
            title: 'Test Task',
            description: 'Test description',
            status: 'pending',
            priority: 'medium',
            user_id: null, // Esto debería fallar si hay restricción NOT NULL
            project_id: null,
            created_at: new Date().toISOString()
        };

        const { data: insertResult, error: insertError } = await supabase
            .from('tasks')
            .insert(testTask)
            .select()
            .single();

        if (insertError) {
            console.log('❌ Error de inserción (esperado):', insertError);
            
            // Ahora intentemos con un user_id válido
            console.log('\n🔄 Intentando con user_id válido...');
            
            // Buscar un usuario existente
            const { data: users } = await supabase.auth.admin.listUsers();
            
            if (users.users && users.users.length > 0) {
                const validUserId = users.users[0].id;
                console.log(`👤 Usando user_id: ${validUserId}`);
                
                testTask.user_id = validUserId;
                
                const { data: successInsert, error: successError } = await supabase
                    .from('tasks')
                    .insert(testTask)
                    .select()
                    .single();

                if (successError) {
                    console.log('❌ Error incluso con user_id válido:', successError);
                } else {
                    console.log('✅ Inserción exitosa:', successInsert.title);
                    
                    // Limpiar
                    await supabase
                        .from('tasks')
                        .delete()
                        .eq('id', successInsert.id);
                    console.log('🧹 Tarea de prueba eliminada');
                }
            } else {
                console.log('⚠️ No se encontraron usuarios');
            }
        } else {
            console.log('✅ Inserción exitosa (inesperado):', insertResult);
            // Limpiar
            await supabase
                .from('tasks')
                .delete()
                .eq('id', insertResult.id);
        }

    } catch (error) {
        console.error('💥 Error general:', error);
    }
}

checkTasksSchema();
