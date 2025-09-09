-- Script con manejo de errores detallado
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

RAISE NOTICE '=== INICIANDO CREACIÓN DE DATOS ===';
RAISE NOTICE 'User ID: %', test_user_id;

-- 1. Crear cliente
BEGIN
    INSERT INTO clients (id, user_id, name, email, company, phone, address, city, province, nif)
    VALUES (gen_random_uuid(), test_user_id, 'TechCorp Solutions', 'ceo@techcorp.es', 'TechCorp Solutions SL', '+34 600 555 777', 'Calle Serrano 95', 'Madrid', 'Madrid', 'B88776655')
    RETURNING id INTO test_client_id;
    
    RAISE NOTICE '✅ Cliente creado: %', test_client_id;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Error creando cliente: %', SQLERRM;
        RETURN;
END;

-- 2. Crear proyecto
BEGIN
    INSERT INTO projects (id, name, description, client_id, user_id, status, budget, start_date, end_date)
    VALUES (gen_random_uuid(), 'App Fintech Mobile', 'Aplicación bancaria con pagos digitales y criptomonedas', test_client_id, test_user_id, 'active', 55000.00, CURRENT_DATE - INTERVAL '85 days', CURRENT_DATE + INTERVAL '30 days')
    RETURNING id INTO test_project_id;
    
    RAISE NOTICE '✅ Proyecto creado: %', test_project_id;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Error creando proyecto: %', SQLERRM;
        RETURN;
END;

-- 3. Crear eventos de calendario UNO POR UNO para detectar errores
RAISE NOTICE 'Creando eventos de calendario...';
FOR i IN 1..3 LOOP -- Solo 3 para empezar
    BEGIN
        start_date := CURRENT_TIMESTAMP - INTERVAL '85 days' + (i * INTERVAL '2.4 days') + INTERVAL '9 hours';
        end_date := start_date + INTERVAL '6.5 hours';
        
        INSERT INTO calendar_events (
            user_id, title, description, start_time, end_time, type, 
            client_id, project_id, is_billable, hourly_rate, actual_revenue,
            time_tracked, status, productivity_score, efficiency_rating
        ) VALUES (
            test_user_id,
            'Desarrollo Backend Fintech ' || i,
            'Trabajo en app fintech mobile',
            start_date, end_date, 'development',
            test_client_id, test_project_id, true, 85.00, 552.50,
            23400, 'completed', 9, 10
        );
        
        RAISE NOTICE '✅ Evento % creado', i;
    EXCEPTION
        WHEN others THEN
            RAISE NOTICE '❌ Error creando evento %: %', i, SQLERRM;
            -- Continuar con el siguiente evento
    END;
END LOOP;

-- 4. Crear tareas UNA POR UNA
RAISE NOTICE 'Creando tareas...';
BEGIN
    INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category) 
    VALUES (test_project_id, 'Arquitectura segura', 'Diseño de seguridad bancaria', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '75 days', 28800, 'architecture');
    
    RAISE NOTICE '✅ Tarea 1 creada';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Error creando tarea 1: %', SQLERRM;
END;

BEGIN
    INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category) 
    VALUES (test_project_id, 'APIs de pagos', 'Integración con bancos', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '65 days', 36000, 'backend');
    
    RAISE NOTICE '✅ Tarea 2 creada';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Error creando tarea 2: %', SQLERRM;
END;

-- 5. Crear presupuestos UNO POR UNO
RAISE NOTICE 'Creando presupuestos...';
BEGIN
    INSERT INTO budgets (user_id, client_id, title, description, status, total_amount, approved_at, sent_at, created_at) 
    VALUES (test_user_id, test_client_id, 'Fintech MVP', 'App básica con pagos', 'approved', 25000.00, CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP - INTERVAL '72 days', CURRENT_TIMESTAMP - INTERVAL '75 days');
    
    RAISE NOTICE '✅ Presupuesto 1 creado';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Error creando presupuesto 1: %', SQLERRM;
END;

-- 6. Crear facturas UNA POR UNA
RAISE NOTICE 'Creando facturas...';
BEGIN
    INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, total_amount, status, issue_date, due_date, paid_date) 
    VALUES (test_user_id, test_client_id, test_project_id, 'FINTECH-001', 'Fintech MVP Completo', 'App móvil con pagos bancarios', 25000.00, 25000.00, 'paid', CURRENT_DATE - INTERVAL '55 days', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '35 days');
    
    RAISE NOTICE '✅ Factura 1 creada';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Error creando factura 1: %', SQLERRM;
END;

-- 7. Crear mensajes
RAISE NOTICE 'Creando mensajes...';
BEGIN
    INSERT INTO client_messages (client_id, project_id, message, sender_type, is_read, created_at) 
    VALUES (test_client_id, test_project_id, 'Hola! ¿Cómo va la app fintech?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '30 days');
    
    RAISE NOTICE '✅ Mensaje 1 creado';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '❌ Error creando mensaje 1: %', SQLERRM;
END;

RAISE NOTICE '=== PROCESO COMPLETADO ===';

-- Verificar qué se creó
RAISE NOTICE 'Verificando datos creados...';
RAISE NOTICE 'Clientes: % ', (SELECT COUNT(*) FROM clients WHERE user_id = test_user_id);
RAISE NOTICE 'Proyectos: %', (SELECT COUNT(*) FROM projects WHERE user_id = test_user_id);
RAISE NOTICE 'Eventos: %', (SELECT COUNT(*) FROM calendar_events WHERE user_id = test_user_id);
RAISE NOTICE 'Tareas: %', (SELECT COUNT(*) FROM tasks WHERE user_id = test_user_id);
RAISE NOTICE 'Presupuestos: %', (SELECT COUNT(*) FROM budgets WHERE user_id = test_user_id);
RAISE NOTICE 'Facturas: %', (SELECT COUNT(*) FROM invoices WHERE user_id = test_user_id);

END $$;
