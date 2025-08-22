-- Verificar el estado actual del usuario amazonjgp80@gmail.com
SELECT 
    id,
    email,
    subscription_status,
    subscription_plan,
    stripe_customer_id,
    stripe_subscription_id,
    trial_ends_at,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'amazonjgp80@gmail.com';

-- Verificar actividades recientes
SELECT 
    activity_type,
    activity_data,
    created_at
FROM trial_activities 
WHERE user_id = (
    SELECT id FROM profiles WHERE email = 'amazonjgp80@gmail.com'
)
ORDER BY created_at DESC
LIMIT 10;
