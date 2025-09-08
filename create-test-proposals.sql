-- Script para crear propuestas de ejemplo para probar el sistema
-- Ejecutar en Supabase SQL Editor después de reemplazar 'TU_USER_ID' con tu ID real

-- Primero obtener tu user_id (ejecuta esto primero):
-- SELECT auth.uid() as user_id;

-- Propuesta 1: Desarrollo Web con buen diseño
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
    notes,
    created_at
) VALUES (
    'TU_USER_ID', -- Reemplazar con tu user_id real
    'TechStart Innovations',
    'contacto@techstart.com',
    'Desarrollo de Aplicación Web SaaS',
    'Desarrollo completo de aplicación web SaaS para gestión de proyectos con dashboard administrativo, sistema de usuarios y API REST',
    '[
        {"id": "1", "name": "Análisis y Arquitectura", "description": "Definición de requisitos técnicos y diseño de arquitectura"},
        {"id": "2", "name": "Diseño UI/UX", "description": "Diseño de interfaces responsive y experiencia de usuario"},
        {"id": "3", "name": "Desarrollo Frontend", "description": "Implementación con React/Next.js y TypeScript"},
        {"id": "4", "name": "Desarrollo Backend", "description": "API REST con Node.js y base de datos PostgreSQL"},
        {"id": "5", "name": "Sistema de Autenticación", "description": "Login, registro y gestión de roles de usuarios"},
        {"id": "6", "name": "Dashboard Administrativo", "description": "Panel de control con métricas y gestión"},
        {"id": "7", "name": "Testing y QA", "description": "Pruebas automatizadas y testing manual"},
        {"id": "8", "name": "Deployment y DevOps", "description": "Configuración de servidores y CI/CD"},
        {"id": "9", "name": "Documentación", "description": "Documentación técnica y de usuario"},
        {"id": "10", "name": "Soporte Post-lanzamiento", "description": "3 meses de soporte y mantenimiento incluido"}
    ]',
    '{
        "packages": [
            {
                "name": "Aplicación SaaS Completa",
                "price": 15000,
                "description": "Solución completa lista para producción",
                "features": [
                    "Hasta 1000 usuarios simultáneos",
                    "Dashboard administrativo completo",
                    "API REST documentada",
                    "Sistema de autenticación robusto",
                    "Diseño responsive mobile-first",
                    "Base de datos optimizada",
                    "SSL y medidas de seguridad",
                    "Backup automático diario",
                    "Monitoreo y alertas",
                    "3 meses de soporte incluido"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "30% al inicio, 40% al 60% de avance, 30% al entregar",
        "delivery_time": "12-14 semanas",
        "revisions": "3 rondas de revisiones por fase incluidas",
        "warranty": "6 meses de garantía y corrección de bugs",
        "additional_work": "Funcionalidades adicionales se cotizarán por separado según scope",
        "support": "3 meses de soporte post-lanzamiento incluido"
    }',
    '{
        "phases": [
            {"name": "Análisis y Planificación", "duration": "2 semanas", "deliverable": "Documentación técnica y wireframes aprobados"},
            {"name": "Diseño UI/UX", "duration": "2 semanas", "deliverable": "Diseños finales y prototipo interactivo"},
            {"name": "Setup y Arquitectura", "duration": "1 semana", "deliverable": "Estructura base del proyecto configurada"},
            {"name": "Desarrollo Backend", "duration": "3 semanas", "deliverable": "API REST completa y documentada"},
            {"name": "Desarrollo Frontend", "duration": "3 semanas", "deliverable": "Interfaz de usuario funcional"},
            {"name": "Integración y Testing", "duration": "2 semanas", "deliverable": "Aplicación integrada con tests"},
            {"name": "Deployment y Optimización", "duration": "1 semana", "deliverable": "Aplicación desplegada en producción"}
        ]
    }',
    'sent',
    15000.00,
    'EUR',
    CURRENT_DATE + INTERVAL '45 days',
    'Cliente muy interesado, ya tuvimos 2 reuniones. Equipo técnico con experiencia en React. Presupuesto confirmado. Proyecto prioritario para Q1.',
    NOW() - INTERVAL '3 days'
);

-- Propuesta 2: Proyecto simple pero con debilidades para mostrar mejoras
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
    notes,
    created_at
) VALUES (
    'TU_USER_ID', -- Reemplazar con tu user_id real
    'Restaurante El Buen Sabor',
    'info@elbuensabor.com',
    'Página Web para Restaurante',
    'Sitio web básico',
    '[
        {"id": "1", "name": "Diseño web", "description": "Diseño básico"},
        {"id": "2", "name": "Desarrollo", "description": "Programación"},
        {"id": "3", "name": "Contenido", "description": "Textos e imágenes"}
    ]',
    '{
        "packages": [
            {
                "name": "Web Básica",
                "price": 2500,
                "description": "Sitio web sencillo",
                "features": [
                    "5 páginas",
                    "Diseño responsive",
                    "Formulario contacto"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "50% inicio, 50% final",
        "delivery_time": "Un mes aproximadamente",
        "revisions": "Incluidas",
        "warranty": "Garantía básica"
    }',
    '{
        "phases": [
            {"name": "Desarrollo", "duration": "1 mes", "deliverable": "Web terminada"}
        ]
    }',
    'draft',
    2500.00,
    'EUR',
    CURRENT_DATE + INTERVAL '20 days',
    'Cliente local, presupuesto limitado',
    NOW() - INTERVAL '7 days'
);

-- Propuesta 3: Consultoría bien estructurada
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
    notes,
    created_at
) VALUES (
    'TU_USER_ID', -- Reemplazar con tu user_id real
    'Empresa Digital Solutions SL',
    'director@digitalsolutions.com',
    'Consultoría de Transformación Digital y Automatización',
    'Asesoramiento integral para digitalización de procesos empresariales, implementación de herramientas de automatización y optimización de workflows existentes',
    '[
        {"id": "1", "name": "Auditoría Digital Completa", "description": "Análisis exhaustivo de procesos actuales y identificación de oportunidades"},
        {"id": "2", "name": "Estrategia de Transformación", "description": "Roadmap personalizado de digitalización por fases"},
        {"id": "3", "name": "Implementación de Herramientas", "description": "Setup y configuración de soluciones tecnológicas"},
        {"id": "4", "name": "Automatización de Workflows", "description": "Creación de procesos automatizados clave"},
        {"id": "5", "name": "Capacitación del Equipo", "description": "Formación práctica para el personal"},
        {"id": "6", "name": "Seguimiento y Optimización", "description": "Monitoreo de resultados y ajustes continuos"}
    ]',
    '{
        "packages": [
            {
                "name": "Transformación Digital Completa",
                "price": 8500,
                "description": "Programa integral de 3 meses",
                "features": [
                    "Auditoría completa de procesos",
                    "Estrategia personalizada de digitalización",
                    "Implementación de 5+ herramientas",
                    "Automatización de workflows críticos",
                    "Capacitación para 20+ empleados",
                    "Soporte durante 6 meses",
                    "ROI tracking y métricas",
                    "Documentación completa",
                    "Acceso a herramientas premium",
                    "Reuniones semanales de seguimiento"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "25% al inicio, 50% al mes 1.5, 25% al finalizar",
        "delivery_time": "12 semanas (3 meses)",
        "revisions": "Ajustes ilimitados durante el período de implementación",
        "warranty": "6 meses de soporte post-implementación incluido",
        "additional_work": "Herramientas adicionales según necesidades específicas",
        "support": "Soporte prioritario vía email, teléfono y reuniones semanales"
    }',
    '{
        "phases": [
            {"name": "Auditoría y Análisis", "duration": "3 semanas", "deliverable": "Informe detallado de situación actual y oportunidades"},
            {"name": "Estrategia y Planificación", "duration": "2 semanas", "deliverable": "Roadmap de transformación y selección de herramientas"},
            {"name": "Implementación Fase 1", "duration": "3 semanas", "deliverable": "Herramientas core configuradas y funcionando"},
            {"name": "Implementación Fase 2", "duration": "2 semanas", "deliverable": "Automatizaciones y workflows implementados"},
            {"name": "Capacitación y Transferencia", "duration": "1.5 semanas", "deliverable": "Equipo capacitado y documentación entregada"},
            {"name": "Seguimiento y Optimización", "duration": "0.5 semanas", "deliverable": "Ajustes finales y plan de mantenimiento"}
        ]
    }',
    'viewed',
    8500.00,
    'EUR',
    CURRENT_DATE + INTERVAL '30 days',
    'Empresa mediana con 50 empleados. Muy interesados en automatización. Presupuesto aprobado por gerencia. Quieren empezar en febrero.',
    NOW() - INTERVAL '5 days'
);

-- Verificar que se crearon las propuestas
-- SELECT id, title, prospect_name, status, total_amount, currency, created_at 
-- FROM proposals 
-- WHERE user_id = 'TU_USER_ID' 
-- ORDER BY created_at DESC;
