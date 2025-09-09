-- SCRIPT PARA IDENTIFICAR TU USER_ID REAL
-- Ejecuta este PRIMERO para obtener tu user_id correcto

-- 1. Verificar usuarios en auth.users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verificar si hay datos en otras tablas que usen user_id
SELECT DISTINCT user_id 
FROM calendar_events 
WHERE user_id IS NOT NULL
LIMIT 5;

-- 3. Verificar si hay datos en budgets
SELECT DISTINCT client_id as user_id
FROM budgets 
WHERE client_id IS NOT NULL
LIMIT 5;

-- 4. Una vez que identifiques tu user_id real, 
-- reemplaza 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' en el archivo 
-- setup-time-tracking-complete.sql por tu user_id correcto
