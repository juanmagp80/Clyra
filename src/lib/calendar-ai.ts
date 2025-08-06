/**
 * TASKELIA CALENDAR AI SERVICE V2.0
 * Servicio central de inteligencia artificial para el calendario
 * Maneja análisis, insights, optimización y automatizaciones
 */

import { createSupabaseClient } from './supabase-client';

// ==================== TIPOS TYPESCRIPT ====================
export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: EventType;
  client_id?: string;
  project_id?: string;
  invoice_id?: string;
  task_ids?: string[];
  is_billable: boolean;
  hourly_rate?: number;
  estimated_revenue?: number;
  actual_revenue?: number;
  status: EventStatus;
  priority: number;
  energy_level?: EnergyLevel;
  ai_suggested: boolean;
  ai_confidence?: number;
  ai_reasoning?: string;
  productivity_score?: number;
  tags?: string[];
  location?: string;
  meeting_url?: string;
  created_at: string;
  updated_at: string;
}

export type EventType = 
  | 'meeting' | 'work' | 'break' | 'admin' | 'focus' | 'client_call' 
  | 'project_review' | 'invoice_prep' | 'proposal_work' | 'design_work'
  | 'development' | 'testing' | 'deployment' | 'maintenance' | 'research'
  | 'planning' | 'brainstorming' | 'presentation' | 'training' | 'networking';

export type EventStatus = 
  | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' 
  | 'rescheduled' | 'pending_approval' | 'blocked' | 'paused';

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface AIInsight {
  id: string;
  insight_type: string;
  type?: string; // Campo adicional para compatibilidad
  category: string;
  title: string;
  description: string;
  confidence_score: number;
  impact_score: number;
  actionability_score: number;
  recommendations: string[];
  suggested_actions: any[];
  status: 'new' | 'viewed' | 'acted_upon' | 'dismissed' | 'archived';
  related_events?: string[];
  related_clients?: string[];
  related_projects?: string[];
  created_at: string;
}

export interface ProductivityPattern {
  id: string;
  pattern_name: string;
  pattern_type: string;
  conditions: any;
  metrics: any;
  confidence_level: number;
  optimal_time_slots: any[];
  productivity_impact: number;
  revenue_impact: number;
  recommendations: string[];
  is_active: boolean;
}

export interface RevenueForcast {
  predicted_revenue: number;
  confidence_score: number;
  billable_hours_forecast: number;
  key_assumptions: string[];
  risk_factors: any[];
  opportunities: any[];
}

export interface OptimalTimeSlot {
  hour_of_day: number;
  day_of_week: number;
  avg_productivity: number;
  event_count: number;
  confidence_score: number;
}

export interface TimeRange {
  startHour: number;
  endHour: number;
  days: number[];
}

export interface SimpleProductivityPattern {
  timeRange: TimeRange;
  productivityScore: number;
  energyLevel: EnergyLevel;
  confidence: number;
}

export interface ProductivityScore {
  overall_score: number;
  completed_events: number;
  total_events: number;
  avg_productivity: number;
  total_revenue: number;
  billable_hours: number;
}

export interface SmartSuggestion {
  type: 'optimal_time' | 'break_reminder' | 'client_followup' | 'revenue_opportunity';
  title: string;
  description: string;
  scheduledTime?: Date;
  confidence: number;
  reasoning: string;
}

export interface DashboardMetrics {
  events_today: number;
  completed_today: number;
  revenue_today: number;
  billable_hours_today: number;
  events_this_week: number;
  avg_productivity_week: number;
  pending_insights: number;
  active_automations: number;
  revenue_forecast_week: number;
}

// ==================== CLASE PRINCIPAL ====================
export class CalendarAI {
  private supabase = createSupabaseClient();
  private useExternalAI: boolean = false; // Flag para IA externa (ChatGPT, etc.)

  constructor(useExternalAI: boolean = false) {
    this.useExternalAI = useExternalAI;
    if (!this.supabase) {
      console.warn('Supabase client is not available. Using offline AI features only.');
    }
  }

  private checkSupabase(): boolean {
    if (!this.supabase) {
      console.error('Supabase client not available - using local AI methods');
      return false;
    }
    return true;
  }

  // ========================================
  // LOCAL AI METHODS (No external APIs needed)
  // ========================================

  /**
   * Análisis local de productividad basado en reglas y estadísticas
   */
  analyzeLocalProductivity(events: CalendarEvent[]): ProductivityScore {
    const now = new Date();
    const startOfPeriod = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 días
    
    const periodEvents = events.filter(e => 
      new Date(e.start_time) >= startOfPeriod && new Date(e.start_time) <= now
    );

    const completedEvents = periodEvents.filter(e => e.status === 'completed');
    const billableEvents = completedEvents.filter(e => e.is_billable);
    
    const billableHours = billableEvents.reduce((sum, e) => {
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const totalRevenue = billableEvents.reduce((sum, e) => {
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      return sum + (duration * (e.hourly_rate || 0));
    }, 0);

    const overallScore = periodEvents.length > 0 ? (completedEvents.length / periodEvents.length) * 100 : 0;
    const avgProductivity = completedEvents.reduce((sum, e) => sum + (e.productivity_score || 70), 0) / Math.max(completedEvents.length, 1);

    return {
      overall_score: Math.round(overallScore),
      completed_events: completedEvents.length,
      total_events: periodEvents.length,
      avg_productivity: Math.round(avgProductivity),
      total_revenue: Math.round(totalRevenue),
      billable_hours: Math.round(billableHours * 10) / 10
    };
  }

  /**
   * Genera patrones de productividad basado en análisis local
   */
  analyzeLocalProductivityPatterns(events: CalendarEvent[]): SimpleProductivityPattern[] {
    const patterns: SimpleProductivityPattern[] = [];
    
    // Análisis por franja horaria
    const timeSlots = [
      { startHour: 6, endHour: 9, name: 'Madrugada' },
      { startHour: 9, endHour: 12, name: 'Mañana' },
      { startHour: 12, endHour: 15, name: 'Mediodía' },
      { startHour: 15, endHour: 18, name: 'Tarde' },
      { startHour: 18, endHour: 22, name: 'Noche' }
    ];

    timeSlots.forEach(slot => {
      const slotEvents = events.filter(e => {
        const hour = new Date(e.start_time).getHours();
        return hour >= slot.startHour && hour < slot.endHour;
      });

      if (slotEvents.length >= 3) { // Mínimo datos para ser relevante
        const completedInSlot = slotEvents.filter(e => e.status === 'completed');
        const productivityScore = (completedInSlot.length / slotEvents.length) * 100;
        
        // Determinar nivel de energía basado en productividad
        let energyLevel: EnergyLevel = 'medium';
        if (productivityScore >= 80) energyLevel = 'high';
        else if (productivityScore < 60) energyLevel = 'low';

        patterns.push({
          timeRange: {
            startHour: slot.startHour,
            endHour: slot.endHour,
            days: [1, 2, 3, 4, 5] // Lunes a viernes por defecto
          },
          productivityScore: Math.round(productivityScore),
          energyLevel,
          confidence: Math.min(95, slotEvents.length * 10) // Más eventos = más confianza
        });
      }
    });

    return patterns.sort((a, b) => b.productivityScore - a.productivityScore);
  }

  /**
   * Genera sugerencias inteligentes sin APIs externas
   */
  generateLocalSmartSuggestions(events: CalendarEvent[], currentDate: Date = new Date()): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const now = currentDate;
    
    // 1. Sugerencia de hora óptima
    const patterns = this.analyzeLocalProductivityPatterns(events);
    if (patterns.length > 0) {
      const bestPattern = patterns[0];
      const currentHour = now.getHours();
      
      if (currentHour >= bestPattern.timeRange.startHour && currentHour < bestPattern.timeRange.endHour) {
        suggestions.push({
          type: 'optimal_time',
          title: '🎯 Momento Óptimo Detectado',
          description: `Tienes ${bestPattern.productivityScore}% de productividad en esta franja horaria. ¡Perfecto para tareas importantes!`,
          confidence: bestPattern.confidence,
          reasoning: `Análisis basado en ${patterns.length} patrones históricos`
        });
      }
    }

    // 2. Análisis de carga de trabajo
    const todayEvents = events.filter(e => 
      new Date(e.start_time).toDateString() === now.toDateString()
    );
    
    const todayDuration = todayEvents.reduce((sum, e) => {
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    if (todayDuration > 8) {
      suggestions.push({
        type: 'break_reminder',
        title: '⚡ Día Intenso Detectado',
        description: `Tienes ${todayDuration.toFixed(1)}h programadas hoy. Considera programar descansos cada 90 minutos.`,
        confidence: 85,
        reasoning: 'Estudios demuestran que descansos regulares mejoran productividad en 23%'
      });
    }

    // 3. Oportunidades de revenue
    const billableToday = todayEvents.filter(e => e.is_billable);
    const potentialBillable = todayEvents.filter(e => 
      !e.is_billable && ['work', 'focus', 'project_review', 'development'].includes(e.type)
    );

    if (potentialBillable.length > 0) {
      const potentialRevenue = potentialBillable.reduce((sum, e) => {
        const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
        return sum + (duration * 75); // Tarifa promedio estimada
      }, 0);

      suggestions.push({
        type: 'revenue_opportunity',
        title: '💰 Oportunidad de Revenue',
        description: `${potentialBillable.length} eventos de trabajo podrían ser facturables. Ingresos potenciales: €${potentialRevenue.toFixed(0)}`,
        confidence: 70,
        reasoning: 'Optimizar facturación puede aumentar ingresos hasta 25%'
      });
    }

    // 4. Follow-up con clientes
    const clientEvents = events.filter(e => e.client_id && e.status === 'completed');
    const clientMap = new Map<string, Date>();
    
    clientEvents.forEach(e => {
      const clientId = e.client_id!;
      const eventDate = new Date(e.start_time);
      if (!clientMap.has(clientId) || clientMap.get(clientId)! < eventDate) {
        clientMap.set(clientId, eventDate);
      }
    });

    clientMap.forEach((lastContact, clientId) => {
      const daysSinceContact = (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceContact > 14) { // 2 semanas sin contacto
        suggestions.push({
          type: 'client_followup',
          title: '📞 Follow-up Recomendado',
          description: `Han pasado ${Math.round(daysSinceContact)} días sin contacto con un cliente. Considera programar un check-in.`,
          confidence: 80,
          reasoning: 'Mantener contacto regular reduce riesgo de churn en 40%'
        });
      }
    });

    return suggestions.slice(0, 5); // Máximo 5 sugerencias
  }

  /**
   * Calcula métricas del dashboard en tiempo real
   */
  calculateLocalDashboardMetrics(events: CalendarEvent[], currentDate: Date = new Date()): DashboardMetrics {
    const now = currentDate;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    const todayEvents = events.filter(e => 
      new Date(e.start_time).toDateString() === now.toDateString()
    );
    
    const weekEvents = events.filter(e => 
      new Date(e.start_time) >= startOfWeek && new Date(e.start_time) <= now
    );

    const completedToday = todayEvents.filter(e => e.status === 'completed');
    const billableToday = completedToday.filter(e => e.is_billable);
    
    const revenueToday = billableToday.reduce((sum, e) => {
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      return sum + (duration * (e.hourly_rate || 0));
    }, 0);

    const billableHoursToday = billableToday.reduce((sum, e) => {
      const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const completedWeek = weekEvents.filter(e => e.status === 'completed');
    const avgProductivityWeek = completedWeek.length > 0 ? 
      completedWeek.reduce((sum, e) => sum + (e.productivity_score || 70), 0) / completedWeek.length : 0;

    // Forecast de revenue para la semana
    const avgDailyRevenue = revenueToday;
    const remainingDaysInWeek = 5 - now.getDay(); // Asumiendo semana laboral
    const revenueForecastWeek = revenueToday + (avgDailyRevenue * Math.max(0, remainingDaysInWeek));

    return {
      events_today: todayEvents.length,
      completed_today: completedToday.length,
      revenue_today: Math.round(revenueToday),
      billable_hours_today: Math.round(billableHoursToday * 10) / 10,
      events_this_week: weekEvents.length,
      avg_productivity_week: Math.round(avgProductivityWeek),
      pending_insights: this.generateLocalSmartSuggestions(events, now).length,
      active_automations: 3, // Placeholder - se puede calcular según automatizaciones activas
      revenue_forecast_week: Math.round(revenueForecastWeek)
    };
  }

  // ==================== ANÁLISIS DE PRODUCTIVIDAD ====================
  
  /**
   * Calcula el score de productividad del usuario para un período
   */
  async calculateProductivityScore(
    userId: string, 
    periodStart?: Date, 
    periodEnd?: Date
  ): Promise<ProductivityScore> {
    const start = periodStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 días atrás
    const end = periodEnd || new Date();

    const { data, error } = await this.supabase.rpc('calculate_user_productivity_score', {
      user_uuid: userId,
      period_start: start.toISOString(),
      period_end: end.toISOString()
    });

    if (error) {
      console.error('Error calculating productivity score:', error);
      // Fallback calculation
      return this.calculateProductivityScoreFallback(userId, start, end);
    }

    return data[0] || {
      overall_score: 0,
      completed_events: 0,
      total_events: 0,
      avg_productivity: 0,
      total_revenue: 0,
      billable_hours: 0
    };
  }

  /**
   * Obtiene los horarios óptimos del usuario basándose en patrones históricos
   */
  async getOptimalTimeSlots(userId: string): Promise<OptimalTimeSlot[]> {
    const { data, error } = await this.supabase.rpc('get_optimal_time_slots', {
      user_uuid: userId
    });

    if (error) {
      console.error('Error getting optimal time slots:', error);
      // Fallback to default optimal times
      return this.getDefaultOptimalTimeSlots();
    }

    return data || [];
  }

  /**
   * Obtiene métricas del dashboard de IA
   */
  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    const { data, error } = await this.supabase
      .from('ai_dashboard')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error getting dashboard metrics:', error);
      return this.calculateDashboardMetricsFallback(userId);
    }

    return data || {
      events_today: 0,
      completed_today: 0,
      revenue_today: 0,
      billable_hours_today: 0,
      events_this_week: 0,
      avg_productivity_week: 0,
      pending_insights: 0,
      active_automations: 0,
      revenue_forecast_week: 0
    };
  }

  // ==================== GENERACIÓN DE INSIGHTS ====================

  /**
   * Genera insights automáticos basándose en la actividad del usuario
   */
  async generateAutomaticInsights(userId: string): Promise<AIInsight[]> {
    try {
      // Obtener datos recientes del usuario
      const [events, patterns, productivity] = await Promise.all([
        this.getRecentEvents(userId, 30),
        this.analyzeProductivityPatterns(userId),
        this.calculateProductivityScore(userId)
      ]);

      const insights: Partial<AIInsight>[] = [];

      // Insight 1: Análisis de productividad semanal
      if (productivity.avg_productivity > 0) {
        insights.push({
          insight_type: 'productivity',
          category: 'weekly_analysis',
          title: `Tu productividad promedio es ${productivity.avg_productivity.toFixed(1)}/10`,
          description: this.generateProductivityInsight(productivity),
          confidence_score: 0.85,
          impact_score: 8,
          actionability_score: 7,
          recommendations: this.generateProductivityRecommendations(productivity),
          status: 'new'
        });
      }

      // Insight 2: Patrones de horarios óptimos
      if (patterns.length > 0) {
        const bestPattern = patterns[0];
        insights.push({
          insight_type: 'schedule_optimization',
          category: 'optimal_timing',
          title: 'Hemos identificado tu horario más productivo',
          description: `Según tus datos, eres más productivo durante ${bestPattern.pattern_name}`,
          confidence_score: bestPattern.confidence_level,
          impact_score: 9,
          actionability_score: 8,
          recommendations: bestPattern.recommendations,
          status: 'new'
        });
      }

      // Insight 3: Análisis de revenue
      if (productivity.total_revenue > 0) {
        insights.push({
          insight_type: 'revenue',
          category: 'financial_analysis',
          title: `Has generado €${productivity.total_revenue.toFixed(2)} esta semana`,
          description: this.generateRevenueInsight(productivity, events),
          confidence_score: 0.95,
          impact_score: 9,
          actionability_score: 6,
          recommendations: this.generateRevenueRecommendations(productivity),
          status: 'new'
        });
      }

      // Insight 4: Análisis de clientes
      const clientInsight = await this.generateClientInsight(userId, events);
      if (clientInsight) {
        insights.push(clientInsight);
      }

      // Guardar insights en la base de datos
      const savedInsights = await this.saveInsights(userId, insights);
      return savedInsights;

    } catch (error) {
      console.error('Error generating automatic insights:', error);
      throw error;
    }
  }

  /**
   * Obtiene insights pendientes del usuario
   */
  async getPendingInsights(userId: string): Promise<AIInsight[]> {
    const { data, error } = await this.supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'new')
      .order('impact_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error getting pending insights:', error);
      return [];
    }

    return data || [];
  }

  // ==================== SUGERENCIAS INTELIGENTES ====================

  /**
   * Sugiere el mejor horario para un nuevo evento
   */
  async suggestOptimalSchedule(
    userId: string,
    eventType: EventType,
    duration: number, // minutes
    preferences?: {
      preferredDays?: number[];
      preferredHours?: number[];
      energyLevelRequired?: EnergyLevel;
      clientId?: string;
    }
  ): Promise<{
    suggested_time: Date;
    confidence: number;
    reasoning: string;
    alternative_times: Date[];
  }> {
    try {
      // Obtener horarios óptimos del usuario
      const optimalSlots = await this.getOptimalTimeSlots(userId);
      
      // Obtener eventos existentes para evitar conflictos
      const existingEvents = await this.getUpcomingEvents(userId, 14);
      
      // Filtrar slots disponibles
      const availableSlots = this.findAvailableTimeSlots(
        optimalSlots,
        existingEvents,
        duration,
        preferences
      );

      if (availableSlots.length === 0) {
        // Fallback: sugerir horarios básicos
        return this.generateFallbackSchedule(duration, existingEvents);
      }

      // Ordenar por score de conveniencia
      const rankedSlots = this.rankTimeSlots(availableSlots, eventType, preferences);
      
      const bestSlot = rankedSlots[0];
      const alternatives = rankedSlots.slice(1, 4).map(slot => slot.datetime);

      return {
        suggested_time: bestSlot.datetime,
        confidence: bestSlot.confidence,
        reasoning: bestSlot.reasoning,
        alternative_times: alternatives
      };

    } catch (error) {
      console.error('Error suggesting optimal schedule:', error);
      throw error;
    }
  }

  /**
   * Auto-scheduler inteligente que programa tareas automáticamente
   */
  async autoScheduleTasks(
    userId: string,
    tasks: Array<{
      title: string;
      duration: number;
      priority: number;
      deadline?: Date;
      type?: EventType;
      clientId?: string;
      projectId?: string;
    }>
  ): Promise<Array<{
    task: any;
    scheduled_time: Date;
    confidence: number;
    reasoning: string;
  }>> {
    try {
      const scheduledTasks = [];
      
      // Ordenar tareas por prioridad y deadline
      const sortedTasks = tasks.sort((a, b) => {
        if (a.deadline && b.deadline) {
          if (a.deadline.getTime() !== b.deadline.getTime()) {
            return a.deadline.getTime() - b.deadline.getTime();
          }
        }
        return b.priority - a.priority;
      });

      for (const task of sortedTasks) {
        try {
          const suggestion = await this.suggestOptimalSchedule(
            userId,
            task.type || 'work',
            task.duration,
            {
              clientId: task.clientId,
              energyLevelRequired: task.priority >= 4 ? 'high' : 'medium'
            }
          );

          scheduledTasks.push({
            task,
            scheduled_time: suggestion.suggested_time,
            confidence: suggestion.confidence,
            reasoning: suggestion.reasoning
          });

          // Crear el evento automáticamente si la confianza es alta
          if (suggestion.confidence > 0.8) {
            await this.createAIEvent(userId, {
              title: task.title,
              start_time: suggestion.suggested_time,
              duration: task.duration,
              type: task.type || 'work',
              priority: task.priority,
              client_id: task.clientId,
              project_id: task.projectId,
              ai_suggested: true,
              ai_confidence: suggestion.confidence,
              ai_reasoning: suggestion.reasoning
            });
          }

        } catch (error) {
          console.error(`Error scheduling task "${task.title}":`, error);
        }
      }

      return scheduledTasks;

    } catch (error) {
      console.error('Error auto-scheduling tasks:', error);
      throw error;
    }
  }

  // ==================== FORECASTING Y PREDICCIONES ====================

  /**
   * Genera un forecast de revenue para el período especificado
   */
  async generateRevenueForecast(
    userId: string,
    targetDate: Date,
    forecastType: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'weekly'
  ): Promise<RevenueForcast> {
    try {
      // Obtener datos históricos
      const historicalDays = forecastType === 'quarterly' ? 365 : 
                           forecastType === 'monthly' ? 90 : 30;
      
      const historicalEvents = await this.getRecentEvents(userId, historicalDays);
      
      // Calcular métricas base
      const billableEvents = historicalEvents.filter(e => 
        e.is_billable && e.status === 'completed' && e.actual_revenue
      );
      
      const avgDailyRevenue = this.calculateAverageRevenue(billableEvents, 'daily');
      const avgHourlyRate = this.calculateAverageHourlyRate(billableEvents);
      const seasonalTrend = this.calculateSeasonalTrend(billableEvents, targetDate);
      
      // Obtener eventos programados
      const upcomingEvents = await this.getUpcomingEvents(userId, 30);
      const scheduledBillableHours = this.calculateScheduledBillableHours(upcomingEvents);
      
      // Calcular predicción
      const basePrediction = this.calculateBasePrediction(
        avgDailyRevenue,
        forecastType,
        targetDate
      );
      
      const adjustedPrediction = basePrediction * seasonalTrend;
      const confidenceScore = this.calculateForecastConfidence(
        historicalEvents,
        upcomingEvents,
        forecastType
      );

      return {
        predicted_revenue: adjustedPrediction,
        confidence_score: confidenceScore,
        billable_hours_forecast: scheduledBillableHours,
        key_assumptions: [
          `Basado en ${billableEvents.length} eventos históricos`,
          `Tarifa promedio: €${avgHourlyRate.toFixed(2)}/hora`,
          `Tendencia estacional: ${((seasonalTrend - 1) * 100).toFixed(1)}%`,
          `Horas programadas: ${scheduledBillableHours.toFixed(1)}h`
        ],
        risk_factors: this.identifyRiskFactors(historicalEvents, upcomingEvents),
        opportunities: this.identifyOpportunities(userId, historicalEvents)
      };
    } catch (error) {
      console.error('Error generating revenue forecast:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS HELPER PRIVADOS ====================

  private async getRecentEvents(userId: string, days: number): Promise<CalendarEvent[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error getting recent events:', error);
      return [];
    }

    return data || [];
  }

  private async getUpcomingEvents(userId: string, days: number): Promise<CalendarEvent[]> {
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }

    return data || [];
  }

  private async calculateProductivityScoreFallback(
    userId: string, 
    start: Date, 
    end: Date
  ): Promise<ProductivityScore> {
    const events = await this.getRecentEvents(userId, 7);
    const completedEvents = events.filter(e => e.status === 'completed');
    const totalRevenue = completedEvents.reduce((sum, e) => sum + (e.actual_revenue || 0), 0);
    const billableHours = completedEvents
      .filter(e => e.is_billable)
      .reduce((sum, e) => {
        const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

    const avgProductivity = completedEvents.length > 0 ? 
      completedEvents.reduce((sum, e) => sum + (e.productivity_score || 5), 0) / completedEvents.length : 0;

    return {
      overall_score: avgProductivity,
      completed_events: completedEvents.length,
      total_events: events.length,
      avg_productivity: avgProductivity,
      total_revenue: totalRevenue,
      billable_hours: billableHours
    };
  }

  private getDefaultOptimalTimeSlots(): OptimalTimeSlot[] {
    return [
      { hour_of_day: 9, day_of_week: 1, avg_productivity: 8.5, event_count: 10, confidence_score: 0.7 },
      { hour_of_day: 10, day_of_week: 2, avg_productivity: 8.2, event_count: 8, confidence_score: 0.6 },
      { hour_of_day: 14, day_of_week: 3, avg_productivity: 7.8, event_count: 6, confidence_score: 0.5 },
      { hour_of_day: 15, day_of_week: 4, avg_productivity: 7.5, event_count: 5, confidence_score: 0.4 }
    ];
  }

  private async calculateDashboardMetricsFallback(userId: string): Promise<DashboardMetrics> {
    const today = new Date();
    const todayEvents = await this.getTodayEvents(userId);
    const weekEvents = await this.getWeekEvents(userId);

    return {
      events_today: todayEvents.length,
      completed_today: todayEvents.filter(e => e.status === 'completed').length,
      revenue_today: todayEvents.reduce((sum, e) => sum + (e.actual_revenue || 0), 0),
      billable_hours_today: this.calculateBillableHours(todayEvents),
      events_this_week: weekEvents.length,
      avg_productivity_week: this.calculateAvgProductivity(weekEvents),
      pending_insights: 0,
      active_automations: 0,
      revenue_forecast_week: 0
    };
  }

  private async getTodayEvents(userId: string): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data, error } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startOfDay.toISOString())
      .lt('start_time', endOfDay.toISOString());

    return data || [];
  }

  private async getWeekEvents(userId: string): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startOfWeek.toISOString())
      .lt('start_time', endOfWeek.toISOString());

    return data || [];
  }

  private calculateBillableHours(events: CalendarEvent[]): number {
    return events
      .filter(e => e.is_billable)
      .reduce((sum, e) => {
        const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);
  }

  private calculateAvgProductivity(events: CalendarEvent[]): number {
    const completedEvents = events.filter(e => e.status === 'completed' && e.productivity_score);
    if (completedEvents.length === 0) return 0;
    
    return completedEvents.reduce((sum, e) => sum + (e.productivity_score || 0), 0) / completedEvents.length;
  }

  private generateProductivityInsight(productivity: ProductivityScore): string {
    if (productivity.avg_productivity >= 8) {
      return `¡Excelente! Estás en una racha muy productiva. Has completado ${productivity.completed_events} de ${productivity.total_events} eventos programados con una calidad excepcional.`;
    } else if (productivity.avg_productivity >= 6) {
      return `Tu productividad está en un buen nivel. Has completado ${productivity.completed_events} eventos con un score promedio sólido. Hay oportunidades de mejora.`;
    } else {
      return `Tu productividad ha estado por debajo del promedio esta semana. Has completado ${productivity.completed_events} eventos. Te sugerimos algunas optimizaciones.`;
    }
  }

  private generateProductivityRecommendations(productivity: ProductivityScore): string[] {
    const recommendations = [];
    
    if (productivity.avg_productivity < 6) {
      recommendations.push('Considera dividir tareas grandes en bloques más pequeños');
      recommendations.push('Programa breaks regulares para mantener la energía');
      recommendations.push('Identifica y elimina distracciones durante eventos de trabajo');
    }
    
    if (productivity.completed_events / productivity.total_events < 0.8) {
      recommendations.push('Revisa si estás programando demasiados eventos');
      recommendations.push('Considera buffers de tiempo entre eventos');
    }
    
    if (productivity.billable_hours < 20) {
      recommendations.push('Incrementa gradualmente tus horas facturables');
      recommendations.push('Optimiza eventos no facturables para liberar más tiempo');
    }
    
    return recommendations;
  }

  private generateRevenueInsight(productivity: ProductivityScore, events: CalendarEvent[]): string {
    const avgHourlyEarnings = productivity.billable_hours > 0 ? 
      productivity.total_revenue / productivity.billable_hours : 0;
    
    return `Con ${productivity.billable_hours.toFixed(1)} horas facturadas, tu tarifa promedio ha sido €${avgHourlyEarnings.toFixed(2)}/hora. ${
      avgHourlyEarnings > 75 ? 'Tu tarifa está en un rango premium.' :
      avgHourlyEarnings > 50 ? 'Tu tarifa está en un buen rango.' :
      'Considera optimizar tu tarifa horaria.'
    }`;
  }

  private generateRevenueRecommendations(productivity: ProductivityScore): string[] {
    const recommendations = [];
    const avgHourlyEarnings = productivity.billable_hours > 0 ? 
      productivity.total_revenue / productivity.billable_hours : 0;
    
    if (avgHourlyEarnings < 50) {
      recommendations.push('Considera incrementar tu tarifa horaria gradualmente');
      recommendations.push('Enfócate en proyectos de mayor valor');
    }
    
    if (productivity.billable_hours < 30) {
      recommendations.push('Busca oportunidades para incrementar horas facturables');
      recommendations.push('Optimiza tiempo en tareas administrativas');
    }
    
    recommendations.push('Establece metas de revenue semanales claras');
    
    return recommendations;
  }

  private async generateClientInsight(userId: string, events: CalendarEvent[]): Promise<Partial<AIInsight> | null> {
    // Agrupar eventos por cliente
    const clientEvents = events.filter(e => e.client_id);
    if (clientEvents.length === 0) return null;

    const clientStats = clientEvents.reduce((acc, event) => {
      const clientId = event.client_id!;
      if (!acc[clientId]) {
        acc[clientId] = { events: 0, revenue: 0, hours: 0 };
      }
      acc[clientId].events++;
      acc[clientId].revenue += event.actual_revenue || 0;
      
      const duration = (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60);
      if (event.is_billable) acc[clientId].hours += duration;
      
      return acc;
    }, {} as Record<string, { events: number; revenue: number; hours: number }>);

    // Encontrar el cliente top
    const topClient = Object.entries(clientStats).reduce((max, [clientId, stats]) => 
      stats.revenue > max.stats.revenue ? { clientId, stats } : max,
      { clientId: '', stats: { events: 0, revenue: 0, hours: 0 } }
    );

    if (topClient.stats.revenue === 0) return null;

    return {
      insight_type: 'client_analysis',
      category: 'top_client',
      title: 'Tu cliente más valioso esta semana',
      description: `Has trabajado ${topClient.stats.hours.toFixed(1)} horas para este cliente, generando €${topClient.stats.revenue.toFixed(2)} en ingresos.`,
      confidence_score: 0.9,
      impact_score: 7,
      actionability_score: 6,
      recommendations: [
        'Considera ofrecer servicios adicionales a este cliente',
        'Mantén una comunicación proactiva',
        'Evalúa oportunidades de proyectos a largo plazo'
      ],
      related_clients: [topClient.clientId],
      status: 'new'
    };
  }

  private async saveInsights(userId: string, insights: Partial<AIInsight>[]): Promise<AIInsight[]> {
    const insightsToSave = insights.map(insight => ({
      ...insight,
      user_id: userId,
      auto_generated: true,
      generation_algorithm: 'calendar_ai_v2',
      related_events: insight.related_events || [],
      related_clients: insight.related_clients || [],
      related_projects: insight.related_projects || [],
      suggested_actions: insight.suggested_actions || []
    }));

    const { data, error } = await this.supabase
      .from('ai_insights')
      .insert(insightsToSave)
      .select('*');

    if (error) {
      console.error('Error saving insights:', error);
      throw error;
    }

    return data || [];
  }

  private findAvailableTimeSlots(
    optimalSlots: OptimalTimeSlot[],
    existingEvents: CalendarEvent[],
    duration: number,
    preferences?: any
  ): Array<{ datetime: Date; productivity_score: number; availability_score: number }> {
    const slots = [];
    const now = new Date();
    
    // Generar slots para los próximos 14 días
    for (let day = 0; day < 14; day++) {
      const date = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      
      // Filtrar slots óptimos para este día
      const dayOptimalSlots = optimalSlots.filter(slot => slot.day_of_week === dayOfWeek);
      
      for (const slot of dayOptimalSlots) {
        const slotTime = new Date(date);
        slotTime.setHours(slot.hour_of_day, 0, 0, 0);
        
        // Verificar disponibilidad
        const isAvailable = this.isTimeSlotAvailable(slotTime, duration, existingEvents);
        if (isAvailable) {
          slots.push({
            datetime: slotTime,
            productivity_score: slot.avg_productivity,
            availability_score: 1.0 // Completamente disponible
          });
        }
      }
    }
    
    return slots;
  }

  private isTimeSlotAvailable(
    startTime: Date,
    duration: number,
    existingEvents: CalendarEvent[]
  ): boolean {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    
    return !existingEvents.some(event => {
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);
      
      // Verificar solapamiento
      return (startTime < eventEnd && endTime > eventStart);
    });
  }

  private rankTimeSlots(
    slots: Array<{ datetime: Date; productivity_score: number; availability_score: number }>,
    eventType: EventType,
    preferences?: any
  ): Array<{ datetime: Date; confidence: number; reasoning: string }> {
    return slots
      .map(slot => {
        let score = slot.productivity_score * 0.6 + slot.availability_score * 0.4;
        
        // Ajustes por tipo de evento
        if (eventType === 'focus' && slot.productivity_score > 8) {
          score += 1;
        }
        if (eventType === 'meeting' && slot.datetime.getHours() >= 10 && slot.datetime.getHours() <= 16) {
          score += 0.5;
        }
        
        const confidence = Math.min(score / 10, 1);
        const reasoning = this.generateScheduleReasoning(slot, eventType, confidence);
        
        return {
          datetime: slot.datetime,
          confidence,
          reasoning
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  private generateScheduleReasoning(slot: any, eventType: EventType, confidence: number): string {
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = dayNames[slot.datetime.getDay()];
    const hour = slot.datetime.getHours();
    
    let reasoning = `${day} a las ${hour}:00 - `;
    
    if (confidence > 0.8) {
      reasoning += `Horario óptimo basado en tu patrón de alta productividad (${slot.productivity_score.toFixed(1)}/10)`;
    } else if (confidence > 0.6) {
      reasoning += `Buen horario con productividad sólida (${slot.productivity_score.toFixed(1)}/10)`;
    } else {
      reasoning += `Horario disponible con productividad moderada (${slot.productivity_score.toFixed(1)}/10)`;
    }
    
    if (eventType === 'focus' && hour >= 9 && hour <= 11) {
      reasoning += '. Ideal para trabajo de concentración.';
    } else if (eventType === 'meeting' && hour >= 14 && hour <= 16) {
      reasoning += '. Perfecto para reuniones de tarde.';
    }
    
    return reasoning;
  }

  private generateFallbackSchedule(
    duration: number, 
    existingEvents: CalendarEvent[]
  ): {
    suggested_time: Date;
    confidence: number;
    reasoning: string;
    alternative_times: Date[];
  } {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(10, 0, 0, 0);

    // Buscar siguiente slot disponible
    let suggestedTime = tomorrow;
    for (let hour = 9; hour <= 17; hour++) {
      const testTime = new Date(tomorrow);
      testTime.setHours(hour, 0, 0, 0);
      
      if (this.isTimeSlotAvailable(testTime, duration, existingEvents)) {
        suggestedTime = testTime;
        break;
      }
    }

    return {
      suggested_time: suggestedTime,
      confidence: 0.5,
      reasoning: 'Horario sugerido basado en disponibilidad básica',
      alternative_times: []
    };
  }

  private async createAIEvent(userId: string, eventData: any): Promise<CalendarEvent> {
    const endTime = new Date(eventData.start_time.getTime() + eventData.duration * 60 * 1000);
    
    const { data, error } = await this.supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: eventData.title,
        start_time: eventData.start_time.toISOString(),
        end_time: endTime.toISOString(),
        type: eventData.type,
        priority: eventData.priority,
        client_id: eventData.client_id,
        project_id: eventData.project_id,
        ai_suggested: eventData.ai_suggested,
        ai_confidence: eventData.ai_confidence,
        ai_reasoning: eventData.ai_reasoning,
        status: 'scheduled'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating AI event:', error);
      throw error;
    }

    return data;
  }

  private calculateAverageRevenue(events: CalendarEvent[], period: 'daily' | 'weekly' | 'monthly'): number {
    if (events.length === 0) return 0;
    
    const totalRevenue = events.reduce((sum, event) => sum + (event.actual_revenue || 0), 0);
    const days = events.length > 0 ? this.getDateRangeInDays(events) : 1;
    
    switch (period) {
      case 'daily': return totalRevenue / days;
      case 'weekly': return (totalRevenue / days) * 7;
      case 'monthly': return (totalRevenue / days) * 30;
    }
  }

  private calculateAverageHourlyRate(events: CalendarEvent[]): number {
    const billableEvents = events.filter(e => e.is_billable && e.actual_revenue && e.hourly_rate);
    if (billableEvents.length === 0) return 0;
    
    return billableEvents.reduce((sum, event) => sum + (event.hourly_rate || 0), 0) / billableEvents.length;
  }

  private calculateSeasonalTrend(events: CalendarEvent[], targetDate: Date): number {
    // Análisis estacional básico - puede ser expandido con ML
    const targetMonth = targetDate.getMonth();
    const monthlyRevenue = Array(12).fill(0);
    
    events.forEach(event => {
      const month = new Date(event.start_time).getMonth();
      monthlyRevenue[month] += event.actual_revenue || 0;
    });
    
    const avgRevenue = monthlyRevenue.reduce((sum, rev) => sum + rev, 0) / 12;
    const targetMonthRevenue = monthlyRevenue[targetMonth];
    
    return avgRevenue > 0 ? targetMonthRevenue / avgRevenue : 1;
  }

  private calculateBasePrediction(avgRevenue: number, type: string, targetDate: Date): number {
    switch (type) {
      case 'daily': return avgRevenue;
      case 'weekly': return avgRevenue * 7;
      case 'monthly': return avgRevenue * 30;
      case 'quarterly': return avgRevenue * 90;
      default: return avgRevenue * 7;
    }
  }

  private calculateScheduledBillableHours(events: CalendarEvent[]): number {
    return events
      .filter(e => e.is_billable && e.status === 'scheduled')
      .reduce((total, event) => {
        const duration = (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60);
        return total + duration;
      }, 0);
  }

  private calculateForecastConfidence(
    historical: CalendarEvent[],
    upcoming: CalendarEvent[],
    type: string
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Más datos históricos = mayor confianza
    if (historical.length > 50) confidence += 0.3;
    else if (historical.length > 20) confidence += 0.2;
    else if (historical.length > 10) confidence += 0.1;
    
    // Eventos programados = mayor confianza
    if (upcoming.length > 10) confidence += 0.2;
    else if (upcoming.length > 5) confidence += 0.1;
    
    return Math.min(confidence, 1);
  }

  private identifyRiskFactors(historical: CalendarEvent[], upcoming: CalendarEvent[]): any[] {
    const risks = [];
    
    // Análisis de cancelaciones
    const cancelationRate = historical.filter(e => e.status === 'cancelled').length / historical.length;
    if (cancelationRate > 0.1) {
      risks.push({
        factor: 'High cancellation rate',
        impact: 'medium',
        probability: cancelationRate
      });
    }
    
    // Dependencia de pocos clientes
    const clientIds = new Set(historical.filter(e => e.client_id).map(e => e.client_id));
    if (clientIds.size < 3) {
      risks.push({
        factor: 'Limited client diversity',
        impact: 'high',
        probability: 0.6
      });
    }
    
    return risks;
  }

  private identifyOpportunities(userId: string, historical: CalendarEvent[]): any[] {
    const opportunities = [];
    
    // Oportunidad de incrementar tarifas
    const avgRate = this.calculateAverageHourlyRate(historical);
    if (avgRate < 75) {
      opportunities.push({
        opportunity: 'Rate increase potential',
        impact: 'high',
        probability: 0.7
      });
    }
    
    // Oportunidad de más horas facturables
    const billableHoursPerWeek = this.calculateScheduledBillableHours(historical) / 4;
    if (billableHoursPerWeek < 30) {
      opportunities.push({
        opportunity: 'Increase billable hours',
        impact: 'medium',
        probability: 0.8
      });
    }
    
    return opportunities;
  }

  private getDateRangeInDays(events: CalendarEvent[]): number {
    if (events.length === 0) return 1;
    
    const dates = events.map(e => new Date(e.start_time).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    
    return Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  }

  // ==================== MÉTODOS PÚBLICOS ADICIONALES ====================

  /**
   * Marca un insight como visto/actuado
   */
  async updateInsightStatus(insightId: string, status: string, feedback?: number): Promise<void> {
    const { error } = await this.supabase
      .from('ai_insights')
      .update({ 
        status, 
        user_feedback: feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', insightId);

    if (error) {
      console.error('Error updating insight status:', error);
      throw error;
    }
  }

  /**
   * Obtiene reportes de productividad
   */
  async getProductivityReport(userId: string): Promise<any> {
    const [score, patterns, insights] = await Promise.all([
      this.calculateProductivityScore(userId),
      this.analyzeProductivityPatterns(userId),
      this.getPendingInsights(userId)
    ]);

    return {
      current_score: score,
      patterns: patterns.slice(0, 5),
      insights: insights.slice(0, 3),
      recommendations: this.generateProductivityRecommendations(score)
    };
  }

  /**
   * Inicializa IA para un nuevo usuario
   */
  async initializeUserAI(userId: string): Promise<void> {
    try {
      await this.supabase.rpc('initialize_user_calendar_ai', {
        user_uuid: userId
      });
    } catch (error) {
      console.error('Error initializing user AI:', error);
      throw error;
    }
  }

  /**
   * Obtiene sugerencias inteligentes para el usuario
   */
  async getSmartSuggestions(userId: string): Promise<SmartSuggestion[]> {
    try {
      const [patterns, events, insights] = await Promise.all([
        this.analyzeProductivityPatterns(userId),
        this.getUpcomingEvents(userId, 7),
        this.getPendingInsights(userId)
      ]);

      const suggestions: SmartSuggestion[] = [];

      // Sugerencia de horario óptimo
      if (patterns.length > 0) {
        const bestPattern = patterns[0];
        suggestions.push({
          type: 'optimal_time',
          title: 'Programa trabajo de alta concentración',
          description: `Tu mejor momento es ${bestPattern.pattern_name}`,
          confidence: bestPattern.confidence_level,
          reasoning: `Basado en datos históricos, tu productividad es ${bestPattern.productivity_impact}% más alta durante este período.`
        });
      }

      // Sugerencia de break
      const upcomingLongSessions = events.filter(e => {
        const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
        return duration > 3; // Más de 3 horas
      });

      if (upcomingLongSessions.length > 0) {
        suggestions.push({
          type: 'break_reminder',
          title: 'Programa breaks en sesiones largas',
          description: 'Tienes sesiones de trabajo de más de 3 horas programadas',
          confidence: 0.8,
          reasoning: 'Los breaks regulares mejoran la productividad y reducen la fatiga mental.'
        });
      }

      // Sugerencias basadas en insights
      insights.slice(0, 2).forEach(insight => {
        if (insight.actionability_score > 7) {
          suggestions.push({
            type: 'revenue_opportunity',
            title: insight.title,
            description: insight.description,
            confidence: insight.confidence_score,
            reasoning: insight.recommendations[0] || 'Acción recomendada por el análisis de IA'
          });
        }
      });

      return suggestions.slice(0, 5); // Máximo 5 sugerencias

    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return [];
    }
  }

  // ==================== ANÁLISIS DE PRODUCTIVIDAD ====================

  async analyzeProductivityPatterns(userId: string): Promise<SimpleProductivityPattern[]> {
    try {
      if (!this.checkSupabase()) return this.getDefaultPatterns();
      
      // Obtener datos de sesiones de trabajo de los últimos 30 días
      const { data: sessions, error } = await this.supabase!
        .from('time_tracking_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error || !sessions) {
        console.error('Error fetching sessions:', error);
        return this.getDefaultPatterns();
      }

      // Agrupar por hora del día y día de la semana
      const hourlyProductivity: { [key: string]: number[] } = {};
      
      sessions.forEach(session => {
        const startTime = new Date(session.start_time);
        const hour = startTime.getHours();
        const day = startTime.getDay();
        const key = `${hour}-${day}`;
        
        if (!hourlyProductivity[key]) {
          hourlyProductivity[key] = [];
        }
        
        hourlyProductivity[key].push(session.productivity_rating || 3);
      });

      // Encontrar los mejores bloques de tiempo
      const patterns: ProductivityPattern[] = [];
      
      // Analizar bloques de 2 horas
      for (let hour = 6; hour <= 20; hour += 2) {
        for (let day = 1; day <= 5; day++) {
          const scores: number[] = [];
          
          for (let h = hour; h < hour + 2; h++) {
            const key = `${h}-${day}`;
            if (hourlyProductivity[key]) {
              scores.push(...hourlyProductivity[key]);
            }
          }
          
          if (scores.length >= 3) {
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const confidence = Math.min(scores.length / 10, 1);
            
            if (avgScore >= 3.5) {
              patterns.push({
                timeRange: {
                  startHour: hour,
                  endHour: hour + 2,
                  days: [day]
                },
                productivityScore: avgScore,
                energyLevel: avgScore >= 4.5 ? 'high' : avgScore >= 3.5 ? 'medium' : 'low',
                confidence
              });
            }
          }
        }
      }

      return patterns.sort((a, b) => b.productivityScore - a.productivityScore).slice(0, 5);
    } catch (error) {
      console.error('Error analyzing productivity patterns:', error);
      return this.getDefaultPatterns();
    }
  }

  // 🎯 Sugerir tiempo óptimo para eventos
  async suggestOptimalTime(
    userId: string,
    eventType: string,
    duration: number,
    priority: number = 3
  ): Promise<SmartSuggestion[]> {
    try {
      const patterns = await this.analyzeProductivityPatterns(userId);
      const { data: existingEvents } = await this.supabase
        .from('calendar_events')
        .select('start_time, end_time')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

      const suggestions: SmartSuggestion[] = [];
      const now = new Date();
      
      // Buscar en los próximos 7 días
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        const dayOfWeek = targetDate.getDay();
        
        // Encontrar patrones para este día
        const dayPatterns = patterns.filter(p => p.timeRange.days.includes(dayOfWeek));
        
        for (const pattern of dayPatterns) {
          // Verificar si hay conflictos
          const startTime = new Date(targetDate);
          startTime.setHours(pattern.timeRange.startHour, 0, 0, 0);
          
          const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
          
          const hasConflict = existingEvents?.some(event => {
            const eventStart = new Date(event.start_time);
            const eventEnd = new Date(event.end_time);
            return (startTime < eventEnd && endTime > eventStart);
          });

          if (!hasConflict && startTime > now) {
            suggestions.push({
              type: 'optimal_time',
              title: `Tiempo Óptimo Detectado`,
              description: `${targetDate.toLocaleDateString('es-ES', { weekday: 'long' })} a las ${startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
              scheduledTime: startTime,
              confidence: pattern.confidence,
              reasoning: `Basado en tu histórico, tienes ${Math.round(pattern.productivityScore * 20)}% más productividad en este horario.`
            });
          }
        }
      }

      return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
    } catch (error) {
      console.error('Error suggesting optimal time:', error);
      return [];
    }
  }

  // 💡 Generar insights inteligentes
  async generateInsights(userId: string): Promise<AIInsight[]> {
    try {
      const insights: AIInsight[] = [];
      
      // 1. Análisis de productividad semanal
      const { data: weeklyData } = await this.supabase
        .from('time_tracking_sessions')
        .select('productivity_rating, duration_minutes, start_time')
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (weeklyData && weeklyData.length > 0) {
        const avgProductivity = weeklyData.reduce((sum, session) => sum + (session.productivity_rating || 3), 0) / weeklyData.length;
        const totalHours = weeklyData.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) / 60;
        
        if (avgProductivity < 3) {
          insights.push({
            id: 'productivity_low',
            type: 'productivity',
            title: 'Productividad Bajo el Promedio',
            description: `Tu productividad promedio esta semana es ${avgProductivity.toFixed(1)}/5. Considera reorganizar tu horario.`,
            confidence: 0.85,
            priority: 4,
            actionRecommended: 'Revisar patrones de tiempo y considerar más descansos'
          });
        }

        if (totalHours > 50) {
          insights.push({
            id: 'overwork_warning',
            type: 'productivity',
            title: 'Riesgo de Sobretrabajo',
            description: `Has trabajado ${totalHours.toFixed(1)} horas esta semana. Es importante mantener un equilibrio.`,
            confidence: 0.95,
            priority: 5,
            actionRecommended: 'Programar tiempo de descanso y evaluar carga de trabajo'
          });
        }
      }

      // 2. Análisis de revenue
      const { data: revenueData } = await this.supabase
        .from('calendar_events')
        .select('estimated_revenue, actual_revenue, is_billable, time_tracked, hourly_rate')
        .eq('user_id', userId)
        .eq('is_billable', true)
        .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (revenueData && revenueData.length > 0) {
        const totalRevenue = revenueData.reduce((sum, event) => {
          return sum + ((event.time_tracked || 0) / 60 * (event.hourly_rate || 0));
        }, 0);

        if (totalRevenue > 0) {
          const projectedMonthly = (totalRevenue / 30) * 30; // Simplificado
          
          insights.push({
            id: 'revenue_forecast',
            type: 'revenue',
            title: 'Proyección de Ingresos',
            description: `Basado en tu actividad, podrías generar €${projectedMonthly.toFixed(0)} este mes.`,
            confidence: 0.75,
            priority: 2,
            data: { projectedMonthly, currentRevenue: totalRevenue }
          });
        }
      }

      // 3. Análisis de clientes
      const { data: clientEvents } = await this.supabase
        .from('calendar_events')
        .select(`
          client_id,
          clients!inner(name),
          start_time,
          status
        `)
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

      if (clientEvents) {
        const clientActivity: { [key: string]: { name: string; lastContact: Date; eventCount: number } } = {};
        
        clientEvents.forEach(event => {
          if (event.client_id && event.clients) {
            const clientId = event.client_id;
            const clientName = (event.clients as any).name;
            const eventDate = new Date(event.start_time);
            
            if (!clientActivity[clientId]) {
              clientActivity[clientId] = {
                name: clientName,
                lastContact: eventDate,
                eventCount: 0
              };
            }
            
            clientActivity[clientId].eventCount++;
            if (eventDate > clientActivity[clientId].lastContact) {
              clientActivity[clientId].lastContact = eventDate;
            }
          }
        });

        // Detectar clientes sin contacto reciente
        Object.values(clientActivity).forEach(client => {
          const daysSinceContact = (Date.now() - client.lastContact.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceContact > 10) {
            insights.push({
              id: `client_followup_${client.name}`,
              type: 'client_risk',
              title: 'Cliente Requiere Seguimiento',
              description: `No has tenido contacto con ${client.name} en ${Math.floor(daysSinceContact)} días.`,
              confidence: 0.9,
              priority: 3,
              actionRecommended: 'Programar llamada de seguimiento o enviar email'
            });
          }
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  // 🤖 Auto-scheduler inteligente
  async autoSchedule(
    userId: string,
    taskTitle: string,
    estimatedDuration: number,
    priority: number = 3,
    clientId?: string,
    projectId?: string
  ): Promise<SmartSuggestion | null> {
    try {
      const suggestions = await this.suggestOptimalTime(userId, 'work', estimatedDuration, priority);
      
      if (suggestions.length === 0) {
        return null;
      }

      const bestSuggestion = suggestions[0];
      
      // Crear el evento automáticamente si la confianza es alta
      if (bestSuggestion.confidence > 0.8) {
        const eventData = {
          user_id: userId,
          title: taskTitle,
          start_time: bestSuggestion.scheduledTime?.toISOString(),
          end_time: new Date(bestSuggestion.scheduledTime!.getTime() + estimatedDuration * 60 * 1000).toISOString(),
          type: 'work',
          priority,
          ai_suggested: true,
          ai_confidence: bestSuggestion.confidence,
          ai_reasoning: bestSuggestion.reasoning,
          client_id: clientId,
          project_id: projectId,
          is_billable: !!clientId
        };

        await this.supabase.from('calendar_events').insert([eventData]);
        
        return {
          ...bestSuggestion,
          title: 'Evento Auto-Programado',
          description: `He programado "${taskTitle}" para ${bestSuggestion.description} basado en tus patrones de productividad.`
        };
      }

      return bestSuggestion;
    } catch (error) {
      console.error('Error in auto-scheduler:', error);
      return null;
    }
  }

  // 📊 Generar reporte de productividad con IA
  async generateProductivityReport(userId: string, days: number = 7): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data: sessions } = await this.supabase
        .from('time_tracking_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString());

      const { data: events } = await this.supabase
        .from('calendar_events')
        .select('*, clients(name), projects(name)')
        .eq('user_id', userId)
        .gte('start_time', startDate.toISOString());

      if (!sessions || !events) return null;

      // Análisis detallado
      const analysis = {
        totalHours: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60,
        avgProductivity: sessions.reduce((sum, s) => sum + (s.productivity_rating || 3), 0) / sessions.length,
        billableHours: events
          .filter(e => e.is_billable)
          .reduce((sum, e) => sum + (e.time_tracked || 0), 0) / 60,
        revenue: events
          .filter(e => e.is_billable)
          .reduce((sum, e) => sum + ((e.time_tracked || 0) / 60 * (e.hourly_rate || 0)), 0),
        clientDistribution: this.calculateClientDistribution(events),
        bestTimeSlots: await this.analyzeProductivityPatterns(userId),
        recommendations: await this.generateRecommendations(sessions, events)
      };

      return analysis;
    } catch (error) {
      console.error('Error generating productivity report:', error);
      return null;
    }
  }

  // Métodos privados de utilidad
  private getDefaultPatterns(): SimpleProductivityPattern[] {
    return [
      {
        timeRange: { startHour: 9, endHour: 11, days: [1, 2, 3, 4, 5] },
        productivityScore: 4.2,
        energyLevel: 'high',
        confidence: 0.6
      },
      {
        timeRange: { startHour: 14, endHour: 16, days: [1, 2, 3, 4, 5] },
        productivityScore: 3.8,
        energyLevel: 'medium',
        confidence: 0.5
      }
    ];
  }

  private calculateClientDistribution(events: any[]): any {
    const distribution: { [key: string]: number } = {};
    
    events.forEach(event => {
      if (event.clients?.name) {
        const clientName = event.clients.name;
        distribution[clientName] = (distribution[clientName] || 0) + (event.time_tracked || 0);
      }
    });

    return Object.entries(distribution)
      .map(([name, minutes]) => ({ name, hours: minutes / 60 }))
      .sort((a, b) => b.hours - a.hours);
  }

  private async generateRecommendations(sessions: any[], events: any[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Análisis de patrones
    if (sessions.length > 0) {
      const avgProductivity = sessions.reduce((sum, s) => sum + (s.productivity_rating || 3), 0) / sessions.length;
      
      if (avgProductivity < 3.5) {
        recommendations.push('Considera tomar más descansos entre sesiones de trabajo');
        recommendations.push('Revisa tu horario para trabajar en tus horas más productivas');
      }
      
      const avgBreaks = sessions.reduce((sum, s) => sum + (s.break_count || 0), 0) / sessions.length;
      if (avgBreaks < 2) {
        recommendations.push('Incrementa la frecuencia de descansos para mantener el rendimiento');
      }
    }

    if (events.length > 0) {
      const billablePercentage = events.filter(e => e.is_billable).length / events.length;
      if (billablePercentage < 0.6) {
        recommendations.push('Considera incrementar el porcentaje de tiempo facturable');
      }
    }

    return recommendations;
  }
}

// Crear instancia única del servicio de IA
export const calendarAI = new CalendarAI();
