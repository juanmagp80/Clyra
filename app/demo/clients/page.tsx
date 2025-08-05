'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Building2,
  DollarSign,
  Mail,
  Phone,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { demoClients, demoProjects } from '../demo-data';

export default function DemoClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar clientes por término de búsqueda
  const filteredClients = demoClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener proyectos de un cliente
  const getClientProjects = (clientId: string) => {
    return demoProjects.filter(project => project.client_id === clientId);
  };

  // Función para obtener el estado del proyecto más reciente
  const getLastProjectStatus = (clientId: string) => {
    const projects = getClientProjects(clientId);
    if (projects.length === 0) return null;

    const lastProject = projects.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    return lastProject.status;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      on_hold: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const labels = {
      completed: 'Completado',
      in_progress: 'En Progreso',
      planning: 'Planificando',
      on_hold: 'En Pausa'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.planning}`}>
        {labels[status as keyof typeof labels] || 'Desconocido'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="p-8">
        {/* Header con CTA */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
            <p className="text-muted-foreground">Organiza tu cartera de clientes y visualiza su valor</p>
          </div>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Sparkles className="w-4 h-4 mr-2" />
              Crear cuenta gratis
            </Button>
          </Link>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{demoClients.length}</div>
              <p className="text-xs text-blue-600">+2 este mes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                €{demoClients.reduce((sum, client) => sum + client.total_revenue, 0).toLocaleString()}
              </div>
              <p className="text-xs text-green-600">De todos los clientes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Valor Promedio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                €{Math.round(demoClients.reduce((sum, client) => sum + client.total_revenue, 0) / demoClients.length).toLocaleString()}
              </div>
              <p className="text-xs text-purple-600">Por cliente</p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Clientes ({filteredClients.length})
            </h2>
            <p className="text-slate-600">
              Gestiona toda la información de tus clientes en un solo lugar
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const projects = getClientProjects(client.id);
            const lastStatus = getLastProjectStatus(client.id);

            return (
              <Card key={client.id} className="hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-blue-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-1">
                        {client.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-slate-600 mb-2">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">{client.company}</span>
                      </div>
                    </div>
                    {lastStatus && getStatusBadge(lastStatus)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900">{projects.length}</div>
                      <div className="text-xs text-slate-600">Proyectos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        €{client.total_revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600">Ingresos</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/demo/clients/${client.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && searchTerm && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No se encontraron clientes
              </h3>
              <p className="text-slate-600 mb-4">
                No hay clientes que coincidan con "{searchTerm}"
              </p>
              <Button onClick={() => setSearchTerm('')} variant="outline">
                Limpiar búsqueda
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Quieres gestionar tus clientes así?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Organiza toda la información de contacto, historial de proyectos y
              estadísticas de ingresos en un lugar centralizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Comenzar gratis
                </Button>
              </Link>
              <Link href="/demo/projects">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Ver Demo de Proyectos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
