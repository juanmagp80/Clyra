-- VERIFICAR QUE LOS DATOS SE GUARDARON CORRECTAMENTE
-- Ejecutar en el SQL Editor de Supabase

-- Ver todos los registros de company_settings
SELECT 
    id,
    user_id,
    company_name,
    nif,
    address,
    postal_code,
    city,
    province,
    country,
    phone,
    email,
    website,
    registration_number,
    social_capital,
    created_at,
    updated_at
FROM public.company_settings
ORDER BY updated_at DESC;

-- Ver solo los datos más recientes (último registro)
SELECT 
    company_name,
    nif,
    city,
    province,
    updated_at
FROM public.company_settings
ORDER BY updated_at DESC
LIMIT 1;
