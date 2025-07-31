'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  FileText,
  Plus,
  Settings
} from 'lucide-react';

interface DashboardStatsProps {
  totalClients: number;
  activeProjects: number;
  monthlyRevenue: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  billableHoursThisWeek: number;
}

export default function DashboardStats({ 
  totalClients, 
  activeProjects, 
  monthlyRevenue, 
  hoursThisWeek,
  hoursThisMonth,
  billableHoursThisWeek
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Clientes",
      value: totalClients,
      description: "Clientes registrados",
      icon: Users,
      trend: "+12% este mes"
    },
    {
      title: "Proyectos Activos",
      value: activeProjects,
      description: "En progreso",
      icon: FileText,
      trend: "+3 nuevos"
    },
    {
      title: "Ingresos Mensuales",
      value: `€${monthlyRevenue.toLocaleString()}`,
      description: "Facturación mes actual",
      icon: DollarSign,
      trend: "+8% vs mes anterior"
    },
    {
      title: "Horas Esta Semana",
      value: `${hoursThisWeek}h`,
      description: `${billableHoursThisWeek}h facturables`,
      icon: Clock,
      trend: `${hoursThisMonth}h este mes`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu actividad freelance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            <CardDescription>
              Tareas más frecuentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Cliente
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Crear Proyecto
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Programar Cita
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Cliente "Tech Solutions" añadido</span>
                <span className="text-muted-foreground ml-auto">2h</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Proyecto "Web App" actualizado</span>
                <span className="text-muted-foreground ml-auto">4h</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Factura #2024-001 enviada</span>
                <span className="text-muted-foreground ml-auto">1d</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Citas</CardTitle>
            <CardDescription>
              Esta semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="text-center">
                  <div className="text-lg font-bold">15</div>
                  <div className="text-xs text-muted-foreground">ENE</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reunión con cliente</p>
                  <p className="text-xs text-muted-foreground">10:00 - Tech Solutions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-center">
                  <div className="text-lg font-bold">17</div>
                  <div className="text-xs text-muted-foreground">ENE</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Entrega de proyecto</p>
                  <p className="text-xs text-muted-foreground">14:00 - StartupXYZ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
