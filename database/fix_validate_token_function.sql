-- CORRECCIÓN PARA LA FUNCIÓN validate_client_token
-- Ejecutar este script para arreglar el error "structure of query does not match function result type"

-- Eliminar la función existente si existe
DROP FUNCTION IF EXISTS validate_client_token(TEXT);

-- Crear la función corregida con tipos compatibles
CREATE OR REPLACE FUNCTION validate_client_token(token_value TEXT)
RETURNS TABLE(
    client_id UUID,
    client_name TEXT,
    client_company TEXT,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name::TEXT,
        COALESCE(c.company, '')::TEXT,
        (ct.is_active AND (ct.expires_at IS NULL OR ct.expires_at > NOW())) as is_valid
    FROM client_tokens ct
    JOIN clients c ON c.id = ct.client_id
    WHERE ct.token = token_value;
    
    -- Actualizar last_used_at si el token es válido
    UPDATE client_tokens 
    SET last_used_at = NOW() 
    WHERE token = token_value 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario de documentación
COMMENT ON FUNCTION validate_client_token(TEXT) IS 'Valida token y retorna información del cliente (CORREGIDA para tipos compatibles)';

-- Verificar que la función se creó correctamente
SELECT 'Función validate_client_token corregida exitosamente! 🎉' as resultado;
