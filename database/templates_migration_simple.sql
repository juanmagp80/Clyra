-- SISTEMA DE TEMPLATES PARA FREELANCERS - VERSIÓN SIMPLIFICADA
-- Copia y pega este código completo en la consola SQL de Supabase

-- ==================== TABLA DE TEMPLATES ====================

CREATE TABLE IF NOT EXISTS project_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== RLS Y POLÍTICAS ====================

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates" ON project_templates
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON project_templates
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- ==================== ÍNDICES ====================

CREATE INDEX IF NOT EXISTS idx_project_templates_user_id ON project_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_public ON project_templates(is_public) WHERE is_public = true;

-- ==================== TEMPLATES PREDEFINIDOS ====================

INSERT INTO project_templates (name, category, description, template_data, is_public, usage_count) VALUES
(
    'Desarrollo Web Profesional',
    'web_development', 
    'Template completo para proyectos de desarrollo web con fases, entregables y precios estructurados',
    '{
        "phases": [
            {
                "name": "Descubrimiento y Análisis",
                "duration": "1 semana",
                "tasks": [
                    "Reunión inicial con cliente",
                    "Análisis de requisitos",
                    "Definición de objetivos",
                    "Investigación de competencia",
                    "Arquitectura de información"
                ]
            },
            {
                "name": "Diseño UI/UX",
                "duration": "2 semanas", 
                "tasks": [
                    "Wireframes de baja fidelidad",
                    "Diseño visual",
                    "Prototipo interactivo",
                    "Guía de estilo",
                    "Revisiones con cliente"
                ]
            },
            {
                "name": "Desarrollo Frontend",
                "duration": "3 semanas",
                "tasks": [
                    "Configuración del entorno",
                    "Maquetación responsive",
                    "Implementación de interacciones", 
                    "Integración con APIs",
                    "Optimización de rendimiento"
                ]
            },
            {
                "name": "Desarrollo Backend",
                "duration": "2 semanas",
                "tasks": [
                    "Configuración servidor",
                    "Base de datos",
                    "APIs y endpoints",
                    "Autenticación",
                    "Panel de administración"
                ]
            },
            {
                "name": "Testing y Lanzamiento",
                "duration": "1 semana",
                "tasks": [
                    "Testing funcional",
                    "Testing responsivo",
                    "Optimización SEO",
                    "Configuración hosting",
                    "Formación cliente"
                ]
            }
        ],
        "deliverables": [
            "Sitio web completamente funcional",
            "Panel de administración",
            "Documentación técnica",
            "Manual de usuario",
            "1 mes de soporte incluido"
        ],
        "milestones": [
            "Aprobación de diseños",
            "Entrega de frontend",
            "Integración completa",
            "Testing finalizado",
            "Lanzamiento en vivo"
        ],
        "pricing": {
            "base_price": 3500,
            "hourly_rate": 45,
            "estimated_hours": 80,
            "packages": [
                "Básico: Sitio informativo - €2,500",
                "Profesional: Sitio con CMS - €3,500", 
                "Premium: Plataforma completa - €5,500"
            ]
        }
    }',
    true,
    0
),
(
    'Identidad Visual Completa',
    'design',
    'Template para proyectos de diseño de marca e identidad visual corporativa',
    '{
        "phases": [
            {
                "name": "Brief y Investigación",
                "duration": "3 días",
                "tasks": [
                    "Entrevista con cliente",
                    "Análisis de competencia",
                    "Definición de personalidad de marca",
                    "Moodboard y referencias",
                    "Estrategia visual"
                ]
            },
            {
                "name": "Conceptualización",
                "duration": "1 semana",
                "tasks": [
                    "Bocetos iniciales",
                    "3 propuestas de logo",
                    "Exploración tipográfica",
                    "Paleta de colores",
                    "Presentación de conceptos"
                ]
            },
            {
                "name": "Desarrollo",
                "duration": "1 semana", 
                "tasks": [
                    "Refinamiento del logo seleccionado",
                    "Variaciones del logo",
                    "Aplicaciones de marca",
                    "Patrones y elementos gráficos",
                    "Revisiones finales"
                ]
            },
            {
                "name": "Manual de Marca",
                "duration": "3 días",
                "tasks": [
                    "Documentación de uso",
                    "Ejemplos de aplicación", 
                    "Guía de colores y tipografías",
                    "Usos correctos e incorrectos",
                    "Archivos finales"
                ]
            }
        ],
        "deliverables": [
            "Logo en todas sus variaciones",
            "Manual de identidad corporativa",
            "Papelería corporativa",
            "Kit para redes sociales",
            "Archivos vectoriales y rasterizados"
        ],
        "milestones": [
            "Aprobación de concepto",
            "Logo final aprobado",
            "Aplicaciones completas", 
            "Manual entregado"
        ],
        "pricing": {
            "base_price": 1200,
            "hourly_rate": 40,
            "estimated_hours": 30,
            "packages": [
                "Básico: Logo + Manual - €800",
                "Completo: Identidad + Papelería - €1,200",
                "Premium: Marca + Estrategia - €2,000"
            ]
        }
    }',
    true,
    0
),
(
    'Consultoría Digital',
    'consulting',
    'Template para proyectos de consultoría y auditoría digital',
    '{
        "phases": [
            {
                "name": "Diagnóstico Inicial",
                "duration": "1 semana",
                "tasks": [
                    "Auditoría actual",
                    "Análisis de métricas",
                    "Entrevistas con stakeholders",
                    "Identificación de problemas",
                    "Benchmark competitivo"
                ]
            },
            {
                "name": "Estrategia",
                "duration": "1 semana",
                "tasks": [
                    "Definición de objetivos",
                    "Roadmap de implementación",
                    "Plan de acción",
                    "Priorización de iniciativas",
                    "KPIs y métricas"
                ]
            },
            {
                "name": "Implementación",
                "duration": "2-4 semanas",
                "tasks": [
                    "Ejecución del plan",
                    "Configuración de herramientas",
                    "Formación del equipo",
                    "Seguimiento semanal",
                    "Ajustes y optimizaciones"
                ]
            },
            {
                "name": "Seguimiento",
                "duration": "1 mes",
                "tasks": [
                    "Monitoreo de resultados",
                    "Reportes semanales",
                    "Soporte técnico",
                    "Optimizaciones menores",
                    "Reporte final"
                ]
            }
        ],
        "deliverables": [
            "Auditoría completa",
            "Plan estratégico detallado",
            "Documentación técnica",
            "Formación del equipo",
            "Seguimiento por 30 días"
        ],
        "milestones": [
            "Diagnóstico completado",
            "Estrategia aprobada",
            "Implementación en marcha",
            "Resultados medibles"
        ],
        "pricing": {
            "base_price": 2800,
            "hourly_rate": 70,
            "estimated_hours": 40,
            "packages": [
                "Auditoría: Solo diagnóstico - €1,200",
                "Consultoría: Diagnóstico + Plan - €2,800",
                "Completa: Todo + Implementación - €4,500"
            ]
        }
    }',
    true,
    0
);

-- ==================== FUNCIÓN DE TRIGGER PARA UPDATED_AT ====================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_templates_updated_at 
    BEFORE UPDATE ON project_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
