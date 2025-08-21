-- Script SQL para insertar datos de prueba reales en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Insertar perfil de usuario de prueba
INSERT INTO profiles (
    id,
    email,
    subscription_status,
    subscription_plan,
    trial_started_at,
    trial_ends_at,
    subscription_current_period_end,
    cancel_at_period_end,
    stripe_subscription_id,
    stripe_customer_id,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'amazonjgp80@gmail.com',
    'active',
    'pro',
    '2025-08-01T00:00:00Z',
    NULL,
    '2025-09-21T00:00:00Z', -- 30 días desde hoy
    true, -- Suscripción cancelada pero activa hasta el final del período
    'sub_test_1234567890',
    'cus_test_1234567890',
    '2025-08-01T00:00:00Z',
    '2025-08-21T00:00:00Z'
) ON CONFLICT (id) DO UPDATE SET
    subscription_status = EXCLUDED.subscription_status,
    subscription_plan = EXCLUDED.subscription_plan,
    subscription_current_period_end = EXCLUDED.subscription_current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    updated_at = EXCLUDED.updated_at;

-- 2. Insertar datos de uso del usuario
INSERT INTO user_usage (
    user_id,
    clients_count,
    projects_count,
    storage_used_gb,
    emails_sent_month,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    5,
    12,
    0,
    23,
    '2025-08-01T00:00:00Z',
    '2025-08-21T00:00:00Z'
) ON CONFLICT (user_id) DO UPDATE SET
    clients_count = EXCLUDED.clients_count,
    projects_count = EXCLUDED.projects_count,
    storage_used_gb = EXCLUDED.storage_used_gb,
    emails_sent_month = EXCLUDED.emails_sent_month,
    updated_at = EXCLUDED.updated_at;

-- 3. Verificar que los datos se insertaron correctamente
SELECT 
    'Perfil creado' as tabla,
    id,
    email,
    subscription_status,
    subscription_plan,
    cancel_at_period_end,
    subscription_current_period_end
FROM profiles 
WHERE email = 'amazonjgp80@gmail.com';

SELECT 
    'Uso creado' as tabla,
    user_id,
    clients_count,
    projects_count,
    storage_used_gb,
    emails_sent_month
FROM user_usage 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
