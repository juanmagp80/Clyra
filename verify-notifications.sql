-- SQL para verificar las notificaciones creadas
-- Ejecutar en Supabase SQL Editor

-- Verificar notificaciones recientes del usuario
SELECT 
    id,
    user_id,
    title,
    message,
    type,
    route,
    action_data,
    is_read,
    created_at
FROM user_notifications 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
ORDER BY created_at DESC 
LIMIT 10;

-- Contar notificaciones no leídas
SELECT 
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
    COUNT(CASE WHEN is_read = true THEN 1 END) as read_notifications
FROM user_notifications 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';

-- Verificar notificaciones de las últimas 24 horas
SELECT 
    id,
    title,
    message,
    type,
    is_read,
    created_at
FROM user_notifications 
WHERE user_id = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'
AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
