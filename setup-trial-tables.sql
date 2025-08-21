-- Crear tablas necesarias para el sistema de trial

-- 1. Tabla de perfiles (si no existe)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    subscription_status TEXT DEFAULT 'trial',
    subscription_plan TEXT DEFAULT 'free',
    trial_started_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de uso de usuarios
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    clients_count INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    emails_sent_month INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    max_clients INTEGER,
    max_projects INTEGER,
    max_storage_gb INTEGER,
    price_monthly DECIMAL(10,2),
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de actividades de trial
CREATE TABLE IF NOT EXISTS trial_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de suscripciones de Stripe
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar planes por defecto si no existen
INSERT INTO subscription_plans (name, max_clients, max_projects, max_storage_gb, price_monthly, features)
VALUES 
    ('Trial Gratuito', 10, 5, 1, 0.00, '{"trial_days": 14, "support": "email"}'),
    ('Pro', -1, -1, 10, 29.99, '{"unlimited": true, "support": "priority", "automations": true}')
ON CONFLICT DO NOTHING;

-- Función para actualizar uso de usuario
CREATE OR REPLACE FUNCTION update_user_usage(
    user_uuid UUID,
    usage_type TEXT,
    increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    -- Crear registro si no existe
    INSERT INTO user_usage (user_id)
    VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Actualizar el campo correspondiente
    CASE usage_type
        WHEN 'clients' THEN
            UPDATE user_usage 
            SET clients_count = clients_count + increment_by, updated_at = NOW()
            WHERE user_id = user_uuid;
        WHEN 'projects' THEN
            UPDATE user_usage 
            SET projects_count = projects_count + increment_by, updated_at = NOW()
            WHERE user_id = user_uuid;
        WHEN 'storage' THEN
            UPDATE user_usage 
            SET storage_used_mb = storage_used_mb + increment_by, updated_at = NOW()
            WHERE user_id = user_uuid;
        WHEN 'emails' THEN
            UPDATE user_usage 
            SET emails_sent_month = emails_sent_month + increment_by, updated_at = NOW()
            WHERE user_id = user_uuid;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estado de trial
CREATE OR REPLACE FUNCTION get_trial_status(user_uuid UUID)
RETURNS TABLE (
    status TEXT,
    plan TEXT,
    days_remaining INTEGER,
    is_expired BOOLEAN,
    can_use_features BOOLEAN
) AS $$
DECLARE
    profile_record RECORD;
    days_left INTEGER;
    expired BOOLEAN;
    can_use BOOLEAN;
BEGIN
    -- Obtener perfil
    SELECT * INTO profile_record
    FROM profiles 
    WHERE id = user_uuid;
    
    IF NOT FOUND THEN
        -- Si no hay perfil, retornar valores por defecto
        RETURN QUERY SELECT 'trial'::TEXT, 'free'::TEXT, 0, TRUE, FALSE;
        RETURN;
    END IF;
    
    -- Calcular días restantes
    days_left := GREATEST(0, EXTRACT(days FROM (profile_record.trial_ends_at - NOW()))::INTEGER);
    expired := profile_record.subscription_status = 'trial' AND days_left <= 0;
    can_use := profile_record.subscription_status = 'active' OR (profile_record.subscription_status = 'trial' AND NOT expired);
    
    RETURN QUERY SELECT 
        profile_record.subscription_status::TEXT,
        profile_record.subscription_plan::TEXT,
        days_left,
        expired,
        can_use;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_usage_updated_at ON user_usage;
CREATE TRIGGER update_user_usage_updated_at
    BEFORE UPDATE ON user_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para user_usage
DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON user_usage;
CREATE POLICY "Users can update own usage" ON user_usage
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON user_usage;
CREATE POLICY "Users can insert own usage" ON user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para trial_activities
DROP POLICY IF EXISTS "Users can view own activities" ON trial_activities;
CREATE POLICY "Users can view own activities" ON trial_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON trial_activities;
CREATE POLICY "Users can insert own activities" ON trial_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Dar permisos a los planes (solo lectura para todos)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can view plans" ON subscription_plans;
CREATE POLICY "Everyone can view plans" ON subscription_plans
    FOR SELECT USING (TRUE);
