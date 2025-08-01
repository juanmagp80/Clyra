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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    {stat.change}
                  </span>
                  <span className="text-slate-500 text-sm">vs mes anterior</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tiempo Trabajado</h3>
                <p className="text-slate-600 text-sm">Resumen de horas</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-700 mb-2">
                {hoursThisMonth}h
              </div>
              <div className="text-emerald-600 font-semibold">Este Mes</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
              <div className="text-3xl font-bold text-amber-700 mb-2">
                {billableHoursThisWeek}h
              </div>
              <div className="text-amber-600 font-semibold">Facturable (Semana)</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Progreso Semanal</span>
              <span className="text-sm text-slate-600">
                {Math.round((hoursThisWeek / 40) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((hoursThisWeek / 40) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Acciones Rápidas</h3>
              <p className="text-slate-600 text-sm">Operaciones frecuentes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Nuevo Cliente', icon: Users, color: 'blue' },
              { title: 'Crear Proyecto', icon: Briefcase, color: 'emerald' },
              { title: 'Registrar Tiempo', icon: Clock, color: 'purple' },
              { title: 'Generar Factura', icon: DollarSign, color: 'amber' }
            ].map((action, index) => (
              <button
                key={index}
                className={`p-4 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105 ${action.color === 'blue' ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50' :
                    action.color === 'emerald' ? 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50' :
                      action.color === 'purple' ? 'border-purple-300 hover:border-purple-400 hover:bg-purple-50' :
                        'border-amber-300 hover:border-amber-400 hover:bg-amber-50'
                  }`}
              >
                <action.icon className={`w-6 h-6 mx-auto mb-2 ${action.color === 'blue' ? 'text-blue-600' :
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