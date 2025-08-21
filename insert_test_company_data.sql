-- INSERTAR DATOS DE EMPRESA DE PRUEBA
-- Ejecutar en el SQL Editor de Supabase

-- OPCIÓN A: Si auth.uid() funciona (poco probable en SQL Editor)
-- SELECT auth.uid() as my_user_id;

-- OPCIÓN B: Buscar tu user_id manualmente
-- Ve a Authentication → Users en tu panel de Supabase y copia tu UUID

-- PASO 1: Ver todos los usuarios (para encontrar tu UUID)
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- PASO 2: Insertar datos de empresa de prueba
-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con tu UUID real de la consulta anterior

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
    'TU_USER_ID_AQUI', -- REEMPLAZAR CON TU UUID REAL
    'EJEMPLO EMPRESA S.L.',
    'B12345678',
    'Calle Ejemplo, 123',
    '28001',
    'Madrid',
    'Madrid',
    'España',
    '+34 912 345 678',
    'contacto@ejemplo.com',
    'https://www.ejemplo.com',
    'M-123456',
    3000.00,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    company_name = EXCLUDED.company_name,
    nif = EXCLUDED.nif,
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    country = EXCLUDED.country,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    website = EXCLUDED.website,
    registration_number = EXCLUDED.registration_number,
    social_capital = EXCLUDED.social_capital,
    updated_at = NOW();

-- PASO 3: Verificar que se insertó correctamente
-- Reemplaza 'TU_USER_ID_AQUI' con el mismo UUID que usaste arriba
SELECT 
    company_name,
    nif,
    city,
    province
FROM public.company_settings 
WHERE user_id = 'TU_USER_ID_AQUI';

-- OPCIONAL: Si quieres borrar los datos de prueba después
-- DELETE FROM public.company_settings WHERE user_id = 'TU_USER_ID_AQUI';
