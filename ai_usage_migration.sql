-- Tabla para trackear el uso de IA y calcular costos
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_type VARCHAR(50) NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  model VARCHAR(50) DEFAULT 'gpt-4-turbo',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_automation_type ON ai_usage(automation_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_type ON ai_usage(user_id, automation_type);

-- RLS (Row Level Security) para que cada usuario solo vea sus propios datos
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propios registros
CREATE POLICY "Users can view own AI usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar sus propios registros
CREATE POLICY "Users can insert own AI usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_ai_usage_updated_at ON ai_usage;
CREATE TRIGGER update_ai_usage_updated_at
    BEFORE UPDATE ON ai_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vista para estadísticas de uso mensual por usuario
CREATE OR REPLACE VIEW ai_usage_monthly_stats AS
SELECT 
  user_id,
  automation_type,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_requests,
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  SUM(total_tokens) as total_tokens,
  SUM(cost_usd) as total_cost_usd,
  AVG(cost_usd) as avg_cost_per_request
FROM ai_usage
WHERE success = true
GROUP BY user_id, automation_type, DATE_TRUNC('month', created_at)
ORDER BY month DESC, total_cost_usd DESC;

-- Vista para el resumen de costos del mes actual por usuario
CREATE OR REPLACE VIEW ai_usage_current_month AS
SELECT 
  user_id,
  COUNT(*) as total_requests,
  SUM(cost_usd) as total_cost_usd,
  SUM(CASE WHEN automation_type = 'email_generation' THEN cost_usd ELSE 0 END) as email_cost,
  SUM(CASE WHEN automation_type = 'project_analysis' THEN cost_usd ELSE 0 END) as project_cost,
  SUM(CASE WHEN automation_type = 'meeting_reminder' THEN cost_usd ELSE 0 END) as meeting_cost,
  SUM(CASE WHEN automation_type = 'invoice_followup' THEN cost_usd ELSE 0 END) as invoice_cost,
  SUM(CASE WHEN automation_type = 'client_onboarding' THEN cost_usd ELSE 0 END) as onboarding_cost,
  SUM(CASE WHEN automation_type = 'feedback_analysis' THEN cost_usd ELSE 0 END) as feedback_cost
FROM ai_usage
WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
  AND success = true
GROUP BY user_id;

-- Comentarios sobre la estructura
COMMENT ON TABLE ai_usage IS 'Registro de uso de IA para automatizaciones';
COMMENT ON COLUMN ai_usage.automation_type IS 'Tipo de automatización: email_generation, project_analysis, meeting_reminder, invoice_followup, client_onboarding, feedback_analysis';
COMMENT ON COLUMN ai_usage.prompt_tokens IS 'Tokens usados en el prompt (input)';
COMMENT ON COLUMN ai_usage.completion_tokens IS 'Tokens generados en la respuesta (output)';
COMMENT ON COLUMN ai_usage.cost_usd IS 'Costo en USD basado en los tokens y modelo usado';
COMMENT ON COLUMN ai_usage.metadata IS 'Datos adicionales como client_id, project_id, etc.';
