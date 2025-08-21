-- SCRIPT PARA CORREGIR POLÍTICAS RLS DE LA TABLA CLIENTS
-- Ejecutar este script en Supabase SQL Editor

-- 1. Verificar que RLS esté habilitado en la tabla clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage their clients" ON clients;

-- 3. Crear políticas nuevas y más permisivas para usuarios autenticados

-- Política para SELECT (ver clientes propios)
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT (crear nuevos clientes)
CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (actualizar clientes propios)
CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE (eliminar clientes propios)
CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Verificar que la tabla clients tenga la estructura correcta
-- Si la columna user_id no existe, crearla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX idx_clients_user_id ON clients(user_id);
    END IF;
END $$;

-- 5. Si hay clientes sin user_id, asignarles un user_id temporal
-- (Solo ejecutar si tienes clientes existentes sin user_id)
/*
UPDATE clients 
SET user_id = (SELECT id FROM auth.users LIMIT 1) 
WHERE user_id IS NULL;
*/

-- 6. Verificar las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'clients';

SELECT 'Políticas RLS para clients configuradas correctamente! ✅' as resultado;
