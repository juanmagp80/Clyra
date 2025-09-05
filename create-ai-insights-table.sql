-- TABLA AI_INSIGHTS PARA AUTOMATIZACIONES IA
-- Ejecutar en Supabase SQL Editor

-- Crear tabla ai_insights si no existe
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Tipo de insight
    insight_type VARCHAR(50) NOT NULL, -- sentiment_analysis, communication_optimization, etc.
    category VARCHAR(50), -- client_feedback, sales, productivity, etc.
    
    -- Contenido del insight
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    data_points JSONB, -- Datos que sustentan el insight
    
    -- Métricas y scores
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
    actionability_score INTEGER CHECK (actionability_score BETWEEN 1 AND 10),
    
    -- Recomendaciones
    recommendations TEXT[],
    suggested_actions JSONB, -- [{action, priority, estimated_impact}]
    
    -- Estado del insight
    status VARCHAR(20) CHECK (status IN ('new', 'viewed', 'acted_upon', 'dismissed', 'archived')) DEFAULT 'new',
    user_feedback INTEGER CHECK (user_feedback BETWEEN 1 AND 5),
    user_notes TEXT,
    
    -- Contexto temporal
    time_period_start TIMESTAMPTZ,
    time_period_end TIMESTAMPTZ,
    related_events UUID[],
    related_clients UUID[],
    related_projects UUID[],
    
    -- Automatización
    auto_generated BOOLEAN DEFAULT true,
    generation_algorithm VARCHAR(100),
    triggers_used TEXT[],
    
    -- Validación y mejora
    was_accurate BOOLEAN,
    actual_outcome TEXT,
    feedback_for_ml JSONB,
    
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can manage own AI insights" ON ai_insights
    FOR ALL USING (auth.uid() = user_id);

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_insights(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_ai_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_ai_insights_updated_at ON ai_insights;
CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON ai_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_insights_updated_at();
