'use client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    ArrowRight,
    BarChart3,
    Clock,
    DollarSign,
    FileText,
    Sparkles,
    Users,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { demoStats } from './demo-data';

export default function DemoPage() {
    const [showTour, setShowTour] = useState(true);
    const [tourStep, setTourStep] = useState(0);
    const router = useRouter();

    const tourSteps = [
        {
            title: "¡Bienvenido al Demo de Clyra!",
            description: "Explora todas las funcionalidades sin registrarte. Navega libremente o sigue este tour guiado.",
            target: null
        },
        {
            title: "Dashboard Principal",
            description: "Aquí tienes un resumen de tu negocio: clientes, proyectos activos, ingresos y tiempo trabajado.",
            target: "dashboard-stats"
        },
        {
            title: "Gestión de Clientes",
            description: "Organiza toda la información de tus clientes y visualiza el valor que aporta cada uno.",
            target: "clients-section"
        },
        {
            title: "Control de Proyectos",
            description: "Gestiona tus proyectos, fechas límite y progreso en tiempo real.",
            target: "projects-section"
        },
        {
            title: "¿Te gusta lo que ves?",
            description: "Crea tu cuenta gratuita para empezar a gestionar tu negocio como un profesional.",
            target: "cta-section"
        }
    ];

    const nextStep = () => {
        if (tourStep < tourSteps.length - 1) {
            setTourStep(tourStep + 1);
        } else {
            setShowTour(false);
        }
    };

    const skipTour = () => {
        setShowTour(false);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Tour Overlay */}
            {showTour && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    {tourSteps[tourStep].title}
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    {tourSteps[tourStep].description}
                                </p>
                            </div>
                            <button
                                onClick={skipTour}
                                className="text-slate-400 hover:text-slate-600 ml-4"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {tourSteps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${index === tourStep ? 'bg-blue-600' : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={skipTour} size="sm">
                                    Saltar tour
                                </Button>
                                <Button onClick={nextStep} size="sm">
                                    {tourStep === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="p-8">
                {/* Header con CTA */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground">Bienvenido al modo demo de Clyra</p>
                    </div>
                    <Link href="/register">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Crear cuenta gratis
                        </Button>
                    </Link>
                </div>
                {/* Dashboard Stats */}
                <div id="dashboard-stats" className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Clientes
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{demoStats.totalClients}</div>
                                <p className="text-xs text-muted-foreground">+2 este mes</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Proyectos Activos
                                </CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{demoStats.activeProjects}</div>
                                <p className="text-xs text-muted-foreground">En progreso</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Ingresos Totales
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    €{demoStats.totalRevenue.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">+15% vs mes anterior</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Horas Este Mes
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{demoStats.hoursThisMonth}h</div>
                                <p className="text-xs text-muted-foreground">20h esta semana</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Clients Section */}
                    <Card id="clients-section" className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Clientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Gestiona tu cartera de clientes y visualiza su valor.
                            </p>
                            <Link href="/demo/clients">
                                <Button className="w-full">
                                    Ver Clientes
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Projects Section */}
                    <Card id="projects-section" className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Proyectos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Controla el progreso y fechas límite de tus proyectos.
                            </p>
                            <Link href="/demo/projects">
                                <Button className="w-full">
                                    Ver Proyectos
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Invoices Section */}
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                Facturas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                Crea y gestiona facturas profesionales.
                            </p>
                            <Link href="/demo/invoices">
                                <Button className="w-full">
                                    Ver Facturas
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA Section */}
                <Card id="cta-section" className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">
                            ¿Te gusta lo que ves?
                        </h2>
                        <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
                            Crea tu cuenta gratuita y empieza a gestionar tu negocio como un profesional.
                            Sin tarjeta de crédito, configuración en 2 minutos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <Button size="lg" variant="secondary">
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Crear cuenta gratis
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                                    Volver al inicio
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
