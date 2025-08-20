-- Crear suscripción de prueba manual
-- IMPORTANTE: Reemplaza 'TU_EMAIL_AQUÍ' por tu email real de usuario

INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  price_id,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
SELECT 
  id as user_id,
  'cus_test_customer' as stripe_customer_id,
  'sub_test_subscription' as stripe_subscription_id,
  'active' as status,
  'price_test_12eur' as price_id,
  NOW() as current_period_start,
  NOW() + INTERVAL '1 month' as current_period_end,
  false as cancel_at_period_end
FROM auth.users 
WHERE email = 'TU_EMAIL_AQUÍ'  -- CAMBIA ESTO POR TU EMAIL REAL
LIMIT 1;

-- Verificar que se creó correctamente
SELECT * FROM subscriptions;
