-- Insertar automatizaciones de ejemplo para pruebas
-- Ejecutar esto en Supabase SQL Editor

-- Primero verificar que el usuario existe (reemplazar con tu user_id real)
-- SELECT auth.uid(); -- Ejecuta esto primero para obtener tu user_id

-- Insertar automatizaciones de ejemplo (reemplaza 'YOUR_USER_ID_HERE' con tu user_id real)
INSERT INTO automations (user_id, name, description, trigger_type, actions, is_active, execution_count) 
VALUES 
(
    auth.uid(), -- Esto obtiene automáticamente el user_id del usuario autenticado
    'Seguimiento de Clientes',
    'Envía recordatorios automáticos a clientes sobre el progreso de sus proyectos',
    'client_communication',
    '[
        {"type": "send_email", "template": "project_update", "name": "Enviar actualización de proyecto"},
        {"type": "create_task", "name": "Crear tarea de seguimiento"}
    ]'::jsonb,
    true,
    5
),
(
    auth.uid(),
    'Recordatorio de Facturas',
    'Notifica cuando una factura está próxima a vencer',
    'invoice_followup',
    '[
        {"type": "send_email", "template": "invoice_reminder", "name": "Recordatorio de pago"},
        {"type": "create_notification", "name": "Crear notificación"}
    ]'::jsonb,
    true,
    12
),
(
    auth.uid(),
    'Onboarding de Nuevos Clientes',
    'Automatiza el proceso de bienvenida para nuevos clientes',
    'client_onboarding',
    '[
        {"type": "send_welcome_email", "name": "Enviar email de bienvenida"},
        {"type": "create_project_template", "name": "Crear proyecto inicial"},
        {"type": "schedule_meeting", "name": "Programar reunión inicial"}
    ]'::jsonb,
    true,
    3
),
(
    auth.uid(),
    'Hitos de Proyecto',
    'Notifica cuando se completa un hito importante del proyecto',
    'project_milestone',
    '[
        {"type": "send_milestone_email", "name": "Notificar hito completado"},
        {"type": "update_project_status", "name": "Actualizar estado del proyecto"}
    ]'::jsonb,
    false,
    8
),
(
    auth.uid(),
    'Feedback de Cliente',
    'Solicita feedback automáticamente al completar un proyecto',
    'client_feedback',
    '[
        {"type": "send_feedback_request", "name": "Solicitar feedback"},
        {"type": "create_review_task", "name": "Crear tarea de revisión"}
    ]'::jsonb,
    true,
    2
);
