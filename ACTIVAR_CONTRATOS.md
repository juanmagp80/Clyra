## 🚀 **PASOS PARA ACTIVAR EL SISTEMA DE CONTRATOS**

### 1. **Ejecutar la migración en Supabase**
1. Ve a tu dashboard de Supabase
2. Entra en "SQL Editor"
3. Copia y pega el siguiente SQL completo:

```sql
-- Migración para el sistema de contratos
CREATE TABLE IF NOT EXISTS contract_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    template_id UUID REFERENCES contract_templates(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    contract_content TEXT NOT NULL,
    project_details JSONB DEFAULT '{}'::jsonb,
    contract_value DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    start_date DATE,
    end_date DATE,
    payment_terms TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    signed_at TIMESTAMP WITH TIME ZONE,
    client_signature TEXT,
    freelancer_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_user_id ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_templates_category ON contract_templates(category);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts" ON contracts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts" ON contracts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" ON contracts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" ON contracts
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view contract templates" ON contract_templates
    FOR SELECT USING (is_active = true);

-- Templates de contratos (5 profesionales)
INSERT INTO contract_templates (name, description, category, template_content, variables) VALUES
('Contrato de Desarrollo Web', 'Contrato estándar para proyectos de desarrollo web y aplicaciones', 'web_development', 
'CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO WEB

Entre {{freelancer_name}}, con DNI {{freelancer_dni}}, domiciliado en {{freelancer_address}} (en adelante, "EL PRESTADOR"), y {{client_name}}, con {{client_document_type}} {{client_document}}, domiciliado en {{client_address}} (en adelante, "EL CLIENTE"), se acuerda:

PRIMERA.- OBJETO DEL CONTRATO
EL PRESTADOR se compromete a desarrollar y entregar al CLIENTE el siguiente proyecto web:
- Nombre del proyecto: {{project_name}}
- Descripción: {{project_description}}
- Tecnologías a utilizar: {{technologies}}
- Funcionalidades principales: {{main_features}}

SEGUNDA.- PLAZO DE EJECUCIÓN
El proyecto se ejecutará en un plazo de {{project_duration}} días naturales, contados desde {{start_date}} hasta {{end_date}}.

TERCERA.- PRECIO Y FORMA DE PAGO
El precio total del proyecto es de {{contract_value}} {{currency}}.
Forma de pago: {{payment_terms}}

CUARTA.- ENTREGABLES
- Código fuente completo
- Documentación técnica
- Manual de usuario
- {{additional_deliverables}}

QUINTA.- PROPIEDAD INTELECTUAL
Una vez abonado el importe total, todos los derechos de propiedad intelectual del trabajo desarrollado quedarán transferidos al CLIENTE.

En {{city}}, a {{contract_date}}

EL PRESTADOR                    EL CLIENTE
{{freelancer_name}}            {{client_name}}',
'["freelancer_name", "freelancer_dni", "freelancer_address", "client_name", "client_document_type", "client_document", "client_address", "project_name", "project_description", "technologies", "main_features", "project_duration", "start_date", "end_date", "contract_value", "currency", "payment_terms", "additional_deliverables", "city", "contract_date"]'),

('Contrato de Diseño Gráfico', 'Contrato para servicios de diseño gráfico y branding', 'design',
'CONTRATO DE SERVICIOS DE DISEÑO GRÁFICO

Entre {{freelancer_name}}, con DNI {{freelancer_dni}}, como diseñador freelance (en adelante, "EL DISEÑADOR"), y {{client_name}}, con {{client_document_type}} {{client_document}} (en adelante, "EL CLIENTE"), se establece:

PRIMERA.- SERVICIOS DE DISEÑO
EL DISEÑADOR proporcionará los siguientes servicios:
- Tipo de diseño: {{design_type}}
- Descripción del proyecto: {{project_description}}
- Número de propuestas iniciales: {{initial_proposals}}
- Número de revisiones incluidas: {{revisions_included}}

SEGUNDA.- CRONOGRAMA
- Fecha de inicio: {{start_date}}
- Entrega de primeras propuestas: {{first_delivery_date}}
- Entrega final: {{end_date}}

TERCERA.- HONORARIOS
Importe total: {{contract_value}} {{currency}}
{{payment_terms}}

En {{city}}, a {{contract_date}}

EL DISEÑADOR                    EL CLIENTE
{{freelancer_name}}            {{client_name}}',
'["freelancer_name", "freelancer_dni", "client_name", "client_document_type", "client_document", "design_type", "project_description", "initial_proposals", "revisions_included", "start_date", "first_delivery_date", "end_date", "contract_value", "currency", "payment_terms", "file_formats", "revision_cost", "city", "contract_date"]'),

('Contrato de Marketing Digital', 'Contrato para servicios de marketing digital y redes sociales', 'marketing',
'CONTRATO DE SERVICIOS DE MARKETING DIGITAL

Entre {{freelancer_name}}, profesional en marketing digital (en adelante, "EL CONSULTOR"), y {{client_name}} (en adelante, "EL CLIENTE"):

PRIMERA.- SERVICIOS INCLUIDOS
- Gestión de redes sociales: {{social_networks}}
- Estrategia de contenido: {{content_strategy}}
- Campañas publicitarias: {{advertising_campaigns}}
- Análisis y reporting: {{reporting_frequency}}

SEGUNDA.- OBJETIVOS Y KPIS
- Objetivo principal: {{main_objective}}
- KPIs a medir: {{kpis}}
- Meta de alcance: {{reach_goal}}
- Meta de engagement: {{engagement_goal}}

En {{city}}, a {{contract_date}}

EL CONSULTOR                    EL CLIENTE
{{freelancer_name}}            {{client_name}}',
'["freelancer_name", "client_name", "social_networks", "content_strategy", "advertising_campaigns", "reporting_frequency", "main_objective", "kpis", "reach_goal", "engagement_goal", "contract_duration", "start_date", "notice_period", "professional_fee", "currency", "ad_budget", "monthly_total", "meeting_frequency", "communication_channel", "city", "contract_date"]'),

('Contrato de Consultoría', 'Contrato general para servicios de consultoría profesional', 'consulting',
'CONTRATO DE PRESTACIÓN DE SERVICIOS DE CONSULTORÍA

Entre {{freelancer_name}}, consultor especializado en {{specialization}} (en adelante, "EL CONSULTOR"), y {{client_name}} (en adelante, "EL CLIENTE"):

PRIMERA.- OBJETO DE LA CONSULTORÍA
EL CONSULTOR prestará servicios de consultoría en:
- Área de especialización: {{specialization}}
- Alcance del proyecto: {{project_scope}}
- Objetivos esperados: {{expected_outcomes}}

SEGUNDA.- MODALIDAD DE TRABAJO
- Modalidad: {{work_modality}} (presencial/remoto/híbrido)
- Horas estimadas: {{estimated_hours}} horas

En {{city}}, a {{contract_date}}

EL CONSULTOR                    EL CLIENTE
{{freelancer_name}}            {{client_name}}',
'["freelancer_name", "specialization", "client_name", "project_scope", "expected_outcomes", "work_modality", "estimated_hours", "weekly_hours", "hourly_rate", "currency", "total_estimate", "billing_frequency", "additional_deliverables", "city", "contract_date"]'),

('Contrato de Redacción de Contenidos', 'Contrato para servicios de copywriting y creación de contenidos', 'content',
'CONTRATO DE SERVICIOS DE REDACCIÓN DE CONTENIDOS

Entre {{freelancer_name}}, redactor profesional (en adelante, "EL REDACTOR"), y {{client_name}} (en adelante, "EL CLIENTE"):

PRIMERA.- SERVICIOS DE REDACCIÓN
Tipo de contenido a crear:
- {{content_type}} (blog posts, web copy, newsletters, etc.)
- Cantidad: {{content_quantity}}
- Extensión promedio: {{average_length}} palabras

SEGUNDA.- PROCESO DE TRABAJO
- Briefing inicial y definición de objetivos
- Investigación y documentación
- Primera versión del contenido
- Revisiones (máximo {{max_revisions}} por pieza)

En {{city}}, a {{contract_date}}

EL REDACTOR                     EL CLIENTE
{{freelancer_name}}            {{client_name}}',
'["freelancer_name", "client_name", "content_type", "content_quantity", "average_length", "tone_style", "max_revisions", "start_date", "delivery_frequency", "review_deadline", "price_per_word", "price_per_piece", "contract_value", "currency", "seo_optimization", "target_keywords", "keyword_density", "city", "contract_date"]');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON contract_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Haz clic en "RUN"

### 2. **Después de ejecutar la migración:**
- Recarga la página de contratos
- El botón "Nuevo Contrato" ya debería estar habilitado
- Tendrás 5 templates profesionales disponibles

### 3. **Para solucionar el problema del layout:**
Si ves contenido debajo del sidebar, refresca la página tras ejecutar la migración.

¡Ya está todo listo para usar! 🎉
