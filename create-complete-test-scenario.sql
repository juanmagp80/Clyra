-- Script para crear un escenario de prueba completo para las automatizaciones de IA
-- Incluye: cliente, proyecto, propuesta y conversación completa

-- 1. CREAR CLIENTE DE PRUEBA
INSERT INTO clients (
    id,
    user_id,
    name,
    email,
    phone,
    company,
    address,
    notes,
    status,
    created_at,
    updated_at
) VALUES (
    'client-test-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    'María González García',
    'maria.gonzalez@techsolutions.com',
    '+34 666 777 888',
    'TechSolutions Madrid S.L.',
    'Calle Gran Vía 45, 3º B, 28013 Madrid',
    'Cliente premium con múltiples proyectos de desarrollo web y móvil. Muy exigente con los plazos y calidad. Prefiere comunicación directa y actualizaciones semanales.',
    'active',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '2 days'
) 
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    company = EXCLUDED.company,
    address = EXCLUDED.address,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 2. CREAR PROYECTO COMPLEJO
INSERT INTO projects (
    id,
    user_id,
    client_id,
    name,
    description,
    status,
    priority,
    budget,
    currency,
    estimated_hours,
    start_date,
    end_date,
    progress,
    notes,
    created_at,
    updated_at
) VALUES (
    'project-test-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Plataforma E-commerce Completa con IA',
    'Desarrollo de una plataforma de comercio electrónico completa con funcionalidades de IA para recomendaciones personalizadas, chatbot de atención al cliente, análisis predictivo de ventas y sistema de gestión de inventario automatizado. Incluye desarrollo web responsive, aplicación móvil iOS/Android, panel de administración avanzado y integración con múltiples pasarelas de pago.',
    'in_progress',
    'high',
    45000,
    'EUR',
    320,
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '60 days',
    35,
    'Proyecto crítico para el Q4. Cliente muy exigente. Requisitos cambiantes. Tecnologías: React, Node.js, MongoDB, TensorFlow, AWS. Equipo de 4 desarrolladores. Reuniones semanales obligatorias.',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '1 day'
);

-- 3. CREAR TAREAS DEL PROYECTO (para análisis de riesgos más completo)
INSERT INTO tasks (
    id,
    user_id,
    project_id,
    title,
    description,
    status,
    priority,
    due_date,
    estimated_hours,
    actual_hours,
    assigned_to,
    created_at,
    updated_at
) VALUES 
-- Tareas críticas con retrasos
(
    'task-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM projects WHERE name LIKE 'Plataforma E-commerce%' LIMIT 1),
    'Integración API de Recomendaciones IA',
    'Implementar sistema de machine learning para recomendaciones personalizadas usando TensorFlow y APIs de terceros',
    'in_progress',
    'high',
    NOW() - INTERVAL '5 days', -- VENCIDA
    40,
    45,
    'Juan Pérez',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '1 day'
),
(
    'task-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM projects WHERE name LIKE 'Plataforma E-commerce%' LIMIT 1),
    'Configuración Sistema de Pagos',
    'Integrar Stripe, PayPal y Bizum. Implementar sistema de reembolsos automáticos',
    'pending',
    'high',
    NOW() + INTERVAL '7 days',
    25,
    0,
    'Ana López',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '2 days'
),
(
    'task-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM projects WHERE name LIKE 'Plataforma E-commerce%' LIMIT 1),
    'Testing de Seguridad Completo',
    'Auditoría de seguridad, penetration testing, validación GDPR',
    'pending',
    'medium',
    NOW() + INTERVAL '30 days',
    30,
    0,
    'Carlos Ruiz',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '3 days'
);

-- 4. CREAR PROPUESTA DETALLADA
INSERT INTO proposals (
    id,
    user_id,
    client_id,
    title,
    description,
    value,
    currency,
    status,
    valid_until,
    terms,
    notes,
    created_at,
    updated_at
) VALUES (
    'proposal-test-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Expansión Sistema E-commerce: Módulo B2B y Analytics Avanzados',
    'Propuesta para la segunda fase del proyecto de e-commerce, incluyendo:

    **MÓDULO B2B EMPRESARIAL:**
    - Portal dedicado para clientes corporativos
    - Sistema de cotizaciones automáticas
    - Gestión de descuentos por volumen
    - Facturación empresarial integrada
    - Dashboard de compras corporativas

    **ANALYTICS E INTELIGENCIA DE NEGOCIO:**
    - Dashboard ejecutivo con KPIs en tiempo real
    - Análisis predictivo de demanda
    - Segmentación automática de clientes
    - Reportes de rentabilidad por producto
    - Integración con Google Analytics 4 y Facebook Pixel

    **OPTIMIZACIONES ADICIONALES:**
    - Implementación de PWA (Progressive Web App)
    - Optimización SEO técnico avanzado
    - Sistema de reviews y reputación
    - Chatbot con IA conversacional (GPT-4)
    - Integración con CRM Salesforce

    **CRONOGRAMA:** 3 meses
    **GARANTÍA:** 12 meses de soporte técnico
    **FORMACIÓN:** 20 horas incluidas para el equipo del cliente',
    28500,
    'EUR',
    'pending',
    NOW() + INTERVAL '15 days',
    'Condiciones de pago: 40% al inicio, 40% a mitad de proyecto, 20% al finalizar. Incluye 3 revisiones por módulo. Cambios adicionales se facturarán aparte a 85€/hora. Propiedad intelectual transferida al cliente al completar pagos.',
    'Cliente muy interesado pero necesita aprobación del CFO. Competencia directa con otra empresa (presupuesto 32k). Puntos fuertes: experiencia previa exitosa, equipo especializado. Debilidades: precio ligeramente superior, timeline ajustado.',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '1 day'
);

-- 5. CREAR CONVERSACIÓN COMPLETA Y REALISTA
INSERT INTO freelancer_messages (
    id,
    user_id,
    client_id,
    message,
    sender,
    message_type,
    is_read,
    created_at
) VALUES 
-- Inicio de conversación profesional
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Buenos días María, espero que hayas tenido un buen fin de semana. Te escribo para hacer seguimiento del proyecto de e-commerce. Hemos completado el 35% según lo planificado, pero me gustaría comentarte algunos puntos importantes sobre el desarrollo.',
    'freelancer',
    'text',
    true,
    NOW() - INTERVAL '6 days'
),
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Hola! Sí, gracias. Me alegra saber que vamos según el cronograma. ¿Qué puntos querías comentar? Espero que no sean problemas graves...',
    'client',
    'text',
    true,
    NOW() - INTERVAL '6 days' + INTERVAL '2 hours'
),
-- Comunicación sobre problemas técnicos
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'No son problemas graves, pero sí situaciones que debemos gestionar proactivamente:

    1. **API de Recomendaciones**: La integración con TensorFlow está siendo más compleja de lo previsto. Necesitamos 1 semana adicional para optimizar el rendimiento.

    2. **Pasarelas de Pago**: Stripe ha actualizado su API y requiere cambios en nuestra implementación. Ya estamos trabajando en ello.

    3. **Oportunidad de Mejora**: He identificado una optimización que podría reducir los tiempos de carga en un 40%, pero requiere refactorizar parte del código del carrito.

    ¿Podríamos programar una call esta semana para revisar todo en detalle?',
    'freelancer',
    'text',
    true,
    NOW() - INTERVAL '6 days' + INTERVAL '3 hours'
),
-- Respuesta del cliente mostrando preocupación
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Me preocupa un poco el tema de la semana adicional... Ya sabes que tenemos una fecha límite muy ajustada para el lanzamiento en Black Friday. El equipo directivo está muy pendiente de este proyecto.

    ¿Esa semana adicional afectaría al cronograma general? ¿Y cuánto costaría la optimización del carrito que mencionas?

    Podemos hacer la call el miércoles a las 10:00. Por favor, trae propuestas concretas.',
    'client',
    'text',
    true,
    NOW() - INTERVAL '5 days'
),
-- Respuesta profesional gestionando expectativas
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Entiendo perfectamente tu preocupación, María. Déjame tranquilizarte con datos concretos:

    **CRONOGRAMA:**
    - La semana adicional NO afecta la fecha de lanzamiento
    - Podemos paralelizar tareas para recuperar tiempo
    - Mantenemos el objetivo de Black Friday

    **OPTIMIZACIÓN DEL CARRITO:**
    - Inversión: 8 horas de desarrollo (incluidas en presupuesto)
    - ROI: Reducción 40% tiempo carga = +15% conversiones estimadas
    - Ya está planificada para el sprint actual

    **PROPUESTA PARA LA CALL:**
    1. Demo del progreso actual
    2. Plan de contingencia detallado
    3. Cronograma actualizado con hitos semanales

    Perfecto para el miércoles 10:00. ¿Zoom o presencial?',
    'freelancer',
    'text',
    true,
    NOW() - INTERVAL '5 days' + INTERVAL '4 hours'
),
-- Conversación sobre presupuesto adicional
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Zoom está bien. Me tranquiliza tu enfoque proactivo.

    Una pregunta: hemos estado pensando en añadir un sistema de reviews con IA para analizar sentiment automáticamente. ¿Sería posible incluirlo en esta fase o lo dejamos para la siguiente?

    También, el CFO quiere saber si hay posibilidad de algún descuento por el volumen de trabajo que estamos manejando...',
    'client',
    'text',
    true,
    NOW() - INTERVAL '4 days'
),
-- Manejo de solicitudes adicionales y negociación
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Excelente pregunta sobre el sistema de reviews con IA. Es factible y muy valioso:

    **SISTEMA DE REVIEWS + IA:**
    - Análisis de sentiment automático
    - Detección de reviews falsas
    - Categorización automática por topics
    - Estimación: 12 horas (1.020€)

    **SOBRE EL DESCUENTO:**
    Reconociendo vuestra confianza y el volumen de proyectos:
    - 5% descuento en facturación restante del proyecto actual
    - 10% descuento garantizado en la propuesta B2B que os envié
    - Prioridad en soporte post-lanzamiento

    ¿Os parece una propuesta justa? Podemos cerrar todo en la call del miércoles.',
    'freelancer',
    'text',
    true,
    NOW() - INTERVAL '4 days' + INTERVAL '6 hours'
),
-- Aceptación y cierre positivo
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    '¡Perfecto! Me parece una propuesta muy razonable. El sistema de reviews con IA nos interesa mucho, creo que será un diferenciador importante.

    He comentado los descuentos con el CFO y está de acuerdo. También está muy interesado en la propuesta B2B que mencionas.

    Nos vemos el miércoles a las 10:00. Envío link de Zoom por email.

    ¡Gracias por la gestión tan profesional del proyecto!',
    'client',
    'text',
    true,
    NOW() - INTERVAL '3 days'
),
-- Mensaje reciente mostrando progreso
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Update post-reunión:

    ✅ **COMPLETADO ESTA SEMANA:**
    - Integración Stripe y PayPal al 100%
    - Optimización del carrito implementada (-38% tiempo carga)
    - Testing de seguridad básico completado

    🔄 **EN PROGRESO:**
    - Sistema de reviews con IA (60% completado)
    - Módulo de recomendaciones (recuperando timeline)

    📅 **PRÓXIMA SEMANA:**
    - Demo funcional completa para stakeholders
    - Testing de carga y optimización final

    Todo según lo acordado. ¡El proyecto va viento en popa! 🚀',
    'freelancer',
    'text',
    true,
    NOW() - INTERVAL '1 day'
),
-- Último mensaje del cliente mostrando satisfacción
(
    'msg-' || substr(md5(random()::text), 1, 8),
    (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1),
    'Excelente progreso! El equipo directivo está muy contento con los avances.

    La mejora en los tiempos de carga ya la hemos notado en las pruebas internas. Impresionante trabajo.

    Para la demo de la próxima semana, ¿podríamos incluir también una preview del módulo B2B? Aunque sea básica, creo que ayudaría a acelerar la aprobación del presupuesto.

    ¡Sigamos así! 💪',
    'client',
    'text',
    false, -- No leído aún
    NOW() - INTERVAL '4 hours'
);

-- 6. CONFIRMAR CREACIÓN DE DATOS
SELECT 
    'DATOS DE PRUEBA CREADOS EXITOSAMENTE' as status,
    (SELECT COUNT(*) FROM clients WHERE email = 'maria.gonzalez@techsolutions.com') as clientes_creados,
    (SELECT COUNT(*) FROM projects WHERE name LIKE 'Plataforma E-commerce%') as proyectos_creados,
    (SELECT COUNT(*) FROM proposals WHERE title LIKE 'Expansión Sistema E-commerce%') as propuestas_creadas,
    (SELECT COUNT(*) FROM freelancer_messages WHERE client_id = (SELECT id FROM clients WHERE email = 'maria.gonzalez@techsolutions.com' LIMIT 1)) as mensajes_creados,
    (SELECT COUNT(*) FROM tasks WHERE project_id = (SELECT id FROM projects WHERE name LIKE 'Plataforma E-commerce%' LIMIT 1)) as tareas_creadas;
