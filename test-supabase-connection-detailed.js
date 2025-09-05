const { createClient } = require('@supabase/supabase-js');

// Configuración
const supabaseUrl = 'https://joyhaxtpmrmndmifsihn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODA5NzUsImV4cCI6MjA2OTU1Njk3NX0.77Si27sIxzCtJqmw3Z81dJDejKcgaX9pm8eZMldPr4I';

console.log('🔍 Diagnóstico detallado de conexión a Supabase...\n');

// Test 1: Conectividad básica con fetch
console.log('1. Test de conectividad básica con fetch...');
fetch(supabaseUrl + '/rest/v1/', {
    headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
    }
})
.then(response => {
    console.log('✅ Conectividad básica: OK');
    console.log('   Status:', response.status);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    return response.text();
})
.then(data => {
    console.log('   Response preview:', data.substring(0, 200) + '...');
})
.catch(error => {
    console.log('❌ Error en conectividad básica:', error.message);
    console.log('   Causa:', error.cause?.message || 'Sin causa específica');
});

// Test 2: Cliente Supabase
console.log('\n2. Test del cliente Supabase...');
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false
    }
});

// Test 3: Consulta simple
setTimeout(() => {
    console.log('\n3. Test de consulta simple...');
    supabase
        .from('users')
        .select('count')
        .limit(1)
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ Error en consulta:', error.message);
                console.log('   Detalles:', error);
            } else {
                console.log('✅ Consulta exitosa:', data);
            }
        })
        .catch(error => {
            console.log('❌ Error de conexión en consulta:', error.message);
        });
}, 2000);

// Test 4: Auth status
setTimeout(() => {
    console.log('\n4. Test de estado de autenticación...');
    supabase.auth.getSession()
        .then(({ data, error }) => {
            if (error) {
                console.log('❌ Error en auth:', error.message);
            } else {
                console.log('✅ Auth status:', data.session ? 'Sesión activa' : 'Sin sesión');
            }
        });
}, 3000);

// Test 5: Conectividad a diferentes endpoints
setTimeout(() => {
    console.log('\n5. Test de endpoints específicos...');
    
    const endpoints = [
        '/rest/v1/',
        '/auth/v1/health',
        '/rest/v1/users?select=count&limit=1'
    ];
    
    endpoints.forEach((endpoint, index) => {
        setTimeout(() => {
            console.log(`   Testing endpoint ${index + 1}/3: ${endpoint}`);
            fetch(supabaseUrl + endpoint, {
                headers: {
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log(`   ✅ ${endpoint}: ${response.status} ${response.statusText}`);
            })
            .catch(error => {
                console.log(`   ❌ ${endpoint}: ${error.message}`);
            });
        }, index * 500);
    });
}, 4000);

console.log('\n💡 Esperando resultados...');
