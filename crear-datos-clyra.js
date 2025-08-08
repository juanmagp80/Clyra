// *** SCRIPT ESPECÍFICO PARA TU PROYECTO ***
// Ejecutar en la consola del navegador (F12) desde tu aplicación

async function crearDatosPrueba() {
    console.log('🚀 Creando datos de prueba con tu cliente Supabase...');
    
    try {
        // Tu aplicación usa src/lib/supabase.ts con export { supabase }
        // Buscar en el módulo importado o variables globales
        let supabaseClient = null;
        
        // Método 1: Buscar en window
        if (window.supabase) {
            supabaseClient = window.supabase;
            console.log('✅ Cliente encontrado en window.supabase');
        }
        
        // Método 2: Buscar en React DevTools props/state
        else if (window.React) {
            console.log('🔍 Buscando en componentes React...');
            // Buscar componentes que puedan tener el cliente
            const rootElement = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
            if (rootElement && rootElement._reactInternalFiber) {
                console.log('📦 React Fiber encontrado');
            }
        }
        
        // Método 3: Interceptar requests para encontrar la configuración
        else {
            console.log('🔍 Analizando requests de red para encontrar Supabase...');
            
            // Buscar en Performance API por requests de Supabase
            const entries = performance.getEntriesByType('resource');
            const supabaseRequests = entries.filter(entry => 
                entry.name.includes('supabase.co') || 
                entry.name.includes('supabase')
            );
            
            if (supabaseRequests.length > 0) {
                const url = supabaseRequests[0].name;
                const baseUrl = url.split('/rest/')[0];
                console.log('🎯 URL de Supabase detectada:', baseUrl);
            }
        }
        
        // Método 4: Crear cliente usando las variables de entorno que están en tu código
        if (!supabaseClient) {
            console.log('🔧 Intentando crear cliente con configuración detectada...');
            
            // Buscar las variables en el DOM o scripts
            const scripts = document.getElementsByTagName('script');
            let envVars = {};
            
            for (let script of scripts) {
                const content = script.innerHTML;
                if (content.includes('NEXT_PUBLIC_SUPABASE_URL')) {
                    console.log('📄 Configuración Next.js detectada');
                    
                    // Intentar extraer las variables
                    const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL['"]\s*:\s*['"]([^'"]+)['"]/);
                    const keyMatch = content.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY['"]\s*:\s*['"]([^'"]+)['"]/);
                    
                    if (urlMatch && keyMatch) {
                        envVars.url = urlMatch[1];
                        envVars.key = keyMatch[1];
                        break;
                    }
                }
            }
            
            // Si tenemos las variables, crear el cliente
            if (envVars.url && envVars.key) {
                console.log('🔑 Variables encontradas, creando cliente...');
                
                // Cargar Supabase desde CDN si no está disponible
                if (!window.supabase) {
                    await loadSupabaseFromCDN();
                }
                
                supabaseClient = window.supabase.createClient(envVars.url, envVars.key);
            }
        }
        
        // Si aún no tenemos cliente, pedir ayuda al usuario
        if (!supabaseClient) {
            console.log('❌ No se pudo detectar automáticamente el cliente Supabase');
            console.log('');
            console.log('💡 SOLUCIONES:');
            console.log('1. Asegúrate de estar en una página de tu app donde Supabase esté cargado');
            console.log('2. Si ves requests de Supabase en Network tab, puedes usar:');
            console.log('   crearDatosConURL("https://tu-proyecto.supabase.co", "tu-anon-key")');
            console.log('');
            console.log('🔍 Debug info:');
            console.log('- window.supabase:', !!window.supabase);
            console.log('- window.React:', !!window.React);
            console.log('- Requests Supabase:', performance.getEntriesByType('resource').filter(e => e.name.includes('supabase')).length);
            
            // Crear función helper
            window.crearDatosConURL = async (url, key) => {
                console.log('🔧 Creando cliente con URL proporcionada...');
                await loadSupabaseFromCDN();
                const client = window.supabase.createClient(url, key);
                return ejecutarCreacionDatos(client);
            };
            
            return;
        }
        
        return ejecutarCreacionDatos(supabaseClient);
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.log('🔧 Intenta refrescar la página y ejecutar el script de nuevo');
    }
}

async function loadSupabaseFromCDN() {
    if (window.supabase) return;
    
    console.log('📦 Cargando Supabase desde CDN...');
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
        script.onload = () => {
            console.log('✅ Supabase cargado desde CDN');
            resolve();
        };
    });
}

async function ejecutarCreacionDatos(supabaseClient) {
    console.log('✅ Cliente Supabase listo, obteniendo usuario...');
    
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError) {
            console.error('❌ Error obteniendo usuario:', userError);
            return;
        }
        
        if (!user) {
            console.error('❌ Usuario no autenticado');
            console.log('💡 Asegúrate de estar logueado en la aplicación');
            return;
        }
        
        console.log('👤 Usuario autenticado:', user.id);
        console.log('📧 Email:', user.email);
        
        // 1. CREAR CLIENTES (con manejo de errores de columnas)
        console.log('👥 Creando clientes de prueba...');
        
        const clientsData = [
            {
                user_id: user.id,
                name: 'María García',
                email: 'maria.garcia@test.com'
            },
            {
                user_id: user.id,
                name: 'Carlos López',
                email: 'carlos.lopez@test.com'
            },
            {
                user_id: user.id,
                name: 'Ana Martínez',
                email: 'ana.martinez@test.com'
            },
            {
                user_id: user.id,
                name: 'Pedro Sánchez',
                email: 'pedro.sanchez@test.com'
            }
        ];
        
        const { data: clients, error: clientsError } = await supabaseClient
            .from('clients')
            .insert(clientsData)
            .select();
        
        if (clientsError) {
            console.error('❌ Error creando clientes:', clientsError);
            
            // Si es error de columnas, intentar con menos campos
            if (clientsError.code === '42703') {
                console.log('🔄 Intentando con campos básicos...');
                const simpleData = clientsData.map(c => ({ user_id: c.user_id, name: c.name, email: c.email }));
                const { data: simpleClients, error: simpleError } = await supabaseClient
                    .from('clients')
                    .insert(simpleData)
                    .select();
                
                if (!simpleError) {
                    console.log('✅ Clientes creados (versión básica):', simpleClients.length);
                    clients = simpleClients;
                }
            }
        } else {
            console.log('✅ Clientes creados:', clients.length);
        }
        
        // 2. CREAR PROYECTOS (si tenemos clientes)
        if (clients && clients.length > 0) {
            console.log('📋 Creando proyectos...');
            
            const projectsData = [
                {
                    user_id: user.id,
                    client_id: clients[0].id,
                    name: 'Rediseño Web Corporativo',
                    description: 'Renovación completa del sitio web'
                },
                {
                    user_id: user.id,
                    client_id: clients[1].id,
                    name: 'App Móvil MVP',
                    description: 'Desarrollo de aplicación móvil'
                }
            ];
            
            const { data: projects, error: projectsError } = await supabaseClient
                .from('projects')
                .insert(projectsData)
                .select();
            
            if (projectsError) {
                console.error('❌ Error creando proyectos:', projectsError);
            } else {
                console.log('✅ Proyectos creados:', projects.length);
                
                // 3. CREAR FACTURAS
                console.log('💰 Creando facturas...');
                
                const invoicesData = [
                    {
                        user_id: user.id,
                        client_id: clients[0].id,
                        invoice_number: 'INV-TEST-001',
                        amount: 5000,
                        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        user_id: user.id,
                        client_id: clients[1].id,
                        invoice_number: 'INV-TEST-002',
                        amount: 8500,
                        due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ];
                
                const { data: invoices, error: invoicesError } = await supabaseClient
                    .from('invoices')
                    .insert(invoicesData)
                    .select();
                
                if (invoicesError) {
                    console.error('❌ Error creando facturas:', invoicesError);
                } else {
                    console.log('✅ Facturas creadas:', invoices.length);
                }
            }
        }
        
        console.log('');
        console.log('🎉 ¡PROCESO COMPLETADO!');
        console.log('📊 Datos de prueba listos para las automatizaciones');
        console.log('💡 Ve a /dashboard/automations y prueba el botón "Ejecutar"');
        console.log('🔍 Verás logs detallados de la ejecución en la consola');
        
    } catch (error) {
        console.error('❌ Error ejecutando creación de datos:', error);
    }
}

// Ejecutar automáticamente
console.log('🛠️ Script para tu proyecto Clyra cargado');
console.log('🔍 Detectando configuración de Supabase...');
crearDatosPrueba();
