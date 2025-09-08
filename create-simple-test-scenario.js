const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSimpleTestScenario() {
    console.log('🎯 Iniciando creación de escenario de prueba simplificado...');
    
    try {
        // 1. Obtener el usuario actual
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError || !users.length) {
            throw new Error('No se encontró usuario: ' + (usersError?.message || 'Lista vacía'));
        }
        
        const userId = users[0].id;
        console.log('✅ Usuario encontrado:', userId);

        // 2. Crear cliente simple
        const clientData = {
            user_id: userId,
            name: 'María González García',
            email: 'maria.gonzalez@techsolutions.com',
            phone: '+34 666 777 888',
            company: 'TechSolutions Madrid S.L.',
            address: 'Calle Gran Vía 45, 3º B, 28013 Madrid',
            status: 'active'
        };

        const { data: client, error: clientError } = await supabase
            .from('clients')
            .upsert(clientData, { onConflict: 'email' })
            .select()
            .single();

        if (clientError) throw new Error('Error creando cliente: ' + clientError.message);
        console.log('✅ Cliente creado:', client.name);

        // 3. Crear proyecto
        const projectData = {
            user_id: userId,
            client_id: client.id,
            name: 'Plataforma E-commerce Completa con IA',
            description: 'Desarrollo de una plataforma de comercio electrónico completa con funcionalidades de IA para recomendaciones personalizadas, chatbot de atención al cliente, análisis predictivo de ventas y sistema de gestión de inventario automatizado.',
            status: 'in_progress',
            priority: 'high',
            budget: 45000,
            currency: 'EUR',
            estimated_hours: 320,
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 35
        };

        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();

        if (projectError) throw new Error('Error creando proyecto: ' + projectError.message);
        console.log('✅ Proyecto creado:', project.name);

        // 4. Crear tareas con problemas potenciales
        const tasksData = [
            {
                user_id: userId,
                project_id: project.id,
                title: 'Integración API de Recomendaciones IA',
                description: 'Implementar sistema de machine learning para recomendaciones personalizadas usando TensorFlow',
                status: 'in_progress',
                priority: 'high',
                due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // VENCIDA
                estimated_hours: 40,
                actual_hours: 45
            },
            {
                user_id: userId,
                project_id: project.id,
                title: 'Configuración Sistema de Pagos',
                description: 'Integrar Stripe, PayPal y Bizum. Sistema de reembolsos automáticos',
                status: 'pending',
                priority: 'high',
                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                estimated_hours: 25,
                actual_hours: 0
            },
            {
                user_id: userId,
                project_id: project.id,
                title: 'Testing de Seguridad Completo',
                description: 'Auditoría de seguridad, penetration testing, validación GDPR',
                status: 'pending',
                priority: 'medium',
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                estimated_hours: 30,
                actual_hours: 0
            }
        ];

        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .insert(tasksData)
            .select();

        if (tasksError) throw new Error('Error creando tareas: ' + tasksError.message);
        console.log('✅ Tareas creadas:', tasks.length);

        // 5. Crear propuesta
        const proposalData = {
            user_id: userId,
            client_id: client.id,
            title: 'Expansión Sistema E-commerce: Módulo B2B y Analytics Avanzados',
            description: `Propuesta para la segunda fase del proyecto de e-commerce, incluyendo:

**MÓDULO B2B EMPRESARIAL:**
- Portal dedicado para clientes corporativos
- Sistema de cotizaciones automáticas
- Gestión de descuentos por volumen
- Dashboard de compras corporativas

**ANALYTICS E INTELIGENCIA DE NEGOCIO:**
- Dashboard ejecutivo con KPIs en tiempo real
- Análisis predictivo de demanda
- Segmentación automática de clientes
- Reportes de rentabilidad por producto

**OPTIMIZACIONES ADICIONALES:**
- Implementación de PWA (Progressive Web App)
- Optimización SEO técnico avanzado
- Sistema de reviews y reputación
- Chatbot con IA conversacional (GPT-4)

**CRONOGRAMA:** 3 meses | **GARANTÍA:** 12 meses soporte`,
            value: 28500,
            currency: 'EUR',
            status: 'pending',
            valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            terms: 'Condiciones de pago: 40% al inicio, 40% a mitad de proyecto, 20% al finalizar. Incluye 3 revisiones por módulo.'
        };

        const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .insert(proposalData)
            .select()
            .single();

        if (proposalError) throw new Error('Error creando propuesta: ' + proposalError.message);
        console.log('✅ Propuesta creada:', proposal.title);

        // 6. Crear conversación realista
        const messagesData = [
            {
                user_id: userId,
                client_id: client.id,
                message: 'Buenos días María, espero que hayas tenido un buen fin de semana. Te escribo para hacer seguimiento del proyecto de e-commerce. Hemos completado el 35% según lo planificado, pero me gustaría comentarte algunos puntos importantes sobre el desarrollo.',
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: 'Hola! Sí, gracias. Me alegra saber que vamos según el cronograma. ¿Qué puntos querías comentar? Espero que no sean problemas graves...',
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `No son problemas graves, pero sí situaciones que debemos gestionar proactivamente:

1. **API de Recomendaciones**: La integración con TensorFlow está siendo más compleja de lo previsto. Necesitamos 1 semana adicional para optimizar el rendimiento.

2. **Pasarelas de Pago**: Stripe ha actualizado su API y requiere cambios en nuestra implementación. Ya estamos trabajando en ello.

3. **Oportunidad de Mejora**: He identificado una optimización que podría reducir los tiempos de carga en un 40%, pero requiere refactorizar parte del código del carrito.

¿Podríamos programar una call esta semana para revisar todo en detalle?`,
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Me preocupa un poco el tema de la semana adicional... Ya sabes que tenemos una fecha límite muy ajustada para el lanzamiento en Black Friday. El equipo directivo está muy pendiente de este proyecto.

¿Esa semana adicional afectaría al cronograma general? ¿Y cuánto costaría la optimización del carrito que mencionas?

Podemos hacer la call el miércoles a las 10:00. Por favor, trae propuestas concretas.`,
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Entiendo perfectamente tu preocupación, María. Déjame tranquilizarte con datos concretos:

**CRONOGRAMA:**
- La semana adicional NO afecta la fecha de lanzamiento
- Podemos paralelizar tareas para recuperar tiempo
- Mantenemos el objetivo de Black Friday

**OPTIMIZACIÓN DEL CARRITO:**
- Inversión: 8 horas de desarrollo (incluidas en presupuesto)
- ROI: Reducción 40% tiempo carga = +15% conversiones estimadas

Perfecto para el miércoles 10:00. ¿Zoom o presencial?`,
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Zoom está bien. Me tranquiliza tu enfoque proactivo.

Una pregunta: hemos estado pensando en añadir un sistema de reviews con IA para analizar sentiment automáticamente. ¿Sería posible incluirlo en esta fase o lo dejamos para la siguiente?

También, el CFO quiere saber si hay posibilidad de algún descuento por el volumen de trabajo que estamos manejando...`,
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Excelente pregunta sobre el sistema de reviews con IA. Es factible y muy valioso:

**SISTEMA DE REVIEWS + IA:**
- Análisis de sentiment automático
- Detección de reviews falsas
- Categorización automática por topics
- Estimación: 12 horas (1.020€)

**SOBRE EL DESCUENTO:**
Reconociendo vuestra confianza y el volumen de proyectos:
- 5% descuento en facturación restante del proyecto actual
- 10% descuento garantizado en la propuesta B2B que os envié

¿Os parece una propuesta justa?`,
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `¡Perfecto! Me parece una propuesta muy razonable. El sistema de reviews con IA nos interesa mucho, creo que será un diferenciador importante.

He comentado los descuentos con el CFO y está de acuerdo. También está muy interesado en la propuesta B2B que mencionas.

Nos vemos el miércoles a las 10:00. ¡Gracias por la gestión tan profesional del proyecto!`,
                sender: 'client',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Update post-reunión:

✅ **COMPLETADO ESTA SEMANA:**
- Integración Stripe y PayPal al 100%
- Optimización del carrito implementada (-38% tiempo carga)
- Testing de seguridad básico completado

🔄 **EN PROGRESO:**
- Sistema de reviews con IA (60% completado)
- Módulo de recomendaciones (recuperando timeline)

📅 **PRÓXIMA SEMANA:**
- Demo funcional completa para stakeholders

Todo según lo acordado. ¡El proyecto va viento en popa! 🚀`,
                sender: 'freelancer',
                message_type: 'text',
                is_read: true,
                created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                user_id: userId,
                client_id: client.id,
                message: `Excelente progreso! El equipo directivo está muy contento con los avances.

La mejora en los tiempos de carga ya la hemos notado en las pruebas internas. Impresionante trabajo.

Para la demo de la próxima semana, ¿podríamos incluir también una preview del módulo B2B? Aunque sea básica, creo que ayudaría a acelerar la aprobación del presupuesto.

¡Sigamos así! 💪`,
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
        console.log('\n🎉 ¡ESCENARIO DE PRUEBA COMPLETO CREADO EXITOSAMENTE!');
        console.log('');
        console.log('📊 RESUMEN DE DATOS CREADOS:');
        console.log(`   👤 Cliente: ${client.name} (${client.company})`);
        console.log(`   🏗️  Proyecto: ${project.name} (${project.progress}% completado)`);
        console.log(`   📋 Propuesta: ${proposal.title} (€${proposal.value})`);
        console.log(`   💬 Conversación: ${messages.length} mensajes intercambiados`);
        console.log(`   ✅ Tareas: ${tasks.length} tareas del proyecto (1 vencida)`);
        console.log('');
        console.log('🎯 AUTOMATIZACIONES LISTAS PARA PROBAR:');
        console.log('   ⚠️  Detector de Riesgos → Seleccionar "María González" → "Plataforma E-commerce"');
        console.log('   📊 Analizador de Propuestas → Seleccionar "María González" → "Expansión Sistema E-commerce"');
        console.log('   🧠 Análisis de Conversación → Seleccionar "María González"');
        console.log('   🎭 Análisis de Sentimiento → Copiar último mensaje del cliente (muy positivo)');
        console.log('   💬 Optimización de Comunicación → Crear respuesta al último mensaje');
        console.log('');
        console.log('✨ Los datos incluyen:');
        console.log('   • Proyecto con tareas vencidas (riesgo alto)');
        console.log('   • Conversación con negociación y resolución exitosa');
        console.log('   • Propuesta compleja con múltiples módulos');
        console.log('   • Cliente satisfecho pero con presión temporal');

    } catch (error) {
        console.error('❌ Error creando escenario de prueba:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

createSimpleTestScenario();
