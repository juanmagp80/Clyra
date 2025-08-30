-- SQL para agregar las columnas necesarias a la tabla user_notifications
-- Ejecutar en Supabase SQL Editor

-- Verificar estructura actual de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
ORDER BY ordinal_position;

-- Agregar las columnas necesarias si no existen
DO $$ 
BEGIN
    -- Agregar columna route si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'route'
    ) THEN
        ALTER TABLE user_notifications 
        ADD COLUMN route TEXT DEFAULT NULL;
        RAISE NOTICE 'Columna route agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna route ya existe';
    END IF;

    -- Agregar columna action_data si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'action_data'
    ) THEN
        ALTER TABLE user_notifications 
        ADD COLUMN action_data JSONB DEFAULT NULL;
        RAISE NOTICE 'Columna action_data agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna action_data ya existe';
    END IF;

    -- Verificar si existe la columna type (debe ser un enum)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_notifications' 
        AND column_name = 'type'
    ) THEN
        -- Crear tipo enum si no existe
        DO $inner$ 
        BEGIN
            CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');
        EXCEPTION 
            WHEN duplicate_object THEN 
                RAISE NOTICE 'El tipo notification_type ya existe';
        END $inner$;
        
        ALTER TABLE user_notifications 
        ADD COLUMN type notification_type DEFAULT 'info';
        RAISE NOTICE 'Columna type agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna type ya existe';
    END IF;
END $$;

-- Verificar estructura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_notifications' 
ORDER BY ordinal_position;

-- Mostrar algunas notificaciones existentes para verificar
SELECT 
    id, 
    title, 
    message, 
    type, 
    route,
    action_data,
    created_at
FROM user_notifications 
ORDER BY created_at DESC 
LIMIT 5;
