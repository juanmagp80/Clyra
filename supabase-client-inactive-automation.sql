-- SQL para ejecutar directamente en Supabase SQL Editor
-- Primero obtener tu user_id (ejecuta esta consulta primero)
SELECT id, email FROM auth.users ORDER BY created_at LIMIT 5;

-- Luego ejecuta el INSERT reemplazando 'TU_USER_ID_AQUI' con tu ID real de la consulta anterior
-- Agrega la automatización de Cliente Inactivo con detección automática

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
    'Seguimiento Cliente Inactivo',
    'Detecta automáticamente clientes sin comunicación o trabajo en proyectos durante 30+ días y envía email de seguimiento',
    'client_inactive',
    '{
        "days_threshold": 30,
        "check_communications": true,
        "check_project_work": true,
        "auto_detect": true
    }',
    '[
        {
            "type": "send_email",
            "parameters": {
                "subject": "¡Hola {{client_name}}! ¿Cómo va todo?",
                "template": "<div style=\"font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;\"><div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;\"><h1 style=\"color: white; margin: 0; font-size: 28px;\">👋 ¡Hola de nuevo!</h1></div><div style=\"padding: 30px;\"><h2 style=\"color: #333; margin-top: 0;\">Hola {{client_name}},</h2><p style=\"font-size: 16px; line-height: 1.6; color: #555;\">Espero que todo esté marchando bien. Hace un tiempo que no tenemos noticias tuyas y quería hacer un check-in rápido para ver cómo van las cosas.</p><div style=\"background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea;\"><h3 style=\"color: #333; margin-top: 0;\">🤔 ¿Cómo puedo ayudarte?</h3><ul style=\"color: #555; line-height: 1.6;\"><li>¿Hay algún proyecto nuevo en el que podamos colaborar?</li><li>¿Te gustaría revisar el progreso de proyectos anteriores?</li><li>¿Necesitas algún tipo de consultoría o asesoramiento?</li><li>¿Tienes feedback sobre nuestros servicios anteriores?</li></ul></div><p style=\"font-size: 16px; line-height: 1.6; color: #555;\">Si es un buen momento, me encantaría programar una llamada rápida de 15-20 minutos para ponernos al día. Sin compromiso, solo para mantener la comunicación y ver si hay algo en lo que te pueda apoyar.</p><div style=\"text-align: center; margin: 30px 0;\"><a href=\"mailto:{{user_email}}?subject=Re: ¿Cómo va todo?\" style=\"background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">Responder Email</a></div><p style=\"font-size: 14px; color: #666; text-align: center;\">O simplemente responde a este email cuando tengas un momento.</p></div><div style=\"background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #eee;\"><p style=\"color: #666; font-size: 14px; margin: 0;\">Saludos cordiales,<br><strong>{{user_name}}</strong><br>{{user_company}}</p><p style=\"color: #999; font-size: 12px; margin: 10px 0 0 0;\">Este es un seguimiento automático. Si prefieres no recibir estos emails, solo házmelo saber.</p></div></div>"
            }
        },
        {
            "type": "assign_task",
            "parameters": {
                "title": "Seguimiento cliente inactivo: {{client_name}}",
                "description": "Cliente {{client_name}} detectado como inactivo (30+ días sin comunicación o trabajo en proyectos). Email de seguimiento enviado automáticamente. Hacer seguimiento personalizado si es necesario.",
                "priority": "medium",
                "due_in_days": 7,
                "status": "pending"
            }
        }
    ]',
    true,
    'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'  -- Reemplaza esto con tu ID real de la consulta anterior
);
