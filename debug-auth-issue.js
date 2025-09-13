require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Debes configurar las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    console.log('1. Copia tu URL de Supabase desde el dashboard');
    console.log('2. Copia tu Service Role Key desde el dashboard > Settings > API');
    console.log('3. Ejecuta: NEXT_PUBLIC_SUPABASE_URL=tu-url SUPABASE_SERVICE_ROLE_KEY=tu-key node debug-auth-issue.js');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuthIssues() {
    console.log('🔍 Diagnosticando problemas de autenticación...\n');
    
    try {
        // 1. Verificar configuración básica
        console.log('📊 Configuración actual:');
        console.log('- Supabase URL:', supabaseUrl);
        console.log('- Key tipo:', supabaseKey.startsWith('eyJ') ? 'Service Role Key' : 'Anon Key');
        console.log('');

        // 2. Listar usuarios existentes
        console.log('👥 Usuarios registrados:');
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            console.error('❌ Error listando usuarios:', usersError.message);
            if (usersError.message.includes('JWT')) {
                console.log('💡 Solución: Usa Service Role Key, no Anon Key');
            }
        } else {
            console.log(`📊 Total usuarios: ${users.users.length}`);
            
            // Verificar emails duplicados
            const emails = users.users.map(u => u.email);
            const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
            
            if (duplicateEmails.length > 0) {
                console.log('⚠️  EMAILS DUPLICADOS ENCONTRADOS:');
                duplicateEmails.forEach(email => console.log(`   - ${email}`));
            } else {
                console.log('✅ No hay emails duplicados');
            }
            
            console.log('\n📋 Lista de usuarios:');
            users.users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Confirmado: ${user.email_confirmed_at ? '✅ Sí' : '❌ No'}`);
                console.log(`   Creado: ${new Date(user.created_at).toLocaleString('es-ES')}`);
                console.log(`   Último login: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES') : 'Nunca'}`);
                console.log('');
            });
        }

        // 3. Verificar configuración de Auth
        console.log('🔐 Configuración de Authentication:');
        console.log('Para verificar la configuración de Auth:');
        console.log('1. Ve a tu proyecto Supabase Dashboard');
        console.log('2. Authentication > Settings');
        console.log('3. Verifica estas configuraciones:');
        console.log('   - Enable email confirmations: DEBE estar habilitado');
        console.log('   - Disable new user signups: DEBE estar deshabilitado');
        console.log('   - Enable phone confirmations: Opcional');
        console.log('');

        // 4. Probar registro con email existente
        console.log('🧪 Probando registro con email duplicado...');
        if (users && users.users.length > 0) {
            const existingEmail = users.users[0].email;
            console.log(`Intentando registrar: ${existingEmail}`);
            
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: existingEmail,
                password: 'test123456'
            });
            
            if (signUpError) {
                if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
                    console.log('✅ Correcto: Supabase rechaza emails duplicados');
                } else {
                    console.log('❌ Error inesperado:', signUpError.message);
                }
            } else {
                console.log('⚠️  PROBLEMA: Supabase permitió email duplicado');
                console.log('Datos devueltos:', signUpData);
            }
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

async function suggestSolutions() {
    console.log('\n💡 SOLUCIONES RECOMENDADAS:\n');
    
    console.log('1. PARA EMAILS DUPLICADOS:');
    console.log('   - Ve a Supabase Dashboard > Authentication > Users');
    console.log('   - Elimina manualmente los usuarios duplicados');
    console.log('   - Verifica que la tabla auth.users tenga constraint UNIQUE en email');
    console.log('');
    
    console.log('2. PARA EMAILS DE CONFIRMACIÓN:');
    console.log('   - Ve a Authentication > Settings');
    console.log('   - Habilita "Enable email confirmations"');
    console.log('   - Configura "Confirm email" en la URL de tu app');
    console.log('   - Revisa la configuración SMTP si usas custom');
    console.log('');
    
    console.log('3. CONFIGURACIÓN SMTP (si no llegan emails):');
    console.log('   - Ve a Authentication > Settings > SMTP Settings');
    console.log('   - Configura tu proveedor de email (Gmail, SendGrid, etc.)');
    console.log('   - O usa el SMTP por defecto de Supabase (limitado)');
    console.log('');
    
    console.log('4. VERIFICAR SPAM:');
    console.log('   - Los emails de confirmación pueden ir a spam');
    console.log('   - Revisa carpetas de correo no deseado');
    console.log('   - Whitelist: noreply@mail.supabase.io');
}

// Ejecutar diagnóstico
debugAuthIssues().then(() => {
    suggestSolutions();
}).catch(error => {
    console.error('❌ Error ejecutando diagnóstico:', error);
});