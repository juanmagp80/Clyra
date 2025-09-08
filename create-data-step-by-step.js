const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDataByTable() {
    console.log('🎯 Creando datos de prueba tabla por tabla...');
    
    try {
        // 1. Obtener usuario
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError || !users.length) {
            throw new Error('No se encontró usuario');
        }
        
        const userId = users[0].id;
        console.log('✅ Usuario:', userId);

        // 2. Cliente básico
        console.log('📝 Creando cliente...');
        const { data: existingClient } = await supabase
            .from('clients')
            .select('*')
            .eq('email', 'maria.gonzalez@techsolutions.com')
            .single();
            
        let client;
        if (existingClient) {
            client = existingClient;
            console.log('✅ Cliente existente encontrado:', client.name);
        } else {
            const { data: newClient, error: clientError } = await supabase
                .from('clients')
                .insert({
                    user_id: userId,
                    name: 'María González García',
                    email: 'maria.gonzalez@techsolutions.com'
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
                description: 'Desarrollo de una plataforma de comercio electrónico completa con funcionalidades de IA para recomendaciones personalizadas, chatbot de atención al cliente, análisis predictivo de ventas y sistema de gestión de inventario automatizado.',
                status: 'in_progress',
                budget: 45000,
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

        if (projectError) throw new Error('Error creando proyecto: ' + projectError.message);
        console.log('✅ Proyecto creado:', project.name);

        // 4. Propuesta
        console.log('📝 Creando propuesta...');
        const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .insert({
                user_id: userId,
                client_id: client.id,
                title: 'Expansión Sistema E-commerce: Módulo B2B y Analytics Avanzados',
                description: 'Propuesta para la segunda fase del proyecto de e-commerce con módulo B2B empresarial, analytics e inteligencia de negocio, y optimizaciones adicionales como PWA, SEO avanzado, sistema de reviews y chatbot con IA conversacional.',
                value: 28500,
                currency: 'EUR',
                status: 'pending',
                valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();

        if (proposalError) throw new Error('Error creando propuesta: ' + proposalError.message);
        console.log('✅ Propuesta creada:', proposal.title);

        // 5. Mensajes
        console.log('📝 Creando conversación...');
        const messagesData = [
            {
                user_id: userId,
                client_id: client.id,
                message: 'Buenos días María, te escribo para hacer seguimiento del proyecto de e-commerce. Hemos completado el 35% según lo planificado, pero me gustaría comentarte algunos puntos importantes sobre el desarrollo.',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: '¿Qué puntos querías comentar? Espero que no sean problemas graves...',
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'No son problemas graves, pero sí situaciones que debemos gestionar: 1) API de Recomendaciones necesita 1 semana adicional, 2) Stripe actualizó su API, 3) Tengo una optimización que reduciría tiempos de carga en 40%. ¿Podríamos hacer una call esta semana?',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Me preocupa el tema de la semana adicional... Tenemos fecha límite ajustada para Black Friday. ¿Esa semana afectaría al cronograma general? Podemos hacer la call el miércoles a las 10:00.',
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Tranquila, la semana adicional NO afecta el lanzamiento. Podemos paralelizar tareas y mantener Black Friday. La optimización está ya planificada para este sprint. Perfecto para el miércoles 10:00.',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Me tranquiliza tu enfoque. ¿Sería posible añadir un sistema de reviews con IA para analizar sentiment? También, el CFO pregunta si hay descuento por volumen de trabajo...',
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Sistema de reviews con IA: análisis de sentiment automático, detección de reviews falsas, 12 horas (1.020€). Descuento: 5% en facturación restante + 10% garantizado en propuesta B2B. ¿Te parece justo?',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: '¡Perfecto! Me parece muy razonable. El sistema de reviews con IA nos interesa mucho. El CFO está de acuerdo con los descuentos. ¡Gracias por la gestión tan profesional! 💪',
                sender: 'client',
                message_type: 'text',
                is_read: false,
                created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            }
        ];

        const { data: messages, error: messagesError } = await supabase
            .from('freelancer_messages')
            .insert(messagesData)
            .select();

        if (messagesError) throw new Error('Error creando mensajes: ' + messagesError.message);
        console.log('✅ Conversación creada:', messages.length, 'mensajes');

        // Resumen
        console.log('\n🎉 ¡DATOS DE PRUEBA CREADOS EXITOSAMENTE!');
        console.log('');
        console.log('📊 RESUMEN:');
        console.log(`   👤 Cliente: ${client.name} (${client.email})`);
        console.log(`   🏗️  Proyecto: ${project.name}`);
        console.log(`   📋 Propuesta: ${proposal.title} (€${proposal.value})`);
        console.log(`   💬 Conversación: ${messages.length} mensajes`);
        console.log('');
        console.log('🎯 AUTOMATIZACIONES DISPONIBLES:');
        console.log('   ⚠️  Detector de Riesgos → "María González" → "Plataforma E-commerce"');
        console.log('   📊 Analizador de Propuestas → "María González" → "Expansión Sistema E-commerce"');
        console.log('   🧠 Análisis de Conversación → "María González"');
        console.log('   🎭 Análisis de Sentimiento → Último mensaje del cliente (muy positivo)');
        console.log('   💬 Optimización → Responder al último mensaje');
        console.log('');
        console.log('🚀 ¡Ve a http://localhost:3000/dashboard/ai-automations para probar todas las automatizaciones!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) console.error('Stack:', error.stack);
        process.exit(1);
    }
}

createDataByTable();
