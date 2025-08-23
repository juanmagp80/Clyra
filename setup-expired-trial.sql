-- Agregar columna trial_start_date si no existe
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ DEFAULT NOW();

-- Configurar trial expirado para amazonjgp80@gmail.com
UPDATE profiles 
SET 
  subscription_status = 'cancelled',
  subscription_plan = 'free',
  trial_start_date = NOW() - INTERVAL '15 days',
  stripe_subscription_id = NULL,
  stripe_customer_id = NULL,
  updated_at = NOW()
WHERE email = 'amazonjgp80@gmail.com';

-- Verificar el resultado
SELECT 
  email,
  subscription_status,
  subscription_plan,
  trial_start_date,
  EXTRACT(DAY FROM (NOW() - trial_start_date)) as trial_days_elapsed,
  CASE 
    WHEN EXTRACT(DAY FROM (NOW() - trial_start_date)) > 14 THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as trial_status
FROM profiles 
WHERE email = 'amazonjgp80@gmail.com';
