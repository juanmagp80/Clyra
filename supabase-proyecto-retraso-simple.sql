-- SQL para automatización simplificada sin action_data
-- Ejecutar en Supabase SQL Editor

-- Eliminar automatización anterior
DELETE FROM automations 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
AND trigger_type = 'project_delayed';

-- Insertar automatización simplificada
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
    'Alerta Proyecto con Retraso (Simplificada)',
    'Detecta automáticamente proyectos vencidos y crea notificaciones internas simples',
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
                "message": "El proyecto {{project_name}} para {{client_name}} lleva {{days_overdue}} días de retraso. Revisar urgentemente.",
                "type": "warning",
                "route": "/dashboard/projects"
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

-- Verificar inserción
SELECT 
    name, 
    description, 
    trigger_type, 
    is_active
FROM automations 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
AND trigger_type = 'project_delayed';
