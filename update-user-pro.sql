-- Script SQL para actualizar directamente el usuario a PRO activo
UPDATE profiles 
SET 
    subscription_status = 'active',
    subscription_plan = 'pro',
    stripe_customer_id = 'cus_SuTaFBCVBNnSvX',
    stripe_subscription_id = 'sub_1RyeIGHFKglWYpZiq7qVU3rk',
    updated_at = NOW()
WHERE email = 'amazonjgp80@gmail.com';

-- Verificar que se actualizó correctamente
SELECT 
    email,
    subscription_status,
    subscription_plan,
    stripe_customer_id,
    stripe_subscription_id,
    updated_at
FROM profiles 
WHERE email = 'amazonjgp80@gmail.com';
