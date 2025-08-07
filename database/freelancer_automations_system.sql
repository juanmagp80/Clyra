-- SISTEMA DE AUTOMATIZACIONES PARA FREELANCERS
-- Automatizar tareas repetitivas comunes en el trabajo freelance

-- ==================== TABLA DE AUTOMATIZACIONES ====================

CREATE TABLE IF NOT EXISTS automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- 'project_status_change', 'task_completed', 'deadline_approaching', etc.
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatizaciones predefinidas para freelancers
INSERT INTO automations (user_id, name, trigger_type, trigger_conditions, actions, is_active) 
SELECT 
    auth.uid(),
    automation.name,
    automation.trigger_type,
    automation.trigger_conditions::jsonb,
    automation.actions::jsonb,
    true
FROM (VALUES
    -- Seguimiento automático de proyectos
    (
        'Notificar progreso semanal',
        'schedule',
        '{"frequency": "weekly", "day": "friday", "time": "17:00"}',
        '[
            {"type": "generate_report", "report_type": "weekly_progress"},
            {"type": "send_email", "template": "weekly_update", "recipients": ["client"]}
        ]'
    ),
    -- Recordatorios de facturas
    (
        'Recordatorio facturación mensual',
        'schedule',
        '{"frequency": "monthly", "day": "last", "time": "09:00"}',
        '[
            {"type": "create_invoice", "for": "completed_projects"},
            {"type": "notify_user", "message": "Hora de facturar proyectos completados"}
        ]'
    ),
    -- Seguimiento de tiempo automático
    (
        'Iniciar tiempo al cambiar tarea a "En progreso"',
        'task_status_change',
        '{"from_status": "pending", "to_status": "in_progress"}',
        '[
            {"type": "start_time_tracking", "task_id": "{{task.id}}"},
            {"type": "notify_user", "message": "Tiempo iniciado automáticamente"}
        ]'
    ),
    -- Cliente inactivo
    (
        'Seguimiento cliente inactivo',
        'client_inactive',
        '{"days_inactive": 30}',
        '[
            {"type": "send_email", "template": "check_in", "recipients": ["client"]},
            {"type": "create_task", "title": "Seguimiento cliente {{client.name}}", "priority": "medium"}
        ]'
    ),
    -- Proyecto cerca del deadline
    (
        'Alerta deadline próximo',
        'deadline_approaching',
        '{"days_before": 3}',
        '[
            {"type": "notify_user", "priority": "high", "message": "Proyecto {{project.name}} vence en {{days}} días"},
            {"type": "send_email", "template": "deadline_reminder", "recipients": ["client"]}
        ]'
    ),
    -- Backup automático semanal
    (
        'Backup datos proyecto',
        'schedule',
        '{"frequency": "weekly", "day": "sunday", "time": "02:00"}',
        '[
            {"type": "export_project_data", "format": "json"},
            {"type": "notify_user", "message": "Backup semanal completado"}
        ]'
    )
) AS automation(name, trigger_type, trigger_conditions, actions)
WHERE EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid());

-- ==================== TABLA DE EJECUCIONES ====================

CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
    trigger_data JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
    result JSONB,
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== FUNCIONES DE AUTOMATIZACIÓN ====================

-- Función para ejecutar automatizaciones
CREATE OR REPLACE FUNCTION execute_automation(automation_uuid UUID, trigger_data JSONB DEFAULT '{}')
RETURNS JSONB AS $$
DECLARE
    automation_record RECORD;
    execution_id UUID;
    action_item JSONB;
    result JSONB := '{"success": true, "actions_executed": []}';
BEGIN
    -- Obtener automatización
    SELECT * INTO automation_record FROM automations WHERE id = automation_uuid AND is_active = true;
    
    IF automation_record IS NULL THEN
        RETURN '{"success": false, "error": "Automation not found or inactive"}';
    END IF;
    
    -- Crear registro de ejecución
    INSERT INTO automation_executions (automation_id, trigger_data, status)
    VALUES (automation_uuid, trigger_data, 'running')
    RETURNING id INTO execution_id;
    
    -- Ejecutar cada acción
    FOR action_item IN SELECT * FROM jsonb_array_elements(automation_record.actions)
    LOOP
        CASE action_item->>'type'
            WHEN 'send_email' THEN
                -- Aquí iría la lógica de envío de email
                result := jsonb_set(result, '{actions_executed}', 
                    (result->'actions_executed') || jsonb_build_array('email_sent'));
            
            WHEN 'create_task' THEN
                -- Crear tarea automáticamente
                INSERT INTO tasks (
                    user_id, title, description, priority, status
                ) VALUES (
                    automation_record.user_id,
                    action_item->>'title',
                    action_item->>'description',
                    COALESCE(action_item->>'priority', 'medium'),
                    'pending'
                );
                result := jsonb_set(result, '{actions_executed}', 
                    (result->'actions_executed') || jsonb_build_array('task_created'));
            
            WHEN 'notify_user' THEN
                -- Crear notificación
                INSERT INTO user_notifications (
                    user_id, title, message, type
                ) VALUES (
                    automation_record.user_id,
                    'Automatización',
                    action_item->>'message',
                    COALESCE(action_item->>'priority', 'info')
                );
                result := jsonb_set(result, '{actions_executed}', 
                    (result->'actions_executed') || jsonb_build_array('notification_sent'));
        END CASE;
    END LOOP;
    
    -- Actualizar contadores
    UPDATE automations SET execution_count = execution_count + 1 WHERE id = automation_uuid;
    UPDATE automation_executions SET status = 'completed', result = result WHERE id = execution_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== TABLA DE NOTIFICACIONES ====================

CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== RLS Y ÍNDICES ====================

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para automations
CREATE POLICY "Users can manage own automations" ON automations
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para automation_executions
CREATE POLICY "Users can view own automation executions" ON automation_executions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM automations WHERE id = automation_executions.automation_id AND user_id = auth.uid())
    );

-- Políticas para user_notifications
CREATE POLICY "Users can manage own notifications" ON user_notifications
    FOR ALL USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automations_trigger_type ON automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_executions_automation_id ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id, is_read);
