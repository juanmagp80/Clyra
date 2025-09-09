-- 1. VERIFICAR ESTRUCTURA ACTUAL DE ai_insights
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_insights' 
ORDER BY ordinal_position;

-- 2. CREAR/ACTUALIZAR TABLA ai_insights CON LA ESTRUCTURA CORRECTA
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    analysis JSONB,  -- Cambiado de 'data' a 'analysis' y 'analysis' separado
    data JSONB,      -- Para datos adicionales
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SI LA TABLA YA EXISTE PERO LE FALTA LA COLUMNA 'data', AGREGARLA
ALTER TABLE ai_insights 
ADD COLUMN IF NOT EXISTS data JSONB;

-- 4. SI LA TABLA YA EXISTE PERO LE FALTA LA COLUMNA 'analysis', AGREGARLA  
ALTER TABLE ai_insights 
ADD COLUMN IF NOT EXISTS analysis JSONB;

-- 5. CONFIGURAR RLS (Row Level Security)
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- 6. CREAR POLÍTICAS RLS PARA SEGURIDAD
DROP POLICY IF EXISTS "Users can view their own insights" ON ai_insights;
CREATE POLICY "Users can view their own insights" 
ON ai_insights FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own insights" ON ai_insights;
CREATE POLICY "Users can insert their own insights" 
ON ai_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own insights" ON ai_insights;
CREATE POLICY "Users can update their own insights" 
ON ai_insights FOR UPDATE 
USING (auth.uid() = user_id);

-- 7. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at);

-- 8. VERIFICAR QUE TODO ESTÉ CORRECTO
SELECT 
    table_name,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ai_insights' 
ORDER BY ordinal_position;
