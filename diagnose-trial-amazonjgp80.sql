-- Diagnóstico del sistema de trial para amazonjgp80@gmail.com

-- 1. Verificar si el usuario existe en auth.users
SELECT 
    'Usuario en auth.users' as check_type,
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'amazonjgp80@gmail.com';

-- 2. Verificar si existe perfil
SELECT 
    'Perfil existente' as check_type,
    id,
    email,
    subscription_status,
    subscription_plan,
    trial_started_at,
    trial_ends_at,
    EXTRACT(days FROM (trial_ends_at - NOW())) as days_remaining
FROM profiles 
WHERE email = 'amazonjgp80@gmail.com';

-- 3. Verificar uso del usuario
SELECT 
    'Uso del usuario' as check_type,
    user_id,
    clients_count,
    projects_count,
    storage_used_mb,
    emails_sent_month
FROM user_usage 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'amazonjgp80@gmail.com');

-- 4. Verificar actividades de trial
SELECT 
    'Actividades de trial' as check_type,
    user_id,
    activity_type,
    activity_data,
    created_at
FROM trial_activities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'amazonjgp80@gmail.com')
ORDER BY created_at DESC;

-- 5. Verificar planes de suscripción
SELECT 
    'Planes disponibles' as check_type,
    name,
    max_clients,
    max_projects,
    max_storage_gb,
    price_monthly
FROM subscription_plans;

-- 6. Verificar suscripciones de Stripe
SELECT 
    'Suscripciones Stripe' as check_type,
    user_id,
    status,
    current_period_end
FROM subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'amazonjgp80@gmail.com');

-- 7. Diagnóstico manual del estado
SELECT 
    'Estado calculado' as check_type,
    p.subscription_status,
    p.subscription_plan,
    p.trial_started_at,
    p.trial_ends_at,
    EXTRACT(days FROM (p.trial_ends_at - NOW()))::INTEGER as days_remaining,
    (p.subscription_status = 'trial' AND EXTRACT(days FROM (p.trial_ends_at - NOW())) <= 0) as is_expired,
    (p.subscription_status = 'active' OR (p.subscription_status = 'trial' AND EXTRACT(days FROM (p.trial_ends_at - NOW())) > 0)) as can_use_features
FROM profiles p
WHERE p.email = 'amazonjgp80@gmail.com';
