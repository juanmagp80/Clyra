'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    ArrowLeft,
    Calendar,
    Clock,
    DollarSign,
    FileText,
    Sparkles,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
// import { demoClients, demoProjects } from '../../demo-data';
interface DemoClient {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
}
interface DemoProject {
    id: string;
    title?: string;
    description?: string;
    client_id?: string;
}
const demoClients: DemoClient[] = [];
const demoProjects: DemoProject[] = [];

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export default function DemoProjectDetailsPage({ params }: Props) {
    const [project, setProject] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    useEffect(() => {
        (async () => {
            const { id } = await params;
            const proj = demoProjects.find(p => p.id === id);
            if (!proj) {
                notFound();
                return;
            }
            setProject(proj);
            setClient(demoClients.find(c => c.id === proj.client_id));
        })();
    }, [params]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
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
            <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${styles[status as keyof typeof styles] || styles.planning}`}>
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
            <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${styles[priority as keyof typeof styles] || styles.medium}`}>
                {labels[priority as keyof typeof labels] || priority}
            </span>
        );
    };

    // Función para simular acciones
    const handleAction = (action: string) => {
        alert(`Demo: ${action}. ¡Crea tu cuenta para usar esta funcionalidad!`);
    };

    // Calcular progreso del proyecto
    const progressPercentage = project.progress || 0;

    return (
        <div className="p-6">
            {/* Header con navegación */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/demo/projects">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Proyectos
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
                        <p className="text-muted-foreground">Detalle del proyecto</p>
                    </div>
                </div>
                <Link href="/register">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Crear cuenta gratis
                    </Button>
                </Link>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto">
                {/* Project Status & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                                        <p className="text-muted-foreground">{project.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {getStatusBadge(project.status)}
                                        {getPriorityBadge(project.priority)}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Progreso del proyecto</span>
                                            <span>{progressPercentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Project Details */}
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                                                <p className="font-medium">{formatDate(project.start_date)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Fecha límite</p>
                                                <p className="font-medium">{formatDate(project.end_date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Project Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Información del Proyecto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Presupuesto</span>
                                    </div>
                                    <span className="font-bold">{formatCurrency(project.budget)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Cliente</span>
                                    </div>
                                    <span className="font-medium">{client?.name}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Horas estimadas</span>
                                    </div>
                                    <span className="font-medium">40h</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    className="w-full"
                                    onClick={() => handleAction('Actualizar progreso')}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Actualizar Progreso
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleAction('Generar informe')}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generar Informe
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleAction('Crear factura')}
                                >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Crear Factura
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Client Information */}
                {client && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg">Información del Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nombre</p>
                                    <p className="font-medium">{client.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Empresa</p>
                                    <p className="font-medium">{client.company}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{client.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Teléfono</p>
                                    <p className="font-medium">{client.phone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Project Timeline (Demo) */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Timeline del Proyecto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-medium">Proyecto iniciado</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(project.start_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-medium">Fase de diseño completada</p>
                                    <p className="text-sm text-muted-foreground">Hace 5 días</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-3 h-3 bg-gray-300 rounded-full mt-2"></div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Entrega final</p>
                                    <p className="text-sm text-muted-foreground">{formatDate(project.end_date)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA Final */}
                <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            ¿Te gusta este nivel de detalle?
                        </h2>
                        <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                            Con Taskelio puedes gestionar todos tus proyectos con este nivel de detalle y mucho más.
                            Crea tu cuenta gratuita y empezar a organizar tu negocio.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <Button size="lg" variant="secondary">
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Crear cuenta gratis
                                </Button>
                            </Link>
                            <Link href="/demo/projects">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                                    Ver todos los proyectos
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
