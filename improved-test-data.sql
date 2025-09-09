-- Script mejorado que usa el usuario actualmente logueado
-- Este script detecta automáticamente tu user_id desde la sesión actual

DO $$
DECLARE
    test_user_id UUID;
    test_client_id UUID;
    test_project_id UUID;
    i INTEGER;
    start_date TIMESTAMP;
    end_date TIMESTAMP;
BEGIN

-- Obtener el user_id del usuario actualmente logueado
test_user_id := auth.uid();

-- Si no funciona auth.uid(), usar método alternativo
IF test_user_id IS NULL THEN
    SELECT id INTO test_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
END IF;

-- Verificar que tenemos un user_id válido
IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No se pudo obtener user_id. Asegúrate de estar logueado en Supabase.';
END IF;

RAISE NOTICE 'Creando datos de prueba para user_id: %', test_user_id;

-- Verificar si ya existen datos para este usuario
DECLARE
    existing_events INTEGER;
    existing_clients INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_events FROM calendar_events WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO existing_clients FROM clients WHERE user_id = test_user_id;
    
    RAISE NOTICE 'Datos existentes - Eventos: %, Clientes: %', existing_events, existing_clients;
END;

-- 1. Crear cliente de prueba
INSERT INTO clients (id, user_id, name, email, company, phone, address, city, province, nif)
VALUES (gen_random_uuid(), test_user_id, 'TechStart Solutions', 'contacto@techstart.es', 'TechStart Solutions SL', '+34 600 333 444', 'Paseo de Gracia 123', 'Barcelona', 'Barcelona', 'B11223344')
RETURNING id INTO test_client_id;

RAISE NOTICE 'Cliente creado con ID: %', test_client_id;

-- 2. Crear proyecto de prueba
INSERT INTO projects (id, name, description, client_id, user_id, status, budget, start_date, end_date)
VALUES (gen_random_uuid(), 'Plataforma E-learning', 'Desarrollo de plataforma educativa online con LMS', test_client_id, test_user_id, 'active', 35000.00, CURRENT_DATE - INTERVAL '80 days', CURRENT_DATE + INTERVAL '20 days')
RETURNING id INTO test_project_id;

RAISE NOTICE 'Proyecto creado con ID: %', test_project_id;

-- 3. Crear eventos de calendario (distribuidos en los últimos 90 días)
FOR i IN 1..35 LOOP
    start_date := CURRENT_TIMESTAMP - INTERVAL '85 days' + (i * INTERVAL '2.5 days') + INTERVAL '9 hours';
    end_date := start_date + INTERVAL '6 hours';
    
    INSERT INTO calendar_events (
        user_id, title, description, start_time, end_time, type, category,
        client_id, project_id, is_billable, hourly_rate, actual_revenue,
        time_tracked, status, productivity_score, efficiency_rating
    ) VALUES (
        test_user_id,
        CASE (i % 6)
            WHEN 0 THEN 'Desarrollo Frontend React'
            WHEN 1 THEN 'API Backend Node.js'
            WHEN 2 THEN 'Diseño UI/UX'
            WHEN 3 THEN 'Testing y QA'
            WHEN 4 THEN 'Reunión con Cliente'
            ELSE 'Documentación Técnica'
        END,
        'Trabajo en plataforma e-learning - ' || 
        CASE (i % 6)
            WHEN 0 THEN 'Componentes React, responsive design'
            WHEN 1 THEN 'APIs REST, base de datos, autenticación'
            WHEN 2 THEN 'Wireframes, prototipos, experiencia usuario'
            WHEN 3 THEN 'Pruebas automatizadas, bugs fixes'
            WHEN 4 THEN 'Revisión progreso, feedback, planificación'
            ELSE 'Documentación código, manual usuario'
        END,
        start_date,
        end_date,
        CASE (i % 6)
            WHEN 4 THEN 'client_call'
            WHEN 2 THEN 'design_work'
            WHEN 3 THEN 'testing'
            ELSE 'development'
        END,
        'web_development',
        test_client_id,
        test_project_id,
        true,
        60.00,
        360.00, -- 6 horas * 60€
        21600, -- 6 horas en segundos
        'completed',
        FLOOR(RANDOM() * 3 + 8)::INTEGER, -- Entre 8-10
        FLOOR(RANDOM() * 2 + 9)::INTEGER  -- Entre 9-10
    );
    
    -- Log cada 10 eventos
    IF i % 10 = 0 THEN
        RAISE NOTICE 'Creados % eventos de calendario', i;
    END IF;
END LOOP;

-- 4. Crear tareas completadas
INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category) VALUES
(test_project_id, 'Análisis de requisitos', 'Definición completa de funcionalidades', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '75 days', 14400, 'planning'),
(test_project_id, 'Arquitectura del sistema', 'Diseño técnico y tecnologías', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '70 days', 18000, 'architecture'),
(test_project_id, 'Setup del entorno', 'Configuración inicial y repositorios', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '65 days', 7200, 'setup'),
(test_project_id, 'Sistema de usuarios', 'Registro, login, perfiles', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '60 days', 25200, 'backend'),
(test_project_id, 'Dashboard principal', 'Interfaz principal de la plataforma', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '50 days', 28800, 'frontend'),
(test_project_id, 'Sistema de cursos', 'Creación y gestión de cursos', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '40 days', 32400, 'feature'),
(test_project_id, 'Reproductor de video', 'Player personalizado con controles', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '30 days', 21600, 'integration'),
(test_project_id, 'Sistema de evaluaciones', 'Exámenes y calificaciones', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '20 days', 27000, 'feature'),
(test_project_id, 'Reportes y analytics', 'Estadísticas de progreso', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '12 days', 16200, 'analytics'),
(test_project_id, 'Optimización móvil', 'Responsive design completo', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '6 days', 19800, 'optimization');

RAISE NOTICE 'Creadas % tareas completadas', 10;

-- 5. Crear presupuestos
INSERT INTO budgets (user_id, client_id, title, description, status, total_amount, approved_at, sent_at, created_at) VALUES
(test_user_id, test_client_id, 'E-learning - Fase 1', 'Sistema base con usuarios y cursos', 'approved', 15000.00, CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP - INTERVAL '72 days', CURRENT_TIMESTAMP - INTERVAL '75 days'),
(test_user_id, test_client_id, 'E-learning - Fase 2', 'Evaluaciones y sistema de pagos', 'approved', 12000.00, CURRENT_TIMESTAMP - INTERVAL '35 days', CURRENT_TIMESTAMP - INTERVAL '37 days', CURRENT_TIMESTAMP - INTERVAL '40 days'),
(test_user_id, test_client_id, 'E-learning - Fase 3', 'App móvil y funciones avanzadas', 'sent', 8000.00, NULL, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '12 days');

RAISE NOTICE 'Creados % presupuestos', 3;

-- 6. Crear facturas
INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, total_amount, status, issue_date, due_date, paid_date) VALUES
(test_user_id, test_client_id, test_project_id, 'FAC-2024-200', 'E-learning Fase 1 Completa', 'Sistema base implementado y desplegado', 15000.00, 15000.00, 'paid', CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '30 days'),
(test_user_id, test_client_id, test_project_id, 'FAC-2024-201', 'E-learning Fase 2 Completa', 'Evaluaciones y pagos implementados', 12000.00, 12000.00, 'paid', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days'),
(test_user_id, test_client_id, test_project_id, 'FAC-2024-202', 'Horas adicionales desarrollo', 'Optimizaciones y mejoras extras', 3500.00, 3500.00, 'sent', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', NULL);

RAISE NOTICE 'Creadas % facturas', 3;

-- 7. Crear conversación realista con cliente
INSERT INTO client_messages (client_id, project_id, message, sender_type, is_read, created_at) VALUES
(test_client_id, test_project_id, 'Hola! ¿Podemos revisar el progreso de la plataforma?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '25 days'),
(test_client_id, test_project_id, 'Por supuesto! Ya tenemos todo el sistema de usuarios funcionando y estoy terminando el módulo de cursos.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '25 days' + INTERVAL '45 minutes'),
(test_client_id, test_project_id, 'Genial! ¿Cuándo podemos hacer una demo del reproductor de video?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '24 days'),
(test_client_id, test_project_id, 'Esta semana termino el player. ¿Te parece si hacemos la demo el viernes?', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '24 days' + INTERVAL '1 hour'),
(test_client_id, test_project_id, 'Perfecto! También me gustaría revisar el tema de las evaluaciones.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '23 days'),
(test_client_id, test_project_id, 'Sí, ese será el siguiente módulo. Ya tengo el diseño listo, empiezo desarrollo la próxima semana.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '23 days' + INTERVAL '30 minutes'),
(test_client_id, test_project_id, 'La demo del reproductor estuvo increíble! 🎥 Funciona muy fluido.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '18 days'),
(test_client_id, test_project_id, 'Gracias! Ahora voy full con el sistema de exámenes. Será muy completo.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '18 days' + INTERVAL '20 minutes'),
(test_client_id, test_project_id, '¿Cuándo crees que estará listo para empezar a subir contenido real?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '10 days'),
(test_client_id, test_project_id, 'En 2 semanas máximo. Solo queda pulir el panel de admin y hacer testing final.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '1 hour'),
(test_client_id, test_project_id, '¡Excelente! Ya tengo preparados los primeros 5 cursos.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '9 days'),
(test_client_id, test_project_id, 'Perfecto timing! Te voy preparando las credenciales de admin.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '9 days' + INTERVAL '15 minutes');

RAISE NOTICE 'Creados % mensajes con cliente', 12;

-- Resumen final
RAISE NOTICE '=== DATOS CREADOS EXITOSAMENTE ===';
RAISE NOTICE 'User ID: %', test_user_id;
RAISE NOTICE 'Cliente ID: %', test_client_id;
RAISE NOTICE 'Proyecto ID: %', test_project_id;
RAISE NOTICE 'Total eventos calendario: 35 (210 horas)';
RAISE NOTICE 'Total tareas completadas: 10';
RAISE NOTICE 'Total presupuestos: 3 (€35,000)';
RAISE NOTICE 'Total facturas: 3 (€30,500)';
RAISE NOTICE 'Total mensajes: 12';

END $$;
