/**
 * TASKELIO CALENDAR AI SERVICE - Local Version
 * Sistema de IA simplificado que funciona completamente local
 */

// ==================== TIPOS SIMPLIFICADOS ====================
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
  is_billable: boolean;
  hourly_rate?: number;
  status: EventStatus;
  productivity_score?: number;
  location?: string;
  meeting_url?: string;
  created_at: string;
  updated_at: string;
}

export type EventType = 
  | 'meeting' | 'work' | 'break' | 'admin' | 'focus' | 'client_call' 
  | 'project_review' | 'invoice_prep' | 'proposal_work';

export type EventStatus = 
  | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type EnergyLevel = 'low' | 'medium' | 'high';

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

export interface AIInsight {
  id: string;
  insight_type: string;
  type?: string;
  title: string;
  description: string;
  confidence_score: number;
  impact_score: number;
  actionability_score: number;
  recommendations: string[];
  suggested_actions: any[];
  status: string;
  category: string;
  created_at: string;
}

// ==================== CLASE LOCAL AI ====================
export class CalendarAI {
  constructor() {
    // Constructor vacío - todo es local
  }

  /**
   * Análisis local de productividad
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
   * Genera patrones de productividad locales
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

      if (slotEvents.length >= 3) {
        const completedInSlot = slotEvents.filter(e => e.status === 'completed');
        const productivityScore = (completedInSlot.length / slotEvents.length) * 100;
        
        let energyLevel: EnergyLevel = 'medium';
        if (productivityScore >= 80) energyLevel = 'high';
        else if (productivityScore < 60) energyLevel = 'low';

        patterns.push({
          timeRange: {
            startHour: slot.startHour,
            endHour: slot.endHour,
            days: [1, 2, 3, 4, 5]
          },
          productivityScore: Math.round(productivityScore),
          energyLevel,
          confidence: Math.min(95, slotEvents.length * 10)
        });
      }
    });

    return patterns.sort((a, b) => b.productivityScore - a.productivityScore);
  }

  /**
   * Genera sugerencias inteligentes locales
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
      !e.is_billable && ['work', 'focus', 'project_review'].includes(e.type)
    );

    if (potentialBillable.length > 0) {
      const potentialRevenue = potentialBillable.reduce((sum, e) => {
        const duration = (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60 * 60);
        return sum + (duration * 75);
      }, 0);

      suggestions.push({
        type: 'revenue_opportunity',
        title: '💰 Oportunidad de Revenue',
        description: `${potentialBillable.length} eventos de trabajo podrían ser facturables. Ingresos potenciales: €${potentialRevenue.toFixed(0)}`,
        confidence: 70,
        reasoning: 'Optimizar facturación puede aumentar ingresos hasta 25%'
      });
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Calcula métricas del dashboard
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

    const avgDailyRevenue = revenueToday;
    const remainingDaysInWeek = 5 - now.getDay();
    const revenueForecastWeek = revenueToday + (avgDailyRevenue * Math.max(0, remainingDaysInWeek));

    return {
      events_today: todayEvents.length,
      completed_today: completedToday.length,
      revenue_today: Math.round(revenueToday),
      billable_hours_today: Math.round(billableHoursToday * 10) / 10,
      events_this_week: weekEvents.length,
      avg_productivity_week: Math.round(avgProductivityWeek),
      pending_insights: this.generateLocalSmartSuggestions(events, now).length,
      active_automations: 3,
      revenue_forecast_week: Math.round(revenueForecastWeek)
    };
  }
}

// Instancia global
export const calendarAI = new CalendarAI();
