-- Agregar columnas de Stripe a la tabla profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- Verificar las columnas existentes
\d profiles;
