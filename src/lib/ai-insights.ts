import { supabase } from './supabase'

export interface AIInsight {
  id: string
  title: string
  value: string
  description: string
  trend: 'up' | 'down' | 'stable'
  category: 'productivity' | 'revenue' | 'time' | 'clients' | 'projects'
  icon: string
  color: string
  priority: 'high' | 'medium' | 'low'
}

export class AIInsightsEngine {
  async generateInsights(userId: string): Promise<AIInsight[]> {
    const insights: AIInsight[] = []

    try {
      // Insight 1: Productividad por horas facturables
      const productivityInsight = await this.getProductivityInsight(userId)
      if (productivityInsight) insights.push(productivityInsight)

      // Insight 2: Cliente más rentable
      const topClientInsight = await this.getTopClientInsight(userId)
      if (topClientInsight) insights.push(topClientInsight)

      // Insight 3: Análisis de tiempo
      const timeAnalysisInsight = await this.getTimeAnalysisInsight(userId)
      if (timeAnalysisInsight) insights.push(timeAnalysisInsight)

      // Insight 4: Flujo de caja
      const cashflowInsight = await this.getCashflowInsight(userId)
      if (cashflowInsight) insights.push(cashflowInsight)

      // Insight 5: Eficiencia de proyectos
      const projectEfficiencyInsight = await this.getProjectEfficiencyInsight(userId)
      if (projectEfficiencyInsight) insights.push(projectEfficiencyInsight)

      // Insight 6: Patrones de trabajo
      const workPatternsInsight = await this.getWorkPatternsInsight(userId)
      if (workPatternsInsight) insights.push(workPatternsInsight)

    } catch (error) {
      console.error('Error generating AI insights:', error)
    }

    return insights.slice(0, 6) // Máximo 6 insights
  }

  private async getProductivityInsight(userId: string): Promise<AIInsight | null> {
    try {
      // Calcular horas facturables vs no facturables esta semana
      const { data: thisWeekData } = await supabase
        .from('time_entries')
        .select('duration_minutes, hourly_rate, is_billable')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (!thisWeekData || thisWeekData.length === 0) return null

      const billableMinutes = thisWeekData
        .filter((entry: any) => entry.is_billable)
        .reduce((sum: number, entry: any) => sum + entry.duration_minutes, 0)

      const totalMinutes = thisWeekData
        .reduce((sum: number, entry: any) => sum + entry.duration_minutes, 0)

      const billablePercentage = Math.round((billableMinutes / totalMinutes) * 100)
      const billableHours = Math.round(billableMinutes / 60 * 10) / 10

      const trend = billablePercentage > 70 ? 'up' : billablePercentage > 50 ? 'stable' : 'down'
      const priority = billablePercentage > 70 ? 'high' : billablePercentage > 50 ? 'medium' : 'low'

      return {
        id: 'productivity',
        title: 'Productividad',
        value: `${billablePercentage}%`,
        description: `${billableHours}h facturables de ${Math.round(totalMinutes/60)}h totales esta semana`,
        trend,
        category: 'productivity',
        icon: 'TrendingUp',
        color: trend === 'up' ? 'emerald' : trend === 'stable' ? 'amber' : 'red',
        priority
      }
    } catch (error) {
      console.error('Error in productivity insight:', error)
      return null
    }
  }

  private async getTopClientInsight(userId: string): Promise<AIInsight | null> {
    try {
      // Calcular ingresos por cliente este mes
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select(`
          total_amount,
          status,
          clients!inner(name)
        `)
        .eq('user_id', userId)
        .eq('status', 'paid')
        .gte('issue_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      if (!invoicesData || invoicesData.length === 0) return null

      // Agrupar por cliente
      const clientRevenue = invoicesData.reduce((acc: Record<string, number>, invoice: any) => {
        const clientName = invoice.clients.name
        acc[clientName] = (acc[clientName] || 0) + invoice.total_amount
        return acc
      }, {} as Record<string, number>)

      // Encontrar el cliente top
      const topClient = Object.entries(clientRevenue)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]

      if (!topClient) return null

      const [clientName, revenue] = topClient
      const totalRevenue = Object.values(clientRevenue).reduce((sum: number, rev: unknown) => sum + (rev as number), 0)
      const percentage = Math.round(((revenue as number) / totalRevenue) * 100)

      return {
        id: 'top-client',
        title: 'Cliente Top',
        value: `€${(revenue as number).toLocaleString()}`,
        description: `${clientName} representa el ${percentage}% de ingresos este mes`,
        trend: 'up',
        category: 'revenue',
        icon: 'Crown',
        color: 'purple',
        priority: 'high'
      }
    } catch (error) {
      console.error('Error in top client insight:', error)
      return null
    }
  }

  private async getTimeAnalysisInsight(userId: string): Promise<AIInsight | null> {
    try {
      // Analizar distribución de tiempo por tipo de proyecto
      const { data: timeData } = await supabase
        .from('time_entries')
        .select(`
          duration_minutes,
          projects!inner(name, status)
        `)
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (!timeData || timeData.length === 0) return null

      // Encontrar el proyecto que más tiempo consume
      const projectTime = timeData.reduce((acc: Record<string, number>, entry: any) => {
        const projectName = entry.projects.name
        acc[projectName] = (acc[projectName] || 0) + entry.duration_minutes
        return acc
      }, {} as Record<string, number>)

      const topProject = Object.entries(projectTime)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]

      if (!topProject) return null

      const [projectName, minutes] = topProject
      const hours = Math.round((minutes as number) / 60 * 10) / 10
      const totalMinutes = Object.values(projectTime).reduce((sum: number, min: unknown) => sum + (min as number), 0)
      const percentage = Math.round(((minutes as number) / totalMinutes) * 100)

      return {
        id: 'time-analysis',
        title: 'Foco Principal',
        value: `${hours}h`,
        description: `${projectName} consume el ${percentage}% de tu tiempo este mes`,
        trend: 'stable',
        category: 'time',
        icon: 'Clock',
        color: 'blue',
        priority: 'medium'
      }
    } catch (error) {
      console.error('Error in time analysis insight:', error)
      return null
    }
  }

  private async getCashflowInsight(userId: string): Promise<AIInsight | null> {
    try {
      // Analizar facturas pendientes vs pagadas
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('total_amount, status')
        .eq('user_id', userId)
        .gte('issue_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      if (!invoicesData || invoicesData.length === 0) return null

      const pendingAmount = invoicesData
        .filter((inv: any) => inv.status === 'sent' || inv.status === 'overdue')
        .reduce((sum: number, inv: any) => sum + inv.total_amount, 0)

      const paidAmount = invoicesData
        .filter((inv: any) => inv.status === 'paid')
        .reduce((sum: number, inv: any) => sum + inv.total_amount, 0)

      const totalAmount = pendingAmount + paidAmount
      const collectionRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0

      const trend = collectionRate > 80 ? 'up' : collectionRate > 60 ? 'stable' : 'down'

      return {
        id: 'cashflow',
        title: 'Flujo de Caja',
        value: `€${pendingAmount.toLocaleString()}`,
        description: `Pendiente de cobro. Tasa de cobro: ${collectionRate}%`,
        trend,
        category: 'revenue',
        icon: 'DollarSign',
        color: trend === 'up' ? 'green' : trend === 'stable' ? 'amber' : 'red',
        priority: pendingAmount > 5000 ? 'high' : 'medium'
      }
    } catch (error) {
      console.error('Error in cashflow insight:', error)
      return null
    }
  }

  private async getProjectEfficiencyInsight(userId: string): Promise<AIInsight | null> {
    try {
      // Calcular proyectos completados vs activos
      const { data: projectsData } = await supabase
        .from('projects')
        .select('status, budget, start_date, end_date')
        .eq('user_id', userId)

      if (!projectsData || projectsData.length === 0) return null

      const completed = projectsData.filter((p: any) => p.status === 'completed').length
      const active = projectsData.filter((p: any) => p.status === 'active').length
      const total = completed + active

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
      
      // Calcular proyectos en tiempo
      const onTimeProjects = projectsData
        .filter((p: any) => p.status === 'completed' && p.end_date)
        .filter((p: any) => {
          const endDate = new Date(p.end_date!)
          const today = new Date()
          return endDate >= today
        }).length

      const onTimeRate = completed > 0 ? Math.round((onTimeProjects / completed) * 100) : 0

      return {
        id: 'project-efficiency',
        title: 'Eficiencia',
        value: `${onTimeRate}%`,
        description: `${completed}/${total} proyectos completados. ${onTimeRate}% entregados a tiempo`,
        trend: onTimeRate > 80 ? 'up' : onTimeRate > 60 ? 'stable' : 'down',
        category: 'projects',
        icon: 'Target',
        color: onTimeRate > 80 ? 'green' : onTimeRate > 60 ? 'amber' : 'red',
        priority: 'medium'
      }
    } catch (error) {
      console.error('Error in project efficiency insight:', error)
      return null
    }
  }

  private async getWorkPatternsInsight(userId: string): Promise<AIInsight | null> {
    try {
      // Analizar patrones de trabajo por día de la semana
      const { data: timeData } = await supabase
        .from('time_entries')
        .select('duration_minutes, created_at')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (!timeData || timeData.length === 0) return null

      // Agrupar por día de la semana
      const dayPattern = timeData.reduce((acc: Record<string, number>, entry: any) => {
        const dayOfWeek = new Date(entry.created_at).getDay()
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const dayName = dayNames[dayOfWeek]
        acc[dayName] = (acc[dayName] || 0) + entry.duration_minutes
        return acc
      }, {} as Record<string, number>)

      // Encontrar el día más productivo
      const mostProductiveDay = Object.entries(dayPattern)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]

      if (!mostProductiveDay) return null

      const [dayName, minutes] = mostProductiveDay
      const hours = Math.round((minutes as number) / 60 * 10) / 10
      const totalMinutes = Object.values(dayPattern).reduce((sum: number, min: unknown) => sum + (min as number), 0)
      const percentage = Math.round(((minutes as number) / totalMinutes) * 100)

      return {
        id: 'work-patterns',
        title: 'Patrón Óptimo',
        value: dayName,
        description: `Tu día más productivo con ${hours}h (${percentage}% del tiempo total)`,
        trend: 'stable',
        category: 'productivity',
        icon: 'Activity',
        color: 'indigo',
        priority: 'low'
      }
    } catch (error) {
      console.error('Error in work patterns insight:', error)
      return null
    }
  }
}

// Instancia singleton
export const aiInsights = new AIInsightsEngine()
