-- SCRIPT PARA VERIFICAR QUE TODO ESTÉ CONFIGURADO CORRECTAMENTE

-- 1. Verificar que existan las tablas necesarias
SELECT 
    'clients' as tabla,
    COUNT(*) as registros
FROM clients
UNION ALL
SELECT 
    'client_tokens' as tabla,
    COUNT(*) as registros
FROM client_tokens
UNION ALL
SELECT 
    'client_messages' as tabla,
    COUNT(*) as registros
FROM client_messages;

-- 2. Verificar que la función existe
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'validate_client_token';

-- 3. Mostrar tokens existentes (sin mostrar el token completo por seguridad)
SELECT 
    ct.id,
    LEFT(ct.token, 8) || '...' as token_preview,
    c.name as client_name,
    ct.is_active,
    ct.created_at
FROM client_tokens ct
JOIN clients c ON c.id = ct.client_id
ORDER BY ct.created_at DESC
LIMIT 5;
