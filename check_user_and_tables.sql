-- Script para obtener tu User ID y preparar los datos

-- ==============================
-- PASO 1: OBTENER TU USER_ID
-- ==============================

-- Ejecuta esta consulta con tu email para obtener tu user_id
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'tu_email@ejemplo.com';  -- REEMPLAZA CON TU EMAIL

-- Copia el user_id que te devuelva la consulta anterior

-- ==============================
-- PASO 2: VERIFICAR TABLAS EXISTENTES
-- ==============================

-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'projects', 'invoices', 'time_entries')
ORDER BY table_name;

-- ==============================
-- PASO 3: VER ESTRUCTURA DE TABLAS
-- ==============================

-- Ver columnas de la tabla clients
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver columnas de la tabla projects
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver columnas de la tabla invoices
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'invoices' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==============================
-- PASO 4: LIMPIAR DATOS ANTERIORES (OPCIONAL)
-- ==============================

-- CUIDADO: Esto borrará todos tus datos existentes
-- Descomenta solo si quieres empezar desde cero

-- DELETE FROM invoices WHERE user_id = 'TU_USER_ID_AQUI';
-- DELETE FROM projects WHERE user_id = 'TU_USER_ID_AQUI';
-- DELETE FROM clients WHERE user_id = 'TU_USER_ID_AQUI';

-- ==============================
-- PASO 5: CONTAR DATOS ACTUALES
-- ==============================

-- Ver cuántos datos tienes actualmente
SELECT 
    'Clientes' as tipo,
    COUNT(*) as cantidad
FROM clients 
WHERE user_id = 'TU_USER_ID_AQUI'  -- REEMPLAZA CON TU USER_ID

UNION ALL

SELECT 
    'Proyectos' as tipo,
    COUNT(*) as cantidad
FROM projects 
WHERE user_id = 'TU_USER_ID_AQUI'  -- REEMPLAZA CON TU USER_ID

UNION ALL

SELECT 
    'Facturas' as tipo,
    COUNT(*) as cantidad
FROM invoices 
WHERE user_id = 'TU_USER_ID_AQUI'; -- REEMPLAZA CON TU USER_ID
