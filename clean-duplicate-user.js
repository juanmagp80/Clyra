require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDuplicateUser() {
    console.log('🧹 Limpiando usuario duplicado...\n');
    
    try {
        // ID del usuario duplicado creado durante la prueba
        const duplicateUserId = '377726a4-4cd3-4794-a045-707715662d9c';
        const duplicateEmail = 'refugestion@gmail.com';
        
        console.log(`🎯 Eliminando usuario duplicado:`);
        console.log(`   - ID: ${duplicateUserId}`);
        console.log(`   - Email: ${duplicateEmail}`);
        console.log(`   - Creado: Durante la prueba de diagnóstico`);
        
        // Eliminar usuario duplicado
        const { data, error } = await supabase.auth.admin.deleteUser(duplicateUserId);
        
        if (error) {
            console.error('❌ Error eliminando usuario:', error.message);
            return;
        }
        
        console.log('✅ Usuario duplicado eliminado correctamente');
        
        // Verificar que ya no existe
        console.log('\n🔍 Verificando eliminación...');
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.error('❌ Error verificando usuarios:', listError.message);
            return;
        }
        
        const stillExists = users.users.find(u => u.id === duplicateUserId);
        
        if (stillExists) {
            console.log('⚠️  El usuario aún existe, puede necesitar más tiempo');
        } else {
            console.log('✅ Confirmado: Usuario duplicado eliminado');
        }
        
        // Mostrar usuarios restantes con ese email
        const usersWithEmail = users.users.filter(u => u.email === duplicateEmail);
        console.log(`\n📊 Usuarios restantes con email ${duplicateEmail}: ${usersWithEmail.length}`);
        
        usersWithEmail.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}`);
            console.log(`   Creado: ${new Date(user.created_at).toLocaleString('es-ES')}`);
            console.log(`   Confirmado: ${user.email_confirmed_at ? '✅ Sí' : '❌ No'}`);
        });
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

async function checkUniqueConstraint() {
    console.log('\n🔍 Verificando constraint UNIQUE en auth.users...');
    
    try {
        const { data, error } = await supabase
            .from('information_schema.table_constraints')
            .select('constraint_name, constraint_type')
            .eq('table_name', 'users')
            .eq('table_schema', 'auth');
            
        if (error) {
            console.log('❌ No se pudo verificar constraints (normal en algunos casos)');
            console.log('💡 Verifica manualmente en el Dashboard de Supabase');
        } else {
            console.log('📊 Constraints encontrados:', data);
        }
        
    } catch (error) {
        console.log('ℹ️  No se pudo verificar constraints automáticamente');
        console.log('💡 Verifica manualmente en SQL Editor de Supabase:');
        console.log('   SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = \'users\' AND table_schema = \'auth\';');
    }
}

// Ejecutar limpieza
cleanDuplicateUser()
    .then(() => checkUniqueConstraint())
    .then(() => {
        console.log('\n🎯 PRÓXIMOS PASOS:');
        console.log('1. Ve a Supabase Dashboard > Authentication > Settings');
        console.log('2. Verifica que "Enable email confirmations" esté habilitado');  
        console.log('3. Configura SMTP si los emails no llegan');
        console.log('4. Prueba registro con email nuevo');
        console.log('5. Prueba registro con email existente (debe fallar)');
    })
    .catch(error => {
        console.error('❌ Error ejecutando limpieza:', error);
    });