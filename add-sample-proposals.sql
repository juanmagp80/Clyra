-- Script para agregar propuestas de ejemplo para el Analizador de Propuestas IA

-- Nota: Ejecutar este script desde la consola SQL de Supabase
-- Asegúrate de estar autenticado y reemplazar 'TU_USER_ID' con tu ID de usuario real

-- Propuesta 1: Desarrollo Web
INSERT INTO proposals (
    user_id,
    prospect_name,
    prospect_email,
    title,
    description,
    services,
    pricing,
    terms,
    timeline,
    status,
    total_amount,
    currency,
    valid_until,
    created_at
) VALUES (
    'TU_USER_ID', -- Reemplazar con tu user_id real
    'TechCorp Solutions',
    'contacto@techcorp.com',
    'Desarrollo de Plataforma E-commerce',
    'Desarrollo completo de plataforma de comercio electrónico con funcionalidades avanzadas y diseño responsive',
    '{
        "items": [
            "Análisis de requisitos y arquitectura",
            "Diseño UI/UX responsive",
            "Desarrollo frontend React/Next.js",
            "Backend con API REST",
            "Sistema de pagos integrado",
            "Panel de administración",
            "Testing y optimización",
            "Deployment y configuración",
            "1 mes de soporte post-lanzamiento"
        ]
    }',
    '{
        "packages": [
            {
                "name": "Desarrollo Completo",
                "price": 8500,
                "description": "Plataforma e-commerce completa",
                "features": [
                    "Hasta 100 productos",
                    "Pasarela de pagos múltiple",
                    "Dashboard administrativo",
                    "Optimización SEO",
                    "Responsive design",
                    "SSL y seguridad"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "40% al inicio, 40% al 70% completado, 20% al entregar",
        "delivery_time": "8-10 semanas",
        "revisions": "3 rondas de revisiones incluidas",
        "warranty": "2 meses de garantía y soporte",
        "additional_work": "Trabajos adicionales se cotizarán por separado"
    }',
    '{
        "phases": [
            {"name": "Análisis y Diseño", "duration": "2 semanas", "deliverable": "Wireframes y mockups aprobados"},
            {"name": "Desarrollo Frontend", "duration": "3 semanas", "deliverable": "Interfaz funcional"},
            {"name": "Desarrollo Backend", "duration": "2 semanas", "deliverable": "API y base de datos"},
            {"name": "Integración y Testing", "duration": "2 semanas", "deliverable": "Plataforma completa"},
            {"name": "Deployment y Entrega", "duration": "1 semana", "deliverable": "Sitio en producción"}
        ]
    }',
    'sent',
    8500.00,
    'EUR',
    CURRENT_DATE + INTERVAL '30 days',
    NOW() - INTERVAL '5 days'
);

-- Propuesta 2: Diseño de Marca
INSERT INTO proposals (
    user_id,
    prospect_name,
    prospect_email,
    title,
    description,
    services,
    pricing,
    terms,
    timeline,
    status,
    total_amount,
    currency,
    valid_until,
    created_at
) VALUES (
    'TU_USER_ID', -- Reemplazar con tu user_id real
    'StartupCreative',
    'maria@startupcreative.com',
    'Identidad Visual Completa',
    'Desarrollo de identidad visual completa para startup tecnológica, incluyendo logo, manual de marca y aplicaciones',
    '{
        "items": [
            "Brief y análisis de marca",
            "Investigación de competencia",
            "Conceptualización y moodboard",
            "Diseño de logo (3 propuestas)",
            "Desarrollo de identidad elegida",
            "Manual de uso de marca",
            "Paleta de colores y tipografías",
            "Aplicaciones: tarjetas, papel",
            "Kit digital para redes sociales",
            "Archivos vectoriales finales"
        ]
    }',
    '{
        "packages": [
            {
                "name": "Identidad Completa",
                "price": 2200,
                "description": "Marca completa con aplicaciones",
                "features": [
                    "Logo principal + variaciones",
                    "Manual de marca completo",
                    "Paleta de colores",
                    "Tipografías corporativas",
                    "Papelería básica",
                    "Kit redes sociales",
                    "Archivos fuente"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "50% al inicio, 50% al entregar",
        "delivery_time": "3-4 semanas",
        "revisions": "2 rondas de revisiones por fase",
        "rights": "Derechos completos al cliente",
        "additional_work": "Aplicaciones adicionales se cotizarán por separado"
    }',
    '{
        "phases": [
            {"name": "Brief y Investigación", "duration": "3 días", "deliverable": "Análisis y estrategia"},
            {"name": "Conceptualización", "duration": "1 semana", "deliverable": "3 propuestas de logo"},
            {"name": "Desarrollo", "duration": "1 semana", "deliverable": "Logo final y variaciones"},
            {"name": "Manual y Aplicaciones", "duration": "1 semana", "deliverable": "Entrega completa"}
        ]
    }',
    'viewed',
    2200.00,
    'EUR',
    CURRENT_DATE + INTERVAL '15 days',
    NOW() - INTERVAL '12 days'
);

-- Propuesta 3: Consultoría Digital
INSERT INTO proposals (
    user_id,
    prospect_name,
    prospect_email,
    title,
    description,
    services,
    pricing,
    terms,
    timeline,
    status,
    total_amount,
    currency,
    valid_until,
    created_at
) VALUES (
    'TU_USER_ID', -- Reemplazar con tu user_id real
    'Empresa Tradicional SA',
    'transformacion@empresatradicional.com',
    'Consultoría de Transformación Digital',
    'Asesoramiento integral para la digitalización de procesos empresariales y optimización tecnológica',
    '{
        "items": [
            "Auditoría tecnológica actual",
            "Análisis de procesos de negocio",
            "Estrategia de transformación digital",
            "Roadmap de implementación",
            "Recomendaciones de herramientas",
            "Plan de migración de datos",
            "Capacitación del equipo",
            "Seguimiento y optimización",
            "Informes mensuales de progreso"
        ]
    }',
    '{
        "packages": [
            {
                "name": "Consultoría Integral",
                "price": 5500,
                "description": "3 meses de consultoría completa",
                "features": [
                    "Auditoría completa",
                    "Estrategia personalizada",
                    "Plan de implementación",
                    "20 horas de capacitación",
                    "Soporte durante 3 meses",
                    "Informes detallados"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "30% al inicio, 40% al mes, 30% al finalizar",
        "delivery_time": "12 semanas",
        "includes": "Auditoría, estrategia, implementación y seguimiento",
        "warranty": "6 meses de soporte post-consultoría",
        "meetings": "Reuniones semanales de seguimiento incluidas"
    }',
    '{
        "phases": [
            {"name": "Auditoría", "duration": "2 semanas", "deliverable": "Informe de situación actual"},
            {"name": "Estrategia", "duration": "2 semanas", "deliverable": "Plan de transformación"},
            {"name": "Implementación", "duration": "6 semanas", "deliverable": "Soluciones desplegadas"},
            {"name": "Seguimiento", "duration": "2 semanas", "deliverable": "Optimización y ajustes"}
        ]
    }',
    'draft',
    5500.00,
    'EUR',
    CURRENT_DATE + INTERVAL '45 days',
    NOW() - INTERVAL '2 days'
);

-- Propuesta 4: Aplicación Móvil (Ejemplo con debilidades)
INSERT INTO proposals (
    user_id,
    prospect_name,
    prospect_email,
    title,
    description,
    services,
    pricing,
    terms,
    timeline,
    status,
    total_amount,
    currency,
    valid_until,
    created_at
) VALUES (
    'TU_USER_ID', -- Reemplazar con tu user_id real
    'GymFit Center',
    'info@gymfitcenter.com',
    'App Móvil para Gimnasio',
    'Desarrollo de aplicación móvil para gestión de miembros y reserva de clases',
    '{
        "items": [
            "App nativa iOS y Android",
            "Sistema de reservas",
            "Perfil de usuario",
            "Notificaciones push",
            "Integración con backend"
        ]
    }',
    '{
        "packages": [
            {
                "name": "App Básica",
                "price": 12000,
                "description": "App móvil básica",
                "features": [
                    "iOS y Android",
                    "Reservas básicas",
                    "Perfil usuario"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "50% inicio, 50% entrega",
        "delivery_time": "Varios meses",
        "revisions": "Incluidas",
        "support": "Soporte básico"
    }',
    '{
        "phases": [
            {"name": "Desarrollo", "duration": "indefinido", "deliverable": "App terminada"}
        ]
    }',
    'rejected',
    12000.00,
    'EUR',
    CURRENT_DATE - INTERVAL '10 days',
    NOW() - INTERVAL '25 days'
);

-- Para usar este script:
-- 1. Ve a tu proyecto de Supabase
-- 2. Entra en el SQL Editor
-- 3. Reemplaza 'TU_USER_ID' con tu ID real de usuario (puedes obtenerlo ejecutando: SELECT auth.uid();)
-- 4. Ejecuta cada INSERT individualmente o todo junto
-- 5. Verifica que se crearon las propuestas: SELECT * FROM proposals WHERE user_id = auth.uid();

-- Comando para obtener tu user_id:
-- SELECT auth.uid();

-- Verificar propuestas creadas:
-- SELECT id, title, prospect_name, status, total_amount, currency, created_at 
-- FROM proposals 
-- WHERE user_id = auth.uid() 
-- ORDER BY created_at DESC;
