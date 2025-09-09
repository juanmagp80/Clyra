-- Script para crear datos de prueba realistas para automatización de desarrollo
-- Ejecutar en Supabase SQL Editor

-- Primero obtenemos el user_id actual (reemplaza con tu UUID real)
-- Puedes obtenerlo desde: SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- Variables (AJUSTAR CON TU USER_ID REAL)
DO $$
DECLARE
    test_user_id UUID := 'TU_USER_ID_AQUI'; -- CAMBIAR POR TU ID REAL
    test_client_id UUID;
    test_project_id UUID;
    i INTEGER;
    start_date TIMESTAMP;
    end_date TIMESTAMP;
BEGIN

-- 1. Crear cliente de prueba
INSERT INTO clients (id, user_id, name, email, company, phone, address, city, province, nif)
VALUES (gen_random_uuid(), test_user_id, 'Tech Solutions SL', 'contacto@techsolutions.com', 'Tech Solutions SL', '+34 600 123 456', 'Calle Mayor 123', 'Madrid', 'Madrid', 'B12345678')
RETURNING id INTO test_client_id;

-- 2. Crear proyecto de prueba
INSERT INTO projects (id, name, description, client_id, user_id, status, budget, start_date, end_date)
VALUES (gen_random_uuid(), 'Desarrollo Web E-commerce', 'Tienda online completa con panel de administración', test_client_id, test_user_id, 'active', 15000.00, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days')
RETURNING id INTO test_project_id;

-- 3. Crear eventos de calendario (últimos 90 días)
FOR i IN 1..45 LOOP
    start_date := CURRENT_TIMESTAMP - INTERVAL '90 days' + (i * INTERVAL '2 days') + INTERVAL '9 hours';
    end_date := start_date + INTERVAL '6 hours';
    
    INSERT INTO calendar_events (
        user_id, title, description, start_time, end_time, type, category,
        client_id, project_id, is_billable, hourly_rate, actual_revenue,
        time_tracked, status, productivity_score, efficiency_rating
    ) VALUES (
        test_user_id,
        CASE (i % 4)
            WHEN 0 THEN 'Desarrollo Frontend'
            WHEN 1 THEN 'Reunión Cliente'
            WHEN 2 THEN 'Testing y QA'
            ELSE 'Planificación Proyecto'
        END,
        'Trabajo en proyecto e-commerce',
        start_date,
        end_date,
        CASE (i % 4)
            WHEN 1 THEN 'client_call'
            ELSE 'development'
        END,
        'project_work',
        test_client_id,
        test_project_id,
        true,
        45.00,
        270.00, -- 6 horas * 45€
        21600, -- 6 horas en segundos
        'completed',
        FLOOR(RANDOM() * 4 + 7)::INTEGER, -- Entre 7-10
        FLOOR(RANDOM() * 3 + 8)::INTEGER  -- Entre 8-10
    );
END LOOP;

-- 4. Crear tareas completadas
INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category) VALUES
(test_project_id, 'Diseño de base de datos', 'Modelado de entidades y relaciones', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '80 days', 14400, 'backend'),
(test_project_id, 'Configuración del entorno', 'Setup inicial del proyecto', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '75 days', 7200, 'setup'),
(test_project_id, 'API de productos', 'CRUD completo de productos', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '65 days', 21600, 'backend'),
(test_project_id, 'Interfaz de usuario', 'Componentes React principales', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '50 days', 28800, 'frontend'),
(test_project_id, 'Sistema de pagos', 'Integración con Stripe', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '35 days', 18000, 'integration'),
(test_project_id, 'Panel de administración', 'Dashboard para gestión', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '25 days', 25200, 'frontend'),
(test_project_id, 'Testing unitario', 'Pruebas automatizadas', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '15 days', 10800, 'testing'),
(test_project_id, 'Deploy y configuración', 'Puesta en producción', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '5 days', 7200, 'deployment');

-- 5. Crear presupuestos aprobados
INSERT INTO budgets (user_id, client_id, title, description, status, total_amount, approved_at, sent_at, created_at) VALUES
(test_user_id, test_client_id, 'Desarrollo E-commerce - Fase 1', 'Frontend y backend básico', 'approved', 8500.00, CURRENT_TIMESTAMP - INTERVAL '85 days', CURRENT_TIMESTAMP - INTERVAL '87 days', CURRENT_TIMESTAMP - INTERVAL '90 days'),
(test_user_id, test_client_id, 'Integración Pagos', 'Sistema de pagos completo', 'approved', 3500.00, CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP - INTERVAL '47 days', CURRENT_TIMESTAMP - INTERVAL '50 days'),
(test_user_id, test_client_id, 'Panel Administración', 'Dashboard administrativo', 'approved', 3000.00, CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '27 days', CURRENT_TIMESTAMP - INTERVAL '30 days');

-- 6. Crear facturas pagadas
INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, total_amount, status, issue_date, due_date, paid_date) VALUES
(test_user_id, test_client_id, test_project_id, 'FAC-2024-001', 'Desarrollo E-commerce - Hito 1', 'Entrega primera fase', 8500.00, 8500.00, 'paid', CURRENT_DATE - INTERVAL '75 days', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '55 days'),
(test_user_id, test_client_id, test_project_id, 'FAC-2024-002', 'Integración Pagos', 'Sistema Stripe implementado', 3500.00, 3500.00, 'paid', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '15 days'),
(test_user_id, test_client_id, test_project_id, 'FAC-2024-003', 'Panel Admin', 'Dashboard completado', 3000.00, 3000.00, 'sent', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '5 days', NULL);

-- 7. Crear mensajes con clientes
INSERT INTO client_messages (client_id, project_id, message, sender_type, is_read, created_at) VALUES
(test_client_id, test_project_id, 'Hola, ¿podrías enviarme un update del progreso del proyecto?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '20 days'),
(test_client_id, test_project_id, 'Por supuesto, el desarrollo va muy bien. Hemos completado el 70% del frontend y toda la API está funcionando.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '2 hours'),
(test_client_id, test_project_id, 'Excelente! ¿Cuándo podríamos ver una demo?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '19 days'),
(test_client_id, test_project_id, 'Podemos programar una demo para esta semana. Te preparo un entorno de staging.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '19 days' + INTERVAL '1 hour'),
(test_client_id, test_project_id, 'He revisado la demo, está quedando genial. ¿Seguimos en tiempo para el lanzamiento?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(test_client_id, test_project_id, 'Sí, vamos perfectos de tiempo. Solo queda el testing final y la documentación.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '30 minutes'),
(test_client_id, test_project_id, 'Perfecto, ya tengo preparado el contenido para poblar la tienda.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(test_client_id, test_project_id, 'Genial, en cuanto termines la carga de productos podemos hacer el go-live.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '1 hour');

END $$;

-- Verificar los datos creados
SELECT 
    'Eventos' as tipo,
    COUNT(*) as cantidad,
    SUM(time_tracked)/3600 as horas_totales,
    SUM(actual_revenue) as ingresos_totales
FROM calendar_events 
WHERE user_id = 'TU_USER_ID_AQUI' -- CAMBIAR
UNION ALL
SELECT 
    'Tareas',
    COUNT(*),
    SUM(total_time_seconds)/3600,
    0
FROM tasks 
WHERE user_id = 'TU_USER_ID_AQUI' -- CAMBIAR
UNION ALL
SELECT 
    'Facturas',
    COUNT(*),
    0,
    SUM(total_amount)
FROM invoices 
WHERE user_id = 'TU_USER_ID_AQUI' -- CAMBIAR
UNION ALL
SELECT 
    'Presupuestos',
    COUNT(*),
    0,
    SUM(total_amount)
FROM budgets 
WHERE user_id = 'TU_USER_ID_AQUI'; -- CAMBIAR
