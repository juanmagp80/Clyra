// PROPUESTA DE IMPLEMENTACIÓN: ANALIZADOR DE RENDIMIENTO IA

const performanceAnalysisEndpoint = {
  
  // 1. RECOLECCIÓN DE DATOS DEL PERÍODO SELECCIONADO
  async collectUserData(userId, period) {
    const dateRange = this.getPeriodRange(period); // last_7_days, last_30_days, last_90_days
    
    return {
      // Eventos del calendario con métricas
      calendarEvents: await supabase
        .from('calendar_events')
        .select(`
          *,
          client:clients(name, company),
          project:projects(name, status)
        `)
        .eq('user_id', userId)
        .gte('start_time', dateRange.start)
        .lte('start_time', dateRange.end),
      
      // Sesiones de time tracking
      timeTrackingSessions: await supabase
        .from('time_tracking_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', dateRange.start),
      
      // Presupuestos y revenue
      budgetsData: await supabase
        .from('budgets')
        .select(`
          *,
          client:clients(name),
          budget_items(*)
        `)
        .eq('user_id', userId)
        .gte('created_at', dateRange.start),
      
      // Insights previos de IA
      aiInsights: await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateRange.start)
    };
  },

  // 2. ANÁLISIS CON OPENAI GPT-4
  async analyzePerformance(userData, period) {
    const prompt = `
    Analiza el rendimiento profesional de este usuario basándote en estos datos reales:

    PERÍODO: ${period} 
    
    📅 EVENTOS DE CALENDARIO (${userData.calendarEvents.length} eventos):
    ${userData.calendarEvents.map(event => `
    - ${event.title} (${event.type})
    - Cliente: ${event.client?.name || 'Interno'} 
    - Duración: ${event.duration_minutes}min
    - Productividad: ${event.productivity_score}/10
    - Revenue: €${event.actual_revenue || 0}
    - Estado: ${event.status}
    `).join('')}

    ⏱️ TIME TRACKING (${userData.timeTrackingSessions.length} sesiones):
    - Total horas trabajadas: ${userData.timeTrackingSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60}h
    - Horas facturables: ${userData.timeTrackingSessions.reduce((sum, s) => sum + s.billable_minutes, 0) / 60}h
    - Productividad promedio: ${userData.timeTrackingSessions.reduce((sum, s) => sum + s.productivity_score, 0) / userData.timeTrackingSessions.length}/10

    💰 INGRESOS Y PRESUPUESTOS:
    ${userData.budgetsData.map(budget => `
    - ${budget.title}: €${budget.total_amount} (${budget.status})
    - Cliente: ${budget.client?.name}
    - Items: ${budget.budget_items?.length || 0}
    `).join('')}

    Proporciona análisis JSON con:
    {
      "productivity_analysis": {
        "overall_score": number (1-10),
        "efficiency_trends": "análisis de tendencias",
        "peak_performance_hours": ["9:00-11:00", "14:00-16:00"],
        "productivity_patterns": "patrones identificados",
        "improvement_areas": ["área1", "área2"]
      },
      "time_management": {
        "total_hours_worked": number,
        "billable_percentage": number,
        "average_session_length": number,
        "break_frequency": "optimal/excessive/insufficient",
        "time_distribution": {"work": 70, "meetings": 20, "admin": 10}
      },
      "client_performance": {
        "response_time_average": "análisis de responsividad",
        "satisfaction_indicators": "indicadores de satisfacción",
        "communication_effectiveness": number (1-10),
        "project_delivery_rate": number
      },
      "financial_performance": {
        "revenue_trend": "increasing/stable/declining",
        "revenue_per_hour": number,
        "proposal_conversion_rate": number,
        "budget_accuracy": "análisis de precisión en presupuestos"
      },
      "bottlenecks_identified": [
        {
          "area": "nombre del bottleneck",
          "impact": "alto/medio/bajo",
          "description": "descripción detallada",
          "solution": "solución recomendada"
        }
      ],
      "opportunities": [
        {
          "opportunity": "nombre de la oportunidad",
          "potential_impact": "descripción del impacto",
          "implementation": "cómo implementar",
          "priority": "alta/media/baja"
        }
      ],
      "actionable_recommendations": [
        {
          "action": "acción específica",
          "expected_outcome": "resultado esperado",
          "timeframe": "1 semana/1 mes/3 meses",
          "difficulty": "fácil/medio/difícil"
        }
      ],
      "next_period_predictions": {
        "productivity_forecast": number,
        "revenue_projection": number,
        "key_focus_areas": ["área1", "área2", "área3"]
      }
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un consultor experto en productividad y análisis de rendimiento profesional. Respondes SOLO con JSON válido."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  },

  // 3. GENERACIÓN DE INSIGHTS VISUALES
  generateInsights(analysis, period) {
    return {
      summary: {
        title: `Análisis de Rendimiento - ${period}`,
        overall_score: analysis.productivity_analysis.overall_score,
        key_metrics: {
          productivity: analysis.productivity_analysis.overall_score,
          efficiency: analysis.time_management.billable_percentage,
          revenue_per_hour: analysis.financial_performance.revenue_per_hour,
          client_satisfaction: analysis.client_performance.communication_effectiveness
        }
      },
      
      visualizations: [
        {
          type: "productivity_trend",
          title: "Tendencia de Productividad",
          data: analysis.productivity_analysis.efficiency_trends
        },
        {
          type: "time_distribution", 
          title: "Distribución del Tiempo",
          data: analysis.time_management.time_distribution
        },
        {
          type: "revenue_analysis",
          title: "Análisis Financiero", 
          data: analysis.financial_performance
        }
      ],

      actionable_insights: analysis.actionable_recommendations.map(rec => ({
        title: rec.action,
        description: rec.expected_outcome,
        priority: rec.difficulty,
        timeframe: rec.timeframe
      }))
    };
  }
};

// EJEMPLO DE RESPUESTA ESPERADA:
const exampleAnalysisResult = {
  "productivity_analysis": {
    "overall_score": 8.2,
    "efficiency_trends": "Incremento del 15% en productividad en las últimas 2 semanas. Mejores días: martes y miércoles.",
    "peak_performance_hours": ["9:00-11:00", "14:00-16:00"],
    "productivity_patterns": "Mayor rendimiento en tareas de desarrollo por las mañanas, reuniones más efectivas por la tarde.",
    "improvement_areas": ["Gestión de interrupciones", "Tiempo entre tareas"]
  },
  "time_management": {
    "total_hours_worked": 167.5,
    "billable_percentage": 78,
    "average_session_length": 2.3,
    "break_frequency": "optimal",
    "time_distribution": {"desarrollo": 45, "reuniones": 25, "admin": 15, "propuestas": 15}
  },
  "bottlenecks_identified": [
    {
      "area": "Cambio de contexto",
      "impact": "alto", 
      "description": "Pérdida de 20-30 min cada vez que cambias entre desarrollo y reuniones",
      "solution": "Agrupar reuniones en bloques específicos, usar bloques de focus time"
    }
  ],
  "opportunities": [
    {
      "opportunity": "Automatización de propuestas",
      "potential_impact": "Ahorro de 3-5 horas semanales en preparación de propuestas",
      "implementation": "Crear templates reutilizables y sistema de pricing automático",
      "priority": "alta"
    }
  ],
  "actionable_recommendations": [
    {
      "action": "Implementar bloques de 'Deep Work' de 3h por las mañanas",
      "expected_outcome": "Incremento del 25% en productividad de desarrollo",
      "timeframe": "1 semana",
      "difficulty": "fácil"
    },
    {
      "action": "Automatizar reportes de progreso a clientes",
      "expected_outcome": "Ahorro de 2h semanales + mejor comunicación",
      "timeframe": "2 semanas", 
      "difficulty": "medio"
    }
  ]
};
