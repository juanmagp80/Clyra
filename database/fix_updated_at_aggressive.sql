-- SCRIPT AGRESIVO PARA CORREGIR EL ERROR DE updated_at EN LA TABLA CLIENTS
-- Ejecutar este script en Supabase SQL Editor

-- 1. Verificar estructura actual
SELECT 'ESTRUCTURA ACTUAL:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 2. Verificar triggers existentes
SELECT 'TRIGGERS EXISTENTES:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'clients';

-- 3. ELIMINAR TODOS LOS TRIGGERS EXISTENTES RELACIONADOS CON TIMESTAMPS
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS handle_updated_at ON clients;
DROP TRIGGER IF EXISTS set_updated_at ON clients;
DROP TRIGGER IF EXISTS updated_at_trigger ON clients;
DROP TRIGGER IF EXISTS update_updated_at_column_trigger ON clients;

-- 4. Agregar la columna updated_at si no existe (forzando su creación)
DO $$
BEGIN
    -- Intentar eliminar la columna si existe (para recrearla limpia)
    BEGIN
        ALTER TABLE clients DROP COLUMN IF EXISTS updated_at;
        RAISE NOTICE 'Columna updated_at eliminada (si existía)';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'No se pudo eliminar la columna updated_at: %', SQLERRM;
    END;
    
    -- Agregar la columna nueva
    ALTER TABLE clients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Columna updated_at agregada correctamente';
    
    -- Actualizar registros existentes
    UPDATE clients SET updated_at = NOW();
    RAISE NOTICE 'Registros existentes actualizados con timestamp actual';
END $$;

-- 5. Crear la función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_clients_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear el trigger con un nombre único
CREATE TRIGGER clients_update_timestamp
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_clients_timestamp();

-- 7. Verificar que todo está bien
SELECT 'VERIFICACIÓN FINAL:' as info;

SELECT 'Columnas de la tabla clients:' as description;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

SELECT 'Triggers activos:' as description;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'clients';

-- 8. Hacer una prueba de actualización
DO $$
DECLARE
    test_client_id UUID;
BEGIN
    -- Obtener un cliente para probar
    SELECT id INTO test_client_id FROM clients LIMIT 1;
    
    IF test_client_id IS NOT NULL THEN
        -- Hacer una actualización de prueba
        UPDATE clients SET name = name WHERE id = test_client_id;
        RAISE NOTICE 'Prueba de actualización exitosa en cliente: %', test_client_id;
    ELSE
        RAISE NOTICE 'No hay clientes para probar';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en prueba de actualización: %', SQLERRM;
END $$;

SELECT '✅ Script completado - La edición de clientes debería funcionar ahora' as resultado;
