-- SCRIPT DE DEPURACIÓN PARA VERIFICAR CLIENTES
-- Ejecutar en Supabase SQL Editor para diagnosticar problemas

-- 1. Verificar estructura de la tabla clients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS activas
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'clients'
ORDER BY policyname;

-- 3. Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'clients';

-- 4. Contar clientes por usuario
SELECT 
    user_id,
    COUNT(*) as total_clients,
    array_agg(name) as client_names
FROM clients 
GROUP BY user_id;

-- 5. Verificar usuarios existentes
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at;

-- 6. Verificar clientes con user_id nulo (no debería haber ninguno)
SELECT id, name, user_id 
FROM clients 
WHERE user_id IS NULL;

-- 7. Verificar un cliente específico (cambiar el ID)
-- SELECT * FROM clients WHERE id = 'ID_DEL_CLIENTE_QUE_NO_SE_PUEDE_EDITAR';

-- 8. Probar permisos de actualización con el usuario actual
-- SELECT auth.uid() as current_user_id;

SELECT 'Verificación completada. Revisa los resultados arriba.' as status;
