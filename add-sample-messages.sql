-- Script para agregar mensajes de ejemplo a un cliente específico
-- Esto es útil para probar la funcionalidad de análisis de conversación

-- Reemplaza 'CLIENT_ID_AQUI' con el ID real del cliente
-- Reemplaza 'USER_ID_AQUI' con tu ID de usuario

DO $$
DECLARE
    client_uuid UUID := 'CLIENT_ID_AQUI'; -- Reemplazar con ID del cliente
    user_uuid UUID := 'USER_ID_AQUI'; -- Reemplazar con tu user ID
BEGIN
    -- Verificar que el cliente existe y pertenece al usuario
    IF NOT EXISTS (
        SELECT 1 FROM clients 
        WHERE id = client_uuid AND user_id = user_uuid
    ) THEN
        RAISE EXCEPTION 'El cliente no existe o no pertenece al usuario especificado';
    END IF;

    -- Insertar mensajes de ejemplo para simular una conversación
    INSERT INTO client_messages (client_id, message, sender_type, created_at) VALUES
    (client_uuid, 'Hola, me gustaría solicitar información sobre sus servicios de desarrollo web.', 'client', NOW() - INTERVAL '5 days'),
    (client_uuid, '¡Hola! Gracias por contactarme. Estaré encantado de ayudarte con tu proyecto web. ¿Podrías contarme más detalles sobre lo que tienes en mente?', 'freelancer', NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'),
    (client_uuid, 'Necesito una página web para mi negocio de consultoría. Algo profesional pero moderno. Mi presupuesto es de aproximadamente €3000.', 'client', NOW() - INTERVAL '4 days'),
    (client_uuid, 'Perfecto, eso está dentro de lo que puedo ofrecerte. Con €3000 podemos crear una web muy profesional. ¿Tienes algún diseño de referencia o colores corporativos específicos?', 'freelancer', NOW() - INTERVAL '4 days' + INTERVAL '2 hours'),
    (client_uuid, 'Me gusta el estilo minimalista, colores azul y blanco principalmente. ¿Cuánto tiempo tomaría el proyecto?', 'client', NOW() - INTERVAL '3 days'),
    (client_uuid, 'Excelente elección de colores. Para un proyecto de esta envergadura, estimo entre 3-4 semanas. Te incluiría diseño responsive, optimización SEO básica y un panel de administración sencillo.', 'freelancer', NOW() - INTERVAL '3 days' + INTERVAL '1 hour'),
    (client_uuid, 'Suena muy bien. ¿Podrías enviarme una propuesta formal con los detalles?', 'client', NOW() - INTERVAL '2 days'),
    (client_uuid, 'Por supuesto. Te enviaré la propuesta detallada esta tarde con todos los entregables, cronograma y términos de pago. ¿Hay algún deadline específico que deba considerar?', 'freelancer', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes'),
    (client_uuid, 'Idealmente me gustaría tenerla lista para finales del próximo mes. ¿Es factible?', 'client', NOW() - INTERVAL '1 day'),
    (client_uuid, 'Sí, totalmente factible. Con 4 semanas tenemos tiempo suficiente para hacer un trabajo de calidad. Te envío la propuesta hoy y podemos empezar la próxima semana si te parece bien.', 'freelancer', NOW() - INTERVAL '1 day' + INTERVAL '20 minutes');

    RAISE NOTICE 'Se han agregado 10 mensajes de ejemplo para el cliente. Ahora puedes usar el análisis de conversación.';
    RAISE NOTICE 'Los mensajes simulan una conversación real de consulta y negociación de proyecto web.';
    RAISE NOTICE 'Puedes ejecutar el "Analizador de Conversaciones" para ver cómo funciona la IA.';
END $$;
