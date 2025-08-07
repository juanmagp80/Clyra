-- MIGRACIÓN PARA SISTEMA DE SUSCRIPCIONES Y TRIAL
-- Ejecutar DESPUÉS de 01_setup_profiles_table.sql

-- ==================== VERIFICAR TABLA PROFILES ====================

-- Verificar que la tabla profiles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'La tabla profiles no existe. Ejecuta primero 01_setup_profiles_table.sql';
    END IF;
END $$;

-- ==================== EXTENSIÓN DE TABLA USERS/PROFILES ====================

-- Agregar campos de suscripción a la tabla de perfiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
    trial_started_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days');

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
    subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro'));

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
    stripe_customer_id VARCHAR(255);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
    stripe_subscription_id VARCHAR(255);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
    subscription_current_period_end TIMESTAMPTZ;

-- ==================== TABLA DE PLANES ====================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    features JSONB DEFAULT '[]',
    max_clients INTEGER,
    max_projects INTEGER,
    max_storage_gb INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TABLA DE LÍMITES DE USO ====================

CREATE TABLE IF NOT EXISTS user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    clients_count INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    emails_sent_month INTEGER DEFAULT 0,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TABLA DE ACTIVIDAD DE TRIAL ====================

CREATE TABLE IF NOT EXISTS trial_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'login', 'feature_used', 'limit_reached'
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ÍNDICES ====================

CREATE INDEX IF NOT EXISTS idx_profiles_trial_status ON profiles(subscription_status, trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_activities_user_id ON trial_activities(user_id);

-- ==================== RLS POLICIES ====================

-- Políticas para user_usage
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON user_usage;
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON user_usage;
CREATE POLICY "Users can insert own usage" ON user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON user_usage;
CREATE POLICY "Users can update own usage" ON user_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para trial_activities
ALTER TABLE trial_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activities" ON trial_activities;
CREATE POLICY "Users can view own activities" ON trial_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activities" ON trial_activities;
CREATE POLICY "Users can insert own activities" ON trial_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================== FUNCIONES ÚTILES ====================

-- Función para verificar si el trial ha expirado
CREATE OR REPLACE FUNCTION is_trial_expired(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile RECORD;
BEGIN
    SELECT subscription_status, trial_ends_at 
    INTO user_profile
    FROM profiles 
    WHERE id = user_uuid;
    
    -- Si no tiene perfil, considerar expirado
    IF user_profile IS NULL THEN
        RETURN true;
    END IF;
    
    -- Si tiene suscripción activa, no está expirado
    IF user_profile.subscription_status = 'active' THEN
        RETURN false;
    END IF;
    
    -- Si está en trial, verificar fecha
    IF user_profile.subscription_status = 'trial' THEN
        RETURN (user_profile.trial_ends_at < NOW());
    END IF;
    
    -- Cualquier otro estado se considera expirado
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener días restantes de trial
CREATE OR REPLACE FUNCTION get_trial_days_remaining(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    user_profile RECORD;
    days_remaining INTEGER;
BEGIN
    SELECT subscription_status, trial_ends_at 
    INTO user_profile
    FROM profiles 
    WHERE id = user_uuid;
    
    -- Si no tiene perfil o no está en trial
    IF user_profile IS NULL OR user_profile.subscription_status != 'trial' THEN
        RETURN 0;
    END IF;
    
    -- Calcular días restantes
    days_remaining := EXTRACT(epoch FROM (user_profile.trial_ends_at - NOW())) / 86400;
    
    -- Retornar 0 si es negativo
    RETURN GREATEST(0, FLOOR(days_remaining)::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar contadores de uso
CREATE OR REPLACE FUNCTION update_user_usage(
    user_uuid UUID,
    usage_type VARCHAR(50),
    increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    -- Crear registro si no existe
    INSERT INTO user_usage (user_id) 
    VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Actualizar contador según el tipo
    CASE usage_type
        WHEN 'clients' THEN
            UPDATE user_usage SET clients_count = clients_count + increment_by WHERE user_id = user_uuid;
        WHEN 'projects' THEN
            UPDATE user_usage SET projects_count = projects_count + increment_by WHERE user_id = user_uuid;
        WHEN 'storage' THEN
            UPDATE user_usage SET storage_used_mb = storage_used_mb + increment_by WHERE user_id = user_uuid;
        WHEN 'emails' THEN
            UPDATE user_usage SET emails_sent_month = emails_sent_month + increment_by WHERE user_id = user_uuid;
    END CASE;
    
    -- Actualizar timestamp
    UPDATE user_usage SET updated_at = NOW() WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== INSERTAR PLANES PREDETERMINADOS ====================

INSERT INTO subscription_plans (name, price_monthly, price_yearly, features, max_clients, max_projects, max_storage_gb) 
VALUES 
(
    'Trial Gratuito',
    0.00,
    0.00,
    '["Acceso completo por 14 días", "Hasta 10 clientes", "Hasta 5 proyectos", "1GB almacenamiento", "Todas las funciones", "Soporte por email"]',
    10,
    5,
    1
),
(
    'Pro',
    10.00,
    100.00,
    '["Clientes ilimitados", "Proyectos ilimitados", "10GB almacenamiento", "Facturación automática", "Seguimiento de tiempo", "Reportes avanzados", "Gestión de tareas", "Portal de cliente", "Soporte prioritario"]',
    -1, -- -1 = ilimitado
    -1,
    10
)
ON CONFLICT DO NOTHING;

-- ==================== TRIGGERS ====================

-- Trigger para actualizar updated_at en user_usage
CREATE OR REPLACE FUNCTION update_user_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_usage_updated_at ON user_usage;
CREATE TRIGGER trigger_update_user_usage_updated_at
    BEFORE UPDATE ON user_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_user_usage_updated_at();

-- ==================== DATOS INICIALES PARA USUARIOS EXISTENTES ====================

-- Actualizar usuarios existentes que no tengan trial configurado
UPDATE profiles 
SET 
    trial_started_at = COALESCE(trial_started_at, created_at, NOW()),
    trial_ends_at = COALESCE(trial_ends_at, created_at + INTERVAL '14 days', NOW() + INTERVAL '14 days'),
    subscription_status = COALESCE(subscription_status, 'trial'),
    subscription_plan = COALESCE(subscription_plan, 'free')
WHERE trial_started_at IS NULL OR trial_ends_at IS NULL;

-- ==================== COMENTARIOS ====================

COMMENT ON TABLE subscription_plans IS 'Planes de suscripción disponibles';
COMMENT ON TABLE user_usage IS 'Tracking de uso por usuario para límites';
COMMENT ON TABLE trial_activities IS 'Log de actividades durante el trial';

COMMENT ON FUNCTION is_trial_expired(UUID) IS 'Verifica si el trial del usuario ha expirado';
COMMENT ON FUNCTION get_trial_days_remaining(UUID) IS 'Obtiene días restantes de trial';
COMMENT ON FUNCTION update_user_usage(UUID, VARCHAR, INTEGER) IS 'Actualiza contadores de uso del usuario';

-- ==================== FINALIZADO ====================

SELECT 'Sistema de suscripciones y trial configurado! 🎉' as resultado;
SELECT 'Próximos pasos: Implementar middleware y UI de trial' as info;
