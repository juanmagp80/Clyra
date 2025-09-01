-- SQL para ejecutar directamente en Supabase SQL Editor
-- Automatización de Proyecto con Retraso - Notificación INTERNA (En lugar de email)

-- Primero eliminamos cualquier automatización duplicada del mismo tipo para este usuario
DELETE FROM automations 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
AND trigger_type = 'project_delayed';

-- Luego insertamos la nueva automatización CON NOTIFICACIÓN INTERNA
INSERT INTO automations (
    name, 
    description, 
    trigger_type, 
    trigger_conditions, 
    actions, 
    is_active, 
    user_id
) 
VALUES (
    'Alerta Proyecto con Retraso (Notificación Interna)',
    'Detecta automáticamente proyectos vencidos y crea notificaciones internas en el sistema, además de tareas de seguimiento',
    'project_delayed',
    '{
        "days_overdue": 0,
        "days_warning": 3,
        "check_active_projects": true,
        "auto_detect": true
    }',
    '[
        {
            "type": "create_notification",
            "parameters": {
                "title": "⚠️ Proyecto {{project_name}} con retraso",
                "message": "El proyecto {{project_name}} para {{client_name}} ({{client_company}}) lleva {{days_overdue}} días de retraso. Fecha límite era: {{end_date}}. Estado actual: {{project_status}}.",
                "type": "warning",
                "route": "/dashboard/projects",
                "action_data": {
                    "project_name": "{{project_name}}",
                    "client_name": "{{client_name}}",
                    "days_overdue": "{{days_overdue}}",
                    "reason": "project_delayed",
                    "priority": "high"
                }
            }
        },
        {
            "type": "assign_task",
            "parameters": {
                "title": "URGENTE: Gestionar retraso en {{project_name}}",
                "description": "El proyecto {{project_name}} para {{client_name}} está {{days_overdue}} días retrasado. Acciones necesarias: 1) Revisar cronograma, 2) Evaluar recursos, 3) Comunicar estado al cliente, 4) Replantear fechas si es necesario.",
                "priority": "high",
                "due_in_days": 1,
                "status": "pending"
            }
        }
    ]',
    true,
    'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
);

-- Verificar que se insertó correctamente
SELECT 
    name, 
    description, 
    trigger_type, 
    is_active,
    actions
FROM automations 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
AND trigger_type = 'project_delayed';
