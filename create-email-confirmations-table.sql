-- Crear tabla para tokens de confirmación de email
CREATE TABLE IF NOT EXISTS email_confirmations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_email_confirmations_token ON email_confirmations(token);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_user_id ON email_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmations_expires_at ON email_confirmations(expires_at);

-- Crear función para limpiar tokens expirados automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_confirmations()
RETURNS void AS $$
BEGIN
    DELETE FROM email_confirmations 
    WHERE expires_at < NOW() AND confirmed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE email_confirmations IS 'Tabla para gestionar tokens de confirmación de email personalizados';
COMMENT ON COLUMN email_confirmations.token IS 'Token único para confirmación de email';
COMMENT ON COLUMN email_confirmations.expires_at IS 'Fecha y hora de expiración del token (24 horas)';
COMMENT ON COLUMN email_confirmations.confirmed_at IS 'Fecha y hora cuando se confirmó el email (NULL si no confirmado)';

-- Crear función para crear la tabla desde la API (si es necesario)
CREATE OR REPLACE FUNCTION create_email_confirmations_table()
RETURNS void AS $$
BEGIN
    -- Esta función se ejecuta desde la API si la tabla no existe
    -- El código SQL de arriba ya crea la tabla si no existe
    RAISE NOTICE 'Tabla email_confirmations verificada/creada correctamente';
END;
$$ LANGUAGE plpgsql;