-- SCRIPT SIMPLE PARA VERIFICAR ESTRUCTURA DE time_tracking_sessions

-- 1. Ver si existe la tabla
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'time_tracking_sessions'
) as table_exists;

-- 2. Ver todas las columnas de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'time_tracking_sessions' 
ORDER BY ordinal_position;

-- 3. Ver si hay datos existentes
SELECT COUNT(*) as existing_records 
FROM time_tracking_sessions;

-- 4. Ver estructura de ejemplo (si hay datos)
SELECT *
FROM time_tracking_sessions
LIMIT 3;
