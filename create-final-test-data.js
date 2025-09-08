const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createFinalTestData() {
    console.log('🎯 Creando datos de prueba para automatizaciones de IA...');
    
    try {
        // 1. Obtener usuario
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError || !users.length) {
            throw new Error('No se encontró usuario');
        }
        
        const userId = users[0].id;
        console.log('✅ Usuario:', userId);

        // 2. Cliente completo con el esquema correcto
        console.log('📝 Creando cliente...');
        const { data: existingClient } = await supabase
            .from('clients')
            .select('*')
            .eq('email', 'maria.gonzalez@techsolutions.com')
            .single();
            
        let client;
        if (existingClient) {
            client = existingClient;
            console.log('✅ Cliente existente:', client.name);
        } else {
            const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({
                    user_id: userId,
                    name: 'María González García',
                    email: 'maria.gonzalez@techsolutions.com',
                    phone: '+34 666 777 888',
                    company: 'TechSolutions Madrid S.L.',
                    address: 'Calle Gran Vía 45, 3º B',
                    nif: 'B87654321',
                    city: 'Madrid',
                    province: 'Madrid',
                    tag: 'premium'
                })
                .select()
                .single();
                
            if (clientError) throw new Error('Error creando cliente: ' + clientError.message);
            client = newClient;
            console.log('✅ Cliente creado:', client.name);
        }

        // 3. Proyecto
        console.log('📝 Creando proyecto...');
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                client_id: client.id,
                name: 'Plataforma E-commerce Completa con IA',
                description: 'Desarrollo de una plataforma de comercio electrónico completa con funcionalidades de IA para recomendaciones personalizadas, chatbot de atención al cliente, análisis predictivo de ventas y sistema de gestión de inventario automatizado. Proyecto crítico con timeline ajustado para Black Friday.',
                status: 'in_progress',
                budget: 45000,
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

        if (projectError) throw new Error('Error creando proyecto: ' + projectError.message);
        console.log('✅ Proyecto creado:', project.name);

                // 4. Propuesta con estructura JSONB correcta
        console.log('📝 Creando propuesta...');
        const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .insert({
                user_id: userId,
                client_id: client.id,
                title: 'Expansión Sistema E-commerce: Módulo B2B y Analytics Avanzados',
                description: `Propuesta para la segunda fase del proyecto de e-commerce, incluyendo módulo B2B empresarial, analytics e inteligencia de negocio, y optimizaciones adicionales como PWA, SEO avanzado, sistema de reviews y chatbot con IA conversacional.`,
                services: [
                    {
                        id: 1,
                        name: "Módulo B2B Empresarial",
                        description: "Portal dedicado para clientes corporativos con sistema de cotizaciones automáticas y gestión de descuentos por volumen",
                        quantity: 1,
                        unit_price: 12000,
                        total: 12000
                    },
                    {
                        id: 2,
                        name: "Analytics e Inteligencia de Negocio",
                        description: "Dashboard ejecutivo con KPIs en tiempo real, análisis predictivo de demanda y reportes de rentabilidad",
                        quantity: 1,
                        unit_price: 8500,
                        total: 8500
                    },
                    {
                        id: 3,
                        name: "Optimizaciones Adicionales",
                        description: "PWA, SEO técnico avanzado, sistema de reviews con IA y chatbot conversacional",
                        quantity: 1,
                        unit_price: 8000,
                        total: 8000
                    }
                ],
                pricing: {
                    subtotal: 28500,
                    tax_rate: 21,
                    tax_amount: 5985,
                    total: 34485,
                    currency: "EUR",
                    payment_terms: "40% al inicio, 40% a mitad de proyecto, 20% al finalizar"
                },
                terms: {
                    delivery_time: "3 meses",
                    warranty: "12 meses de soporte técnico",
                    training: "20 horas de formación incluidas",
                    revisions: "3 revisiones por módulo incluidas",
                    additional_work: "Cambios adicionales a 85€/hora"
                },
                timeline: {
                    phases: [
                        {
                            name: "Fase 1: Módulo B2B",
                            duration: "4 semanas",
                            deliverables: ["Portal corporativo", "Sistema cotizaciones", "Gestión descuentos"]
                        },
                        {
                            name: "Fase 2: Analytics",
                            duration: "4 semanas", 
                            deliverables: ["Dashboard ejecutivo", "Análisis predictivo", "Reportes automáticos"]
                        },
                        {
                            name: "Fase 3: Optimizaciones",
                            duration: "4 semanas",
                            deliverables: ["PWA", "SEO avanzado", "Sistema reviews", "Chatbot IA"]
                        }
                    ]
                },
                status: 'pending',
                total_amount: 34485,
                currency: 'EUR',
                valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: 'Cliente muy interesado pero necesita aprobación del CFO. Competencia directa con otra empresa (presupuesto 32k). Puntos fuertes: experiencia previa exitosa, equipo especializado.'
            })
            .select()
            .single();

        if (proposalError) throw new Error('Error creando propuesta: ' + proposalError.message);
        console.log('✅ Propuesta creada:', proposal.title);

        // 5. Conversación básica pero efectiva
        console.log('📝 Creando conversación...');
        const messagesData = [
            {
                user_id: userId,
                client_id: client.id,
                message: 'Buenos días María, te escribo para hacer seguimiento del proyecto de e-commerce. Hemos completado el 35% según lo planificado.',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true
            },
            {
                user_id: userId,
                client_id: client.id,
                message: '¿Qué tal va todo? Espero que no haya problemas graves...',
                sender: 'client',
                message_type: 'text',
                is_read: true
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'No son problemas graves, pero la integración con TensorFlow necesita 1 semana adicional. También tengo una optimización que reduciría los tiempos de carga en un 40%.',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Me preocupa el tema de la semana adicional... Tenemos fecha límite ajustada para Black Friday. ¿Esa semana afectaría al cronograma general?',
                sender: 'client',
                message_type: 'text',
                is_read: true
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Tranquila, la semana adicional NO afecta el lanzamiento. Podemos paralelizar tareas y mantener el objetivo de Black Friday.',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true
            },
            {
                user_id: userId,
                client_id: client.id,
                message: '¿Sería posible añadir un sistema de reviews con IA? También, el CFO pregunta si hay descuento por volumen de trabajo...',
                sender: 'client',
                message_type: 'text',
                is_read: true
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Sistema de reviews con IA: 12 horas (1.020€). Descuento: 5% en facturación restante + 10% garantizado en propuesta B2B. ¿Te parece justo?',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true
            },
            {
                user_id: userId,
                client_id: client.id,
                message: '¡Perfecto! Me parece muy razonable. El sistema de reviews con IA nos interesa mucho. El CFO está de acuerdo. ¡Gracias por la gestión tan profesional! 💪',
                sender: 'client',
                message_type: 'text',
                is_read: false
            }
        ];

        const { data: messages, error: messagesError } = await supabase
            .from('freelancer_messages')
            .insert(messagesData)
            .select();

        if (messagesError) throw new Error('Error creando mensajes: ' + messagesError.message);
        console.log('✅ Conversación creada:', messages.length, 'mensajes');

        // Resumen final
        console.log('\n🎉 ¡DATOS DE PRUEBA COMPLETOS CREADOS EXITOSAMENTE!');
        console.log('');
        console.log('📊 RESUMEN DE DATOS:');
        console.log(`   👤 Cliente: ${client.name} (${client.email})`);
        console.log(`   🏗️  Proyecto: ${project.name}`);
        console.log(`   📋 Propuesta: ${proposal.title} (€${proposal.total_amount})`);
        console.log(`   💬 Conversación: ${messages.length} mensajes intercambiados`);
        console.log('');
        console.log('🎯 TODAS LAS AUTOMATIZACIONES ESTÁN LISTAS PARA PROBAR:');
        console.log('');
        console.log('   ⚠️  **DETECTOR DE RIESGOS DE PROYECTO**');
        console.log('       → Seleccionar cliente: "María González García"');
        console.log('       → Seleccionar proyecto: "Plataforma E-commerce Completa con IA"');
        console.log('       → IA analizará: budget, timeline, complejidad técnica, riesgos');
        console.log('');
        console.log('   📊 **ANALIZADOR DE PROPUESTAS**');
        console.log('       → Seleccionar cliente: "María González García"');
        console.log('       → Seleccionar propuesta: "Expansión Sistema E-commerce"');
        console.log('       → IA analizará: viabilidad, pricing, fortalezas, debilidades');
        console.log('');
        console.log('   🧠 **ANÁLISIS DE CONVERSACIÓN**');
        console.log('       → Seleccionar cliente: "María González García"');
        console.log('       → IA analizará: sentiment, tono, satisfacción, issues');
        console.log('');
        console.log('   🎭 **ANÁLISIS DE SENTIMIENTO**');
        console.log('       → Copiar último mensaje del cliente (muy positivo):');
        console.log('       → "¡Sigamos así! 💪" para analizar sentiment');
        console.log('');
        console.log('   💬 **OPTIMIZACIÓN DE COMUNICACIÓN**');
        console.log('       → Escribir mensaje de respuesta al cliente');
        console.log('       → IA optimizará tono y profesionalidad');
        console.log('');
        console.log('🚀 **¡Ve a http://localhost:3000/dashboard/ai-automations para probar!**');
        console.log('');
        console.log('✨ **DATOS INCLUYEN:**');
        console.log('   • Proyecto complejo con presupuesto de 45.000€');
        console.log('   • Conversación realista con negociación exitosa');
        console.log('   • Propuesta detallada de 34.485€ con módulos específicos');
        console.log('   • Cliente satisfecho pero con presión temporal');
        console.log('   • Timeline ajustado (ideal para detectar riesgos)');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createFinalTestData();
