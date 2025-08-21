// Script para crear datos de prueba desde la consola del navegador
// Ejecutar en DevTools (F12) -> Consola

async function createSampleData() {
    console.log('🔧 Creando datos de prueba para automatizaciones...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('❌ No hay usuario autenticado');
        return;
    }

    console.log('👤 Usuario:', user.id);

    try {
        // 1. CREAR CLIENTES (solo columnas básicas)
        console.log('👥 Creando clientes de prueba...');
        const clientsData = [
            {
                user_id: user.id,
                name: 'María García',
                email: 'maria.garcia@empresa.com',
                phone: '+34 666 111 222',
                company: 'García Consulting',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: user.id,
                name: 'Carlos López',
                email: 'carlos.lopez@startup.io',
                phone: '+34 677 333 444',
                company: 'StartupTech SL',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: user.id,
                name: 'Ana Martínez',
                email: 'ana.martinez@corp.com',
                phone: '+34 688 555 666',
                company: 'Corporate Solutions',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                user_id: user.id,
                name: 'Pedro Sánchez',
                email: 'pedro.sanchez@pyme.es',
                phone: '+34 699 777 888',
                company: 'PYME Digital',
                created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        let clients, projects, invoices;

        const { data: clientsData2, error: clientError } = await supabase
            .from('clients')
            .insert(clientsData)
            .select();

        if (clientError) {
            console.error('❌ Error creando clientes:', clientError);
            // Intentar obtener clientes existentes si hay error
            const { data: existingClients } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', user.id)
                .limit(4);
            if (existingClients && existingClients.length > 0) {
                console.log('✅ Usando clientes existentes:', existingClients.length);
                clients = existingClients;
            }
        } else {
            console.log('✅ Clientes creados:', clientsData2?.length || 0);
            clients = clientsData2;
        }

        // 2. CREAR PROYECTOS (columnas básicas)
        if (clients && clients.length > 0) {
            console.log('📋 Creando proyectos de prueba...');
            const projectsData = [
                {
                    user_id: user.id,
                    client_id: clients[0].id,
                    name: 'Rediseño Web Corporativo',
                    description: 'Renovación completa del sitio web corporativo',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    client_id: clients[1].id,
                    name: 'App Móvil Startup',
                    description: 'Desarrollo de aplicación móvil MVP',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    user_id: user.id,
                    client_id: clients[2].id,
                    name: 'Sistema CRM Custom',
                    description: 'Desarrollo de sistema CRM personalizado',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];

            const { data: projectsData2, error: projectError } = await supabase
                .from('projects')
                .insert(projectsData)
                .select();

            if (projectError) {
                console.error('❌ Error creando proyectos:', projectError);
                // Intentar obtener proyectos existentes si hay error
                const { data: existingProjects } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('user_id', user.id)
                    .limit(3);
                if (existingProjects && existingProjects.length > 0) {
                    console.log('✅ Usando proyectos existentes:', existingProjects.length);
                    projects = existingProjects;
                }
            } else {
                console.log('✅ Proyectos creados:', projectsData2?.length || 0);
                projects = projectsData2;
            }

            // 3. CREAR FACTURAS (columnas básicas)
            if (projects && projects.length > 0) {
                console.log('💰 Creando facturas de prueba...');
                const invoicesData = [
                    {
                        user_id: user.id,
                        client_id: clients[0].id,
                        invoice_number: 'INV-2024-001',
                        amount: 5000,
                        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    {
                        user_id: user.id,
                        client_id: clients[1].id,
                        invoice_number: 'INV-2024-002',
                        amount: 8500,
                        due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    {
                        user_id: user.id,
                        client_id: clients[2].id,
                        invoice_number: 'INV-2024-003',
                        amount: 12000,
                        due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ];

                const { data: invoicesData2, error: invoiceError } = await supabase
                    .from('invoices')
                    .insert(invoicesData)
                    .select();

                if (invoiceError) {
                    console.error('❌ Error creando facturas:', invoiceError);
                    // Intentar obtener facturas existentes si hay error
                    const { data: existingInvoices } = await supabase
                        .from('invoices')
                        .select('*')
                        .eq('user_id', user.id)
                        .limit(3);
                    if (existingInvoices && existingInvoices.length > 0) {
                        console.log('✅ Usando facturas existentes:', existingInvoices.length);
                        invoices = existingInvoices;
                    }
                } else {
                    console.log('✅ Facturas creadas:', invoicesData2?.length || 0);
                    invoices = invoicesData2;
                }
            }
        }

        console.log('🎉 ¡Datos de prueba creados exitosamente!');
        console.log('📊 Resumen:');
        console.log(`   👥 Clientes: ${clients?.length || 0}`);
        console.log(`   📋 Proyectos: ${projects?.length || 0}`);
        console.log(`   💰 Facturas: ${invoices?.length || 0}`);
        console.log('');
        console.log('🔄 Ahora puedes ejecutar las automatizaciones con datos reales');
        console.log('💡 Ve a la página de automatizaciones y prueba el botón "Ejecutar"');

        return '✅ Datos de prueba creados exitosamente';

    } catch (error) {
        console.error('❌ Error creando datos de prueba:', error);
        return 'Error creando datos de prueba';
    }
}

// Ejecutar la función
createSampleData();
