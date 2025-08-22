-- SISTEMA DE AUTOMACIONES PARA FREELANCERS - VERSIÓN ULTRA SIMPLIFICADA
-- Copia y pega este código completo en la consola SQL de Supabase

-- ==================== TABLA DE AUTOMACIONES (CREAR SOLO SI NO EXISTE) ====================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'automations') THEN
        CREATE TABLE automations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            trigger_type VARCHAR(100) NOT NULL,
            trigger_config JSONB NOT NULL,
            actions JSONB NOT NULL,
            is_active BOOLEAN DEFAULT true,
            last_executed TIMESTAMPTZ,
            execution_count INTEGER DEFAULT 0,
            success_count INTEGER DEFAULT 0,
            error_count INTEGER DEFAULT 0,
            success_rate DECIMAL(5,2) DEFAULT 0.00,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- ==================== TABLA DE EJECUCIONES (CREAR SOLO SI NO EXISTE) ====================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'automation_executions') THEN
        CREATE TABLE automation_executions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
            triggered_by VARCHAR(100) NOT NULL,
            trigger_data JSONB,
            started_at TIMESTAMPTZ DEFAULT NOW(),
            completed_at TIMESTAMPTZ,
            status VARCHAR(50) DEFAULT 'running',
            actions_executed JSONB,
            error_message TEXT,
            execution_time_seconds INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- ==================== TABLA DE NOTIFICACIONES (CREAR SOLO SI NO EXISTE) ====================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_notifications') THEN
        CREATE TABLE user_notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT,
            type VARCHAR(50) DEFAULT 'info',
            is_read BOOLEAN DEFAULT false,
            action_url VARCHAR(500),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- ==================== RLS Y POLÍTICAS ====================

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para automations
DROP POLICY IF EXISTS "Users can manage own automations" ON automations;
CREATE POLICY "Users can manage own automations" ON automations
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para automation_executions
DROP POLICY IF EXISTS "Users can view own automation executions" ON automation_executions;
CREATE POLICY "Users can view own automation executions" ON automation_executions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM automations WHERE id = automation_executions.automation_id AND user_id = auth.uid())
    );

-- Políticas para user_notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON user_notifications;
CREATE POLICY "Users can manage own notifications" ON user_notifications
    FOR ALL USING (auth.uid() = user_id);

-- ==================== ÍNDICES (SOLO BÁSICOS) ====================

CREATE INDEX IF NOT EXISTS idx_automations_user_id ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_is_active ON automations(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_executions_automation_id ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- ==================== FUNCIÓN PARA SUCCESS RATE ====================

CREATE OR REPLACE FUNCTION update_automation_success_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE automations 
    SET 
        success_rate = CASE 
            WHEN execution_count > 0 THEN (success_count::decimal / execution_count) * 100
            ELSE 0
        END,
        updated_at = NOW()
    WHERE id = NEW.automation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS update_automation_stats ON automation_executions;
CREATE TRIGGER update_automation_stats
    AFTER INSERT OR UPDATE ON automation_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_success_rate();

-- ==================== TRIGGER PARA UPDATED_AT ====================

DROP TRIGGER IF EXISTS update_automations_updated_at ON automations;
CREATE TRIGGER update_automations_updated_at 
    BEFORE UPDATE ON automations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
