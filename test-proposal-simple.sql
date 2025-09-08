-- Script de prueba simple para el analizador de propuestas
-- Ejecutar en Supabase SQL Editor

-- 1. Primero obtener tu user_id
SELECT auth.uid() as tu_user_id;

-- 2. Insertar una propuesta de prueba simple (reemplaza 'TU_USER_ID' con el resultado anterior)
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
    'TU_USER_ID', -- REEMPLAZAR AQUÍ
    'Empresa Ejemplo SL',
    'contacto@ejemplo.com',
    'Desarrollo Web Corporativo',
    'Desarrollo de sitio web corporativo moderno con diseño responsive y sistema de gestión de contenidos',
    '[
        {"id": "1", "name": "Diseño UI/UX", "description": "Diseño moderno y responsive"},
        {"id": "2", "name": "Desarrollo Frontend", "description": "HTML, CSS, JavaScript"},
        {"id": "3", "name": "Sistema CMS", "description": "Panel de administración"},
        {"id": "4", "name": "SEO Básico", "description": "Optimización para buscadores"}
    ]',
    '{
        "packages": [
            {
                "name": "Web Completa",
                "price": 3500,
                "description": "Sitio web corporativo completo",
                "features": [
                    "Diseño personalizado",
                    "5 páginas principales",
                    "Panel de administración",
                    "Responsive design",
                    "Optimización SEO",
                    "Formulario de contacto"
                ]
            }
        ]
    }',
    '{
        "payment_terms": "50% al inicio, 50% al entregar",
        "delivery_time": "4-6 semanas",
        "revisions": "3 rondas de revisiones incluidas",
        "warranty": "3 meses de soporte y mantenimiento"
    }',
    '{
        "phases": [
            {"name": "Análisis y Diseño", "duration": "1-2 semanas", "deliverable": "Mockups y wireframes"},
            {"name": "Desarrollo", "duration": "2-3 semanas", "deliverable": "Sitio web funcional"},
            {"name": "Testing y Ajustes", "duration": "1 semana", "deliverable": "Sitio web optimizado"}
        ]
    }',
    'sent',
    3500.00,
    'EUR',
    CURRENT_DATE + INTERVAL '30 days',
    NOW()
);

-- 3. Verificar que se creó la propuesta
SELECT id, title, prospect_name, total_amount, currency, status, created_at 
FROM proposals 
WHERE user_id = 'TU_USER_ID'  -- REEMPLAZAR AQUÍ TAMBIÉN
ORDER BY created_at DESC 
LIMIT 5;
