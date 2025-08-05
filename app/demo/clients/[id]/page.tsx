'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  FileText,
  Mail,
  Phone,
  Plus,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { demoClients, demoInvoices, demoProjects } from '../../demo-data';

export default function DemoClientDetailsPage() {
  const params = useParams();
  const clientId = params.id as string;

  // Encontrar el cliente
  const client = demoClients.find(c => c.id === clientId);
  
  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Cliente no encontrado</h2>
          <Link href="/demo/clients">
            <Button>Volver a Clientes</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Obtener datos relacionados
  const clientProjects = demoProjects.filter(p => p.client_id === clientId);
  const clientInvoices = demoInvoices.filter(i => i.client_id === clientId);
  
  // Calcular estadísticas
  const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const completedProjects = clientProjects.filter(p => p.status === 'completed').length;
  const activeProjects = clientProjects.filter(p => p.status === 'in_progress').length;
  const pendingInvoices = clientInvoices.filter(i => i.status === 'sent').length;

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      on_hold: 'bg-gray-100 text-gray-800 border-gray-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      sent: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const labels = {
      completed: 'Completado',
      in_progress: 'En Progreso',
      planning: 'Planificando',
      on_hold: 'En Pausa',
      paid: 'Pagada',
      sent: 'Enviada',
      draft: 'Borrador'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.planning}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/demo/clients">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Clientes
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
                <p className="text-sm text-slate-600">Demo - Detalles del cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Modo Demo</span>
              </div>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Crear cuenta gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Client Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Client Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{client.name}</h3>
                <p className="text-slate-600">{client.company}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Teléfono</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Cliente desde</p>
                    <p className="font-medium">{formatDate(client.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-sm text-slate-600">Estado</p>
                    <p className="font-medium text-green-600">Activo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Ingresos Totales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  €{totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-green-600">
                  {clientInvoices.length} facturas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Proyectos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  {clientProjects.length}
                </div>
                <p className="text-xs text-blue-600">
                  {completedProjects} completados, {activeProjects} activos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projects Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Proyectos ({clientProjects.length})
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientProjects.map((project) => (
                  <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{project.title}</h4>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {formatDate(project.start_date)}
                      </span>
                      <span className="font-medium text-green-600">
                        €{project.budget.toLocaleString()}
                      </span>
                    </div>
                    {project.status === 'in_progress' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-600">Progreso</span>
                          <span className="text-slate-600">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Facturas ({clientInvoices.length})
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientInvoices.map((invoice) => (
                  <div key={invoice.id} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{invoice.title}</h4>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {formatDate(invoice.issue_date)}
                      </span>
                      <span className="font-medium text-green-600">
                        €{invoice.total_amount.toLocaleString()}
                      </span>
                    </div>
                    {invoice.status === 'sent' && (
                      <p className="text-xs text-yellow-600 mt-2">
                        Vence: {formatDate(invoice.due_date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Te gusta este nivel de detalle?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Mantén toda la información de tus clientes organizada: contacto, 
              historial de proyectos, facturas y estadísticas en un solo lugar.
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
