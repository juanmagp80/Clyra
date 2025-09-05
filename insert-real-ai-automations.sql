-- Automatizaciones IA públicas que cualquier usuario puede usar
-- Estas automatizaciones se ejecutan con los datos específicos de cada usuario
-- IMPORTANTE: Usar is_public = true para que sean visibles para todos

-- PASO 1: Obtener tu user_id actual
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Obtener el primer usuario válido de la tabla auth.users
    SELECT id INTO current_user_id FROM auth.users LIMIT 1;
    
    -- Si no hay usuarios, crear uno temporal (esto no debería pasar)
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún usuario válido en auth.users';
    END IF;
    
    -- Insertar las automatizaciones IA con el user_id válido
    INSERT INTO automations (user_id, name, description, trigger_type, trigger_conditions, actions, is_active, is_public) 
    VALUES 
    -- 1. Análisis Inteligente de Feedback de Clientes (REAL)
    (
        current_user_id,
        'Análisis Inteligente de Feedback',
        'IA analiza feedback de clientes y extrae insights accionables sobre satisfacción, problemas y oportunidades usando OpenAI GPT-4',
        'ai_feedback_analysis',
        '{
            "trigger": "manual",
            "requires_text_input": true,
            "ai_model": "gpt-4o-mini",
            "scope": "user_specific"
        }'::jsonb,
        '[
            {
                "type": "analyze_feedback", 
                "name": "Analizar feedback con IA",
                "parameters": {
                    "extract_sentiment": true,
                    "identify_issues": true,
                    "suggest_actions": true,
                    "analyze_tone": true,
                    "detect_urgency": true
                }
            },
            {
                "type": "create_task",
                "name": "Crear tarea de seguimiento",
                "parameters": {
                    "title": "📊 Feedback analizado: {{client_name}}",
                    "description": "IA analizó feedback y encontró:\\n\\n{{analysis_summary}}\\n\\nAcciones sugeridas:\\n{{suggested_actions}}",
                    "priority": "{{suggested_priority}}",
                    "category": "client_relationship"
                }
            },
            {
                "type": "create_notification",
                "name": "Notificar análisis completado",
                "parameters": {
                    "title": "Análisis de feedback completado",
                    "message": "Sentimiento: {{sentiment}} | Urgencia: {{urgency_level}} | {{key_insights}}"
                }
            }
        ]'::jsonb,
        true,
        true -- Pública para todos los usuarios
    ),

    -- 2. Optimizador Inteligente de Comunicaciones (REAL)
    (
        current_user_id,
        'Optimizador de Comunicaciones IA',
        'IA mejora el tono, claridad y efectividad de tus emails antes de enviarlos usando análisis avanzado de OpenAI',
        'ai_communication_optimizer',
        '{
            "trigger": "manual",
            "requires_text_input": true,
            "ai_model": "gpt-4o-mini",
            "scope": "user_specific"
        }'::jsonb,
        '[
            {
                "type": "optimize_communication",
                "name": "Optimizar comunicación con IA",
                "parameters": {
                    "improve_tone": true,
                    "fix_grammar": true,
                    "enhance_clarity": true,
                    "personalize_for_client": true,
                    "optimize_subject": true,
                    "add_call_to_action": true
                }
            },
            {
                "type": "create_notification",
                "name": "Notificar optimización completada",
                "parameters": {
                    "title": "Comunicación optimizada por IA",
                    "message": "Email mejorado y listo para enviar. Puntuación de mejora: {{improvement_score}}/10"
                }
            }
        ]'::jsonb,
        true,
        true
    ),

    -- 3. Analizador de Propuestas IA (REAL)
    (
        current_user_id,
        'Analizador de Propuestas IA',
        'IA evalúa tus propuestas y sugiere mejoras específicas para aumentar la tasa de éxito usando análisis competitivo',
        'ai_proposal_analysis',
        '{
            "trigger": "manual",
            "requires_text_input": true,
            "ai_model": "gpt-4o-mini",
            "scope": "user_specific"
        }'::jsonb,
        '[
            {
                "type": "analyze_proposal",
                "name": "Analizar propuesta con IA",
                "parameters": {
                    "evaluate_clarity": true,
                    "check_competitiveness": true,
                    "suggest_improvements": true,
                    "score_proposal": true,
                    "analyze_pricing": true,
                    "check_timeline": true
                }
            },
            {
                "type": "create_task",
                "name": "Crear tarea de mejora",
                "parameters": {
                    "title": "🎯 Mejorar propuesta: {{proposal_title}}",
                    "description": "IA sugiere mejoras:\\n\\n{{improvement_suggestions}}\\n\\nPuntuación actual: {{proposal_score}}/10",
                    "priority": "medium",
                    "category": "sales"
                }
            },
            {
                "type": "create_notification",
                "name": "Notificar análisis completado",
                "parameters": {
                    "title": "Análisis de propuesta completado",
                    "message": "Puntuación: {{proposal_score}}/10. {{top_suggestion}}"
                }
            }
        ]'::jsonb,
        true,
        true
    ),

    -- 4. Generador Inteligente de Contenido (REAL)
    (
        current_user_id,
        'Generador de Contenido IA',
        'IA crea contenido personalizado para emails, propuestas, follow-ups usando datos específicos del cliente',
        'ai_content_generation',
        '{
            "trigger": "manual",
            "requires_client_selection": true,
            "ai_model": "gpt-4o-mini",
            "content_types": ["email", "proposal", "follow_up", "welcome", "project_update"],
            "scope": "user_specific"
        }'::jsonb,
        '[
            {
                "type": "generate_content",
                "name": "Generar contenido con IA",
                "parameters": {
                    "type": "{{content_type}}",
                    "tone": "{{selected_tone}}",
                    "length": "{{selected_length}}",
                    "include_call_to_action": true,
                    "personalize_for_client": true,
                    "include_project_context": true
                }
            },
            {
                "type": "create_notification",
                "name": "Notificar contenido generado",
                "parameters": {
                    "title": "Contenido {{content_type}} generado",
                    "message": "IA creó contenido personalizado para {{client_name}}. Listo para revisar y enviar."
                }
            }
        ]'::jsonb,
        true,
        true
    ),

    -- 5. Detector de Riesgos en Proyectos (REAL)
    (
        current_user_id,
        'Detector de Riesgos IA',
        'IA analiza todos tus proyectos activos y detecta riesgos potenciales: retrasos, sobrecostos, clientes insatisfechos',
        'ai_risk_detection',
        '{
            "trigger": "manual",
            "ai_model": "gpt-4o-mini",
            "analyze_active_projects": true,
            "scope": "user_specific"
        }'::jsonb,
        '[
            {
                "type": "detect_project_risks",
                "name": "Detectar riesgos con IA",
                "parameters": {
                    "analyze_timeline": true,
                    "check_budget_status": true,
                    "evaluate_client_communication": true,
                    "assess_scope_creep": true,
                    "predict_delays": true,
                    "check_resource_allocation": true
                }
            },
            {
                "type": "create_task",
                "name": "Crear alerta de riesgo",
                "parameters": {
                    "title": "⚠️ Riesgo detectado: {{project_name}}",
                    "description": "IA identificó riesgo: {{risk_description}}\\n\\nAcción sugerida: {{suggested_action}}\\n\\nPrioridad: {{risk_level}}",
                    "priority": "{{risk_level}}",
                    "category": "project_management"
                }
            }
        ]'::jsonb,
        true,
        true
    ),

    -- 6. Analizador de Rendimiento Personal (REAL)
    (
        current_user_id,
        'Analizador de Rendimiento IA',
        'IA analiza tu productividad, patrones de trabajo y rendimiento para sugerir mejoras personalizadas',
        'ai_performance_analysis',
        '{
            "trigger": "manual",
            "ai_model": "gpt-4o-mini",
            "analyze_productivity": true,
            "scope": "user_specific"
        }'::jsonb,
        '[
            {
                "type": "analyze_performance",
                "name": "Analizar rendimiento con IA",
                "parameters": {
                    "analyze_time_tracking": true,
                    "evaluate_project_efficiency": true,
                    "assess_client_satisfaction": true,
                    "identify_bottlenecks": true,
                    "suggest_optimizations": true
                }
            },
            {
                "type": "create_notification",
                "name": "Notificar análisis de rendimiento",
                "parameters": {
                    "title": "Análisis de rendimiento completado",
                    "message": "Productividad: {{productivity_score}}/10. {{main_insight}}. {{top_recommendation}}"
                }
            }
        ]'::jsonb,
        true,
        true
    ),

    -- 7. Asistente de Precios Inteligente (REAL)
    (
        current_user_id,
        'Asistente de Precios IA',
        'IA analiza el proyecto, tu historial y el mercado para sugerir precios competitivos y rentables',
        'ai_pricing_assistant',
        '{
            "trigger": "manual",
            "ai_model": "gpt-4o-mini",
            "analyze_market": true,
            "scope": "user_specific"
        }'::jsonb,
        '[
            {
                "type": "analyze_pricing",
                "name": "Analizar precios con IA",
                "parameters": {
                    "analyze_project_scope": true,
                    "consider_user_history": true,
                    "evaluate_client_budget": true,
                    "compare_market_rates": true,
                    "calculate_profitability": true
                }
            },
            {
                "type": "create_notification",
                "name": "Notificar análisis de precios",
                "parameters": {
                    "title": "Análisis de precios completado",
                    "message": "Precio sugerido: {{suggested_price}} | Rentabilidad: {{profit_margin}}% | {{pricing_rationale}}"
                }
            }
        ]'::jsonb,
        true,
        true
    );

    RAISE NOTICE 'Se insertaron 7 automatizaciones IA públicas con user_id: %', current_user_id;
END $$;

-- Verificar que se insertaron correctamente las automatizaciones IA públicas
SELECT 
    id,
    name,
    description,
    trigger_type,
    is_active,
    is_public,
    jsonb_array_length(actions) as num_actions,
    CASE 
        WHEN is_public = true THEN 'Pública (disponible para todos)' 
        ELSE 'Privada' 
    END as scope,
    created_at
FROM automations 
WHERE trigger_type LIKE 'ai_%'
   OR name LIKE '%IA%' 
   OR name LIKE '%Inteligente%'
ORDER BY created_at DESC;

-- Verificar que los tipos de acción están correctamente mapeados
SELECT DISTINCT 
    jsonb_array_elements(actions)->>'type' as action_type,
    count(*) as usage_count
FROM automations 
WHERE trigger_type LIKE 'ai_%'
GROUP BY action_type
ORDER BY usage_count DESC;
