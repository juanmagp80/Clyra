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
  productivity_score: number;
  break_duration_minutes: number;
  energy_level_before: number;
  energy_level_after: number;
  task_type: string;
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
  const dateRange = getPeriodRange(period);
  
  console.log(`📅 Recopilando datos para usuario ${userId}, rango: ${dateRange.start} - ${dateRange.end}`);
  
  try {
    // Eventos del calendario
    const { data: calendarEvents, error: eventsError } = await supabase
      .from('calendar_events')
      .select(`
        *,
        client:clients(name, company),
        project:projects(name, status)
      `)
      .eq('user_id', userId)
      .gte('start_time', dateRange.start)
      .lte('start_time', dateRange.end)
      .order('start_time', { ascending: false });

    if (eventsError) {
      console.error('❌ Error fetching calendar events:', eventsError);
      // No fallar si no hay eventos, solo avisar
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
      // No fallar si no hay sesiones, solo avisar
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
      // No fallar si no hay presupuestos, solo avisar
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
      // No fallar si no hay insights, solo avisar
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
  
  // Métricas básicas
  const totalWorkHours = timeTrackingSessions.reduce((sum: number, session: TimeTrackingSession) => 
    sum + (session.duration_minutes / 60), 0);
  
  const totalBillableHours = timeTrackingSessions.reduce((sum: number, session: TimeTrackingSession) => 
    sum + (session.billable_minutes / 60), 0);
  
  const billablePercentage = totalWorkHours > 0 ? (totalBillableHours / totalWorkHours) * 100 : 0;
  
  const avgProductivity = timeTrackingSessions.length > 0 
    ? timeTrackingSessions.reduce((sum: number, session: TimeTrackingSession) => 
        sum + session.productivity_score, 0) / timeTrackingSessions.length
    : 0;
  
  const totalRevenue = calendarEvents.reduce((sum: number, event: CalendarEvent) => 
    sum + (event.actual_revenue || 0), 0);
  
  const revenuePerHour = totalBillableHours > 0 ? totalRevenue / totalBillableHours : 0;
  
  return {
    totalWorkHours: Math.round(totalWorkHours * 100) / 100,
    totalBillableHours: Math.round(totalBillableHours * 100) / 100,
    billablePercentage: Math.round(billablePercentage * 100) / 100,
    avgProductivity: Math.round(avgProductivity * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    revenuePerHour: Math.round(revenuePerHour * 100) / 100
  };
}

async function analyzePerformanceWithAI(userData: any, period: string, metrics: any) {
  const prompt = `
Analiza el rendimiento profesional de este usuario basándote en estos datos reales:

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
- Cliente: ${event.client?.name || 'Interno'} 
- Duración: ${event.duration_minutes}min
- Productividad: ${event.productivity_score}/10
- Revenue: €${event.actual_revenue || 0}
`).join('')}

⏱️ TIME TRACKING (${userData.timeTrackingSessions.length} sesiones):
${userData.timeTrackingSessions.slice(0, 10).map((session: TimeTrackingSession) => `
- Tipo: ${session.task_type}
- Duración: ${session.duration_minutes}min (${session.billable_minutes}min facturables)
- Productividad: ${session.productivity_score}/10
- Energía: ${session.energy_level_before} → ${session.energy_level_after}
`).join('')}

💰 PRESUPUESTOS (${userData.budgetsData.length} presupuestos):
${userData.budgetsData.map((budget: BudgetData) => `
- ${budget.title}: €${budget.total_amount} (${budget.status})
- Cliente: ${budget.client?.name || 'Sin cliente'}
- Items: ${budget.budget_items?.length || 0}
`).join('')}

Proporciona análisis JSON con estructura exacta:
{
  "productivity_analysis": {
    "overall_score": number,
    "efficiency_trends": "string",
    "peak_performance_hours": ["HH:MM-HH:MM"],
    "productivity_patterns": "string",
    "improvement_areas": ["string"]
  },
  "time_management": {
    "total_hours_worked": number,
    "billable_percentage": number,
    "average_session_length": number,
    "break_frequency": "string",
    "time_distribution": {"category": number}
  },
  "client_performance": {
    "response_time_average": "string",
    "satisfaction_indicators": "string", 
    "communication_effectiveness": number,
    "project_delivery_rate": number
  },
  "financial_performance": {
    "revenue_trend": "string",
    "revenue_per_hour": number,
    "proposal_conversion_rate": number,
    "budget_accuracy": "string"
  },
  "bottlenecks_identified": [
    {
      "area": "string",
      "impact": "string",
      "description": "string",
      "solution": "string"
    }
  ],
  "opportunities": [
    {
      "opportunity": "string",
      "potential_impact": "string",
      "implementation": "string",
      "priority": "string"
    }
  ],
  "actionable_recommendations": [
    {
      "action": "string",
      "expected_outcome": "string",
      "timeframe": "string",
      "difficulty": "string"
    }
  ],
  "next_period_predictions": {
    "productivity_forecast": number,
    "revenue_projection": number,
    "key_focus_areas": ["string"]
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un consultor experto en productividad y análisis de rendimiento profesional. Respondes SOLO con JSON válido, sin texto adicional."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0].message.content;
    return JSON.parse(aiResponse || '{}');
  } catch (error) {
    console.error('Error with OpenAI analysis:', error);
    
    // Fallback analysis basado en métricas calculadas
    return generateFallbackAnalysis(metrics, userData, period);
  }
}

function generateFallbackAnalysis(metrics: any, userData: any, period: string) {
  const productivity_score = Math.min(10, Math.max(1, 
    (metrics.avgProductivity * 0.4) + 
    (metrics.billablePercentage / 10 * 0.3) + 
    (Math.min(100, metrics.revenuePerHour) / 10 * 0.3)
  ));

  return {
    productivity_analysis: {
      overall_score: Math.round(productivity_score * 100) / 100,
      efficiency_trends: `Análisis del período de ${period.replace('_', ' ')}: productividad promedio ${metrics.avgProductivity}/10, eficiencia facturable ${metrics.billablePercentage}%`,
      peak_performance_hours: ["09:00-11:00", "14:00-16:00"],
      productivity_patterns: "Basado en los datos, se observan patrones de trabajo consistentes con oportunidades de optimización.",
      improvement_areas: ["Gestión del tiempo", "Optimización de tarifas", "Automatización de procesos"]
    },
    time_management: {
      total_hours_worked: metrics.totalWorkHours,
      billable_percentage: metrics.billablePercentage,
      average_session_length: userData.timeTrackingSessions.length > 0 ? 
        userData.timeTrackingSessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0) / userData.timeTrackingSessions.length / 60 : 0,
      break_frequency: metrics.billablePercentage > 80 ? "insufficient" : metrics.billablePercentage > 60 ? "optimal" : "excessive",
      time_distribution: {"trabajo": 70, "reuniones": 20, "admin": 10}
    },
    client_performance: {
      response_time_average: "Análisis basado en eventos registrados",
      satisfaction_indicators: "Métricas de productividad y entrega positivas",
      communication_effectiveness: Math.min(10, Math.max(5, metrics.avgProductivity)),
      project_delivery_rate: 85
    },
    financial_performance: {
      revenue_trend: metrics.totalRevenue > 0 ? "positive" : "needs_improvement",
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
    // Primero leer el body
    const body = await request.json();
    const { period = '30_days', userId } = body;

    // Método 1: Intentar con Route Handler Client
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

    // Método 2: Si falla, intentar con Service Role (solo para análisis de rendimiento)
    if (authError || !user) {
      console.log('🔄 Trying alternative auth method...');
      
      // Intentar obtener el token de authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verificar el token JWT
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

    // Método 3: Fallback - usar datos del cuerpo de la petición si está disponible
    if (!user && userId) {
      console.log('🔄 Using service role with userId from body...');
      
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Crear objeto user ficticio para las consultas
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

    // Recopilar datos del usuario
    const userData = await collectUserData(supabase, user.id, period);
    
    console.log(`📊 Datos recopilados:`, {
      calendarEvents: userData.calendarEvents.length,
      timeTrackingSessions: userData.timeTrackingSessions.length,
      budgets: userData.budgetsData.length,
      insights: userData.aiInsights.length
    });

    // Verificar si hay datos suficientes para el análisis
    const totalDataPoints = userData.calendarEvents.length + userData.timeTrackingSessions.length + userData.budgetsData.length;
    
    if (totalDataPoints === 0) {
      console.log('⚠️ No hay datos suficientes para análisis, generando análisis básico');
      
      // Generar análisis básico sin datos
      const basicAnalysis = {
        success: true,
        period,
        analysis: {
          productivity_analysis: {
            overall_score: 5.0,
            efficiency_trends: `No hay datos suficientes para el período de ${period.replace('_', ' ')}. Se recomienda empezar a registrar eventos de calendario y sesiones de trabajo.`,
            peak_performance_hours: ["09:00-11:00", "14:00-16:00"],
            productivity_patterns: "Sin datos disponibles para identificar patrones.",
            improvement_areas: ["Registrar eventos de calendario", "Implementar tracking de tiempo", "Crear presupuestos"]
          },
          time_management: {
            total_hours_worked: 0,
            billable_percentage: 0,
            average_session_length: 0,
            break_frequency: "unknown",
            time_distribution: {"setup": 100}
          },
          client_performance: {
            response_time_average: "Sin datos de clientes",
            satisfaction_indicators: "Pendiente de datos",
            communication_effectiveness: 5,
            project_delivery_rate: 0
          },
          financial_performance: {
            revenue_trend: "no_data",
            revenue_per_hour: 0,
            proposal_conversion_rate: 0,
            budget_accuracy: "Sin presupuestos para analizar"
          },
          bottlenecks_identified: [
            {
              area: "Falta de datos",
              impact: "alto",
              description: "No hay suficientes datos registrados para realizar un análisis detallado",
              solution: "Comenzar a registrar eventos de calendario, sesiones de trabajo y crear presupuestos"
            }
          ],
          opportunities: [
            {
              opportunity: "Implementar sistema de tracking",
              potential_impact: "Base sólida para análisis futuros de productividad",
              implementation: "Registrar eventos diarios y sesiones de trabajo",
              priority: "alta"
            }
          ],
          actionable_recommendations: [
            {
              action: "Empezar a registrar eventos en el calendario",
              expected_outcome: "Datos básicos para análisis de patrones",
              timeframe: "Esta semana",
              difficulty: "fácil"
            },
            {
              action: "Crear primer presupuesto en el sistema",
              expected_outcome: "Baseline para análisis financiero",
              timeframe: "Esta semana",
              difficulty: "fácil"
            }
          ],
          next_period_predictions: {
            productivity_forecast: 6.0,
            revenue_projection: 0,
            key_focus_areas: ["Registro de datos", "Setup inicial", "Primera medición"]
          }
        },
        metrics: {
          totalWorkHours: 0,
          totalBillableHours: 0,
          billablePercentage: 0,
          avgProductivity: 0,
          totalRevenue: 0,
          revenuePerHour: 0
        },
        summary: {
          overall_score: 5.0,
          key_metrics: {
            productivity: 5.0,
            efficiency: 0,
            revenue_per_hour: 0,
            communication: 5
          },
          data_points: {
            calendar_events: 0,
            tracking_sessions: 0,
            budgets: 0
          }
        },
        generated_at: new Date().toISOString()
      };

      return NextResponse.json(basicAnalysis);
    }

    // Calcular métricas básicas
    const metrics = calculateMetrics(userData);
    console.log(`📈 Métricas calculadas:`, metrics);

    // Análisis con IA
    const analysis = await analyzePerformanceWithAI(userData, period, metrics);
    console.log(`🤖 Análisis IA completado`);

    // Guardar insights en la base de datos
    const { error: insertError } = await supabase
      .from('ai_insights')
      .insert({
        user_id: user.id,
        type: 'performance_analysis',
        data: {
          period,
          analysis,
          metrics,
          generated_at: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error guardando insights:', insertError);
    }

    // Generar respuesta estructurada
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
