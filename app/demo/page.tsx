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
    X,
    TrendingUp,
    Zap,
    Target,
    Star,
    Rocket,
    Award
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { demoStats } from './demo-data';

export default function DemoPage() {
    const [showTour, setShowTour] = useState(true);
    const [tourStep, setTourStep] = useState(0);
    const [animationStep, setAnimationStep] = useState(0);

    // Animación de entrada para las estadísticas
    useEffect(() => {
        const timer = setInterval(() => {
            setAnimationStep(prev => (prev + 1) % 4);
        }, 2000);
        return () => clearInterval(timer);
    }, []);

    const tourSteps = [
        {
            title: "¡Bienvenido al Demo de Clyra! ✨",
            description: "Explora todas las funcionalidades sin registrarte. Navega libremente o sigue este tour guiado.",
            target: null
        },
        {
            title: "Dashboard Principal 📊",
            description: "Aquí tienes un resumen de tu negocio: clientes, proyectos activos, ingresos y tiempo trabajado.",
            target: "dashboard-stats"
        },
        {
            title: "Gestión de Clientes 👥",
            description: "Organiza toda la información de tus clientes y visualiza el valor que aporta cada uno.",
            target: "clients-section"
        },
        {
            title: "Control de Proyectos 🎯",
            description: "Gestiona tus proyectos, fechas límite y progreso en tiempo real.",
            target: "projects-section"
        },
        {
            title: "¿Te gusta lo que ves? 🚀",
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

    const statsCards = [
        {
            title: "Total Clientes",
            value: demoStats.totalClients,
            subtitle: "+2 este mes",
            icon: Users,
            gradient: "from-blue-500 to-cyan-400",
            bgGradient: "from-blue-50 to-cyan-50",
            iconColor: "text-blue-600",
            delay: "delay-0"
        },
        {
            title: "Proyectos Activos",
            value: demoStats.activeProjects,
            subtitle: "En progreso",
            icon: Target,
            gradient: "from-green-500 to-emerald-400",
            bgGradient: "from-green-50 to-emerald-50",
            iconColor: "text-green-600",
            delay: "delay-200"
        },
        {
            title: "Ingresos Totales",
            value: `€${demoStats.totalRevenue.toLocaleString()}`,
            subtitle: "+15% vs mes anterior",
            icon: DollarSign,
            gradient: "from-purple-500 to-violet-400",
            bgGradient: "from-purple-50 to-violet-50",
            iconColor: "text-purple-600",
            delay: "delay-300"
        },
        {
            title: "Horas Este Mes",
            value: `${demoStats.hoursThisMonth}h`,
            subtitle: "20h esta semana",
            icon: Clock,
            gradient: "from-orange-500 to-yellow-400",
            bgGradient: "from-orange-50 to-yellow-50",
            iconColor: "text-orange-600",
            delay: "delay-500"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Decorative animated elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200/25 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-40 right-10 w-16 h-16 bg-yellow-200/30 rounded-full blur-lg animate-bounce delay-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl animate-spin"></div>
            </div>

            {/* Tour Overlay */}
            {showTour && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    {tourSteps[tourStep].title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {tourSteps[tourStep].description}
                                </p>
                            </div>
                            <button
                                onClick={skipTour}
                                className="text-slate-400 hover:text-slate-600 ml-4 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                {tourSteps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                            index === tourStep 
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110' 
                                                : 'bg-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={skipTour} size="sm" className="text-slate-600">
                                    Saltar tour
                                </Button>
                                <Button onClick={nextStep} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                                    {tourStep === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="relative z-10 p-8">
                {/* Hero Header */}
                <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                        <Sparkles className="w-4 h-4" />
                        Modo Demo Activo
                        <Rocket className="w-4 h-4" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
                        Dashboard Clyra
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                        Bienvenido al futuro de la gestión empresarial. Explora todas las funcionalidades sin límites.
                    </p>
                    <Link href="/register">
                        <Button size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Crear cuenta gratis
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>

                {/* Dashboard Stats */}
                <div id="dashboard-stats" className="mb-12 animate-in slide-in-from-bottom duration-700 delay-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsCards.map((stat, index) => {
                            const IconComponent = stat.icon;
                            return (
                                <Card 
                                    key={stat.title}
                                    className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br ${stat.bgGradient} group animate-in fade-in ${stat.delay}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                        <CardTitle className="text-sm font-medium text-slate-700">
                                            {stat.title}
                                        </CardTitle>
                                        <div className={`p-2 rounded-lg bg-white/80 ${stat.iconColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent className="h-5 w-5" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1 ${
                                            animationStep === index ? 'animate-pulse' : ''
                                        }`}>
                                            {stat.value}
                                        </div>
                                        <p className="text-xs text-slate-600 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3 text-green-500" />
                                            {stat.subtitle}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-in slide-in-from-bottom duration-700 delay-500">
                    {/* Clients Section */}
                    <Card id="clients-section" className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
                                    Clientes VIP
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Gestiona tu cartera de clientes y visualiza el valor que aporta cada uno con métricas avanzadas.
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-500">Progreso del mes</span>
                                <span className="text-sm font-semibold text-blue-600">85%</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-2 mb-6">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full w-[85%] animate-pulse"></div>
                            </div>
                            <Link href="/demo/clients">
                                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg hover:shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
                                    <Star className="w-4 h-4 mr-2" />
                                    Ver Clientes VIP
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Projects Section */}
                    <Card id="projects-section" className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Target className="w-6 h-6" />
                                </div>
                                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                                    Proyectos Elite
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Controla el progreso y fechas límite de tus proyectos con herramientas profesionales.
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-500">Completado</span>
                                <span className="text-sm font-semibold text-green-600">72%</span>
                            </div>
                            <div className="w-full bg-green-100 rounded-full h-2 mb-6">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full w-[72%] animate-pulse"></div>
                            </div>
                            <Link href="/demo/projects">
                                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 shadow-lg hover:shadow-green-500/25 group-hover:scale-105 transition-all duration-300">
                                    <Rocket className="w-4 h-4 mr-2" />
                                    Ver Proyectos Elite
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Invoices Section */}
                    <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-purple-50 to-violet-50">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-400 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent font-bold">
                                    Facturas Pro
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Crea y gestiona facturas profesionales con diseños personalizados y automatización.
                            </p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-500">Cobros del mes</span>
                                <span className="text-sm font-semibold text-purple-600">94%</span>
                            </div>
                            <div className="w-full bg-purple-100 rounded-full h-2 mb-6">
                                <div className="bg-gradient-to-r from-purple-500 to-violet-400 h-2 rounded-full w-[94%] animate-pulse"></div>
                            </div>
                            <Link href="/demo/invoices">
                                <Button className="w-full bg-gradient-to-r from-purple-500 to-violet-400 hover:from-purple-600 hover:to-violet-500 shadow-lg hover:shadow-purple-500/25 group-hover:scale-105 transition-all duration-300">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Ver Facturas Pro
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced CTA Section */}
                <Card id="cta-section" className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white animate-in slide-in-from-bottom duration-700 delay-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/30 to-pink-600/20 animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-bounce"></div>
                        <div className="absolute top-20 right-20 w-16 h-16 bg-purple-400/20 rounded-full blur-lg animate-pulse delay-1000"></div>
                        <div className="absolute bottom-10 left-20 w-24 h-24 bg-pink-400/20 rounded-full blur-2xl animate-bounce delay-500"></div>
                    </div>
                    <CardContent className="relative z-10 p-12 text-center">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg animate-bounce">
                            <Award className="w-4 h-4" />
                            ¡GRATIS POR TIEMPO LIMITADO!
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                            ¿Listo para revolucionar tu negocio?
                        </h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Únete a miles de profesionales que ya han transformado su forma de trabajar. 
                            Sin tarjeta de crédito, configuración en 60 segundos, soporte premium incluido.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link href="/register">
                                <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 text-lg px-8 py-4">
                                    <Rocket className="w-6 h-6 mr-3" />
                                    ¡EMPEZAR AHORA GRATIS!
                                    <Sparkles className="w-6 h-6 ml-3" />
                                </Button>
                            </Link>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400">
                                    Valorado 5/5 por +10,000 usuarios
                                </p>
                            </div>
                        </div>
                        
                        {/* Features list */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-500/20">
                                    <Zap className="w-5 h-5 text-green-400" />
                                </div>
                                <span className="text-slate-300">Setup en 60 segundos</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20">
                                    <Award className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-slate-300">Soporte premium gratis</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                    <Star className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-slate-300">Sin límites de uso</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
