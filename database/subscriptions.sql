-- Crear la tabla de suscripciones si no existe
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_subscribed BOOLEAN DEFAULT false,
    trial_end TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    plan_type TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Políticas RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para ver solo su propia suscripción
CREATE POLICY "Users can view their own subscription"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Política para actualizar solo su propia suscripción
CREATE POLICY "Users can update their own subscription"
ON user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
