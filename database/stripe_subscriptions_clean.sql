-- ========================================
-- SCRIPT DE SUSCRIPCIONES DE STRIPE - VERSION LIMPIA
-- Ejecutar este SQL en Supabase SQL Editor
-- ========================================

-- Limpiar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow service role to insert subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow service role to update subscriptions" ON subscriptions;

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Habilitar RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Crear políticas nuevas
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow service role to insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role to update subscriptions" ON subscriptions
  FOR UPDATE USING (true);

-- Crear función para suscripción de prueba
CREATE OR REPLACE FUNCTION create_test_subscription(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  subscription_record RECORD;
BEGIN
  -- Buscar el usuario por email
  SELECT id, email INTO user_record
  FROM auth.users 
  WHERE email = user_email
  LIMIT 1;
  
  IF user_record.id IS NULL THEN
    RETURN json_build_object('error', 'Usuario no encontrado con email: ' || user_email);
  END IF;
  
  -- Eliminar suscripción existente para este usuario si existe
  DELETE FROM subscriptions WHERE user_id = user_record.id;
  
  -- Crear nueva suscripción
  INSERT INTO subscriptions (
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    status,
    price_id,
    current_period_start,
    current_period_end,
    cancel_at_period_end
  ) VALUES (
    user_record.id,
    'cus_test_manual',
    'sub_test_manual_' || extract(epoch from now())::bigint,
    'active',
    'price_test_12eur',
    NOW(),
    NOW() + INTERVAL '1 month',
    false
  )
  RETURNING * INTO subscription_record;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Suscripción de prueba creada exitosamente',
    'user_id', user_record.id,
    'user_email', user_record.email,
    'subscription_id', subscription_record.id,
    'subscription_status', subscription_record.status,
    'expires_at', subscription_record.current_period_end
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', 'Error al crear suscripción: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar suscripción
CREATE OR REPLACE FUNCTION check_user_subscription(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  result RECORD;
BEGIN
  SELECT 
    u.id as user_id,
    u.email,
    s.id as subscription_id,
    s.status,
    s.current_period_end,
    CASE 
      WHEN s.status = 'active' AND s.current_period_end > NOW() THEN true
      ELSE false
    END as is_active
  INTO result
  FROM auth.users u
  LEFT JOIN subscriptions s ON u.id = s.user_id
  WHERE u.email = user_email
  LIMIT 1;
  
  IF result.user_id IS NULL THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'user_id', result.user_id,
    'email', result.email,
    'has_subscription', CASE WHEN result.subscription_id IS NOT NULL THEN true ELSE false END,
    'subscription_status', COALESCE(result.status, 'none'),
    'subscription_active', COALESCE(result.is_active, false),
    'expires_at', result.current_period_end
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', 'Error al verificar suscripción: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensaje de éxito
SELECT 'Funciones SQL creadas exitosamente!' as message;
