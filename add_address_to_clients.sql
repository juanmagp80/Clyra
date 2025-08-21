-- Script para añadir el campo 'address' a la tabla clients
-- Ejecutar en Supabase SQL Editor

-- Añadir la columna address a la tabla clients
ALTER TABLE clients 
ADD COLUMN address TEXT;

-- Añadir comentario a la columna
COMMENT ON COLUMN clients.address IS 'Dirección física del cliente';

-- Verificar que la columna se ha añadido correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Campo "address" añadido correctamente a la tabla clients';
    RAISE NOTICE 'Ahora puedes actualizar los formularios para incluir la dirección';
END $$;
