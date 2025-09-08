const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createMinimalTestScenario() {
    console.log('🎯 Creando datos de prueba con esquema básico...');
    
    try {
        // 1. Obtener el usuario actual
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError || !users.length) {
            throw new Error('No se encontró usuario: ' + (usersError?.message || 'Lista vacía'));
        }
        
        const userId = users[0].id;
        console.log('✅ Usuario encontrado:', userId);

        // 2. Crear cliente con campos básicos
        const clientData = {
            user_id: userId,
            name: 'María González García',
            email: 'maria.gonzalez@techsolutions.com',
            phone: '+34 666 777 888',
            company: 'TechSolutions Madrid S.L.'
        };

        const { data: client, error: clientError } = await supabase
            .from('clients')
            .upsert(clientData, { onConflict: 'email' })
            .select()
            .single();

        if (clientError) {
            console.log('Intentando crear cliente sin campo company...');
            delete clientData.company;
            const { data: client2, error: clientError2 } = await supabase
                .from('clients')
                .upsert(clientData, { onConflict: 'email' })
                .select()
                .single();
            
            if (clientError2) {
                console.log('Intentando con campos mínimos...');
                const minimalClient = {
                    user_id: userId,
                    name: 'María González García',
                    email: 'maria.gonzalez@techsolutions.com'
                };
                
                const { data: client3, error: clientError3 } = await supabase
                    .from('clients')
                    .upsert(minimalClient, { onConflict: 'email' })
                    .select()
                    .single();
                    
                if (clientError3) throw new Error('Error creando cliente mínimo: ' + clientError3.message);
                console.log('✅ Cliente creado (mínimo):', client3.name);
                client = client3;
            } else {
                console.log('✅ Cliente creado (sin company):', client2.name);
                client = client2;
            }
        } else {
            console.log('✅ Cliente creado (completo):', client.name);
        }

        // 3. Crear proyecto básico
        const projectData = {
            user_id: userId,
            client_id: client.id,
            name: 'Plataforma E-commerce Completa con IA',
            description: 'Desarrollo de una plataforma de comercio electrónico completa con funcionalidades de IA para recomendaciones personalizadas, chatbot de atención al cliente, análisis predictivo de ventas y sistema de gestión de inventario automatizado.',
            status: 'in_progress',
            budget: 45000,
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();

        if (projectError) throw new Error('Error creando proyecto: ' + projectError.message);
        console.log('✅ Proyecto creado:', project.name);

        // 4. Crear propuesta básica
        const proposalData = {
            user_id: userId,
            client_id: client.id,
            title: 'Expansión Sistema E-commerce: Módulo B2B y Analytics Avanzados',
            description: `Propuesta para la segunda fase del proyecto de e-commerce, incluyendo:

**MÓDULO B2B EMPRESARIAL:**
- Portal dedicado para clientes corporativos
- Sistema de cotizaciones automáticas
- Gestión de descuentos por volumen

**ANALYTICS E INTELIGENCIA DE NEGOCIO:**
- Dashboard ejecutivo con KPIs en tiempo real
- Análisis predictivo de demanda
- Reportes de rentabilidad por producto

**OPTIMIZACIONES ADICIONALES:**
- Implementación de PWA (Progressive Web App)
- Sistema de reviews y reputación
- Chatbot con IA conversacional (GPT-4)

Cronograma: 3 meses | Garantía: 12 meses soporte`,
            value: 28500,
            currency: 'EUR',
            status: 'pending',
            valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        };

        const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .insert(proposalData)
            .select()
            .single();

        if (proposalError) throw new Error('Error creando propuesta: ' + proposalError.message);
        console.log('✅ Propuesta creada:', proposal.title);

        // 5. Crear conversación básica
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
                message: `No son problemas graves, pero sí situaciones que debemos gestionar:

1. **API de Recomendaciones**: La integración con TensorFlow necesita 1 semana adicional para optimizar el rendimiento.

2. **Pasarelas de Pago**: Stripe ha actualizado su API y requiere cambios.

3. **Oportunidad de Mejora**: He identificado una optimización que podría reducir los tiempos de carga en un 40%.

¿Podríamos programar una call esta semana?`,
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Me preocupa el tema de la semana adicional... Tenemos fecha límite ajustada para Black Friday. El equipo directivo está muy pendiente.

¿Esa semana afectaría al cronograma general? Podemos hacer la call el miércoles a las 10:00.`,
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Entiendo tu preocupación. Datos concretos:

**CRONOGRAMA:**
- La semana adicional NO afecta la fecha de lanzamiento
- Podemos paralelizar tareas para recuperar tiempo
- Mantenemos el objetivo de Black Friday

**OPTIMIZACIÓN:**
- Reducción 40% tiempo carga = +15% conversiones estimadas
- Ya planificada para el sprint actual

Perfecto para el miércoles 10:00. ¿Zoom?`,
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Zoom está bien. Me tranquiliza tu enfoque proactivo.

Una pregunta: ¿sería posible añadir un sistema de reviews con IA para analizar sentiment automáticamente?

También, el CFO pregunta si hay posibilidad de algún descuento por el volumen de trabajo...`,
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Excelente pregunta sobre el sistema de reviews con IA:

**SISTEMA DE REVIEWS + IA:**
- Análisis de sentiment automático
- Detección de reviews falsas
- Estimación: 12 horas (1.020€)

**DESCUENTO:**
- 5% descuento en facturación restante del proyecto actual
- 10% descuento garantizado en la propuesta B2B

¿Te parece justo?`,
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `¡Perfecto! Me parece muy razonable. El sistema de reviews con IA nos interesa mucho.

El CFO está de acuerdo con los descuentos. También está interesado en la propuesta B2B.

¡Gracias por la gestión tan profesional! 💪`,
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
        console.log('✅ Mensajes creados:', messages.length);

        // Resumen final
        console.log('\n🎉 ¡ESCENARIO DE PRUEBA BÁSICO CREADO EXITOSAMENTE!');
        console.log('');
        console.log('📊 DATOS CREADOS:');
        console.log(`   👤 Cliente: ${client.name}`);
        console.log(`   🏗️  Proyecto: ${project.name}`);
        console.log(`   📋 Propuesta: ${proposal.title} (€${proposal.value})`);
        console.log(`   💬 Conversación: ${messages.length} mensajes`);
        console.log('');
        console.log('🎯 AUTOMATIZACIONES LISTAS:');
        console.log('   ⚠️  Detector de Riesgos → Seleccionar "María González" → "Plataforma E-commerce"');
        console.log('   📊 Analizador de Propuestas → Seleccionar "María González" → "Expansión Sistema E-commerce"');
        console.log('   🧠 Análisis de Conversación → Seleccionar "María González"');
        console.log('   🎭 Análisis de Sentimiento → Usar último mensaje (positivo)');
        console.log('   💬 Optimización → Responder al último mensaje');
        console.log('');
        console.log('🚀 ¡Ve a http://localhost:3000/dashboard/ai-automations para probar!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createMinimalTestScenario();
