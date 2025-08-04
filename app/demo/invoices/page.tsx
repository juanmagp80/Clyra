'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Download, 
  Eye, 
  FileText, 
  Mail, 
  Plus, 
  Search, 
  Send, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { demoClients, demoInvoices, demoProjects } from '../demo-data';

export default function DemoInvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Filtrar facturas
  const filteredInvoices = demoInvoices.filter(invoice => {
    const matchesSearch = invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientInfo(invoice.client_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getClientInfo(invoice.client_id)?.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime();
      case 'date_asc':
        return new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime();
      case 'amount_desc':
        return b.total_amount - a.total_amount;
      case 'amount_asc':
        return a.total_amount - b.total_amount;
      case 'client':
        const clientA = getClientInfo(a.client_id)?.name || '';
        const clientB = getClientInfo(b.client_id)?.name || '';
        return clientA.localeCompare(clientB);
      default:
        return 0;
    }
  });

  // Función para obtener información del cliente y proyecto
  const getClientInfo = (clientId: string) => {
    return demoClients.find(client => client.id === clientId);
  };

  const getProjectInfo = (projectId: string) => {
    return demoProjects.find(project => project.id === projectId);
  };

  // Calcular estadísticas
  const stats = {
    total: demoInvoices.length,
    paid: demoInvoices.filter(i => i.status === 'paid').length,
    sent: demoInvoices.filter(i => i.status === 'sent').length,
    draft: demoInvoices.filter(i => i.status === 'draft').length,
    overdue: demoInvoices.filter(i => {
      const today = new Date();
      const dueDate = new Date(i.due_date);
      return i.status === 'sent' && dueDate < today;
    }).length,
    totalRevenue: demoInvoices.reduce((sum, i) => sum + i.total_amount, 0),
    paidRevenue: demoInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0),
    pendingRevenue: demoInvoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total_amount, 0),
    draftRevenue: demoInvoices.filter(i => i.status === 'draft').reduce((sum, i) => sum + i.total_amount, 0)
  };

  const getStatusBadge = (status: string, dueDate?: string) => {
    // Verificar si está vencida
    const isOverdue = status === 'sent' && dueDate && new Date(dueDate) < new Date();
    
    const styles = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      sent: isOverdue ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      paid: 'Pagada',
      sent: isOverdue ? 'Vencida' : 'Enviada',
      draft: 'Borrador',
      overdue: 'Vencida',
      cancelled: 'Cancelada'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`}>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Función para simular acciones
  const handleAction = (action: string, invoiceId: string) => {
    alert(`Demo: ${action} para factura ${invoiceId}. ¡Crea tu cuenta para usar esta funcionalidad!`);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date_desc');
  };

  return (
    <div className="p-6">
      {/* Header con CTA */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Facturas</h1>
          <p className="text-muted-foreground">Gestiona tus facturas y pagos</p>
        </div>
        <Link href="/register">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Sparkles className="w-4 h-4 mr-2" />
            Crear cuenta gratis
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Pagadas
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.paid}</div>
              <p className="text-xs text-green-600">{formatCurrency(stats.paidRevenue)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">
                Pendientes
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{stats.sent}</div>
              <p className="text-xs text-yellow-600">{formatCurrency(stats.pendingRevenue)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Borradores
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.draft}</div>
              <p className="text-xs text-gray-600">{formatCurrency(stats.draftRevenue)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <p className="text-xs text-blue-600">Facturas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Ingresos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(stats.totalRevenue).replace('€', '€')}
              </div>
              <p className="text-xs text-purple-600">Total facturado</p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Facturas ({filteredInvoices.length})
            </h2>
            <p className="text-slate-600">
              Crea y gestiona facturas profesionales
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar facturas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas</option>
              <option value="paid">Pagadas</option>
              <option value="sent">Enviadas</option>
              <option value="draft">Borradores</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date_desc">Más recientes</option>
              <option value="date_asc">Más antiguas</option>
              <option value="amount_desc">Mayor importe</option>
              <option value="amount_asc">Menor importe</option>
              <option value="client">Por cliente</option>
            </select>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap"
              onClick={() => handleAction('Crear nueva factura', 'nueva')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const client = getClientInfo(invoice.client_id);
            const project = getProjectInfo(invoice.project_id || '');
            
            return (
              <Card key={invoice.id} className="hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-blue-300">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Invoice Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {invoice.title}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {client?.name} • {client?.company}
                          </p>
                          {project && (
                            <p className="text-xs text-slate-500 mt-1">
                              Proyecto: {project.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Emitida</p>
                          <p className="font-medium">{formatDate(invoice.issue_date)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Vence</p>
                          <p className="font-medium">{formatDate(invoice.due_date)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="lg:col-span-2 text-center lg:text-left">
                      <p className="text-sm text-slate-500">Total</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatCurrency(invoice.total_amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        +{formatCurrency(invoice.tax_amount)} IVA
                      </p>
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-1 flex justify-center lg:justify-start">
                      {getStatusBadge(invoice.status, invoice.due_date)}
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2 flex items-center gap-2 justify-center lg:justify-end">
                      {invoice.status === 'draft' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction('Enviar', invoice.id)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Enviar
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction('Recordatorio', invoice.id)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Recordar
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAction('Descargar PDF', invoice.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Link href={`/demo/invoices/${invoice.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No se encontraron facturas
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || statusFilter !== 'all' ? 
                  `No hay facturas que coincidan con los filtros aplicados` : 
                  'No hay facturas para mostrar'
                }
              </p>
              {(searchTerm || statusFilter !== 'all' || sortBy !== 'date_desc') && (
                <Button onClick={clearFilters} variant="outline">
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Facturas Profesionales</h3>
            <p className="text-sm text-slate-600">
              Diseño automático, numeración secuencial y datos fiscales completos
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Envío Automático</h3>
            <p className="text-sm text-slate-600">
              Envía por email, recordatorios automáticos y seguimiento de pagos
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Control Financiero</h3>
            <p className="text-sm text-slate-600">
              Estadísticas de ingresos, reportes y análisis de flujo de caja
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Quieres facturar como un profesional?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Automatiza tu facturación, mejora tu flujo de caja y mantén 
              un control completo de tus ingresos con facturas profesionales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Comenzar gratis
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Volver al Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
