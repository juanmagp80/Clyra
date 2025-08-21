-- Tabla para almacenar información de suscripciones de Stripe
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- active, canceled, past_due, etc.
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS para seguridad
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propias suscripciones
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Política para insertar (solo desde el servidor)
CREATE POLICY "Allow service role to insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Política para actualizar (solo desde el servidor)
CREATE POLICY "Allow service role to update subscriptions" ON subscriptions
  FOR UPDATE USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at_trigger ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Vista para obtener el estado de suscripción de un usuario fácilmente
CREATE OR REPLACE VIEW user_subscription_status AS
SELECT 
  u.id as user_id,
  u.email,
  s.id as subscription_id,
  s.stripe_customer_id,
  s.stripe_subscription_id,
  s.status,
  s.price_id,
  s.current_period_start,
  s.current_period_end,
  s.cancel_at_period_end,
  CASE 
    WHEN s.status = 'active' AND s.current_period_end > NOW() THEN true
    ELSE false
  END as has_active_subscription,
  s.created_at as subscription_created_at,
  s.updated_at as subscription_updated_at
FROM auth.users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status IN ('active', 'trialing');

-- Permitir acceso a la vista
GRANT SELECT ON user_subscription_status TO authenticated;

-- Función para crear suscripción de prueba
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
  
  -- Crear o actualizar la suscripción
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
    'user_id', user_record.id,
    'user_email', user_record.email,
    'subscription', row_to_json(subscription_record)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', 'Error al crear suscripción: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
