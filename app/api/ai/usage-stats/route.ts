import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener estadísticas de uso del mes actual
    const { data: currentMonth, error: currentError } = await supabase
      .from('ai_usage_current_month')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Obtener historial de los últimos 6 meses
    const { data: monthlyStats, error: monthlyError } = await supabase
      .from('ai_usage_monthly_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: false })
      .limit(6);

    // Obtener uso detallado de los últimos 30 días
    const { data: recentUsage, error: recentError } = await supabase
      .from('ai_usage')
      .select('automation_type, cost_usd, created_at, metadata')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .eq('success', true)
      .order('created_at', { ascending: false });

    if (currentError && currentError.code !== 'PGRST116') {
      console.error('Error obteniendo datos del mes actual:', currentError);
    }

    if (monthlyError) {
      console.error('Error obteniendo estadísticas mensuales:', monthlyError);
    }

    if (recentError) {
      console.error('Error obteniendo uso reciente:', recentError);
    }

    // Calcular métricas adicionales
    const totalThisMonth = currentMonth?.total_cost_usd || 0;
    const totalRequests = currentMonth?.total_requests || 0;
    
    // Proyección mensual basada en el uso actual
    const dayOfMonth = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const projectedMonthlyCost = totalThisMonth * (daysInMonth / dayOfMonth);

    return NextResponse.json({
      success: true,
      data: {
        currentMonth: {
          total_cost_usd: totalThisMonth,
          total_requests: totalRequests,
          email_cost: currentMonth?.email_cost || 0,
          project_cost: currentMonth?.project_cost || 0,
          meeting_cost: currentMonth?.meeting_cost || 0,
          invoice_cost: currentMonth?.invoice_cost || 0,
          onboarding_cost: currentMonth?.onboarding_cost || 0,
          feedback_cost: currentMonth?.feedback_cost || 0,
          projected_monthly_cost: projectedMonthlyCost
        },
        monthlyHistory: monthlyStats || [],
        recentUsage: recentUsage || []
      }
    });

  } catch (error) {
    console.error('Error en usage-stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener estadísticas de uso'
    }, { status: 500 });
  }
}
