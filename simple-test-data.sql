-- Script simplificado para crear datos de prueba
-- Obtiene automáticamente tu user_id

DO $$
DECLARE
    test_user_id UUID;
    test_client_id UUID;
    test_project_id UUID;
    i INTEGER;
    start_date TIMESTAMP;
    end_date TIMESTAMP;
BEGIN

-- Obtener el user_id más reciente (asumiendo que eres el usuario más reciente)
SELECT id INTO test_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Si no funciona lo anterior, usar este método alternativo:
-- SELECT id INTO test_user_id FROM profiles ORDER BY created_at DESC LIMIT 1;

RAISE NOTICE 'Creando datos para user_id: %', test_user_id;

-- 1. Crear cliente de prueba
INSERT INTO clients (id, user_id, name, email, company, phone, address, city, province, nif)
VALUES (gen_random_uuid(), test_user_id, 'Acme Corp', 'cliente@acmecorp.com', 'Acme Corporation', '+34 600 111 222', 'Av. Innovación 456', 'Barcelona', 'Barcelona', 'B87654321')
RETURNING id INTO test_client_id;

-- 2. Crear proyecto de prueba
INSERT INTO projects (id, name, description, client_id, user_id, status, budget, start_date, end_date)
VALUES (gen_random_uuid(), 'App Móvil iOS/Android', 'Desarrollo de aplicación nativa con backend', test_client_id, test_user_id, 'active', 25000.00, CURRENT_DATE - INTERVAL '75 days', CURRENT_DATE + INTERVAL '15 days')
RETURNING id INTO test_project_id;

-- 3. Crear 30 eventos de trabajo en los últimos 90 días
FOR i IN 1..30 LOOP
    start_date := CURRENT_TIMESTAMP - INTERVAL '90 days' + (i * INTERVAL '3 days') + INTERVAL '9 hours';
    end_date := start_date + INTERVAL '7 hours';
    
    INSERT INTO calendar_events (
        user_id, title, description, start_time, end_time, type, category,
        client_id, project_id, is_billable, hourly_rate, actual_revenue,
        time_tracked, status, productivity_score, efficiency_rating
    ) VALUES (
        test_user_id,
        CASE (i % 5)
            WHEN 0 THEN 'Desarrollo Backend API'
            WHEN 1 THEN 'Diseño UI/UX'
            WHEN 2 THEN 'Testing y Debug'
            WHEN 3 THEN 'Reunión con Cliente'
            ELSE 'Documentación'
        END,
        'Trabajo en app móvil',
        start_date,
        end_date,
        CASE (i % 5)
            WHEN 3 THEN 'client_call'
            ELSE 'development'
        END,
        'mobile_dev',
        test_client_id,
        test_project_id,
        true,
        55.00,
        385.00, -- 7 horas * 55€
        25200, -- 7 horas en segundos
        'completed',
        FLOOR(RANDOM() * 3 + 8)::INTEGER, -- Entre 8-10
        FLOOR(RANDOM() * 2 + 9)::INTEGER  -- Entre 9-10
    );
END LOOP;

-- 4. Crear tareas completadas
INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category) VALUES
(test_project_id, 'Arquitectura de la app', 'Diseño técnico y wireframes', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '70 days', 18000, 'planning'),
(test_project_id, 'Setup del proyecto', 'Configuración inicial React Native', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '65 days', 10800, 'setup'),
(test_project_id, 'Autenticación', 'Login y registro de usuarios', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '55 days', 21600, 'backend'),
(test_project_id, 'Pantallas principales', 'Home, perfil, configuración', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '45 days', 32400, 'frontend'),
(test_project_id, 'Push notifications', 'Sistema de notificaciones', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '35 days', 14400, 'integration'),
(test_project_id, 'Chat en tiempo real', 'Mensajería instantánea', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '25 days', 28800, 'feature'),
(test_project_id, 'Optimización rendimiento', 'Mejoras de velocidad', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '15 days', 16200, 'optimization'),
(test_project_id, 'Testing en dispositivos', 'Pruebas iOS y Android', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '8 days', 19800, 'testing');

-- 5. Crear presupuestos
INSERT INTO budgets (user_id, client_id, title, description, status, total_amount, approved_at, sent_at, created_at) VALUES
(test_user_id, test_client_id, 'App Móvil - MVP', 'Versión inicial de la aplicación', 'approved', 12000.00, CURRENT_TIMESTAMP - INTERVAL '65 days', CURRENT_TIMESTAMP - INTERVAL '68 days', CURRENT_TIMESTAMP - INTERVAL '70 days'),
(test_user_id, test_client_id, 'Features Avanzadas', 'Chat, notificaciones, analytics', 'approved', 8000.00, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '32 days', CURRENT_TIMESTAMP - INTERVAL '35 days'),
(test_user_id, test_client_id, 'Publicación Stores', 'Deploy en App Store y Google Play', 'sent', 5000.00, NULL, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '7 days');

-- 6. Crear facturas
INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, total_amount, status, issue_date, due_date, paid_date) VALUES
(test_user_id, test_client_id, test_project_id, 'INV-2024-100', 'App Móvil - MVP Entregado', 'Primera versión funcional', 12000.00, 12000.00, 'paid', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '25 days'),
(test_user_id, test_client_id, test_project_id, 'INV-2024-101', 'Features Avanzadas', 'Chat y notificaciones implementadas', 8000.00, 8000.00, 'paid', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE, CURRENT_DATE - INTERVAL '5 days'),
(test_user_id, test_client_id, test_project_id, 'INV-2024-102', 'Optimizaciones Finales', 'Mejoras de rendimiento', 2500.00, 2500.00, 'sent', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '15 days', NULL);

-- 7. Crear mensajes con clientes (conversación realista)
INSERT INTO client_messages (client_id, project_id, message, sender_type, is_read, created_at) VALUES
(test_client_id, test_project_id, '¡Hola! ¿Cómo va el desarrollo de la app?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(test_client_id, test_project_id, 'Muy bien! Ya tenemos el MVP funcionando. ¿Te parece si hacemos una demo mañana?', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '30 days' + INTERVAL '1 hour'),
(test_client_id, test_project_id, 'Perfecto! ¿A qué hora te viene bien?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '29 days'),
(test_client_id, test_project_id, '¿Te parece a las 15:00? Te mando el link de la videollamada.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '29 days' + INTERVAL '2 hours'),
(test_client_id, test_project_id, 'La demo estuvo genial! El chat en tiempo real funciona muy fluido 👏', 'client', true, CURRENT_TIMESTAMP - INTERVAL '28 days'),
(test_client_id, test_project_id, 'Gracias! Ahora voy a enfocarme en las notificaciones push y después optimización.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '28 days' + INTERVAL '30 minutes'),
(test_client_id, test_project_id, '¿Cuándo crees que podremos hacer el beta testing con usuarios reales?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '15 days'),
(test_client_id, test_project_id, 'En una semana máximo. Solo me queda pulir algunos detalles de UX.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '15 days' + INTERVAL '45 minutes'),
(test_client_id, test_project_id, '¡Excelente! Ya tengo una lista de 20 usuarios para el beta.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '14 days'),
(test_client_id, test_project_id, 'Perfecto, te preparo las builds de testing para iOS y Android.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '14 days' + INTERVAL '1 hour');

RAISE NOTICE 'Datos de prueba creados exitosamente!';
RAISE NOTICE 'Cliente ID: %', test_client_id;
RAISE NOTICE 'Proyecto ID: %', test_project_id;

END $$;
