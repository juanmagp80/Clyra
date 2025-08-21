// *** VERSIÓN ALTERNATIVA: BUSCAR EN REACT DEVTOOLS ***
// Ejecutar en la consola del navegador (F12)

async function crearDatosConReact() {
    console.log('🔍 Buscando cliente Supabase en componentes React...');

    try {
        // Buscar en React DevTools
        let supabaseClient = null;

        // Método 1: Buscar en el DOM por elementos React
        const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]') || document.body;

        // Método 2: Buscar en React Fiber
        if (reactRoot._reactInternalFiber || reactRoot._reactInternals) {
            console.log('🔍 React Fiber encontrado, buscando Supabase...');
        }

        // Método 3: Interceptar calls de fetch para obtener la URL de Supabase
        const originalFetch = window.fetch;
        let supabaseUrl = null;
        let supabaseKey = null;

        // Buscar en localStorage/sessionStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            if (key && (key.includes('supabase') || value.includes('supabase'))) {
                console.log(`🔑 Encontrado en localStorage: ${key} = ${value}`);
            }
        }

        // Método 4: Crear cliente desde variables de entorno visibles
        if (window.location.hostname.includes('localhost') || window.location.hostname.includes('vercel')) {
            // Intentar obtener de variables públicas
            const scripts = Array.from(document.getElementsByTagName('script'));
            for (const script of scripts) {
                if (script.innerHTML.includes('NEXT_PUBLIC_SUPABASE')) {
                    console.log('📄 Script con configuración Supabase encontrado');
                    break;
                }
            }
        }

        // Si no encontramos nada, pedir al usuario que proporcione los datos
        if (!supabaseClient) {
            console.log('❌ No se pudo detectar automáticamente el cliente Supabase');
            console.log('');
            console.log('💡 OPCIONES:');
            console.log('1. Ejecuta desde una página donde ya tengas Supabase cargado');
            console.log('2. Proporciona manualmente el cliente:');
            console.log('   crearDatosManual(tuClienteSupabase)');
            console.log('3. O proporciona URL y clave:');
            console.log('   crearDatosConCredenciales("tu-url", "tu-key")');

            // Crear funciones helper
            window.crearDatosConCredenciales = async (url, key) => {
                console.log('🔧 Creando cliente Supabase con credenciales...');

                // Importar Supabase desde CDN si no está disponible
                if (!window.supabase) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
                    document.head.appendChild(script);

                    await new Promise(resolve => {
                        script.onload = resolve;
                    });
                }

                const client = supabase.createClient(url, key);
                return crearDatosConCliente(client);
            };

            return;
        }

        return crearDatosConCliente(supabaseClient);

    } catch (error) {
        console.error('❌ Error buscando Supabase:', error);
    }
}

async function crearDatosConCliente(client) {
    console.log('✅ Cliente Supabase disponible, creando datos...');

    try {
        const { data: { user } } = await client.auth.getUser();
        if (!user) {
            console.error('❌ Usuario no autenticado');
            return;
        }

        console.log('👤 Usuario:', user.id);

        // Crear datos básicos
        const clientsData = [
            { user_id: user.id, name: 'María García', email: 'maria@test.com' },
            { user_id: user.id, name: 'Carlos López', email: 'carlos@test.com' },
            { user_id: user.id, name: 'Ana Martínez', email: 'ana@test.com' }
        ];

        const { data: clients, error } = await client
            .from('clients')
            .insert(clientsData)
            .select();

        if (error) {
            console.error('❌ Error:', error);
        } else {
            console.log('✅ Clientes creados:', clients.length);
            console.log('🎉 ¡Datos listos para probar automatizaciones!');
        }

    } catch (error) {
        console.error('❌ Error creando datos:', error);
    }
}

// Ejecutar
crearDatosConReact();
