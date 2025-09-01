-- SQL para hacer las automatizaciones visibles para todos los usuarios
-- Basado en la estructura real de la tabla (user_id, is_public)

-- 1. Eliminar las políticas existentes que pueden estar bloqueando
DROP POLICY IF EXISTS "Users can only access their own automations" ON automations;
DROP POLICY IF EXISTS "Users can create automations" ON automations;
DROP POLICY IF EXISTS "Users can update their own automations" ON automations;
DROP POLICY IF EXISTS "Users can delete their own automations" ON automations;

-- 2. Crear una nueva política que permita a TODOS los usuarios autenticados leer todas las automatizaciones
CREATE POLICY "All users can read all automations"
    ON automations
    FOR SELECT
    TO authenticated
    USING (true);

-- 3. Política para crear automatizaciones (solo usuarios autenticados)
CREATE POLICY "Authenticated users can create automations"
    ON automations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 4. Política para actualizar (solo el creador)
CREATE POLICY "Users can update their own automations"
    ON automations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Política para eliminar (solo el creador)
CREATE POLICY "Users can delete their own automations"
    ON automations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Verificar que RLS esté habilitado
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
