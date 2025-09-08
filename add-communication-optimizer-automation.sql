-- Script para crear la tabla ai_automations y añadir la automatización "Optimizador de Comunicación"
-- Esta automatización usa IA para analizar y mejorar conversaciones con clientes

-- Crear la tabla ai_automations si no existe
CREATE TABLE IF NOT EXISTS ai_automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.75,
    trigger_conditions JSONB DEFAULT '{}',
    action_templates JSONB DEFAULT '{}',
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para mejorar performance
    CONSTRAINT ai_automations_user_trigger_unique UNIQUE (user_id, trigger_type, trigger_conditions)
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_ai_automations_user_id ON ai_automations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_automations_trigger_type ON ai_automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_ai_automations_active ON ai_automations(is_active);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ai_automations ENABLE ROW LEVEL SECURITY;

-- Crear política RLS para que los usuarios solo vean sus propias automatizaciones
DROP POLICY IF EXISTS "Users can only access their own automations" ON ai_automations;
CREATE POLICY "Users can only access their own automations" ON ai_automations
    FOR ALL USING (user_id = auth.uid());

DO $$
DECLARE
    user_uuid UUID := 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c'; -- Tu user ID real
BEGIN
    -- Insertar/actualizar la automatización
    INSERT INTO ai_automations (
        user_id,
        name,
        description,
        trigger_type,
        is_active,
        confidence_threshold,
        trigger_conditions,
        action_templates,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        'Optimizador de Comunicación',
        'IA mejora automáticamente tus mensajes y emails usando OpenAI para maximizar efectividad y profesionalismo',
        'conversation_analysis',
        true,
        0.89,
        jsonb_build_object(
            'trigger', 'conversation_analysis',
            'manual_trigger', true,
            'requires_client_selection', true,
            'analysis_type', 'communication_optimization'
        ),
        jsonb_build_object(
            'email', jsonb_build_object(
                'enabled', false,
                'subject', 'Análisis de comunicación completado',
                'template', 'El análisis de comunicación con {{client_name}} ha sido completado por IA.'
            ),
            'notification', jsonb_build_object(
                'enabled', true,
                'title', 'Análisis de conversación: {{client_name}}',
                'description', 'IA ha analizado la conversación y proporciona recomendaciones para mejorar la comunicación.',
                'category', 'communication_insights'
            ),
            'task', jsonb_build_object(
                'enabled', true,
                'title', 'Revisar insights de comunicación: {{client_name}}',
                'description', 'IA ha detectado áreas de mejora en la comunicación. Revisa las recomendaciones y aplica las sugerencias.',
                'priority', 'medium',
                'category', 'client_relationship'
            ),
            'ai_analysis', jsonb_build_object(
                'enabled', true,
                'analyze_conversation_tone', true,
                'suggest_improvements', true,
                'detect_communication_gaps', true,
                'propose_next_message', true,
                'evaluate_client_satisfaction', true,
                'confidence_rating', true
            )
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, trigger_type, trigger_conditions) 
    DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        action_templates = EXCLUDED.action_templates,
        is_active = EXCLUDED.is_active,
        confidence_threshold = EXCLUDED.confidence_threshold,
        updated_at = NOW();

    RAISE NOTICE 'Tabla ai_automations creada y automatización "Optimizador de Comunicación" agregada exitosamente para usuario: %', user_uuid;
    RAISE NOTICE 'Esta automatización permite:';
    RAISE NOTICE '- Analizar conversaciones completas con clientes';
    RAISE NOTICE '- Detectar puntos fuertes y áreas de mejora';
    RAISE NOTICE '- Sugerir respuestas optimizadas';
    RAISE NOTICE '- Proporcionar insights de satisfacción del cliente';
    RAISE NOTICE '- Generar recomendaciones específicas para mejorar la relación';
END $$;
