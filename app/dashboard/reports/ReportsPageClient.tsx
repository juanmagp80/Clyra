'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SimpleBarChart } from '@/components/ui/Chart';
import { createSupabaseClient } from '@/src/lib/supabase-client';

interface ReportsPageClientProps {
    userEmail: string;
}

interface ReportMetrics {
    totalRevenue: number;
    totalHours: number;
    avgHourlyRate: number;
    totalProjects: number;
    completedProjects: number;
    activeClients: number;
    billableHours: number;
    nonBillableHours: number;
    previousMetrics?: {
        totalRevenue: number;
        totalHours: number;
        avgHourlyRate: number;
        completedProjects: number;
        activeClients: number;
        billableHours: number;
        nonBillableHours: number;
    };
}

export default function ReportsPageClient({ userEmail }: ReportsPageClientProps) {
    const router = useRouter();
    const reportRef = useRef<HTMLDivElement>(null);
    
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);

    const handleLogout = async () => {
        const supabase = createSupabaseClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push('/login');
    };

    const loadReportsData = async () => {
        setLoading(true);
        try {
            // Mock data para demo
            const mockMetrics: ReportMetrics = {
                totalRevenue: 15420,
                totalHours: 148,
                avgHourlyRate: 65,
                totalProjects: 12,
                completedProjects: 8,
                activeClients: 6,
                billableHours: 132,
                nonBillableHours: 16,
                previousMetrics: {
                    totalRevenue: 12850,
                    totalHours: 135,
                    avgHourlyRate: 60,
                    completedProjects: 6,
                    activeClients: 5,
                    billableHours: 120,
                    nonBillableHours: 15
                }
            };
            setMetrics(mockMetrics);
        } catch (error) {
            console.error('Error loading reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format: 'pdf' | 'excel') => {
        setExportLoading(true);
        try {
            // Simulación de exportación
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const fileName = `Reporte_Taskelia_${dateStr}.${format === 'pdf' ? 'pdf' : 'csv'}`;
            
            alert(`✅ Reporte exportado: ${fileName}`);
            
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('❌ Error al exportar el reporte.');
        } finally {
            setExportLoading(false);
        }
    };

    const shareReport = async () => {
        setShareLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('🔗 Enlace de reporte copiado al portapapeles');
        } catch (error) {
            console.error('Error sharing report:', error);
        } finally {
            setShareLoading(false);
        }
    };

    useEffect(() => {
        loadReportsData();
    }, []);

    const getChangeIndicator = (current: number, previous: number) => {
        if (previous === 0) return { value: '0%', color: 'text-gray-600' };
        
        const change = ((current - previous) / previous) * 100;
        if (change > 0) {
            return { 
                value: `+${change.toFixed(1)}%`,
                color: 'text-emerald-600'
            };
        } else if (change < 0) {
            return { 
                value: `${change.toFixed(1)}%`,
                color: 'text-red-600'
            };
        } else {
            return { 
                value: '0%',
                color: 'text-slate-600'
            };
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 relative overflow-hidden">
                <div className="relative z-10 flex">
                    <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                    <main className="flex-1 ml-56 overflow-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-600">Cargando datos del reporte...</p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-slate-900 relative overflow-hidden">
            <div className="relative z-10 flex">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                
                <main className="flex-1 ml-56 overflow-auto">
                    <div className="p-6" ref={reportRef}>
                        {/* Header */}
                        <div className="mb-8">
                            <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                                            📊 Reportes de Rendimiento
                                        </h1>
                                        <p className="text-slate-600 font-medium">
                                            Análisis completo de tu productividad y resultados
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => exportReport('pdf')}
                                            disabled={exportLoading}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                        >
                                            {exportLoading ? 'Exportando...' : 'Exportar PDF'}
                                        </Button>
                                        <Button
                                            onClick={() => exportReport('excel')}
                                            disabled={exportLoading}
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                                        >
                                            {exportLoading ? 'Exportando...' : 'Exportar Excel'}
                                        </Button>
                                        <Button
                                            onClick={shareReport}
                                            disabled={shareLoading}
                                            variant="outline"
                                        >
                                            {shareLoading ? 'Compartiendo...' : 'Compartir'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Métricas principales */}
                        {metrics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card className="bg-white/60 backdrop-blur-xl border-white/60">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Ingresos Totales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900">
                                            {formatCurrency(metrics.totalRevenue)}
                                        </div>
                                        {metrics.previousMetrics && (
                                            <p className={`text-sm ${getChangeIndicator(metrics.totalRevenue, metrics.previousMetrics.totalRevenue).color}`}>
                                                {getChangeIndicator(metrics.totalRevenue, metrics.previousMetrics.totalRevenue).value} vs mes anterior
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border-white/60">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Horas Trabajadas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900">
                                            {metrics.totalHours}h
                                        </div>
                                        {metrics.previousMetrics && (
                                            <p className={`text-sm ${getChangeIndicator(metrics.totalHours, metrics.previousMetrics.totalHours).color}`}>
                                                {getChangeIndicator(metrics.totalHours, metrics.previousMetrics.totalHours).value} vs mes anterior
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border-white/60">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Tarifa Promedio
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900">
                                            €{metrics.avgHourlyRate}/h
                                        </div>
                                        {metrics.previousMetrics && (
                                            <p className={`text-sm ${getChangeIndicator(metrics.avgHourlyRate, metrics.previousMetrics.avgHourlyRate).color}`}>
                                                {getChangeIndicator(metrics.avgHourlyRate, metrics.previousMetrics.avgHourlyRate).value} vs mes anterior
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border-white/60">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-slate-600">
                                            Proyectos Completados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900">
                                            {metrics.completedProjects}
                                        </div>
                                        {metrics.previousMetrics && (
                                            <p className={`text-sm ${getChangeIndicator(metrics.completedProjects, metrics.previousMetrics.completedProjects).color}`}>
                                                {getChangeIndicator(metrics.completedProjects, metrics.previousMetrics.completedProjects).value} vs mes anterior
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Gráficos simulados */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <Card className="bg-white/60 backdrop-blur-xl border-white/60">
                                <CardHeader>
                                    <CardTitle>Evolución de Ingresos</CardTitle>
                                    <CardDescription>
                                        Ingresos mensuales durante el año
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SimpleBarChart 
                                        data={[8500, 12200, 9800, 15400, 11600, 14200]} 
                                        className="h-64"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="bg-white/60 backdrop-blur-xl border-white/60">
                                <CardHeader>
                                    <CardTitle>Distribución de Tiempo</CardTitle>
                                    <CardDescription>
                                        Horas facturables vs no facturables
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Horas Facturables</span>
                                                <span className="text-sm text-slate-600">{metrics?.billableHours || 0}h</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full" 
                                                    style={{ width: `${((metrics?.billableHours || 0) / (metrics?.totalHours || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Horas No Facturables</span>
                                                <span className="text-sm text-slate-600">{metrics?.nonBillableHours || 0}h</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div 
                                                    className="bg-gray-400 h-2 rounded-full" 
                                                    style={{ width: `${((metrics?.nonBillableHours || 0) / (metrics?.totalHours || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Resumen */}
                        <Card className="bg-white/60 backdrop-blur-xl border-white/60">
                            <CardHeader>
                                <CardTitle>📈 Resumen Ejecutivo</CardTitle>
                                <CardDescription>
                                    Análisis de tu rendimiento actual
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{metrics?.activeClients || 0}</div>
                                        <div className="text-sm text-blue-800">Clientes Activos</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{metrics?.totalProjects || 0}</div>
                                        <div className="text-sm text-green-800">Proyectos Totales</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {metrics ? Math.round((metrics.completedProjects / metrics.totalProjects) * 100) : 0}%
                                        </div>
                                        <div className="text-sm text-purple-800">Tasa de Completado</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
