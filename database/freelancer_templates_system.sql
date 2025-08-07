-- TEMPLATES PARA FREELANCERS
-- Crear sistema de plantillas específicas para diferentes tipos de trabajo freelance

-- ==================== TABLA DE TEMPLATES ====================

CREATE TABLE IF NOT EXISTS project_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'web_development', 'design', 'marketing', 'consulting', etc.
    description TEXT,
    template_data JSONB NOT NULL, -- Estructura completa del template
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates predefinidos por categoría freelance
INSERT INTO project_templates (name, category, description, template_data, is_public) VALUES
-- Template para Desarrollo Web
(
    'Desarrollo Web Completo',
    'web_development',
    'Template completo para proyectos de desarrollo web',
    '{
        "phases": [
            {"name": "Descubrimiento", "duration": "1 week", "tasks": ["Reunión inicial", "Análisis de requisitos", "Wireframes"]},
            {"name": "Diseño", "duration": "2 weeks", "tasks": ["Mockups", "Revisión cliente", "Aprobación diseño"]},
            {"name": "Desarrollo", "duration": "4 weeks", "tasks": ["Setup proyecto", "Frontend", "Backend", "Testing"]},
            {"name": "Lanzamiento", "duration": "1 week", "tasks": ["Deploy", "Testing final", "Entrega"]}
        ],
        "deliverables": ["Wireframes", "Mockups", "Sitio web funcional", "Documentación"],
        "milestones": ["Aprobación diseño", "MVP funcional", "Lanzamiento"],
        "pricing": {
            "base_price": 3000,
            "hourly_rate": 50,
            "estimated_hours": 80
        }
    }',
    true
),
-- Template para Diseño Gráfico
(
    'Proyecto de Branding',
    'design',
    'Template para proyectos de identidad visual',
    '{
        "phases": [
            {"name": "Brief", "duration": "3 days", "tasks": ["Briefing cliente", "Research competencia", "Moodboard"]},
            {"name": "Conceptualización", "duration": "1 week", "tasks": ["Bocetos logo", "Propuestas color", "Tipografía"]},
            {"name": "Desarrollo", "duration": "1.5 weeks", "tasks": ["Logo final", "Manual de marca", "Aplicaciones"]},
            {"name": "Entrega", "duration": "2 days", "tasks": ["Archivos finales", "Presentación", "Manual uso"]}
        ],
        "deliverables": ["Logo vectorial", "Manual de marca", "Tarjetas de visita", "Papelería"],
        "milestones": ["Aprobación concepto", "Logo final", "Manual completo"],
        "pricing": {
            "base_price": 1500,
            "packages": ["Básico: 800€", "Completo: 1500€", "Premium: 2500€"]
        }
    }',
    true
),
-- Template para Consultoría
(
    'Consultoría Digital',
    'consulting',
    'Template para proyectos de consultoría y estrategia',
    '{
        "phases": [
            {"name": "Auditoría", "duration": "1 week", "tasks": ["Análisis situación", "Benchmarking", "DAFO"]},
            {"name": "Estrategia", "duration": "2 weeks", "tasks": ["Plan estratégico", "Roadmap", "KPIs"]},
            {"name": "Implementación", "duration": "4 weeks", "tasks": ["Setup procesos", "Formación", "Seguimiento"]},
            {"name": "Optimización", "duration": "2 weeks", "tasks": ["Análisis resultados", "Ajustes", "Informe final"]}
        ],
        "deliverables": ["Auditoría completa", "Plan estratégico", "Roadmap implementación", "Informe resultados"],
        "milestones": ["Auditoría completada", "Estrategia aprobada", "Implementación activa"],
        "pricing": {
            "hourly_rate": 75,
            "estimated_hours": 60,
            "retainer_monthly": 2000
        }
    }',
    true
);

-- ==================== ÍNDICES Y RLS ====================

CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_public ON project_templates(is_public);

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- Solo el propietario puede ver sus templates privados, todos pueden ver los públicos
CREATE POLICY "Users can view own or public templates" ON project_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own templates" ON project_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON project_templates
    FOR UPDATE USING (auth.uid() = user_id);
