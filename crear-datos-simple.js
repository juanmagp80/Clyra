// *** SCRIPT SIMPLE PARA CREAR DATOS DE PRUEBA ***
// Ejecutar en la consola del navegador (F12) desde tu aplicación

// Función para encontrar el cliente Supabase
function getSupabaseClient() {
    // Intentar diferentes formas de acceder a Supabase
    if (typeof supabase !== 'undefined') return supabase;
    if (window.supabase) return window.supabase;
    if (window.__NEXT_DATA__ && window.__NEXT_DATA__.supabase) return window.__NEXT_DATA__.supabase;

    // Buscar en variables globales
    for (let key in window) {
        if (key.toLowerCase().includes('supabase') && window[key] && typeof window[key].from === 'function') {
            return window[key];
        }
    }

    return null;
}

// Función simple y directa
async function crearDatosPrueba() {
    console.log('🚀 Creando datos de prueba...');

    try {
        // Buscar cliente Supabase
        const supabaseClient = getSupabaseClient();

        if (!supabaseClient) {
            console.error('❌ No se pudo encontrar el cliente Supabase');
            console.log('💡 Intenta ejecutar este script desde una página donde Supabase esté cargado');
            console.log('📋 Variables disponibles:', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
            return;
        }

        console.log('✅ Cliente Supabase encontrado');

        // Obtener usuario autenticado
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            console.error('❌ Usuario no autenticado');
            console.log('💡 Asegúrate de estar logueado en la aplicación');
            return;
        }

        console.log('👤 Usuario ID:', user.id);

        // 1. CREAR CLIENTES
        console.log('👥 Creando clientes...');
        const clientsResult = await supabaseClient
            .from('clients')
            .insert([
                {
                    user_id: user.id,
                    name: 'María García',
                    email: 'maria.garcia@empresa.com',
                    phone: '+34 666 111 222',
                    company: 'García Consulting'
                },
                {
                    user_id: user.id,
                    name: 'Carlos López',
                    email: 'carlos.lopez@startup.io',
                    phone: '+34 677 333 444',
                    company: 'StartupTech SL'
                },
                {
                    user_id: user.id,
                    name: 'Ana Martínez',
                    email: 'ana.martinez@corp.com',
                    phone: '+34 688 555 666',
                    company: 'Corporate Solutions'
                }
            ])
            .select();

        if (clientsResult.error) {
            console.error('❌ Error clientes:', clientsResult.error);
            if (clientsResult.error.code === '42703') {
                console.log('💡 Algunas columnas no existen. Probando con columnas básicas...');
                // Intentar con menos columnas
                const simpleClientsResult = await supabaseClient
                    .from('clients')
                    .insert([
                        { user_id: user.id, name: 'María García', email: 'maria.garcia@empresa.com' },
                        { user_id: user.id, name: 'Carlos López', email: 'carlos.lopez@startup.io' },
                        { user_id: user.id, name: 'Ana Martínez', email: 'ana.martinez@corp.com' }
                    ])
                    .select();
                if (!simpleClientsResult.error) {
                    console.log('✅ Clientes creados (versión simple):', simpleClientsResult.data.length);
                    clientsResult.data = simpleClientsResult.data;
                }
            }
        } else {
            console.log('✅ Clientes creados:', clientsResult.data.length);
        }

        // 2. CREAR PROYECTOS
        if (clientsResult.data && clientsResult.data.length > 0) {
            console.log('📋 Creando proyectos...');
            const projectsResult = await supabaseClient
                .from('projects')
                .insert([
                    {
                        user_id: user.id,
                        client_id: clientsResult.data[0].id,
                        name: 'Rediseño Web',
                        description: 'Renovación del sitio web corporativo'
                    },
                    {
                        user_id: user.id,
                        client_id: clientsResult.data[1].id,
                        name: 'App Móvil',
                        description: 'Desarrollo de aplicación móvil'
                    }
                ])
                .select();

            if (projectsResult.error) {
                console.error('❌ Error proyectos:', projectsResult.error);
            } else {
                console.log('✅ Proyectos creados:', projectsResult.data.length);
            }

            // 3. CREAR FACTURAS
            console.log('💰 Creando facturas...');
            const invoicesResult = await supabaseClient
                .from('invoices')
                .insert([
                    {
                        user_id: user.id,
                        client_id: clientsResult.data[0].id,
                        invoice_number: 'INV-001',
                        amount: 5000,
                        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        user_id: user.id,
                        client_id: clientsResult.data[1].id,
                        invoice_number: 'INV-002',
                        amount: 8500,
                        due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ])
                .select();

            if (invoicesResult.error) {
                console.error('❌ Error facturas:', invoicesResult.error);
            } else {
                console.log('✅ Facturas creadas:', invoicesResult.data.length);
            }
        }

        console.log('');
        console.log('🎉 ¡DATOS DE PRUEBA CREADOS!');
        console.log('📊 Ahora puedes probar las automatizaciones');
        console.log('💡 Ve a /dashboard/automations y prueba el botón "Ejecutar"');

    } catch (error) {
        console.error('❌ Error:', error);
        console.log('🔍 Debug info:');
        console.log('- URL actual:', window.location.href);
        console.log('- Variables window que contienen "supabase":', Object.keys(window).filter(k => k.toLowerCase().includes('supabase')));
    }
}

// También crear una versión manual
window.crearDatosManual = function (supabaseClient) {
    if (!supabaseClient) {
        console.log('❌ Debes proporcionar el cliente Supabase');
        console.log('💡 Ejemplo: crearDatosManual(tuClienteSupabase)');
        return;
    }

    // Usar el cliente proporcionado manualmente
    const originalGetSupabaseClient = getSupabaseClient;
    getSupabaseClient = () => supabaseClient;
    crearDatosPrueba().finally(() => {
        getSupabaseClient = originalGetSupabaseClient;
    });
};

console.log('🛠️ Script cargado. Intentando crear datos automáticamente...');
console.log('📝 Si falla, también puedes usar: crearDatosManual(tuClienteSupabase)');

// Ejecutar automáticamente
crearDatosPrueba();
