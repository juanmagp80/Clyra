-- SISTEMA DE PROPUESTAS Y COTIZACIONES PARA FREELANCERS
-- Crear, gestionar y hacer seguimiento de propuestas comerciales

-- ==================== TABLA DE PROPUESTAS ====================

CREATE TABLE IF NOT EXISTS proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    prospect_name VARCHAR(255), -- Para clientes potenciales que aún no están en el CRM
    prospect_email VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    services JSONB NOT NULL, -- Array de servicios incluidos
    pricing JSONB NOT NULL, -- Estructura de precios
    terms JSONB, -- Términos y condiciones
    timeline JSONB, -- Cronograma del proyecto
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'
    valid_until DATE,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    total_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    template_used VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TABLA DE TEMPLATES DE PROPUESTAS ====================

CREATE TABLE IF NOT EXISTS proposal_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'web_development', 'design', 'marketing', etc.
    structure JSONB NOT NULL, -- Estructura completa del template
    default_pricing JSONB,
    default_terms JSONB,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates predefinidos de propuestas
INSERT INTO proposal_templates (name, category, structure, default_pricing, default_terms, is_active) VALUES
-- Template para Desarrollo Web
(
    'Propuesta Desarrollo Web',
    'web_development',
    '{
        "sections": [
            {
                "title": "Resumen Ejecutivo",
                "content": "Propuesta para desarrollo de sitio web profesional que mejorará su presencia digital y aumentará sus conversiones."
            },
            {
                "title": "Servicios Incluidos",
                "items": [
                    "Análisis de requisitos y consultoría inicial",
                    "Diseño UI/UX responsive",
                    "Desarrollo frontend y backend",
                    "Integración CMS",
                    "Optimización SEO básica",
                    "Testing y depuración",
                    "Formación uso plataforma",
                    "1 mes de soporte post-lanzamiento"
                ]
            },
            {
                "title": "Cronograma",
                "phases": [
                    {"name": "Descubrimiento", "duration": "1 semana", "deliverable": "Especificaciones técnicas"},
                    {"name": "Diseño", "duration": "2 semanas", "deliverable": "Mockups aprobados"},
                    {"name": "Desarrollo", "duration": "4 semanas", "deliverable": "Sitio web funcional"},
                    {"name": "Testing", "duration": "1 semana", "deliverable": "Sitio web optimizado"},
                    {"name": "Lanzamiento", "duration": "1 semana", "deliverable": "Sitio web en vivo"}
                ]
            },
            {
                "title": "Inversión",
                "note": "Los precios incluyen todo lo especificado en esta propuesta"
            }
        ]
    }',
    '{
        "packages": [
            {
                "name": "Básico",
                "price": 2500,
                "description": "Sitio web informativo hasta 5 páginas",
                "features": ["Diseño responsive", "CMS básico", "SEO básico"]
            },
            {
                "name": "Profesional", 
                "price": 4500,
                "description": "Sitio web completo hasta 10 páginas",
                "features": ["Todo lo básico", "Blog integrado", "Formularios avanzados", "Analytics"]
            },
            {
                "name": "Premium",
                "price": 7500,
                "description": "Plataforma web completa",
                "features": ["Todo lo profesional", "E-commerce básico", "Integraciones", "Mantenimiento 3 meses"]
            }
        ]
    }',
    '{
        "payment_terms": "50% al inicio, 50% al completar",
        "delivery_time": "6-8 semanas",
        "revisions": "3 rondas de revisiones incluidas",
        "warranty": "1 mes de garantía post-lanzamiento",
        "cancellation": "Cancelación con 1 semana de aviso"
    }',
    true
),
-- Template para Diseño
(
    'Propuesta Diseño de Marca',
    'design',
    '{
        "sections": [
            {
                "title": "Propuesta Creativa",
                "content": "Desarrollo de identidad visual completa que transmita los valores de su marca y conecte con su audiencia objetivo."
            },
            {
                "title": "Entregables",
                "items": [
                    "Logo principal en versiones horizontal y vertical",
                    "Variaciones de logo (monocromático, simplified)",
                    "Paleta de colores corporativa",
                    "Tipografías corporativas",
                    "Manual de uso de marca",
                    "Aplicaciones: tarjetas, papel membretado",
                    "Archivos fuente vectoriales",
                    "Kit digital para redes sociales"
                ]
            },
            {
                "title": "Proceso Creativo",
                "phases": [
                    {"name": "Brief", "duration": "2 días", "deliverable": "Análisis y moodboard"},
                    {"name": "Conceptualización", "duration": "1 semana", "deliverable": "3 propuestas logo"},
                    {"name": "Desarrollo", "duration": "1 semana", "deliverable": "Logo final y variaciones"},
                    {"name": "Manual", "duration": "3 días", "deliverable": "Manual de marca completo"},
                    {"name": "Aplicaciones", "duration": "2 días", "deliverable": "Papelería y kit digital"}
                ]
            }
        ]
    }',
    '{
        "packages": [
            {
                "name": "Identidad Básica",
                "price": 800,
                "description": "Logo + manual básico",
                "features": ["Logo principal", "2 variaciones", "Manual PDF", "Archivos vectoriales"]
            },
            {
                "name": "Identidad Completa",
                "price": 1500,
                "description": "Marca completa con aplicaciones",
                "features": ["Todo lo básico", "Paleta extendida", "Papelería", "Kit redes sociales"]
            },
            {
                "name": "Identidad Premium",
                "price": 2500,
                "description": "Marca + estrategia visual",
                "features": ["Todo lo completo", "Estrategia comunicación", "Presentación cliente", "3 meses asesoría"]
            }
        ]
    }',
    '{
        "payment_terms": "60% al inicio, 40% al entregar",
        "delivery_time": "2-3 semanas",
        "revisions": "2 rondas de revisiones por fase",
        "rights": "Derechos completos transferidos al cliente",
        "additional_work": "Trabajos adicionales se cotizarán por separado"
    }',
    true
);

-- ==================== TABLA DE SEGUIMIENTO ====================

CREATE TABLE IF NOT EXISTS proposal_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'viewed', 'downloaded', 'forwarded', 'responded'
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== FUNCIONES DE NEGOCIO ====================

-- Función para calcular métricas de propuestas
CREATE OR REPLACE FUNCTION get_proposal_metrics(user_uuid UUID, date_from DATE DEFAULT NULL, date_to DATE DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    metrics JSONB := '{}';
    total_proposals INTEGER;
    sent_proposals INTEGER;
    accepted_proposals INTEGER;
    total_value DECIMAL(10,2);
    won_value DECIMAL(10,2);
    avg_response_time INTERVAL;
BEGIN
    -- Filtros de fecha
    IF date_from IS NULL THEN date_from := CURRENT_DATE - INTERVAL '30 days'; END IF;
    IF date_to IS NULL THEN date_to := CURRENT_DATE; END IF;
    
    -- Total de propuestas
    SELECT COUNT(*) INTO total_proposals
    FROM proposals 
    WHERE user_id = user_uuid 
    AND created_at::date BETWEEN date_from AND date_to;
    
    -- Propuestas enviadas
    SELECT COUNT(*) INTO sent_proposals
    FROM proposals 
    WHERE user_id = user_uuid 
    AND status IN ('sent', 'viewed', 'accepted', 'rejected')
    AND created_at::date BETWEEN date_from AND date_to;
    
    -- Propuestas aceptadas
    SELECT COUNT(*) INTO accepted_proposals
    FROM proposals 
    WHERE user_id = user_uuid 
    AND status = 'accepted'
    AND created_at::date BETWEEN date_from AND date_to;
    
    -- Valor total propuesto
    SELECT COALESCE(SUM(total_amount), 0) INTO total_value
    FROM proposals 
    WHERE user_id = user_uuid 
    AND status IN ('sent', 'viewed', 'accepted', 'rejected')
    AND created_at::date BETWEEN date_from AND date_to;
    
    -- Valor ganado
    SELECT COALESCE(SUM(total_amount), 0) INTO won_value
    FROM proposals 
    WHERE user_id = user_uuid 
    AND status = 'accepted'
    AND created_at::date BETWEEN date_from AND date_to;
    
    -- Tiempo promedio de respuesta
    SELECT AVG(responded_at - sent_at) INTO avg_response_time
    FROM proposals 
    WHERE user_id = user_uuid 
    AND responded_at IS NOT NULL
    AND created_at::date BETWEEN date_from AND date_to;
    
    -- Construir métricas
    metrics := jsonb_build_object(
        'total_proposals', total_proposals,
        'sent_proposals', sent_proposals,
        'accepted_proposals', accepted_proposals,
        'rejection_rate', CASE WHEN sent_proposals > 0 THEN (sent_proposals - accepted_proposals)::float / sent_proposals ELSE 0 END,
        'conversion_rate', CASE WHEN sent_proposals > 0 THEN accepted_proposals::float / sent_proposals ELSE 0 END,
        'total_value', total_value,
        'won_value', won_value,
        'win_rate_value', CASE WHEN total_value > 0 THEN won_value / total_value ELSE 0 END,
        'avg_response_hours', CASE WHEN avg_response_time IS NOT NULL THEN EXTRACT(EPOCH FROM avg_response_time) / 3600 ELSE NULL END
    );
    
    RETURN metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== RLS Y ÍNDICES ====================

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas para proposals
CREATE POLICY "Users can manage own proposals" ON proposals
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para proposal_templates
CREATE POLICY "Users can manage own proposal templates" ON proposal_templates
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para proposal_tracking
CREATE POLICY "Users can view tracking of own proposals" ON proposal_tracking
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM proposals WHERE id = proposal_tracking.proposal_id AND user_id = auth.uid())
    );

-- Índices
CREATE INDEX IF NOT EXISTS idx_proposals_user_status ON proposals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_proposal_tracking_proposal_id ON proposal_tracking(proposal_id, event_type);
