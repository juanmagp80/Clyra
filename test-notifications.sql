-- Script SQL para insertar notificaciones de prueba
-- Reemplaza 'tu-user-id-aqui' con el ID real del usuario

-- Primero, obtener el user_id del usuario (ejecuta esto primero para obtener el ID)
SELECT id, email FROM auth.users WHERE email = 'juangpdev@gmail.com';

-- Luego usar el ID obtenido para insertar las notificaciones
-- REEMPLAZA 'tu-user-id-aqui' con el UUID real del usuario

INSERT INTO public.user_notifications (user_id, title, message, type, action_url, is_read) VALUES
(
    'tu-user-id-aqui', -- Reemplazar con el UUID real
    'Bienvenido a Taskelio',
    'Tu cuenta ha sido configurada correctamente. ¡Comienza a gestionar tus proyectos!',
    'success',
    '/dashboard',
    false
),
(
    'tu-user-id-aqui', -- Reemplazar con el UUID real
    'Nuevo mensaje de cliente',
    'Tienes un nuevo mensaje en tus conversaciones pendientes.',
    'info',
    '/dashboard/client-communications',
    false
),
(
    'tu-user-id-aqui', -- Reemplazar con el UUID real
    'Factura generada',
    'Se ha generado una nueva factura para el proyecto "Desarrollo Web".',
    'success',
    NULL,
    false
),
(
    'tu-user-id-aqui', -- Reemplazar con el UUID real
    'Recordatorio importante',
    'No olvides completar tu perfil para mejorar tu visibilidad.',
    'warning',
    '/dashboard/profile',
    true
);

-- Verificar que se insertaron correctamente
SELECT 
    id,
    title,
    message,
    type,
    is_read,
    action_url,
    created_at
FROM public.user_notifications 
WHERE user_id = 'tu-user-id-aqui' -- Reemplazar con el UUID real
ORDER BY created_at DESC;
