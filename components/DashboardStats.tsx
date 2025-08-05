'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Clock,
  DollarSign,
  Target,
  Users,
  Zap
} from 'lucide-react';

interface DashboardStatsProps {
  totalClients: number;
  activeProjects: number;
  monthlyRevenue: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  billableHoursThisWeek: number;
}

const DashboardStats = ({
  totalClients,
  activeProjects,
  monthlyRevenue,
  hoursThisWeek,
  hoursThisMonth,
  billableHoursThisWeek
}: DashboardStatsProps) => {

  const statCards = [
    {
      title: 'Clientes Totales',
      value: totalClients,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Proyectos Activos',
      value: activeProjects,
      icon: Briefcase,
      change: '+8%',
      changeType: 'positive' as const,
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Horas Esta Semana',
      value: `${hoursThisWeek}h`,
      icon: Clock,
      change: '+15%',
      changeType: 'positive' as const,
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Revenue Mensual',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+24%',
      changeType: 'positive' as const,
      gradient: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <>
      {/* Premium Stats Grid - Más compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Premium Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-transparent to-violet-50/80 rounded-xl blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Inner Premium Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-violet-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                  {stat.title}
                </p>
                <p className="text-2xl font-black text-slate-900 mb-1 bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                  )}
                  <span className={`text-xs font-bold ${stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    {stat.change}
                  </span>
                  <span className="text-slate-500 text-xs font-medium">vs mes anterior</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-lg shadow-indigo-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Premium Ring Animation */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/20 to-violet-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Métricas adicionales - Más compactas */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tiempo Trabajado</h3>
                <p className="text-slate-600 text-xs">Resumen de horas</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700 mb-1">
                {hoursThisMonth}h
              </div>
              <div className="text-emerald-600 font-semibold text-xs">Este Mes</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-700 mb-1">
                {billableHoursThisWeek}h
              </div>
              <div className="text-amber-600 font-semibold text-xs">Facturable (Semana)</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-700">Progreso Semanal</span>
              <span className="text-xs text-slate-600">
                {Math.round((hoursThisWeek / 40) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((hoursThisWeek / 40) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas - Más compacto */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Acciones Rápidas</h3>
              <p className="text-slate-600 text-xs">Operaciones frecuentes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Nuevo Cliente', icon: Users, color: 'blue' },
              { title: 'Crear Proyecto', icon: Briefcase, color: 'emerald' },
              { title: 'Registrar Tiempo', icon: Clock, color: 'purple' },
              { title: 'Generar Factura', icon: DollarSign, color: 'amber' }
            ].map((action, index) => (
              <button
                key={index}
                className={`p-3 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 ${action.color === 'blue' ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50' :
                    action.color === 'emerald' ? 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50' :
                      action.color === 'purple' ? 'border-purple-300 hover:border-purple-400 hover:bg-purple-50' :
                        'border-amber-300 hover:border-amber-400 hover:bg-amber-50'
                  }`}
              >
                <action.icon className={`w-5 h-5 mx-auto mb-1 ${action.color === 'blue' ? 'text-blue-600' :
                    action.color === 'emerald' ? 'text-emerald-600' :
                      action.color === 'purple' ? 'text-purple-600' :
                        'text-amber-600'
                  }`} />
                <p className="text-xs font-semibold text-slate-700">{action.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStats;