-- Actualizar función para incluir información del freelancer
CREATE OR REPLACE FUNCTION validate_client_token(token_value TEXT)
RETURNS TABLE(
    client_id UUID,
    client_name TEXT,
    client_company TEXT,
    freelancer_id UUID,
    freelancer_email TEXT,
    freelancer_name TEXT,
    freelancer_company TEXT,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name::TEXT,
        COALESCE(c.company, '')::TEXT,
        c.user_id,
        COALESCE(p.email, '')::TEXT,
        COALESCE(p.full_name, p.email, 'Freelancer')::TEXT,
        COALESCE(p.company_name, p.business_name, '')::TEXT,
        (ct.is_active AND (ct.expires_at IS NULL OR ct.expires_at > NOW())) as is_valid
    FROM client_tokens ct
    JOIN clients c ON c.id = ct.client_id
    LEFT JOIN profiles p ON p.id = c.user_id
    WHERE ct.token = token_value;
    
    -- Actualizar last_used_at si el token es válido
    UPDATE client_tokens 
    SET last_used_at = NOW() 
    WHERE token = token_value 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
