-- =============================================
-- TASKELIA CALENDAR AI - SCHEMA COMPLETO V2.0
-- Centro neurálgico del SaaS con IA avanzada
-- =============================================

-- Eliminar tablas existentes si existen (para recrear)
DROP TABLE IF EXISTS calendar_automations CASCADE;
DROP TABLE IF EXISTS revenue_forecasts CASCADE;
DROP TABLE IF EXISTS client_integrations CASCADE;
DROP TABLE IF EXISTS smart_automations CASCADE;
DROP TABLE IF EXISTS productivity_patterns CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS time_tracking_sessions CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;

-- ==================== TABLA PRINCIPAL ====================
-- Eventos del calendario con integración profunda y IA
CREATE TABLE calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Información básica expandida
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT false,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Categorización y tipo expandido
    type VARCHAR(30) CHECK (type IN (
        'meeting', 'work', 'break', 'admin', 'focus', 'client_call', 
        'project_review', 'invoice_prep', 'proposal_work', 'design_work',
        'development', 'testing', 'deployment', 'maintenance', 'research',
        'planning', 'brainstorming', 'presentation', 'training', 'networking'
    )) NOT NULL DEFAULT 'work',
    category VARCHAR(50), -- Categorías personalizadas del usuario
    
    -- Integración profunda con entidades del CRM
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    task_ids UUID[], -- Array de IDs de tareas relacionadas
    
    -- Facturación y revenue inteligente
    is_billable BOOLEAN DEFAULT false,
    hourly_rate DECIMAL(10,2),
    estimated_revenue DECIMAL(12,2), -- Revenue esperado
    actual_revenue DECIMAL(12,2), -- Revenue real confirmado
    revenue_confidence DECIMAL(3,2), -- 0-1 confianza en el revenue
    billing_notes TEXT,
    
    -- Localización y formato
    location VARCHAR(500),
    meeting_url VARCHAR(1000),
    meeting_platform VARCHAR(50), -- zoom, teams, meet, etc.
    
    -- Time tracking avanzado
    time_tracked INTEGER DEFAULT 0, -- minutes reales trabajados
    break_time INTEGER DEFAULT 0, -- minutes de breaks durante el evento
    overtime INTEGER DEFAULT 0, -- minutes extras trabajados
    
    -- Estado y workflow
    status VARCHAR(20) CHECK (status IN (
        'scheduled', 'in_progress', 'completed', 'cancelled', 
        'rescheduled', 'pending_approval', 'blocked', 'paused'
    )) NOT NULL DEFAULT 'scheduled',
    
    -- Personalización visual
    color VARCHAR(7), -- hex color
    icon VARCHAR(50), -- emoji o icon name
    
    -- Prioridad y urgencia
    priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 5), -- 1=Low, 5=Critical
    urgency INTEGER DEFAULT 2 CHECK (urgency BETWEEN 1 AND 5),
    importance INTEGER DEFAULT 2 CHECK (importance BETWEEN 1 AND 5),
    
    -- IA y Machine Learning
    energy_level VARCHAR(10) CHECK (energy_level IN ('low', 'medium', 'high')),
    focus_level_required VARCHAR(10) CHECK (focus_level_required IN ('low', 'medium', 'high')),
    ai_suggested BOOLEAN DEFAULT false,
    ai_confidence DECIMAL(3,2) CHECK (ai_confidence BETWEEN 0 AND 1),
    ai_reasoning TEXT,
    ai_optimization_score INTEGER, -- 1-100
    
    -- Recurrencia avanzada
    recurring_pattern JSONB, -- {type, interval, days, until, exceptions}
    parent_event_id UUID REFERENCES calendar_events(id),
    recurrence_exceptions TIMESTAMPTZ[], -- fechas excluidas
    
    -- Workflow y dependencias
    prerequisites TEXT[],
    deliverables TEXT[],
    dependencies UUID[], -- IDs de eventos que deben completarse antes
    blocks UUID[], -- IDs de eventos que este evento bloquea
    
    -- Colaboración
    meeting_attendees JSONB, -- [{email, name, role, confirmed, required}]
    organizer_email VARCHAR(255),
    attendee_count INTEGER DEFAULT 0,
    external_attendees INTEGER DEFAULT 0,
    
    -- Preparación y seguimiento
    preparation_time INTEGER DEFAULT 0, -- minutes
    preparation_completed BOOLEAN DEFAULT false,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_completed BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMPTZ,
    
    -- Productividad y métricas
    productivity_score INTEGER CHECK (productivity_score BETWEEN 1 AND 10),
    efficiency_rating INTEGER CHECK (efficiency_rating BETWEEN 1 AND 10),
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 10),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
    
    -- Outcomes y resultados
    objectives TEXT[],
    outcomes_achieved TEXT[],
    action_items TEXT[],
    decisions_made TEXT[],
    
    -- Tags y categorización flexible
    tags TEXT[],
    custom_fields JSONB, -- Campos personalizables por usuario
    
    -- Integración externa
    external_calendar_id VARCHAR(255),
    external_event_id VARCHAR(255),
    sync_status VARCHAR(20) DEFAULT 'synced',
    last_sync TIMESTAMPTZ,
    
    -- Notificaciones y recordatorios
    reminders INTEGER[], -- minutos antes [15, 60, 1440]
    notification_sent BOOLEAN DEFAULT false,
    email_reminder BOOLEAN DEFAULT true,
    sms_reminder BOOLEAN DEFAULT false,
    
    -- Análisis temporal
    optimal_time_slot BOOLEAN DEFAULT false, -- Si está en horario óptimo del usuario
    weather_dependent BOOLEAN DEFAULT false,
    season_dependent BOOLEAN DEFAULT false,
    
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_ai BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1
);

-- ==================== TIME TRACKING AVANZADO ====================
CREATE TABLE time_tracking_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Tracking temporal
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    billable_minutes INTEGER,
    break_minutes INTEGER DEFAULT 0,
    
    -- Contexto y productividad
    notes TEXT,
    mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 5),
    mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5),
    energy_before INTEGER CHECK (energy_before BETWEEN 1 AND 5),
    energy_after INTEGER CHECK (energy_after BETWEEN 1 AND 5),
    focus_quality INTEGER CHECK (focus_quality BETWEEN 1 AND 5),
    interruptions INTEGER DEFAULT 0,
    distraction_sources TEXT[],
    
    -- Métricas de productividad
    productivity_score INTEGER CHECK (productivity_score BETWEEN 1 AND 10),
    tasks_completed INTEGER DEFAULT 0,
    goals_achieved TEXT[],
    challenges_faced TEXT[],
    
    -- Revenue y facturación
    hourly_rate DECIMAL(10,2),
    total_earned DECIMAL(10,2),
    billable_rate DECIMAL(10,2),
    
    -- Contexto ambiental y IA
    environment_type VARCHAR(50), -- office, home, cafe, coworking
    weather_condition VARCHAR(50),
    time_of_day VARCHAR(20), -- morning, afternoon, evening, night
    day_of_week INTEGER,
    is_optimal_time BOOLEAN DEFAULT false,
    
    -- Automatización y IA
    auto_tracked BOOLEAN DEFAULT false,
    ai_predicted_duration INTEGER,
    ai_accuracy_score DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INSIGHTS DE IA ====================
CREATE TABLE ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Tipo de insight
    insight_type VARCHAR(50) NOT NULL, -- productivity, revenue, client, schedule, health
    category VARCHAR(50), -- daily, weekly, monthly, project-based, client-based
    
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

-- ==================== PATRONES DE PRODUCTIVIDAD ====================
CREATE TABLE productivity_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Identificación del patrón
    pattern_name VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(50), -- time_based, task_based, client_based, environment_based
    
    -- Definición del patrón
    conditions JSONB NOT NULL, -- Condiciones que definen cuándo aplica
    metrics JSONB NOT NULL, -- Métricas asociadas al patrón
    
    -- Fuerza estadística
    occurrence_count INTEGER DEFAULT 1,
    confidence_level DECIMAL(3,2) CHECK (confidence_level BETWEEN 0 AND 1),
    statistical_significance DECIMAL(3,2),
    
    -- Timing y contexto
    optimal_time_slots JSONB, -- [{start_hour, end_hour, day_of_week, productivity_score}]
    seasonal_variations JSONB,
    environmental_factors JSONB,
    
    -- Impacto y beneficios
    productivity_impact DECIMAL(5,2), -- % change in productivity
    revenue_impact DECIMAL(10,2),
    satisfaction_impact DECIMAL(3,2),
    
    -- Recomendaciones basadas en el patrón
    recommendations TEXT[],
    optimization_suggestions JSONB,
    
    -- Validación continua
    last_validated TIMESTAMPTZ,
    validation_score DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    
    -- Machine Learning
    ml_model_used VARCHAR(100),
    feature_importance JSONB,
    prediction_accuracy DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== AUTOMATIZACIONES INTELIGENTES ====================
CREATE TABLE smart_automations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Configuración de la automatización
    name VARCHAR(255) NOT NULL,
    description TEXT,
    automation_type VARCHAR(50), -- schedule_optimization, task_prioritization, invoice_automation, client_follow_up
    
    -- Triggers y condiciones
    triggers JSONB NOT NULL, -- [{type, condition, value}]
    conditions JSONB, -- Condiciones adicionales
    
    -- Acciones a ejecutar
    actions JSONB NOT NULL, -- [{action_type, parameters, priority}]
    
    -- Configuración de ejecución
    is_active BOOLEAN DEFAULT true,
    frequency VARCHAR(20), -- immediate, daily, weekly, monthly, on_event
    execution_time TIME,
    execution_days INTEGER[], -- días de la semana (1-7)
    
    -- Configuración de IA
    ai_enabled BOOLEAN DEFAULT true,
    learning_enabled BOOLEAN DEFAULT true,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
    
    -- Métricas de rendimiento
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    average_execution_time INTEGER, -- seconds
    
    -- Resultados e impacto
    total_time_saved INTEGER DEFAULT 0, -- minutes
    total_revenue_generated DECIMAL(10,2) DEFAULT 0,
    user_satisfaction DECIMAL(3,2),
    
    -- Control de fallos
    max_retries INTEGER DEFAULT 3,
    cooldown_period INTEGER DEFAULT 60, -- minutes
    error_handling JSONB,
    
    -- Logging y auditoría
    last_execution TIMESTAMPTZ,
    next_execution TIMESTAMPTZ,
    execution_log JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INTEGRACIONES CON CLIENTES ====================
CREATE TABLE client_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    
    -- Configuración de integración
    integration_type VARCHAR(50), -- calendar_sync, auto_scheduling, status_updates, invoice_automation
    platform VARCHAR(50), -- google_calendar, outlook, slack, teams, whatsapp
    
    -- Credenciales y configuración (encriptadas)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    webhook_url VARCHAR(500),
    api_config JSONB,
    
    -- Preferencias del cliente
    client_preferences JSONB, -- {preferred_times, communication_style, meeting_duration}
    availability_windows JSONB, -- [{day, start_time, end_time, timezone}]
    blackout_dates DATE[],
    
    -- Automatización personalizada
    auto_scheduling_enabled BOOLEAN DEFAULT false,
    notification_preferences JSONB,
    meeting_templates JSONB,
    
    -- Métricas de integración
    sync_frequency INTEGER DEFAULT 60, -- minutes
    last_sync TIMESTAMPTZ,
    sync_errors INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2),
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    connection_status VARCHAR(20) DEFAULT 'connected', -- connected, disconnected, error, expired
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== FORECASTING DE REVENUE ====================
CREATE TABLE revenue_forecasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Alcance del forecast
    forecast_type VARCHAR(50), -- daily, weekly, monthly, quarterly, project_based, client_based
    target_date DATE NOT NULL,
    forecast_horizon INTEGER, -- días hacia adelante
    
    -- Predicciones principales
    predicted_revenue DECIMAL(12,2) NOT NULL,
    confidence_interval_low DECIMAL(12,2),
    confidence_interval_high DECIMAL(12,2),
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Desglose detallado
    billable_hours_forecast DECIMAL(6,2),
    average_hourly_rate DECIMAL(10,2),
    project_revenue_breakdown JSONB, -- {project_id: revenue}
    client_revenue_breakdown JSONB, -- {client_id: revenue}
    
    -- Factores y drivers
    key_assumptions TEXT[],
    risk_factors JSONB, -- [{factor, impact, probability}]
    opportunities JSONB, -- [{opportunity, impact, probability}]
    
    -- Contexto y variables
    historical_data_points INTEGER,
    seasonal_adjustments JSONB,
    trend_adjustments DECIMAL(5,2), -- % adjustment
    external_factors JSONB,
    
    -- Modelo y algoritmo
    model_used VARCHAR(100),
    model_version VARCHAR(20),
    training_data_period_days INTEGER,
    feature_weights JSONB,
    
    -- Validación y precisión
    actual_revenue DECIMAL(12,2), -- Para evaluar precisión después
    accuracy_score DECIMAL(3,2), -- Una vez conocido el resultado real
    variance_percentage DECIMAL(5,2),
    
    -- Estado del forecast
    status VARCHAR(20) DEFAULT 'active', -- active, archived, invalidated
    reviewed_by_user BOOLEAN DEFAULT false,
    user_adjustments JSONB,
    
    -- Automatización
    auto_generated BOOLEAN DEFAULT true,
    generation_triggers TEXT[],
    update_frequency VARCHAR(20), -- daily, weekly, monthly
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ÍNDICES PARA RENDIMIENTO ====================
-- Índices principales para calendar_events
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_client_id ON calendar_events(client_id);
CREATE INDEX idx_calendar_events_project_id ON calendar_events(project_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_ai_suggested ON calendar_events(ai_suggested);
CREATE INDEX idx_calendar_events_billable ON calendar_events(is_billable);
CREATE INDEX idx_calendar_events_priority ON calendar_events(priority);
CREATE INDEX idx_calendar_events_date_range ON calendar_events(user_id, start_time, end_time);

-- Índices para time tracking
CREATE INDEX idx_time_tracking_user_id ON time_tracking_sessions(user_id);
CREATE INDEX idx_time_tracking_event_id ON time_tracking_sessions(event_id);
CREATE INDEX idx_time_tracking_start_time ON time_tracking_sessions(start_time);
CREATE INDEX idx_time_tracking_client_project ON time_tracking_sessions(client_id, project_id);

-- Índices para IA e insights
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_ai_insights_created ON ai_insights(created_at);

-- Índices para patrones
CREATE INDEX idx_productivity_patterns_user_id ON productivity_patterns(user_id);
CREATE INDEX idx_productivity_patterns_type ON productivity_patterns(pattern_type);
CREATE INDEX idx_productivity_patterns_active ON productivity_patterns(is_active);

-- Índices para automatizaciones
CREATE INDEX idx_smart_automations_user_id ON smart_automations(user_id);
CREATE INDEX idx_smart_automations_active ON smart_automations(is_active);
CREATE INDEX idx_smart_automations_next_execution ON smart_automations(next_execution);

-- ==================== TRIGGERS AUTOMÁTICOS ====================
-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_calendar_events_updated_at 
    BEFORE UPDATE ON calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_tracking_updated_at 
    BEFORE UPDATE ON time_tracking_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at 
    BEFORE UPDATE ON ai_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productivity_patterns_updated_at 
    BEFORE UPDATE ON productivity_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_automations_updated_at 
    BEFORE UPDATE ON smart_automations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_integrations_updated_at 
    BEFORE UPDATE ON client_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_forecasts_updated_at 
    BEFORE UPDATE ON revenue_forecasts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== TRIGGERS DE INTELIGENCIA ====================
-- Trigger para generar insights automáticamente cuando se completa un evento
CREATE OR REPLACE FUNCTION generate_productivity_insights()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actuar cuando el status cambia a 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Generar insight de productividad si el evento tiene métricas
        IF NEW.productivity_score IS NOT NULL THEN
            INSERT INTO ai_insights (
                user_id, insight_type, category, title, description,
                confidence_score, impact_score, actionability_score,
                related_events, auto_generated, generation_algorithm
            ) VALUES (
                NEW.user_id,
                'productivity',
                'event_completion',
                'Análisis de Productividad: ' || NEW.title,
                'Evento completado con score de productividad: ' || NEW.productivity_score || '/10',
                0.85,
                CASE WHEN NEW.productivity_score >= 8 THEN 8 ELSE 5 END,
                7,
                ARRAY[NEW.id],
                true,
                'event_completion_trigger_v1'
            );
        END IF;
        
        -- Actualizar patrones de productividad
        INSERT INTO productivity_patterns (
            user_id, pattern_name, pattern_type, conditions, metrics,
            confidence_level, last_validated, is_active
        ) VALUES (
            NEW.user_id,
            'Patrón de ' || NEW.type || ' - ' || EXTRACT(hour FROM NEW.start_time) || 'h',
            'time_based',
            jsonb_build_object(
                'event_type', NEW.type,
                'hour_of_day', EXTRACT(hour FROM NEW.start_time),
                'day_of_week', EXTRACT(dow FROM NEW.start_time)
            ),
            jsonb_build_object(
                'productivity_score', NEW.productivity_score,
                'duration_minutes', EXTRACT(epoch FROM (NEW.end_time - NEW.start_time))/60,
                'revenue', NEW.actual_revenue
            ),
            0.75,
            NOW(),
            true
        ) ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER trigger_generate_productivity_insights
    AFTER UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION generate_productivity_insights();

-- ==================== FUNCIONES DE IA Y ANÁLISIS ====================
-- Función para calcular score de productividad de un usuario
CREATE OR REPLACE FUNCTION calculate_user_productivity_score(
    user_uuid UUID,
    period_start TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    period_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    overall_score DECIMAL,
    completed_events INTEGER,
    total_events INTEGER,
    avg_productivity DECIMAL,
    total_revenue DECIMAL,
    billable_hours DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(AVG(ce.productivity_score), 0)::DECIMAL as overall_score,
        COUNT(CASE WHEN ce.status = 'completed' THEN 1 END)::INTEGER as completed_events,
        COUNT(*)::INTEGER as total_events,
        COALESCE(AVG(CASE WHEN ce.status = 'completed' THEN ce.productivity_score END), 0)::DECIMAL as avg_productivity,
        COALESCE(SUM(ce.actual_revenue), 0)::DECIMAL as total_revenue,
        COALESCE(SUM(CASE WHEN ce.is_billable AND ce.status = 'completed' 
                     THEN EXTRACT(epoch FROM (ce.end_time - ce.start_time))/3600 
                     END), 0)::DECIMAL as billable_hours
    FROM calendar_events ce
    WHERE ce.user_id = user_uuid
      AND ce.start_time >= period_start
      AND ce.start_time <= period_end;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener horarios óptimos de un usuario
CREATE OR REPLACE FUNCTION get_optimal_time_slots(user_uuid UUID)
RETURNS TABLE (
    hour_of_day INTEGER,
    day_of_week INTEGER,
    avg_productivity DECIMAL,
    event_count INTEGER,
    confidence_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(hour FROM ce.start_time)::INTEGER as hour_of_day,
        EXTRACT(dow FROM ce.start_time)::INTEGER as day_of_week,
        AVG(ce.productivity_score)::DECIMAL as avg_productivity,
        COUNT(*)::INTEGER as event_count,
        CASE 
            WHEN COUNT(*) >= 5 THEN 0.9
            WHEN COUNT(*) >= 3 THEN 0.7
            ELSE 0.5
        END::DECIMAL as confidence_score
    FROM calendar_events ce
    WHERE ce.user_id = user_uuid
      AND ce.status = 'completed'
      AND ce.productivity_score IS NOT NULL
      AND ce.start_time >= NOW() - INTERVAL '30 days'
    GROUP BY 
        EXTRACT(hour FROM ce.start_time),
        EXTRACT(dow FROM ce.start_time)
    HAVING COUNT(*) >= 2
    ORDER BY avg_productivity DESC, event_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ==================== VISTAS PARA DASHBOARD ====================
-- Vista principal del dashboard de IA
CREATE OR REPLACE VIEW ai_dashboard AS
SELECT 
    u.id as user_id,
    
    -- Métricas de hoy
    (SELECT COUNT(*) FROM calendar_events ce 
     WHERE ce.user_id = u.id AND DATE(ce.start_time) = CURRENT_DATE) as events_today,
    
    (SELECT COUNT(*) FROM calendar_events ce 
     WHERE ce.user_id = u.id AND DATE(ce.start_time) = CURRENT_DATE AND ce.status = 'completed') as completed_today,
    
    (SELECT COALESCE(SUM(ce.actual_revenue), 0) FROM calendar_events ce 
     WHERE ce.user_id = u.id AND DATE(ce.start_time) = CURRENT_DATE) as revenue_today,
    
    (SELECT COALESCE(SUM(EXTRACT(epoch FROM (ce.end_time - ce.start_time))/3600), 0) 
     FROM calendar_events ce 
     WHERE ce.user_id = u.id AND DATE(ce.start_time) = CURRENT_DATE AND ce.is_billable) as billable_hours_today,
    
    -- Métricas de la semana
    (SELECT COUNT(*) FROM calendar_events ce 
     WHERE ce.user_id = u.id AND ce.start_time >= DATE_TRUNC('week', CURRENT_DATE)) as events_this_week,
    
    (SELECT COALESCE(AVG(ce.productivity_score), 0) FROM calendar_events ce 
     WHERE ce.user_id = u.id AND ce.start_time >= DATE_TRUNC('week', CURRENT_DATE) 
     AND ce.status = 'completed') as avg_productivity_week,
    
    -- Insights pendientes
    (SELECT COUNT(*) FROM ai_insights ai 
     WHERE ai.user_id = u.id AND ai.status = 'new') as pending_insights,
    
    -- Automatizaciones activas
    (SELECT COUNT(*) FROM smart_automations sa 
     WHERE sa.user_id = u.id AND sa.is_active = true) as active_automations,
    
    -- Forecast de revenue
    (SELECT rf.predicted_revenue FROM revenue_forecasts rf 
     WHERE rf.user_id = u.id AND rf.target_date = CURRENT_DATE + INTERVAL '7 days' 
     ORDER BY rf.created_at DESC LIMIT 1) as revenue_forecast_week

FROM auth.users u;

-- Vista de analytics de productividad
CREATE OR REPLACE VIEW productivity_analytics AS
SELECT 
    ce.user_id,
    DATE(ce.start_time) as event_date,
    EXTRACT(hour FROM ce.start_time) as hour_of_day,
    EXTRACT(dow FROM ce.start_time) as day_of_week,
    ce.type as event_type,
    COUNT(*) as event_count,
    AVG(ce.productivity_score) as avg_productivity,
    SUM(CASE WHEN ce.status = 'completed' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN ce.is_billable THEN EXTRACT(epoch FROM (ce.end_time - ce.start_time))/3600 ELSE 0 END) as billable_hours,
    SUM(ce.actual_revenue) as total_revenue
FROM calendar_events ce
WHERE ce.start_time >= NOW() - INTERVAL '90 days'
GROUP BY ce.user_id, DATE(ce.start_time), EXTRACT(hour FROM ce.start_time), 
         EXTRACT(dow FROM ce.start_time), ce.type;

-- ==================== POLÍTICAS RLS (Row Level Security) ====================
-- Habilitar RLS en todas las tablas
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;

-- Políticas para calendar_events
CREATE POLICY "Users can manage their calendar events" ON calendar_events
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para time_tracking_sessions
CREATE POLICY "Users can manage their time tracking" ON time_tracking_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_insights
CREATE POLICY "Users can view their AI insights" ON ai_insights
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para productivity_patterns
CREATE POLICY "Users can view their productivity patterns" ON productivity_patterns
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para smart_automations
CREATE POLICY "Users can manage their automations" ON smart_automations
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para client_integrations
CREATE POLICY "Users can manage their client integrations" ON client_integrations
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para revenue_forecasts
CREATE POLICY "Users can view their revenue forecasts" ON revenue_forecasts
    FOR ALL USING (auth.uid() = user_id);

-- ==================== DATOS DE EJEMPLO Y CONFIGURACIÓN INICIAL ====================
-- Función para inicializar datos básicos para un nuevo usuario
CREATE OR REPLACE FUNCTION initialize_user_calendar_ai(user_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Crear automatizaciones básicas
    INSERT INTO smart_automations (user_id, name, description, automation_type, triggers, actions) VALUES
    (user_uuid, 'Auto-categorización de eventos', 'Categoriza automáticamente los eventos basándose en el título y descripción', 'event_categorization',
     '[{"type": "event_created", "condition": "always"}]'::jsonb,
     '[{"action_type": "categorize_event", "parameters": {"use_ai": true}}]'::jsonb),
    
    (user_uuid, 'Sugerencias de horarios óptimos', 'Sugiere los mejores horarios basándose en patrones de productividad', 'schedule_optimization',
     '[{"type": "event_scheduling", "condition": "productivity_data_available"}]'::jsonb,
     '[{"action_type": "suggest_optimal_time", "parameters": {"confidence_threshold": 0.7}}]'::jsonb),
    
    (user_uuid, 'Recordatorios inteligentes', 'Envía recordatorios personalizados basándose en el tipo de evento', 'smart_reminders',
     '[{"type": "time_before_event", "condition": {"minutes": [15, 60]}}]'::jsonb,
     '[{"action_type": "send_reminder", "parameters": {"personalized": true}}]'::jsonb);
    
    -- Crear insight inicial de bienvenida
    INSERT INTO ai_insights (user_id, insight_type, category, title, description, confidence_score, impact_score, actionability_score) VALUES
    (user_uuid, 'onboarding', 'welcome', 'Bienvenido a tu Calendario Inteligente', 
     'Tu calendario está configurado para aprender de tus patrones y optimizar tu productividad. Comienza creando algunos eventos para que podamos generar insights personalizados.',
     1.0, 8, 9);
END;
$$ LANGUAGE plpgsql;

-- ==================== COMENTARIOS FINALES ====================
-- Este esquema proporciona:
-- 1. Integración profunda con clientes, proyectos, facturas y tareas
-- 2. IA avanzada para insights, patrones y automatizaciones
-- 3. Time tracking inteligente con métricas de productividad
-- 4. Revenue forecasting y analytics
-- 5. Automatizaciones personalizables
-- 6. Integraciones con calendarios externos
-- 7. Dashboard centralizado con todas las métricas
-- 8. Seguridad completa con RLS
-- 9. Triggers automáticos para insights y optimización
-- 10. Funciones para análisis avanzado

-- Para usar este esquema, simplemente ejecuta:
-- SELECT initialize_user_calendar_ai(auth.uid());
-- después del registro de cada nuevo usuario.
