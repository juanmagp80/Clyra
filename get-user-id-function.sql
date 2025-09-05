-- Función para obtener user ID por email
-- Ejecutar en Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = user_email 
    LIMIT 1;
    
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
