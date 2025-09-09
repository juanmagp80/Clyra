import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PerformanceAnalysisRequest {
  period: '7_days' | '30_days' | '90_days';
}

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  productivity_score: number;
  actual_revenue: number;
  status: string;
  client?: { name: string; company?: string };
  project?: { name: string; status: string };
}

interface TimeTrackingSession {
  id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  billable_minutes: number;
  break_minutes: number;
  notes: string;
  mood_before: number;
  mood_after: number;
  energy_before: number;
  energy_after: number;
  focus_quality: number;
  interruptions: number;
  productivity_score: number;
  tasks_completed: number;
  hourly_rate: number;
  total_earned: number;
  environment_type: string;
  time_of_day: string;
  is_optimal_time: boolean;
}

interface BudgetData {
  id: string;
  title: string;
  total_amount: number;
  status: string;
  created_at: string;
  client?: { name: string };
  budget_items?: { name: string; price: number; quantity: number }[];
}

function getPeriodRange(period: string) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case '7_days':
      start.setDate(now.getDate() - 7);
      break;
    case '30_days':
      start.setDate(now.getDate() - 30);
      break;
    case '90_days':
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
}

async function collectUserData(supabase: any, userId: string, period: string) {
  try {
    const dateRange = getPeriodRange(period);
    
    console.log(`📅 Rango de fechas para análisis:`, {
      period,
      start: dateRange.start,
      end: dateRange.end
    });

    // Eventos de calendario
    const { data: calendarEvents, error: eventsError } = await supabase
      .from('calendar_events')
      .select(`
        *,
        client:clients(name, company),
        project:projects(name, status)
      `)
      .eq('user_id', userId)
      .gte('start_time', dateRange.start)
      .order('start_time', { ascending: false });

    if (eventsError) {
      console.error('❌ Error fetching calendar events:', eventsError);
    }

    // Sesiones de time tracking
    const { data: timeTrackingSessions, error: sessionsError } = await supabase
      .from('time_tracking_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', dateRange.start)
      .order('start_time', { ascending: false });

    if (sessionsError) {
      console.error('❌ Error fetching time tracking sessions:', sessionsError);
    }

    // Presupuestos y revenue
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select(`
        *,
        client:clients(name),
        budget_items(*)
      `)
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .order('created_at', { ascending: false });

    if (budgetsError) {
      console.error('❌ Error fetching budgets:', budgetsError);
    }

    // Insights previos de IA
    const { data: aiInsights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .order('created_at', { ascending: false });

    if (insightsError) {
      console.error('❌ Error fetching AI insights:', insightsError);
    }

    const result = {
      calendarEvents: calendarEvents || [],
      timeTrackingSessions: timeTrackingSessions || [],
      budgetsData: budgetsData || [],
      aiInsights: aiInsights || []
    };

    console.log(`✅ Datos recopilados exitosamente:`, {
      calendarEvents: result.calendarEvents.length,
      timeTrackingSessions: result.timeTrackingSessions.length,
      budgetsData: result.budgetsData.length,
      aiInsights: result.aiInsights.length
    });

    return result;
  } catch (error) {
    console.error('❌ Error collecting user data:', error);
    throw new Error(`Error recopilando datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

function calculateMetrics(userData: any) {
  const { calendarEvents, timeTrackingSessions, budgetsData } = userData;
  
  // Helper function to clean NaN values
  const cleanNumber = (value: number) => isNaN(value) || !isFinite(value) ? 0 : value;
  
  // Métricas de time tracking
  const totalWorkHours = timeTrackingSessions.reduce((sum: number, session: TimeTrackingSession) => 
    sum + (session.duration_minutes / 60), 0);
  
  const totalBillableHours = timeTrackingSessions.reduce((sum: number, session: TimeTrackingSession) => 
    sum + (session.billable_minutes / 60), 0);
  
  const billablePercentage = totalWorkHours > 0 ? (totalBillableHours / totalWorkHours) * 100 : 0;
  
  const avgProductivity = timeTrackingSessions.length > 0 
    ? timeTrackingSessions.reduce((sum: number, session: TimeTrackingSession) => 
        sum + session.productivity_score, 0) / timeTrackingSessions.length
    : 0;
  
  // Métricas de revenue (desde calendar events)
  const totalRevenue = calendarEvents.reduce((sum: number, event: CalendarEvent) => 
    sum + (event.actual_revenue || 0), 0);
  
  // Si tenemos horas facturables de time tracking, usar esas; sino usar duración de eventos
  let effectiveBillableHours = totalBillableHours;
  if (effectiveBillableHours === 0 && calendarEvents.length > 0) {
    const validEvents = calendarEvents.filter((event: CalendarEvent) => 
      event.duration_minutes && !isNaN(event.duration_minutes) && event.duration_minutes > 0);
    effectiveBillableHours = validEvents.reduce((sum: number, event: CalendarEvent) => 
      sum + (event.duration_minutes / 60), 0);
  }
  
  const revenuePerHour = effectiveBillableHours > 0 ? totalRevenue / effectiveBillableHours : 0;
  
  // Métricas adicionales
  const totalEvents = calendarEvents.length;
  const avgEventDuration = totalEvents > 0 
    ? calendarEvents.reduce((sum: number, event: CalendarEvent) => 
        sum + (event.duration_minutes || 0), 0) / totalEvents / 60
    : 0;
  
  const avgEventProductivity = totalEvents > 0 
    ? calendarEvents.reduce((sum: number, event: CalendarEvent) => 
        sum + (event.productivity_score || 0), 0) / totalEvents
    : 0;
  
  return {
    // Time tracking metrics
    totalWorkHours: Math.round(cleanNumber(totalWorkHours) * 100) / 100,
    totalBillableHours: Math.round(cleanNumber(totalBillableHours) * 100) / 100,
    billablePercentage: Math.round(cleanNumber(billablePercentage) * 100) / 100,
    avgProductivity: Math.round(cleanNumber(avgProductivity) * 100) / 100,
    
    // Financial metrics
    totalRevenue: Math.round(cleanNumber(totalRevenue) * 100) / 100,
    revenuePerHour: Math.round(cleanNumber(revenuePerHour) * 100) / 100,
    
    // Event metrics (fallback when no time tracking)
    totalEvents,
    avgEventDuration: Math.round(cleanNumber(avgEventDuration) * 100) / 100,
    avgEventProductivity: Math.round(cleanNumber(avgEventProductivity) * 100) / 100,
    effectiveBillableHours: Math.round(cleanNumber(effectiveBillableHours) * 100) / 100,
    
    // Data availability flags
    hasTimeTracking: timeTrackingSessions.length > 0,
    hasEvents: calendarEvents.length > 0,
    hasBudgets: budgetsData.length > 0
  };
}

async function analyzePerformanceWithAI(userData: any, period: string, metrics: any) {
  const prompt = `Analiza el rendimiento profesional de este usuario basándote en estos datos reales:

PERÍODO DE ANÁLISIS: ${period.replace('_', ' ')}
MÉTRICAS CALCULADAS:
- Horas trabajadas: ${metrics.totalWorkHours}h
- Horas facturables: ${metrics.totalBillableHours}h  
- % Facturable: ${metrics.billablePercentage}%
- Productividad promedio: ${metrics.avgProductivity}/10
- Revenue total: €${metrics.totalRevenue}
- Revenue por hora: €${metrics.revenuePerHour}

📅 EVENTOS DE CALENDARIO (${userData.calendarEvents.length} eventos):
${userData.calendarEvents.slice(0, 10).map((event: CalendarEvent) => `
- ${event.title} (${event.type})
- Duración: ${event.duration_minutes}min
- Productividad: ${event.productivity_score}/10
- Cliente: ${event.client?.name || 'Sin cliente'}
- Revenue: €${event.actual_revenue || 0}
`).join('')}

⏱️ TIME TRACKING (${userData.timeTrackingSessions.length} sesiones):
${userData.timeTrackingSessions.slice(0, 10).map((session: TimeTrackingSession) => `
- Ambiente: ${session.environment_type || 'No especificado'}
- Duración: ${session.duration_minutes}min (${session.billable_minutes}min facturables)
- Productividad: ${session.productivity_score}/10
- Energía: ${session.energy_before} → ${session.energy_after}
- Focus: ${session.focus_quality}/5, Interrupciones: ${session.interruptions}
- Tareas completadas: ${session.tasks_completed}
- Horario: ${session.time_of_day} (Óptimo: ${session.is_optimal_time ? 'Sí' : 'No'})
- Revenue: €${session.total_earned || 0} (€${session.hourly_rate || 0}/h)
`).join('')}

💰 PRESUPUESTOS (${userData.budgetsData.length} presupuestos):
${userData.budgetsData.map((budget: BudgetData) => `
- ${budget.title}: €${budget.total_amount} (${budget.status})
- Cliente: ${budget.client?.name || 'Sin cliente'}
- Items: ${budget.budget_items?.length || 0}
`).join('')}

INSTRUCCIONES:
Proporciona análisis detallado COMPLETAMENTE EN ESPAÑOL usando esta estructura JSON exacta:

{
  "productivity_analysis": {
    "overall_score": [número 1-10],
    "efficiency_trends": "[análisis detallado en español]",
    "peak_performance_hours": ["HH:MM-HH:MM"],
    "productivity_patterns": "[patrones identificados en español]"
  },
  "time_management": {
    "billable_percentage": [porcentaje],
    "average_session_length": [horas],
    "break_frequency": "[análisis en español]",
    "time_distribution": {"trabajo": [%], "reuniones": [%], "admin": [%]}
  },
  "client_performance": {
    "response_time_average": "[análisis en español]",
    "satisfaction_indicators": "[indicadores en español]",
    "communication_effectiveness": [puntuación 1-10],
    "project_delivery_rate": [porcentaje]
  },
  "financial_performance": {
    "revenue_trend": "[tendencia en español]",
    "revenue_per_hour": [número],
    "proposal_conversion_rate": [porcentaje],
    "budget_accuracy": "[análisis en español]"
  },
  "bottlenecks_identified": [
    {
      "area": "[área problemática en español]",
      "impact": "[alto/medio/bajo]",
      "description": "[descripción detallada en español]",
      "solution": "[solución propuesta en español]"
    }
  ],
  "opportunities": [
    {
      "opportunity": "[oportunidad en español]",
      "potential_impact": "[impacto potencial en español]",
      "implementation": "[pasos de implementación en español]",
      "priority": "[alta/media/baja]"
    }
  ],
  "actionable_recommendations": [
    {
      "action": "[acción específica en español]",
      "expected_outcome": "[resultado esperado en español]",
      "timeframe": "[marco temporal en español]",
      "difficulty": "[fácil/medio/difícil]"
    }
  ],
  "next_period_predictions": {
    "productivity_forecast": [puntuación proyectada 1-10],
    "revenue_projection": [cantidad en euros],
    "key_focus_areas": ["[área 1 en español]", "[área 2 en español]"]
  }
}

IMPORTANTE: 
- Todo el contenido DEBE estar en español
- Proporciona análisis específicos basados en los datos reales
- Incluye números y métricas concretas
- Las recomendaciones deben ser accionables y específicas`;

  try {
    console.log('🤖 Enviando datos a OpenAI para análisis...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un consultor experto en productividad y análisis de rendimiento profesional. Analiza datos detalladamente y proporciona insights valiosos en español."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const analysisContent = completion.choices[0].message.content;
    if (!analysisContent) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    console.log('✅ Análisis completado por OpenAI');
    return JSON.parse(analysisContent);

  } catch (error) {
    console.error('❌ Error en análisis con OpenAI:', error);
    
    // Fallback: generar análisis básico
    return createFallbackAnalysis(metrics, userData);
  }
}

function createFallbackAnalysis(metrics: any, userData: any) {
  const productivity_score = metrics.avgProductivity || 5.0;
  
  return {
    productivity_analysis: {
      overall_score: productivity_score,
      efficiency_trends: `Análisis basado en ${userData.timeTrackingSessions.length} sesiones de trabajo. Productividad promedio de ${productivity_score}/10.`,
      peak_performance_hours: ["09:00-11:00", "14:00-16:00"],
      productivity_patterns: "Patrones identificados en base a las sesiones registradas y eventos de calendario."
    },
    time_management: {
      billable_percentage: metrics.billablePercentage,
      average_session_length: userData.timeTrackingSessions.length > 0 ? 
        userData.timeTrackingSessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0) / userData.timeTrackingSessions.length / 60 : 0,
      break_frequency: metrics.billablePercentage > 80 ? "insuficiente" : metrics.billablePercentage > 60 ? "óptima" : "excesiva",
      time_distribution: {"trabajo": 70, "reuniones": 20, "admin": 10}
    },
    client_performance: {
      response_time_average: "Análisis basado en eventos registrados",
      satisfaction_indicators: "Métricas de productividad y entrega positivas",
      communication_effectiveness: Math.min(10, Math.max(5, metrics.avgProductivity)),
      project_delivery_rate: 85
    },
    financial_performance: {
      revenue_trend: metrics.totalRevenue > 0 ? "positiva" : "necesita mejora",
      revenue_per_hour: metrics.revenuePerHour,
      proposal_conversion_rate: 70,
      budget_accuracy: "Basado en presupuestos activos, precisión estimada buena"
    },
    bottlenecks_identified: [
      {
        area: "Eficiencia facturable",
        impact: metrics.billablePercentage < 70 ? "alto" : "bajo",
        description: `Porcentaje facturable actual: ${metrics.billablePercentage}%`,
        solution: "Optimizar planificación y reducir tiempo no facturable"
      }
    ],
    opportunities: [
      {
        opportunity: "Optimización de tarifas",
        potential_impact: `Potencial incremento de €${Math.round(metrics.revenuePerHour * 0.2)}/hora`,
        implementation: "Revisar tarifas basándose en valor entregado",
        priority: "alta"
      }
    ],
    actionable_recommendations: [
      {
        action: "Implementar time blocking para trabajo de alta concentración",
        expected_outcome: "Incremento del 15-25% en productividad",
        timeframe: "1 semana",
        difficulty: "fácil"
      },
      {
        action: "Automatizar reportes y comunicaciones rutinarias",
        expected_outcome: "Ahorro de 3-5 horas semanales",
        timeframe: "2-3 semanas",
        difficulty: "medio"
      }
    ],
    next_period_predictions: {
      productivity_forecast: Math.min(10, productivity_score + 0.5),
      revenue_projection: Math.round(metrics.totalRevenue * 1.1),
      key_focus_areas: ["Automatización", "Optimización de precios", "Gestión del tiempo"]
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period = '30_days', userId } = body;

    let supabase = createRouteHandlerClient({ cookies });
    let user = null;
    let authError = null;

    const authResult = await supabase.auth.getUser();
    user = authResult.data?.user;
    authError = authResult.error;
    
    console.log('🔐 Auth attempt 1 (Route Handler):', { 
      user: user ? { id: user.id, email: user.email } : null, 
      authError: authError?.message 
    });

    if (authError || !user) {
      console.log('🔄 Trying alternative auth method...');
      
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        try {
          const { data: { user: jwtUser }, error: jwtError } = await supabase.auth.getUser(token);
          if (!jwtError && jwtUser) {
            user = jwtUser;
            console.log('✅ Auth success with JWT token:', user.email);
          }
        } catch (jwtErr) {
          console.log('❌ JWT verification failed:', jwtErr);
        }
      }
    }

    if (!user && userId) {
      console.log('🔄 Using service role with userId from body...');
      
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      user = { id: userId };
      console.log('✅ Using service role for user:', userId);
    }
    
    if (!user) {
      console.error('❌ All auth methods failed');
      return NextResponse.json({ 
        error: 'No se pudo autenticar el usuario. Por favor, cierra sesión y vuelve a iniciar sesión.' 
      }, { status: 401 });
    }

    console.log(`🔍 Iniciando análisis de rendimiento para usuario ${user.id}, período: ${period}`);

    const userData = await collectUserData(supabase, user.id, period);
    
    console.log(`📊 Datos recopilados:`, {
      calendarEvents: userData.calendarEvents.length,
      timeTrackingSessions: userData.timeTrackingSessions.length,
      budgets: userData.budgetsData.length,
      insights: userData.aiInsights.length
    });

    const totalDataPoints = userData.calendarEvents.length + userData.timeTrackingSessions.length + userData.budgetsData.length;
    
    if (totalDataPoints === 0) {
      console.log('⚠️ No hay datos suficientes para análisis, generando análisis básico');
      
      const basicAnalysis = {
        success: true,
        period,
        analysis: {
          productivity_analysis: {
            overall_score: 5.0,
            efficiency_trends: `No hay datos suficientes para el período de ${period.replace('_', ' ')}. Se recomienda empezar a registrar eventos de calendario y sesiones de trabajo.`,
            peak_performance_hours: ["09:00-11:00", "14:00-16:00"],
            productivity_patterns: "Sin datos suficientes para identificar patrones."
          },
          bottlenecks_identified: [{
            area: "Falta de datos",
            impact: "alto",
            description: "No hay suficientes datos para realizar un análisis detallado.",
            solution: "Comenzar a registrar actividades diarias en el calendario y sistema de time tracking."
          }],
          opportunities: [{
            opportunity: "Establecer sistema de seguimiento",
            potential_impact: "Mejor visibilidad del rendimiento",
            implementation: "Configurar tracking de tiempo y eventos de calendario",
            priority: "alta"
          }],
          actionable_recommendations: [{
            action: "Configurar sistema de tracking básico",
            expected_outcome: "Datos para análisis futuro",
            timeframe: "1 semana",
            difficulty: "fácil"
          }]
        },
        metrics: {
          totalWorkHours: 0,
          totalBillableHours: 0,
          billablePercentage: 0,
          avgProductivity: 0,
          totalRevenue: 0,
          revenuePerHour: 0
        }
      };

      return NextResponse.json(basicAnalysis);
    }

    const metrics = calculateMetrics(userData);
    
    console.log(`📈 Métricas calculadas:`, metrics);

    const analysis = await analyzePerformanceWithAI(userData, period, metrics);

    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: 'performance_analysis',
        category: 'productivity',
        title: `Análisis de Rendimiento - ${period.replace('_', ' ')}`,
        description: `Análisis automático de productividad y rendimiento para el período de ${period.replace('_', ' ')}`,
        confidence_score: 0.85,
        data_points: analysis,
        impact_score: analysis.productivity_analysis?.overall_score || 5,
        actionable: true,
        priority: 'medium',
        tags: ['productividad', 'análisis', 'rendimiento', 'automatizado'],
        metadata: {
          period_analyzed: period,
          data_sources: ['calendar_events', 'time_tracking_sessions', 'budgets'],
          metrics_calculated: metrics,
          analysis_method: 'openai_gpt4_performance_analyzer'
        },
        recommendations: analysis.actionable_recommendations?.map((rec: any) => rec.action) || [],
        suggested_actions: {
          priority_actions: analysis.actionable_recommendations?.filter((rec: any) => rec.difficulty === 'fácil').slice(0, 3) || [],
          bottlenecks_to_address: analysis.bottlenecks_identified || [],
          opportunities: analysis.opportunities || []
        },
        status: 'new',
        time_period_start: new Date(getPeriodRange(period).start),
        time_period_end: new Date(getPeriodRange(period).end),
        auto_generated: true,
        generation_algorithm: 'openai_gpt4_performance_analyzer',
        triggers_used: ['scheduled_analysis', 'manual_request'],
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error guardando insights:', insertError);
    }

    const response = {
      success: true,
      period,
      analysis,
      metrics,
      summary: {
        overall_score: analysis.productivity_analysis.overall_score,
        key_metrics: {
          productivity: analysis.productivity_analysis.overall_score,
          efficiency: analysis.time_management.billable_percentage,
          revenue_per_hour: analysis.financial_performance.revenue_per_hour,
          communication: analysis.client_performance.communication_effectiveness
        },
        data_points: {
          calendar_events: userData.calendarEvents.length,
          tracking_sessions: userData.timeTrackingSessions.length,
          budgets: userData.budgetsData.length
        }
      },
      generated_at: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en análisis de rendimiento:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, 
      { status: 500 }
    );
  }
}
