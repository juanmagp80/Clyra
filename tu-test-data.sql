-- Script con tu user_id específico
-- e7ed7c8d-229a-42d1-8a44-37bcc64c440c

DO $$
DECLARE
    test_user_id UUID := 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
    test_client_id UUID;
    test_project_id UUID;
    i INTEGER;
    start_date TIMESTAMP;
    end_date TIMESTAMP;
BEGIN

RAISE NOTICE 'Creando datos para tu usuario: %', test_user_id;

-- 1. Crear cliente
INSERT INTO clients (id, user_id, name, email, company, phone, address, city, province, nif)
VALUES (gen_random_uuid(), test_user_id, 'TechCorp Solutions', 'ceo@techcorp.es', 'TechCorp Solutions SL', '+34 600 555 777', 'Calle Serrano 95', 'Madrid', 'Madrid', 'B88776655')
RETURNING id INTO test_client_id;

-- 2. Crear proyecto
INSERT INTO projects (id, name, description, client_id, user_id, status, budget, start_date, end_date)
VALUES (gen_random_uuid(), 'App Fintech Mobile', 'Aplicación bancaria con pagos digitales y criptomonedas', test_client_id, test_user_id, 'active', 55000.00, CURRENT_DATE - INTERVAL '85 days', CURRENT_DATE + INTERVAL '30 days')
RETURNING id INTO test_project_id;

-- 3. Crear 35 eventos de calendario
FOR i IN 1..35 LOOP
    start_date := CURRENT_TIMESTAMP - INTERVAL '85 days' + (i * INTERVAL '2.4 days') + INTERVAL '9 hours';
    end_date := start_date + INTERVAL '6.5 hours';
    
    INSERT INTO calendar_events (
        user_id, title, description, start_time, end_time, type, 
        client_id, project_id, is_billable, hourly_rate, actual_revenue,
        time_tracked, status, productivity_score, efficiency_rating
    ) VALUES (
        test_user_id,
        CASE (i % 7)
            WHEN 0 THEN 'Desarrollo Backend Fintech'
            WHEN 1 THEN 'Frontend React Native'
            WHEN 2 THEN 'Integración APIs Bancarias'
            WHEN 3 THEN 'Testing de Seguridad'
            WHEN 4 THEN 'Reunión Cliente'
            WHEN 5 THEN 'Blockchain Integration'
            ELSE 'UX/UI Design'
        END,
        'Trabajo en app fintech mobile',
        start_date, end_date, 'development',
        test_client_id, test_project_id, true, 85.00, 552.50,
        23400, 'completed', 9, 10
    );
    
    IF i % 10 = 0 THEN
        RAISE NOTICE 'Creados % eventos', i;
    END IF;
END LOOP;

-- 4. Crear tareas
INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category) VALUES
(test_project_id, 'Arquitectura segura', 'Diseño de seguridad bancaria', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '75 days', 28800, 'architecture'),
(test_project_id, 'APIs de pagos', 'Integración con bancos', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '65 days', 36000, 'backend'),
(test_project_id, 'App móvil', 'React Native + expo', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '50 days', 43200, 'mobile'),
(test_project_id, 'Criptowallet', 'Wallet de criptomonedas', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '35 days', 32400, 'blockchain'),
(test_project_id, 'Testing seguridad', 'Auditoría completa', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '20 days', 25200, 'security'),
(test_project_id, 'Deploy producción', 'AWS + Kubernetes', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '10 days', 18000, 'devops');

-- 5. Crear presupuestos
INSERT INTO budgets (user_id, client_id, title, description, status, total_amount, approved_at, sent_at, created_at) VALUES
(test_user_id, test_client_id, 'Fintech MVP', 'App básica con pagos', 'approved', 25000.00, CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP - INTERVAL '72 days', CURRENT_TIMESTAMP - INTERVAL '75 days'),
(test_user_id, test_client_id, 'Crypto Wallet', 'Módulo criptomonedas', 'approved', 20000.00, CURRENT_TIMESTAMP - INTERVAL '40 days', CURRENT_TIMESTAMP - INTERVAL '42 days', CURRENT_TIMESTAMP - INTERVAL '45 days'),
(test_user_id, test_client_id, 'Security Audit', 'Auditoría de seguridad', 'approved', 10000.00, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '17 days', CURRENT_TIMESTAMP - INTERVAL '20 days');

-- 6. Crear facturas
INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, total_amount, status, issue_date, due_date, paid_date) VALUES
(test_user_id, test_client_id, test_project_id, 'FINTECH-001', 'Fintech MVP Completo', 'App móvil con pagos bancarios', 25000.00, 25000.00, 'paid', CURRENT_DATE - INTERVAL '55 days', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '35 days'),
(test_user_id, test_client_id, test_project_id, 'FINTECH-002', 'Crypto Wallet', 'Módulo criptomonedas implementado', 20000.00, 20000.00, 'paid', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '8 days'),
(test_user_id, test_client_id, test_project_id, 'FINTECH-003', 'Security & Deploy', 'Auditoría y despliegue', 10000.00, 10000.00, 'sent', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', NULL);

-- 7. Crear mensajes
INSERT INTO client_messages (client_id, project_id, message, sender_type, is_read, created_at) VALUES
(test_client_id, test_project_id, 'Hola! ¿Cómo va la app fintech?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(test_client_id, test_project_id, 'Excelente! Ya funciona todo el sistema de pagos bancarios. ¿Revisamos?', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '30 days' + INTERVAL '1 hour'),
(test_client_id, test_project_id, '¡Increíble! La integración con los bancos es súper fluida 🏦', 'client', true, CURRENT_TIMESTAMP - INTERVAL '28 days'),
(test_client_id, test_project_id, 'Gracias! Ahora voy con el módulo de criptomonedas. Va a ser espectacular.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '28 days' + INTERVAL '30 minutes'),
(test_client_id, test_project_id, 'El crypto wallet está funcionando perfectamente! 🚀 Bitcoin, Ethereum, todo!', 'client', true, CURRENT_TIMESTAMP - INTERVAL '15 days'),
(test_client_id, test_project_id, 'Sí! Y con total seguridad. Ahora solo queda la auditoría final y lanzamos.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '15 days' + INTERVAL '45 minutes'),
(test_client_id, test_project_id, '¿Cuándo podemos hacer el soft launch para usuarios beta?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(test_client_id, test_project_id, 'La próxima semana. Ya pasó todas las pruebas de seguridad!', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '2 hours');

RAISE NOTICE '=== DATOS CREADOS EXITOSAMENTE ===';
RAISE NOTICE 'Cliente: TechCorp Solutions';
RAISE NOTICE 'Proyecto: App Fintech Mobile';
RAISE NOTICE 'Eventos: 35 (≈230 horas)';
RAISE NOTICE 'Facturas: €55,000 (€45,000 pagado)';
RAISE NOTICE 'Tarifa: €85/hora';
RAISE NOTICE 'Productividad: 9-10/10';

END $$;
