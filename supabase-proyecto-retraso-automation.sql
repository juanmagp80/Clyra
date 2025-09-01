-- SQL para ejecutar directamente en Supabase SQL Editor
-- Automatización de Proyecto con Retraso - Notificación al Usuario

-- Primero eliminamos cualquier automatización duplicada del mismo tipo para este usuario
DELETE FROM automations 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c' 
AND trigger_type = 'project_delayed';

-- Luego insertamos la nueva automatización
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
    'Alerta Proyecto con Retraso',
    'Detecta automáticamente proyectos vencidos o próximos a vencer y envía notificación al usuario (freelancer)',
    'project_delayed',
    '{
        "days_overdue": 0,
        "days_warning": 3,
        "check_active_projects": true,
        "auto_detect": true
    }',
    '[
        {
            "type": "send_email",
            "parameters": {
                "subject": "⚠️ Alerta: Proyecto {{project_name}} con retraso",
                "to_user": true,
                "template": "<div style=\"font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;\"><div style=\"background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;\"><h1 style=\"color: white; margin: 0; font-size: 28px;\">⚠️ Proyecto con Retraso</h1></div><div style=\"padding: 30px;\"><h2 style=\"color: #333; margin-top: 0;\">Hola {{user_name}},</h2><p style=\"font-size: 16px; line-height: 1.6; color: #555;\">Te informamos que el proyecto <strong>{{project_name}}</strong> para el cliente <strong>{{client_name}}</strong> presenta un retraso en la entrega.</p><div style=\"background: #fff3cd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ff6b6b;\"><h3 style=\"color: #333; margin-top: 0;\">📊 Detalles del Proyecto:</h3><ul style=\"color: #555; line-height: 1.6;\"><li><strong>Cliente:</strong> {{client_name}} ({{client_company}})</li><li><strong>Fecha límite:</strong> {{end_date}}</li><li><strong>Días de retraso:</strong> {{days_overdue}}</li><li><strong>Estado actual:</strong> {{project_status}}</li><li><strong>Presupuesto:</strong> €{{budget}}</li></ul></div><div style=\"background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #007bff;\"><h3 style=\"color: #333; margin-top: 0;\">🎯 Acciones Recomendadas:</h3><ul style=\"color: #555; line-height: 1.6;\"><li>Revisar el cronograma del proyecto</li><li>Evaluar los recursos necesarios</li><li>Comunicar el estado al cliente</li><li>Ajustar la fecha de entrega si es necesario</li><li>Identificar bloqueos o impedimentos</li></ul></div><p style=\"font-size: 14px; color: #666; text-align: center;\">Accede a tu dashboard para gestionar este proyecto.</p></div><div style=\"background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eee;\"><p style=\"color: #666; font-size: 14px; margin: 0;\">Sistema de Gestión de Proyectos<br><strong>Taskelio</strong></p><p style=\"color: #999; font-size: 12px; margin: 10px 0 0 0;\">Esta es una alerta automática. Mantén tus proyectos al día para brindar el mejor servicio.</p></div></div>"
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
