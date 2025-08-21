-- SCRIPT PARA CORREGIR EL ERROR DE updated_at EN LA TABLA CLIENTS
-- Ejecutar este script en Supabase SQL Editor

-- 1. Verificar si existe la columna updated_at
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'updated_at';

-- 2. Agregar la columna updated_at si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE clients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Actualizar registros existentes con la fecha actual
        UPDATE clients SET updated_at = NOW() WHERE updated_at IS NULL;
        
        RAISE NOTICE 'Columna updated_at agregada correctamente';
    ELSE
        RAISE NOTICE 'Columna updated_at ya existe';
    END IF;
END $$;

-- 3. Crear o reemplazar la función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Eliminar trigger existente si existe y crear uno nuevo
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar que el trigger se creó correctamente
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'clients'
ORDER BY trigger_name;

-- 6. Verificar la estructura final de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 7. Hacer una prueba de actualización (opcional - descomenta si quieres probar)
-- UPDATE clients SET name = name WHERE id = (SELECT id FROM clients LIMIT 1);

SELECT 'Columna updated_at y trigger configurados correctamente! ✅' as resultado;
SELECT 'Ahora la edición de clientes debería funcionar sin errores' as info;
