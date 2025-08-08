-- Script para crear datos de prueba para las automatizaciones
-- Ejecutar en Supabase SQL Editor

-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con tu ID de usuario real
-- Puedes obtenerlo ejecutando: SELECT auth.uid(); en una consulta separada
-- O desde la consola del navegador: supabase.auth.getUser()

-- Obtener tu user_id (ejecuta esta línea primero para ver tu ID)
SELECT auth.uid() as mi_user_id;

-- Si auth.uid() devuelve null, usa tu user_id directamente
-- Reemplaza este valor con tu user_id real:
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Intenta obtener el user_id del contexto de autenticación
    SELECT auth.uid() INTO current_user_id;
    
    -- Si es null, necesitas ejecutar este script desde la aplicación
    -- o reemplazar current_user_id con tu ID de usuario
    IF current_user_id IS NULL THEN
        RAISE NOTICE 'auth.uid() es null. Ejecuta desde la aplicación o reemplaza con tu user_id';
        RETURN;
    END IF;

    -- 1. CLIENTES DE PRUEBA
    INSERT INTO clients (user_id, name, email, phone, company, created_at, updated_at) VALUES
    (current_user_id, 'María García', 'maria.garcia@empresa.com', '+34 666 111 222', 'García Consulting', NOW(), NOW()),
    (current_user_id, 'Carlos López', 'carlos.lopez@startup.io', '+34 677 333 444', 'StartupTech SL', NOW(), NOW()),
    (current_user_id, 'Ana Martínez', 'ana.martinez@corp.com', '+34 688 555 666', 'Corporate Solutions', NOW(), NOW()),
    (current_user_id, 'Pedro Sánchez', 'pedro.sanchez@pyme.es', '+34 699 777 888', 'PYME Digital', NOW() - INTERVAL '45 days', NOW()),
    (current_user_id, 'Laura Rodríguez', 'laura.rodriguez@innovate.com', '+34 655 999 000', 'Innovate Ltd', NOW() - INTERVAL '7 days', NOW());

    -- 2. PROYECTOS DE PRUEBA
    INSERT INTO projects (user_id, client_id, name, description, created_at, updated_at) VALUES
    (current_user_id, (SELECT id FROM clients WHERE email = 'maria.garcia@empresa.com' AND user_id = current_user_id LIMIT 1), 'Rediseño Web Corporativo', 'Renovación completa del sitio web corporativo con diseño responsive y CMS', NOW(), NOW()),
    (current_user_id, (SELECT id FROM clients WHERE email = 'carlos.lopez@startup.io' AND user_id = current_user_id LIMIT 1), 'App Móvil Startup', 'Desarrollo de aplicación móvil MVP para startup tecnológica', NOW(), NOW()),
    (current_user_id, (SELECT id FROM clients WHERE email = 'ana.martinez@corp.com' AND user_id = current_user_id LIMIT 1), 'Sistema CRM Custom', 'Desarrollo de sistema CRM personalizado para gestión de clientes', NOW(), NOW()),
    (current_user_id, (SELECT id FROM clients WHERE email = 'laura.rodriguez@innovate.com' AND user_id = current_user_id LIMIT 1), 'E-commerce Platform', 'Plataforma de e-commerce con pasarela de pagos integrada', NOW(), NOW());

    -- 3. FACTURAS DE PRUEBA
    INSERT INTO invoices (user_id, client_id, invoice_number, amount, due_date, created_at, updated_at) VALUES
    (current_user_id, (SELECT id FROM clients WHERE email = 'maria.garcia@empresa.com' AND user_id = current_user_id LIMIT 1), 'INV-2024-001', 5000.00, NOW() + INTERVAL '15 days', NOW(), NOW()),
    (current_user_id, (SELECT id FROM clients WHERE email = 'carlos.lopez@startup.io' AND user_id = current_user_id LIMIT 1), 'INV-2024-002', 8500.00, NOW() - INTERVAL '10 days', NOW(), NOW()),
    (current_user_id, (SELECT id FROM clients WHERE email = 'ana.martinez@corp.com' AND user_id = current_user_id LIMIT 1), 'INV-2024-003', 12000.00, NOW() - INTERVAL '10 days', NOW(), NOW()),
    (current_user_id, (SELECT id FROM clients WHERE email = 'laura.rodriguez@innovate.com' AND user_id = current_user_id LIMIT 1), 'INV-2024-004', 7500.00, NOW() - INTERVAL '20 days', NOW(), NOW());

    RAISE NOTICE 'Datos de prueba creados exitosamente para user_id: %', current_user_id;
END $$;

-- Mostrar resumen de datos creados
SELECT 
    'Clientes' as tipo, 
    COUNT(*) as cantidad 
FROM clients 
WHERE user_id = auth.uid()

UNION ALL

SELECT 
    'Proyectos' as tipo, 
    COUNT(*) as cantidad 
FROM projects 
WHERE user_id = auth.uid()

UNION ALL

SELECT 
    'Facturas' as tipo, 
    COUNT(*) as cantidad 
FROM invoices 
WHERE user_id = auth.uid();

-- Verificar que los datos se crearon correctamente
SELECT 'CLIENTES CREADOS:' as info;
SELECT name, email, company FROM clients WHERE user_id = auth.uid();

SELECT 'PROYECTOS CREADOS:' as info;
SELECT name, description FROM projects WHERE user_id = auth.uid();

SELECT 'FACTURAS CREADAS:' as info;
SELECT invoice_number, amount FROM invoices WHERE user_id = auth.uid();
