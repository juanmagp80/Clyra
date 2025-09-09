-- Verificar usuarios existentes y sus datos
-- Ejecuta esto primero para identificar tu user_id correcto

-- 1. Ver todos los usuarios en auth.users
SELECT 
    id,
    email,
    created_at,
    'auth.users' as tabla
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Ver todos los perfiles
SELECT 
    id,
    email,
    full_name,
    created_at,
    'profiles' as tabla
FROM profiles 
ORDER BY created_at DESC;

-- 3. Ver si ya tienes datos existentes
SELECT 
    'calendar_events' as tabla,
    user_id,
    COUNT(*) as cantidad
FROM calendar_events 
GROUP BY user_id
UNION ALL
SELECT 
    'tasks' as tabla,
    user_id,
    COUNT(*)
FROM tasks 
GROUP BY user_id
UNION ALL
SELECT 
    'clients' as tabla,
    user_id,
    COUNT(*)
FROM clients 
GROUP BY user_id
ORDER BY tabla, user_id;

-- 4. Obtener tu user_id actual (el que está logueado)
SELECT auth.uid() as current_user_id;
