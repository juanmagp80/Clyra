-- DIAGNÓSTICO DE DATOS DEL USUARIO
-- Ejecutar en el SQL Editor de Supabase

-- PASO 1: Ver todos los usuarios registrados
SELECT 
    id, 
    email, 
    created_at,
    last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC LIMIT 10;

-- PASO 2: Ver si hay datos de empresa configurados
SELECT 
    user_id,
    company_name,
    nif,
    city,
    province,
    created_at
FROM public.company_settings 
ORDER BY created_at DESC;

-- PASO 3: Ver estructura y datos de la tabla clients
-- Primero verificar si la tabla existe y su estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 4: Ver todos los clientes (con límite para no saturar)
SELECT 
    id,
    user_id,
    name,
    company,
    email,
    nif,
    city,
    created_at
FROM public.clients 
ORDER BY created_at DESC 
LIMIT 30;

-- PASO 5: Contar clientes por usuario
SELECT 
    user_id,
    COUNT(*) as total_clients
FROM public.clients 
GROUP BY user_id
ORDER BY total_clients DESC;

-- PASO 6: Ver RLS (Row Level Security) en las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'company_settings');

-- PASO 7: Ver políticas RLS activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'company_settings');
