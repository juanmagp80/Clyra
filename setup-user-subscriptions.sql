-- Crear tabla user_subscriptions si no existe
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'trial', 'pro')),
    trial_end TIMESTAMPTZ,
    subscription_end TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver/editar sus propias suscripciones
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar registros de prueba para usuarios existentes (solo si no existen)
INSERT INTO public.user_subscriptions (user_id, is_subscribed, plan_type, trial_end)
SELECT 
    id as user_id,
    false as is_subscribed,
    'trial' as plan_type,
    NOW() + INTERVAL '30 days' as trial_end
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;
