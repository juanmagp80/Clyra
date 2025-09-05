-- Tabla para trackear uso de IA y costos
CREATE TABLE IF NOT EXISTS ai_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'email_generation', 'project_analysis', 'automation_content'
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,6) DEFAULT 0, -- En USD
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_type ON ai_usage(type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created ON ai_usage(user_id, created_at);

-- RLS (Row Level Security)
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios registros
CREATE POLICY "Users can view own AI usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios registros
CREATE POLICY "Users can insert own AI usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vista para estadísticas mensuales de uso
CREATE OR REPLACE VIEW ai_usage_monthly AS
SELECT 
  user_id,
  DATE_TRUNC('month', created_at) as month,
  type,
  COUNT(*) as usage_count,
  SUM(estimated_cost) as total_cost,
  AVG(estimated_cost) as avg_cost_per_request,
  COUNT(*) FILTER (WHERE success = true) as successful_requests,
  COUNT(*) FILTER (WHERE success = false) as failed_requests
FROM ai_usage 
GROUP BY user_id, DATE_TRUNC('month', created_at), type
ORDER BY month DESC, user_id;

-- Función para calcular costos estimados (GPT-4o-mini pricing)
CREATE OR REPLACE FUNCTION calculate_ai_cost(
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  model TEXT DEFAULT 'gpt-4o-mini'
) 
RETURNS DECIMAL(10,6) AS $$
DECLARE
  input_cost_per_1k DECIMAL(10,6);
  output_cost_per_1k DECIMAL(10,6);
BEGIN
  -- Precios por 1K tokens (USD) - GPT-4o-mini
  input_cost_per_1k := 0.00015;  -- $0.15 per 1M input tokens
  output_cost_per_1k := 0.0006;  -- $0.60 per 1M output tokens
  
  RETURN (input_tokens * input_cost_per_1k / 1000.0) + 
         (output_tokens * output_cost_per_1k / 1000.0);
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular costos automáticamente
CREATE OR REPLACE FUNCTION update_ai_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.estimated_cost := calculate_ai_cost(NEW.input_tokens, NEW.output_tokens);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_ai_cost_trigger
  BEFORE INSERT OR UPDATE ON ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_cost();

-- Insertar algunos datos de ejemplo para testing
INSERT INTO ai_usage (user_id, type, input_tokens, output_tokens, success, metadata) VALUES
  (
    (SELECT id FROM auth.users LIMIT 1),
    'email_generation',
    150,
    80,
    true,
    '{"email_type": "follow_up", "client_name": "Test Client"}'
  ),
  (
    (SELECT id FROM auth.users LIMIT 1),
    'project_analysis', 
    200,
    120,
    true,
    '{"project_name": "Test Project", "analysis_type": "status"}'
  );
