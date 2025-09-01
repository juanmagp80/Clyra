-- SQL para hacer las automatizaciones globales visibles para todos los usuarios

-- 1. Primero eliminamos las políticas restrictivas existentes
DROP POLICY IF EXISTS "Users can view their own automations" ON automations;

-- 2. Creamos una nueva política que permita a TODOS los usuarios autenticados leer las automatizaciones
CREATE POLICY "All authenticated users can view automations"
    ON automations FOR SELECT
    USING (auth.role() = 'authenticated');

-- 3. Política para crear automatizaciones (solo para admin o usuarios específicos)
DROP POLICY IF EXISTS "Users can create their own automations" ON automations;
CREATE POLICY "Users can create automations"
    ON automations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Política para actualizar (solo el creador original)
DROP POLICY IF EXISTS "Users can update their own automations" ON automations;
CREATE POLICY "Users can update their own automations"
    ON automations FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Política para eliminar (solo el creador original)
DROP POLICY IF EXISTS "Users can delete their own automations" ON automations;
CREATE POLICY "Users can delete their own automations"
    ON automations FOR DELETE
    USING (auth.uid() = user_id);

-- Verificar que RLS esté habilitado
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
