-- INSERTAR/ACTUALIZAR DATOS REALES DE TU EMPRESA
-- Ejecutar en el SQL Editor de Supabase

-- PASO 1: Ver tu user_id actual
SELECT id, email FROM auth.users WHERE email = 'juangpdev@gmail.com';

-- PASO 2: Ver qué datos tienes actualmente
SELECT * FROM public.company_settings WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

-- PASO 3: ACTUALIZAR con TUS DATOS REALES
-- IMPORTANTE: Cambia estos datos por los de tu empresa real

UPDATE public.company_settings 
SET 
    company_name = 'TU_EMPRESA_REAL',           -- Ej: 'Juan García Desarrollo Web S.L.'
    nif = 'TU_NIF_REAL',                       -- Ej: 'B12345678' 
    address = 'TU_DIRECCION_REAL',             -- Ej: 'Calle Real, 123'
    postal_code = 'TU_CODIGO_POSTAL',          -- Ej: '28001'
    city = 'TU_CIUDAD',                        -- Ej: 'Madrid'
    province = 'TU_PROVINCIA',                 -- Ej: 'Madrid'
    country = 'España',
    phone = 'TU_TELEFONO',                     -- Ej: '+34 600 123 456'
    email = 'TU_EMAIL_EMPRESA',                -- Ej: 'contacto@tuempresa.com'
    website = 'TU_WEBSITE',                    -- Ej: 'https://www.tuempresa.com'
    registration_number = 'TU_NUMERO_REGISTRO',-- Ej: 'M-123456'
    social_capital = 3000.00,                  -- Tu capital social
    updated_at = NOW()
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

-- PASO 4: Verificar que se actualizó correctamente
SELECT 
    company_name,
    nif,
    city,
    province,
    email,
    phone
FROM public.company_settings 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

-- ALTERNATIVA: Si prefieres insertar desde cero (borra y crea nuevo)
/*
DELETE FROM public.company_settings WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

INSERT INTO public.company_settings (
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
) VALUES (
    'e7ed7c8d-229a-42d1-8a44-37bcc64c440c',
    'TU_EMPRESA_REAL',           -- Cambia esto
    'TU_NIF_REAL',               -- Cambia esto
    'TU_DIRECCION_REAL',         -- Cambia esto
    'TU_CODIGO_POSTAL',          -- Cambia esto
    'TU_CIUDAD',                 -- Cambia esto
    'TU_PROVINCIA',              -- Cambia esto
    'España',
    'TU_TELEFONO',               -- Cambia esto
    'TU_EMAIL_EMPRESA',          -- Cambia esto
    'TU_WEBSITE',                -- Cambia esto
    'TU_NUMERO_REGISTRO',        -- Cambia esto
    3000.00,
    NOW(),
    NOW()
);
*/
