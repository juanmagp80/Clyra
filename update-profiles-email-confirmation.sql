-- Agregar columna email_confirmed_at a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMP WITH TIME ZONE NULL;

-- Crear índice para mejor rendimiento en consultas de usuarios confirmados
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed_at ON profiles(email_confirmed_at);

-- Comentario para documentación
COMMENT ON COLUMN profiles.email_confirmed_at IS 'Fecha y hora cuando el usuario confirmó su email (NULL si no confirmado)';

-- Función auxiliar para verificar si un usuario está confirmado
CREATE OR REPLACE FUNCTION is_user_email_confirmed(user_uuid UUID)
RETURNS boolean AS $$
DECLARE
    confirmed_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT email_confirmed_at INTO confirmed_at
    FROM profiles
    WHERE id = user_uuid;
    
    RETURN confirmed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Vista para usuarios confirmados (opcional, para consultas más fáciles)
CREATE OR REPLACE VIEW confirmed_users AS
SELECT p.*, 
       CASE WHEN p.email_confirmed_at IS NOT NULL THEN true ELSE false END as is_confirmed
FROM profiles p
WHERE p.email_confirmed_at IS NOT NULL;

-- Comentario para la vista
COMMENT ON VIEW confirmed_users IS 'Vista de usuarios que han confirmado su email';