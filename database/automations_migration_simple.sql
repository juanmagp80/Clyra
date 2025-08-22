-- SISTEMA DE AUTOMACIONES PARA FREELANCERS - VERSIÓN SIMPLIFICADA
-- Copia y pega este código completo en la consola SQL de Supabase

-- ==================== TABLA DE AUTOMACIONES ====================

CREATE TABLE IF NOT EXISTS automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL, -- 'time_based', 'event_based', 'condition_based'
    trigger_config JSONB NOT NULL,
    actions JSONB NOT NULL, -- Array de acciones a ejecutar
    is_active BOOLEAN DEFAULT true,
    last_executed TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TABLA DE EJECUCIONES ====================

CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE NOT NULL,
    triggered_by VARCHAR(100) NOT NULL,
    trigger_data JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
    actions_executed JSONB,
    error_message TEXT,
    execution_time_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TABLA DE NOTIFICACIONES ====================

CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== RLS Y POLÍTICAS ====================

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para automations (DROP IF EXISTS para evitar errores)
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

-- ==================== ÍNDICES ====================

CREATE INDEX IF NOT EXISTS idx_automations_user_active ON automations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_automations_trigger_type ON automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_executions_automation_id ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread ON user_notifications(user_id, is_read) WHERE is_read = false;

-- ==================== AUTOMACIONES PREDEFINIDAS ====================

INSERT INTO automations (name, description, trigger_type, trigger_config, actions, is_active, user_id) 
SELECT 
    'Bienvenida Nuevo Cliente',
    'Envía una serie de emails de bienvenida y crea tareas iniciales cuando se agrega un nuevo cliente',
    'event_based',
    '{
        "event": "client_created",
        "conditions": []
    }',
    '[
        {
            "type": "send_email",
            "template": "client_welcome",
            "delay_hours": 0,
            "config": {
                "subject": "¡Bienvenido! Empecemos a trabajar juntos",
                "template_id": "welcome_client"
            }
        },
        {
            "type": "create_task",
            "delay_hours": 1,
            "config": {
                "title": "Llamada inicial con {{client.name}}",
                "description": "Planificar reunión de kick-off para definir objetivos y timeline",
                "priority": "high",
                "due_date_days": 2
            }
        },
        {
            "type": "send_email",
            "template": "onboarding_guide",
            "delay_hours": 24,
            "config": {
                "subject": "Guía de onboarding - Qué esperar en nuestros primeros días",
                "template_id": "onboarding_guide"
            }
        }
    ]',
    false,
    NULL -- Se asignará al crear manualmente por usuario
WHERE false; -- No insertar automáticamente, solo estructura

INSERT INTO automations (name, description, trigger_type, trigger_config, actions, is_active, user_id) 
SELECT 
    'Recordatorio Factura Vencida',
    'Envía recordatorios automáticos para facturas que han vencido sin pagar',
    'time_based',
    '{
        "schedule": "daily",
        "time": "09:00",
        "conditions": [
            {
                "field": "invoice.status",
                "operator": "equals",
                "value": "pending"
            },
            {
                "field": "invoice.due_date",
                "operator": "less_than",
                "value": "today"
            }
        ]
    }',
    '[
        {
            "type": "send_email",
            "template": "invoice_reminder",
            "config": {
                "subject": "Recordatorio: Factura {{invoice.number}} pendiente de pago",
                "template_id": "invoice_overdue_reminder"
            }
        },
        {
            "type": "create_notification",
            "config": {
                "title": "Factura vencida",
                "message": "La factura {{invoice.number}} de {{client.name}} está vencida",
                "type": "warning"
            }
        }
    ]',
    false,
    NULL
WHERE false;

INSERT INTO automations (name, description, trigger_type, trigger_config, actions, is_active, user_id) 
SELECT 
    'Update Semanal de Progreso',
    'Envía automáticamente un reporte de progreso semanal a todos los clientes activos',
    'time_based',
    '{
        "schedule": "weekly",
        "day": "friday",
        "time": "17:00",
        "conditions": [
            {
                "field": "project.status",
                "operator": "equals",
                "value": "active"
            }
        ]
    }',
    '[
        {
            "type": "generate_report",
            "config": {
                "type": "progress_report",
                "include_time_tracking": true,
                "include_completed_tasks": true,
                "include_next_week_plan": true
            }
        },
        {
            "type": "send_email",
            "template": "weekly_progress",
            "config": {
                "subject": "Reporte semanal - Progreso de {{project.name}}",
                "template_id": "weekly_progress_report",
                "attach_report": true
            }
        }
    ]',
    false,
    NULL
WHERE false;

INSERT INTO automations (name, description, trigger_type, trigger_config, actions, is_active, user_id) 
SELECT 
    'Finalización de Hito',
    'Acciones automáticas cuando se completa un hito importante del proyecto',
    'event_based',
    '{
        "event": "milestone_completed",
        "conditions": [
            {
                "field": "milestone.value",
                "operator": "greater_than",
                "value": 500
            }
        ]
    }',
    '[
        {
            "type": "create_invoice",
            "config": {
                "amount": "{{milestone.value}}",
                "description": "Pago por hito completado: {{milestone.name}}",
                "due_date_days": 15
            }
        },
        {
            "type": "send_email",
            "template": "milestone_completed",
            "config": {
                "subject": "🎉 Hito completado: {{milestone.name}}",
                "template_id": "milestone_completion"
            }
        },
        {
            "type": "schedule_task",
            "delay_hours": 48,
            "config": {
                "title": "Seguimiento post-hito con {{client.name}}",
                "description": "Reunión para revisar entregables y planificar siguientes pasos",
                "due_date_days": 3
            }
        }
    ]',
    false,
    NULL
WHERE false;

INSERT INTO automations (name, description, trigger_type, trigger_config, actions, is_active, user_id) 
SELECT 
    'Control de Tiempo Diario',
    'Recordatorios para registrar tiempo y pausas de descanso',
    'time_based',
    '{
        "schedule": "daily_multiple",
        "times": ["11:00", "15:00", "18:00"],
        "working_days_only": true
    }',
    '[
        {
            "type": "check_time_tracking",
            "config": {
                "min_hours_expected": 2,
                "remind_if_below": true
            }
        },
        {
            "type": "create_notification",
            "condition": "time_below_expected",
            "config": {
                "title": "Recordatorio de tiempo",
                "message": "No olvides registrar tu tiempo trabajado hoy",
                "type": "info"
            }
        },
        {
            "type": "create_notification", 
            "condition": "long_session",
            "config": {
                "title": "Hora del descanso",
                "message": "Has trabajado más de 2 horas seguidas. ¡Tómate un descanso!",
                "type": "warning"
            }
        }
    ]',
    false,
    NULL
WHERE false;

INSERT INTO automations (name, description, trigger_type, trigger_config, actions, is_active, user_id) 
SELECT 
    'Entrega de Proyecto',
    'Lista de verificación y acciones automáticas al completar un proyecto',
    'event_based',
    '{
        "event": "project_completed",
        "conditions": []
    }',
    '[
        {
            "type": "create_checklist",
            "config": {
                "title": "Checklist entrega {{project.name}}",
                "items": [
                    "Todos los archivos entregados al cliente",
                    "Documentación técnica completa",
                    "Credenciales y accesos transferidos",
                    "Factura final enviada",
                    "Backup de archivos realizado"
                ]
            }
        },
        {
            "type": "send_email",
            "template": "project_delivery",
            "config": {
                "subject": "Entrega completada: {{project.name}}",
                "template_id": "project_delivery_notification"
            }
        },
        {
            "type": "schedule_task",
            "delay_hours": 168,
            "config": {
                "title": "Seguimiento post-entrega {{client.name}}",
                "description": "Llamada para recopilar feedback y explorar futuros proyectos",
                "due_date_days": 7
            }
        }
    ]',
    false,
    NULL
WHERE false;

-- ==================== FUNCIÓN PARA CALCULAR SUCCESS RATE ====================

DROP FUNCTION IF EXISTS update_automation_success_rate();
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

DROP TRIGGER IF EXISTS update_automation_stats ON automation_executions;
CREATE TRIGGER update_automation_stats
    AFTER INSERT OR UPDATE ON automation_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_success_rate();

-- ==================== FUNCIÓN DE TRIGGER PARA UPDATED_AT ====================

-- Esta función ya existe, no la recreamos para evitar conflictos
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_automations_updated_at ON automations;
CREATE TRIGGER update_automations_updated_at 
    BEFORE UPDATE ON automations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
