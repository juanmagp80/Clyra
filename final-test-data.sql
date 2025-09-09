-- Script final que NO depende de auth.uid()
-- Usa el usuario más reciente o puedes especificar tu email

DO $$
DECLARE
    test_user_id UUID;
    test_client_id UUID;
    test_project_id UUID;
    i INTEGER;
    start_date TIMESTAMP;
    end_date TIMESTAMP;
BEGIN

-- OPCIÓN 1: Obtener por email (CAMBIA TU EMAIL AQUÍ)
-- SELECT id INTO test_user_id FROM auth.users WHERE email = 'tu-email@ejemplo.com';

-- OPCIÓN 2: Obtener el usuario más reciente (usa esta si solo tienes un usuario)
SELECT id INTO test_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- OPCIÓN 3: Si tienes múltiples usuarios, puedes usar profiles
-- SELECT id INTO test_user_id FROM profiles ORDER BY created_at DESC LIMIT 1;

-- Verificar que tenemos un user_id válido
IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún usuario. Verifica que existe al menos un usuario en auth.users';
END IF;

RAISE NOTICE 'Usando user_id: %', test_user_id;

-- Verificar si ya existen datos para evitar duplicados
DECLARE
    existing_events INTEGER;
    existing_clients INTEGER;
    user_email TEXT;
BEGIN
    SELECT COUNT(*) INTO existing_events FROM calendar_events WHERE user_id = test_user_id;
    SELECT COUNT(*) INTO existing_clients FROM clients WHERE user_id = test_user_id;
    SELECT email INTO user_email FROM auth.users WHERE id = test_user_id;
    
    RAISE NOTICE 'Usuario: % (ID: %)', user_email, test_user_id;
    RAISE NOTICE 'Datos existentes - Eventos: %, Clientes: %', existing_events, existing_clients;
    
    -- Si ya tienes muchos datos, pregunta si continuar
    IF existing_events > 10 THEN
        RAISE NOTICE 'ADVERTENCIA: Ya tienes % eventos. El script agregará más datos.', existing_events;
    END IF;
END;

-- 1. Crear cliente de prueba
INSERT INTO clients (id, user_id, name, email, company, phone, address, city, province, nif)
VALUES (gen_random_uuid(), test_user_id, 'Innovatech Digital', 'admin@innovatech.es', 'Innovatech Digital SL', '+34 654 987 321', 'Gran Vía 88', 'Madrid', 'Madrid', 'B99887766')
RETURNING id INTO test_client_id;

RAISE NOTICE 'Cliente creado: Innovatech Digital (ID: %)', test_client_id;

-- 2. Crear proyecto de prueba
INSERT INTO projects (id, name, description, client_id, user_id, status, budget, start_date, end_date)
VALUES (gen_random_uuid(), 'SaaS de Gestión Empresarial', 'Plataforma completa de gestión con CRM, facturación y reportes', test_client_id, test_user_id, 'active', 45000.00, CURRENT_DATE - INTERVAL '85 days', CURRENT_DATE + INTERVAL '25 days')
RETURNING id INTO test_project_id;

RAISE NOTICE 'Proyecto creado: SaaS de Gestión Empresarial (ID: %)', test_project_id;

-- 3. Crear eventos de calendario realistas (40 eventos en 90 días = trabajo intensivo)
FOR i IN 1..40 LOOP
    -- Distribuir eventos de lunes a viernes, evitando fines de semana
    start_date := CURRENT_TIMESTAMP - INTERVAL '88 days' + (i * INTERVAL '2.2 days');
    
    -- Ajustar al horario laboral (9:00-17:00)
    start_date := date_trunc('day', start_date) + INTERVAL '9 hours' + (RANDOM() * INTERVAL '2 hours');
    end_date := start_date + INTERVAL '5 hours' + (RANDOM() * INTERVAL '3 hours');
    
    INSERT INTO calendar_events (
        user_id, title, description, start_time, end_time, type, category,
        client_id, project_id, is_billable, hourly_rate, actual_revenue,
        time_tracked, status, productivity_score, efficiency_rating,
        satisfaction_rating, energy_level, focus_level_required
    ) VALUES (
        test_user_id,
        CASE (i % 8)
            WHEN 0 THEN 'Desarrollo Backend API'
            WHEN 1 THEN 'Frontend React Development'
            WHEN 2 THEN 'Diseño UI/UX'
            WHEN 3 THEN 'Testing y QA'
            WHEN 4 THEN 'Reunión con Cliente'
            WHEN 5 THEN 'Code Review y Refactoring'
            WHEN 6 THEN 'DevOps y Deployment'
            ELSE 'Documentación y Planning'
        END,
        CASE (i % 8)
            WHEN 0 THEN 'Desarrollo de endpoints REST, autenticación JWT, base de datos PostgreSQL'
            WHEN 1 THEN 'Componentes React, estado con Redux, integración con APIs'
            WHEN 2 THEN 'Prototipado en Figma, sistema de diseño, experiencia usuario'
            WHEN 3 THEN 'Pruebas unitarias, testing E2E, corrección de bugs'
            WHEN 4 THEN 'Revisión de progreso, feedback del cliente, planning siguiente sprint'
            WHEN 5 THEN 'Revisión de código, optimización, refactoring para mejor rendimiento'
            WHEN 6 THEN 'Configuración CI/CD, deploy en AWS, monitoreo'
            ELSE 'Documentación técnica, especificaciones, manuales de usuario'
        END,
        start_date,
        end_date,
        CASE (i % 8)
            WHEN 4 THEN 'client_call'
            WHEN 2 THEN 'design_work'
            WHEN 3 THEN 'testing'
            WHEN 6 THEN 'deployment'
            ELSE 'development'
        END,
        'saas_development',
        test_client_id,
        test_project_id,
        true,
        75.00, -- Tarifa alta para SaaS
        (EXTRACT(EPOCH FROM (end_date - start_date))/3600 * 75.00)::NUMERIC(10,2),
        EXTRACT(EPOCH FROM (end_date - start_date))::INTEGER,
        'completed',
        FLOOR(RANDOM() * 2 + 9)::INTEGER, -- Entre 9-10 (alta productividad)
        FLOOR(RANDOM() * 2 + 9)::INTEGER, -- Entre 9-10 (alta eficiencia)
        FLOOR(RANDOM() * 2 + 9)::INTEGER, -- Entre 9-10 (alta satisfacción)
        CASE WHEN RANDOM() > 0.7 THEN 'high' WHEN RANDOM() > 0.3 THEN 'medium' ELSE 'low' END,
        CASE (i % 8)
            WHEN 2 THEN 'high' -- Diseño requiere alta concentración
            WHEN 3 THEN 'high' -- Testing requiere alta concentración
            WHEN 4 THEN 'medium' -- Reuniones requieren concentración media
            ELSE 'medium'
        END
    );
    
    -- Log progreso cada 10 eventos
    IF i % 10 = 0 THEN
        RAISE NOTICE 'Creados % eventos de calendario', i;
    END IF;
END LOOP;

-- 4. Crear tareas completadas con tiempo realista
INSERT INTO tasks (project_id, title, description, status, priority, user_id, completed_at, total_time_seconds, category) VALUES
(test_project_id, 'Investigación y análisis', 'Research de tecnologías y competencia', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '80 days', 21600, 'research'),
(test_project_id, 'Arquitectura del sistema', 'Diseño de microservicios y base de datos', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '75 days', 28800, 'architecture'),
(test_project_id, 'Setup del proyecto', 'Configuración inicial, repos, CI/CD', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '70 days', 14400, 'setup'),
(test_project_id, 'Autenticación y autorización', 'JWT, roles, middleware de seguridad', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '65 days', 32400, 'backend'),
(test_project_id, 'API de usuarios', 'CRUD completo con validaciones', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '60 days', 25200, 'backend'),
(test_project_id, 'Dashboard principal', 'Interfaz principal con métricas', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '50 days', 36000, 'frontend'),
(test_project_id, 'Módulo CRM', 'Gestión completa de clientes', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '40 days', 43200, 'feature'),
(test_project_id, 'Sistema de facturación', 'Facturas automáticas y reportes', 'completed', 'high', test_user_id, CURRENT_TIMESTAMP - INTERVAL '30 days', 39600, 'feature'),
(test_project_id, 'Reportes y analytics', 'Dashboard de métricas empresariales', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '20 days', 27000, 'analytics'),
(test_project_id, 'API de integraciones', 'Webhooks y APIs de terceros', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '15 days', 21600, 'integration'),
(test_project_id, 'Testing automatizado', 'Suite completa de pruebas', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '10 days', 18000, 'testing'),
(test_project_id, 'Optimización performance', 'Caching, lazy loading, CDN', 'completed', 'medium', test_user_id, CURRENT_TIMESTAMP - INTERVAL '5 days', 16200, 'optimization');

RAISE NOTICE 'Creadas 12 tareas completadas';

-- 5. Crear presupuestos con montos realistas para SaaS
INSERT INTO budgets (user_id, client_id, title, description, status, total_amount, approved_at, sent_at, created_at) VALUES
(test_user_id, test_client_id, 'SaaS MVP - Fase 1', 'Core del sistema: usuarios, auth, dashboard básico', 'approved', 18000.00, CURRENT_TIMESTAMP - INTERVAL '75 days', CURRENT_TIMESTAMP - INTERVAL '77 days', CURRENT_TIMESTAMP - INTERVAL '80 days'),
(test_user_id, test_client_id, 'SaaS CRM - Fase 2', 'Módulo completo de gestión de clientes', 'approved', 15000.00, CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP - INTERVAL '47 days', CURRENT_TIMESTAMP - INTERVAL '50 days'),
(test_user_id, test_client_id, 'SaaS Facturación - Fase 3', 'Sistema de facturación y reportes financieros', 'approved', 12000.00, CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '27 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(test_user_id, test_client_id, 'SaaS Integraciones - Fase 4', 'APIs, webhooks y integraciones externas', 'sent', 8000.00, NULL, CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '10 days');

RAISE NOTICE 'Creados 4 presupuestos (€53,000 total)';

-- 6. Crear facturas con pagos realistas
INSERT INTO invoices (user_id, client_id, project_id, invoice_number, title, description, amount, total_amount, status, issue_date, due_date, paid_date) VALUES
(test_user_id, test_client_id, test_project_id, 'INV-2024-300', 'SaaS MVP Entregado', 'Fase 1 completada: sistema base funcional', 18000.00, 18000.00, 'paid', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '40 days'),
(test_user_id, test_client_id, test_project_id, 'INV-2024-301', 'Módulo CRM Completo', 'Gestión de clientes implementada', 15000.00, 15000.00, 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '10 days'),
(test_user_id, test_client_id, test_project_id, 'INV-2024-302', 'Sistema Facturación', 'Módulo de facturación y reportes', 12000.00, 12000.00, 'paid', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE, CURRENT_DATE - INTERVAL '3 days'),
(test_user_id, test_client_id, test_project_id, 'INV-2024-303', 'Horas Adicionales', 'Optimizaciones y mejoras extra', 4500.00, 4500.00, 'sent', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', NULL);

RAISE NOTICE 'Creadas 4 facturas (€49,500 total, €45,000 pagado)';

-- 7. Crear conversación profesional extensa
INSERT INTO client_messages (client_id, project_id, message, sender_type, is_read, created_at) VALUES
(test_client_id, test_project_id, 'Buenos días! ¿Cómo va el desarrollo del MVP?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '45 days'),
(test_client_id, test_project_id, 'Buenos días! El MVP va excelente. Ya tenemos autenticación, dashboard y gestión básica de usuarios funcionando. ¿Le parece si programamos una demo?', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '45 days' + INTERVAL '2 hours'),
(test_client_id, test_project_id, 'Perfecto! ¿Podríamos hacerla mañana por la tarde?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '44 days'),
(test_client_id, test_project_id, 'Perfecto, ¿a las 16:00 le viene bien? Le preparo un entorno de staging con datos de prueba.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '44 days' + INTERVAL '1 hour'),
(test_client_id, test_project_id, '¡La demo estuvo increíble! 🚀 El dashboard se ve muy profesional y la experiencia es muy fluida.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '43 days'),
(test_client_id, test_project_id, '¡Muchas gracias! Me alegra que le guste. Ahora voy a enfocarme en el módulo CRM que será el corazón del sistema.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '43 days' + INTERVAL '30 minutes'),
(test_client_id, test_project_id, 'Genial. ¿Cuánto tiempo estimas para tener el CRM básico funcionando?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '35 days'),
(test_client_id, test_project_id, 'Aproximadamente 3 semanas. Incluirá gestión completa de contactos, seguimiento de oportunidades y pipeline de ventas.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '35 days' + INTERVAL '45 minutes'),
(test_client_id, test_project_id, 'Perfecto. También me gustaría que incluyera reportes básicos de ventas.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '34 days'),
(test_client_id, test_project_id, 'Claro, los reportes van incluidos. Métricas de conversión, pipeline, y progreso mensual.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '34 days' + INTERVAL '1 hour'),
(test_client_id, test_project_id, 'El módulo CRM está funcionando de maravilla! 📊 Los reportes son exactamente lo que necesitábamos.', 'client', true, CURRENT_TIMESTAMP - INTERVAL '20 days'),
(test_client_id, test_project_id, 'Excelente! Ahora vamos con la facturación automática. Será un gran diferenciador para su empresa.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '20 minutes'),
(test_client_id, test_project_id, '¿El sistema de facturación se integra con el CRM automáticamente?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '15 days'),
(test_client_id, test_project_id, 'Sí, completamente integrado. Cuando una oportunidad se cierra como ganada, puede generar factura automáticamente.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '15 days' + INTERVAL '40 minutes'),
(test_client_id, test_project_id, '¡Esto va a revolucionar nuestro proceso! ¿Cuándo podemos hacer el go-live?', 'client', true, CURRENT_TIMESTAMP - INTERVAL '8 days'),
(test_client_id, test_project_id, 'En una semana máximo. Solo queda testing final y migración de datos. Ya preparé el plan de deploy.', 'freelancer', true, CURRENT_TIMESTAMP - INTERVAL '8 days' + INTERVAL '1 hour');

RAISE NOTICE 'Creados 16 mensajes de conversación profesional';

-- Resumen final con estadísticas
RAISE NOTICE '===============================================';
RAISE NOTICE '=== DATOS DE PRUEBA CREADOS EXITOSAMENTE ===';
RAISE NOTICE '===============================================';
RAISE NOTICE 'User ID: %', test_user_id;
RAISE NOTICE 'Cliente: Innovatech Digital (ID: %)', test_client_id;
RAISE NOTICE 'Proyecto: SaaS de Gestión Empresarial (ID: %)', test_project_id;
RAISE NOTICE '-----------------------------------------------';
RAISE NOTICE '📅 Eventos calendario: 40 (≈280 horas trabajadas)';
RAISE NOTICE '✅ Tareas completadas: 12';
RAISE NOTICE '💰 Presupuestos: 4 (€53,000 total)';
RAISE NOTICE '🧾 Facturas: 4 (€49,500 total, €45,000 cobrado)';
RAISE NOTICE '💬 Mensajes con cliente: 16';
RAISE NOTICE '-----------------------------------------------';
RAISE NOTICE '⚡ Productividad promedio: 9-10/10';
RAISE NOTICE '💶 Tarifa por hora: €75';
RAISE NOTICE '📈 Proyecto: SaaS empresarial (3 meses)';
RAISE NOTICE '===============================================';

END $$;
