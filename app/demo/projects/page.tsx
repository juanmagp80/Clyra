'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
    BarChart3,
    Calendar,
    DollarSign,
    Plus,
    Search,
    Sparkles,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { demoClients, demoProjects } from '../demo-data';

export default function DemoProjectsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filtrar proyectos
    const filteredProjects = demoProjects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Función para obtener información del cliente
    const getClientInfo = (clientId: string) => {
        return demoClients.find(client => client.id === clientId);
    };

    // Calcular estadísticas
    const stats = {
        total: demoProjects.length,
        active: demoProjects.filter(p => p.status === 'in_progress').length,
        completed: demoProjects.filter(p => p.status === 'completed').length,
        planning: demoProjects.filter(p => p.status === 'planning').length,
        totalValue: demoProjects.reduce((sum, p) => sum + p.budget, 0)
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
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const styles = {
            high: 'bg-red-100 text-red-800 border-red-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };

        const labels = {
            high: 'Alta',
            medium: 'Media',
            low: 'Baja'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[priority as keyof typeof styles] || styles.medium}`}>
                {labels[priority as keyof typeof labels] || priority}
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
        <div className="p-6">
            {/* Header con CTA */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
                    <p className="text-muted-foreground">Gestiona tus proyectos y controla el progreso</p>
                </div>
                <Link href="/register">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Crear cuenta gratis
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">
                            Total
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                        <p className="text-xs text-blue-600">Proyectos</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">
                            Activos
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{stats.active}</div>
                        <p className="text-xs text-green-600">En progreso</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">
                            Completados
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-900">{stats.completed}</div>
                        <p className="text-xs text-purple-600">Finalizados</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700">
                            Valor Total
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-900">
                            €{stats.totalValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-orange-600">En proyectos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Proyectos ({filteredProjects.length})
                    </h2>
                    <p className="text-slate-600">
                        Gestiona tus proyectos, fechas límite y progreso
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar proyectos..."
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
                        <option value="all">Todos</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completados</option>
                        <option value="planning">Planificando</option>
                    </select>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 whitespace-nowrap">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Proyecto
                    </Button>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                    const client = getClientInfo(project.client_id);

                    return (
                        <Card key={project.id} className="hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-blue-300">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-semibold text-slate-900 mb-1">
                                            {project.title}
                                        </CardTitle>
                                        <p className="text-sm text-slate-600 mb-2">{client?.name}</p>
                                    </div>
                                    {getStatusBadge(project.status)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getPriorityBadge(project.priority)}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Description */}
                                <p className="text-sm text-slate-600 line-clamp-2">
                                    {project.description}
                                </p>

                                {/* Progress Bar (only for in_progress projects) */}
                                {project.status === 'in_progress' && (
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-slate-600">Progreso</span>
                                            <span className="font-medium">{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Inicio</p>
                                        <p className="font-medium">{formatDate(project.start_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Fin</p>
                                        <p className="font-medium">{formatDate(project.end_date)}</p>
                                    </div>
                                </div>

                                {/* Budget */}
                                <div className="pt-3 border-t border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Presupuesto</span>
                                        <span className="text-lg font-bold text-green-600">
                                            €{project.budget.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Link href={`/demo/projects/${project.id}`} className="flex-1">
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
            {filteredProjects.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            No se encontraron proyectos
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {searchTerm ? `No hay proyectos que coincidan con "${searchTerm}"` : 'No hay proyectos para mostrar'}
                        </p>
                        <Button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} variant="outline">
                            Limpiar filtros
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white mt-12">
                <CardContent className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">
                        ¿Quieres controlar tus proyectos así?
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Gestiona fechas límite, progreso, presupuestos y mantén a tus clientes
                        informados sobre el estado de sus proyectos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                <Sparkles className="w-5 h-5 mr-2" />
                                Comenzar gratis
                            </Button>
                        </Link>
                        <Link href="/demo/invoices">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                Ver Demo de Facturas
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}