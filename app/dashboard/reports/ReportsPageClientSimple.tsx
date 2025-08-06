'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    BarChart3,
    Calendar,
    Download,
    Filter,
    PieChart,
    TrendingUp,
    Euro,
    Clock,
    Users,
    Briefcase,
    Target,
    FileText,
    Share2,
    Mail,
    Eye,
    Settings,
    Zap,
    Brain,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Minus,
    AlertCircle,
    CheckCircle,
    Calendar as CalendarIcon,
    RefreshCw,
    AlertTriangle,
    Award,
    Activity,
    Lightbulb,
    Shield,
    Star,
    Sparkles
} from 'lucide-react';

interface ReportsPageClientProps {
    userEmail: string;
}

// Tipos para los datos de reportes
interface ReportMetrics {
    totalRevenue: number;
    totalHours: number;
    avgHourlyRate: number;
    totalProjects: number;
    completedProjects: number;
    activeClients: number;
    billableHours: number;
    nonBillableHours: number;
    pendingInvoices: number;
    overdueTasks: number;
    previousMetrics?: {
        totalRevenue: number;
        totalHours: number;
        avgHourlyRate: number;
        totalProjects: number;
        completedProjects: number;
        activeClients: number;
        billableHours: number;
        nonBillableHours: number;
        pendingInvoices: number;
        overdueTasks: number;
    };
}

interface Alert {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    actionable: boolean;
}

interface Recommendation {
    id: string;
    type: 'revenue' | 'productivity' | 'client' | 'project';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
}

interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string[];
        borderColor?: string;
        fill?: boolean;
    }>;
}

interface TimeRange {
    start: string;
    end: string;
    label: string;
}

export default function ReportsPageClient({ userEmail }: ReportsPageClientProps) {
    const router = useRouter();
    const supabase = createSupabaseClient();
    const reportRef = useRef<HTMLDivElement>(null);
    
    // Estados principales
    const [loading, setLoading] = useState(true);
    const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
        label: 'Últimos 30 días'
    });
    
    // Estados de datos
    const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
    const [revenueData, setRevenueData] = useState<ChartData | null>(null);
    const [productivityData, setProductivityData] = useState<ChartData | null>(null);
    const [clientData, setClientData] = useState<ChartData | null>(null);
    const [projectData, setProjectData] = useState<ChartData | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    
    // Estados de UI
    const [selectedReport, setSelectedReport] = useState('overview');
    const [showFilters, setShowFilters] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
    
    const timeRanges = [
        {
            start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
            label: 'Últimos 7 días'
        },
        {
            start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
            label: 'Últimos 30 días'
        },
        {
            start: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
            label: 'Últimos 3 meses'
        },
        {
            start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
            label: 'Este año'
        }
    ];

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Cargar datos de reportes
    const loadReportsData = async () => {
        setLoading(true);
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar métricas principales
            await Promise.all([
                loadMetrics(user.id),
                loadRevenueData(user.id),
                loadProductivityData(user.id),
                loadClientData(user.id),
                loadProjectData(user.id),
                loadAlerts(user.id),
                loadRecommendations(user.id)
            ]);
        } catch (error) {
            console.error('Error loading reports data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMetrics = async (userId: string) => {
        try {
            // Datos actuales y del período anterior para comparativas
            const currentMetrics: ReportMetrics = {
                totalRevenue: 15420,
                totalHours: 240,
                avgHourlyRate: 65,
                totalProjects: 8,
                completedProjects: 5,
                activeClients: 4,
                billableHours: 180,
                nonBillableHours: 60,
                pendingInvoices: 3,
                overdueTasks: 2
            };
            
            // Datos del período anterior para comparativas
            const previousMetrics = {
                totalRevenue: 12850,
                totalHours: 210,
                avgHourlyRate: 61,
                totalProjects: 6,
                completedProjects: 4,
                activeClients: 3,
                billableHours: 155,
                nonBillableHours: 55,
                pendingInvoices: 5,
                overdueTasks: 4
            };
            
            setMetrics({
                ...currentMetrics,
                previousMetrics
            });
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    };

    const loadRevenueData = async (userId: string) => {
        try {
            const mockRevenueData: ChartData = {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Ingresos',
                        data: [2500, 3200, 2800, 4100, 3600, 4500],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true
                    }
                ]
            };
            setRevenueData(mockRevenueData);
        } catch (error) {
            console.error('Error loading revenue data:', error);
        }
    };

    const loadProductivityData = async (userId: string) => {
        try {
            const mockProductivityData: ChartData = {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [
                    {
                        label: 'Horas Facturables',
                        data: [8, 7, 8, 6, 8, 3, 2],
                        backgroundColor: '#10B981'
                    },
                    {
                        label: 'Horas No Facturables',
                        data: [2, 3, 2, 4, 2, 1, 1],
                        backgroundColor: '#F59E0B'
                    }
                ]
            };
            setProductivityData(mockProductivityData);
        } catch (error) {
            console.error('Error loading productivity data:', error);
        }
    };

    const loadClientData = async (userId: string) => {
        try {
            const mockClientData: ChartData = {
                labels: ['TechStart', 'Restaurante Oliva', 'FitnessCenter', 'Boutique Moda'],
                datasets: [
                    {
                        label: 'Ingresos por Cliente',
                        data: [5500, 3200, 4800, 1920],
                        backgroundColor: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
                    }
                ]
            };
            setClientData(mockClientData);
        } catch (error) {
            console.error('Error loading client data:', error);
        }
    };

    const loadProjectData = async (userId: string) => {
        try {
            const mockProjectData: ChartData = {
                labels: ['Completados', 'En Progreso', 'Planificación', 'Pausados'],
                datasets: [
                    {
                        label: 'Estado de Proyectos',
                        data: [5, 2, 1, 0],
                        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
                    }
                ]
            };
            setProjectData(mockProjectData);
        } catch (error) {
            console.error('Error loading project data:', error);
        }
    };

    const loadAlerts = async (userId: string) => {
        try {
            const mockAlerts: Alert[] = [
                {
                    id: '1',
                    type: 'warning',
                    title: 'Facturas Pendientes',
                    message: 'Tienes 3 facturas pendientes de pago por un total de €4,200',
                    priority: 'high',
                    actionable: true
                },
                {
                    id: '2',
                    type: 'error',
                    title: 'Tareas Vencidas',
                    message: '2 tareas importantes están vencidas y requieren atención inmediata',
                    priority: 'high',
                    actionable: true
                },
                {
                    id: '3',
                    type: 'success',
                    title: 'Meta de Ingresos',
                    message: 'Has superado tu meta mensual de ingresos en un 20%',
                    priority: 'medium',
                    actionable: false
                },
                {
                    id: '4',
                    type: 'info',
                    title: 'Nuevo Cliente Potencial',
                    message: 'Un cliente ha mostrado interés en tu perfil. Considera contactarlo.',
                    priority: 'medium',
                    actionable: true
                }
            ];
            setAlerts(mockAlerts);
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    };

    const loadRecommendations = async (userId: string) => {
        try {
            const mockRecommendations: Recommendation[] = [
                {
                    id: '1',
                    type: 'revenue',
                    title: 'Aumentar Tarifa Horaria',
                    description: 'Basado en tu experiencia y resultados, podrías aumentar tu tarifa a €75/hora. Esto generaría €2,400 adicionales al mes.',
                    impact: 'high',
                    effort: 'low'
                },
                {
                    id: '2',
                    type: 'productivity',
                    title: 'Optimizar Horarios',
                    description: 'Tus horas más productivas son entre 9-11 AM. Agenda las tareas complejas en este período.',
                    impact: 'medium',
                    effort: 'low'
                },
                {
                    id: '3',
                    type: 'client',
                    title: 'Retainer con TechStart',
                    description: 'TechStart es tu cliente más rentable. Propón un contrato retainer para asegurar ingresos recurrentes.',
                    impact: 'high',
                    effort: 'medium'
                },
                {
                    id: '4',
                    type: 'project',
                    title: 'Automatizar Procesos',
                    description: 'Identifica tareas repetitivas en tus proyectos. La automatización podría ahorrarte 5 horas semanales.',
                    impact: 'medium',
                    effort: 'high'
                }
            ];
            setRecommendations(mockRecommendations);
        } catch (error) {
            console.error('Error loading recommendations:', error);
        }
    };

    const exportReport = async (format: 'pdf' | 'excel') => {
        setExportLoading(true);
        try {
            // Simular proceso de exportación con múltiples pasos
            const steps = [
                'Recopilando datos...',
                'Generando gráficos...',
                'Aplicando formato...',
                'Optimizando archivo...',
                'Finalizando exportación...'
            ];
            
            for (let i = 0; i < steps.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 400));
                // En una implementación real, aquí actualizaríamos el progreso
            }
            
            // Simular descarga de archivo
            const reportData = {
                title: `Reporte_Taskelia_${selectedTimeRange.label.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`,
                period: selectedTimeRange.label,
                generatedAt: new Date().toLocaleString('es-ES'),
                metrics: metrics,
                insights: recommendations.slice(0, 3), // Top 3 recomendaciones
                format: format.toUpperCase()
            };
            
            // Crear blob simulado (en implementación real sería el archivo generado)
            const content = format === 'pdf' 
                ? `Reporte PDF generado para ${reportData.title}`
                : `Datos Excel exportados para ${reportData.title}`;
            
            const blob = new Blob([content], { 
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${reportData.title}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Mostrar notificación de éxito
            alert(`✅ Reporte exportado exitosamente en formato ${format.toUpperCase()}!\n\nArchivo: ${reportData.title}.${format}\nPeríodo: ${reportData.period}\nGenerado: ${reportData.generatedAt}`);
            
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('❌ Error al exportar el reporte. Inténtalo de nuevo.');
        } finally {
            setExportLoading(false);
        }
    };

    const shareReport = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Reporte Taskelia',
                    text: `Reporte de freelancer para ${selectedTimeRange.label}`,
                    url: window.location.href
                });
            } else {
                // Fallback: copiar al portapapeles
                await navigator.clipboard.writeText(window.location.href);
                alert('🔗 Enlace copiado al portapapeles');
            }
        } catch (error) {
            console.error('Error sharing report:', error);
            alert('Error al compartir el reporte');
        }
    };

    useEffect(() => {
        loadReportsData();
    }, [selectedTimeRange]);

    const getChangeIndicator = (current: number, previous: number) => {
        if (previous === 0) return { icon: Minus, color: 'text-gray-600', value: '0%' };
        
        const change = ((current - previous) / previous) * 100;
        if (change > 0) {
            return { 
                icon: ArrowUp, 
                color: 'text-emerald-600', 
                value: `+${change.toFixed(1)}%`,
                bgColor: 'bg-emerald-50',
                isPositive: true
            };
        } else if (change < 0) {
            return { 
                icon: ArrowDown, 
                color: 'text-red-600', 
                value: `${change.toFixed(1)}%`,
                bgColor: 'bg-red-50',
                isPositive: false
            };
        } else {
            return { 
                icon: Minus, 
                color: 'text-slate-600', 
                value: '0%',
                bgColor: 'bg-slate-50',
                isPositive: null
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

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('es-ES').format(num);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-slate-900 relative overflow-hidden">
            {/* Premium Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(99,102,241,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.06),transparent_50%)]" />
                <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[size:32px_32px]" />
            </div>

            <div className="relative z-10 flex">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                
                <main className="flex-1 ml-56 overflow-auto">
                    <div ref={reportRef} className="p-6">
                        {/* Header */}
                        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-6 shadow-xl shadow-slate-900/5 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
                                            Reportes Inteligentes
                                        </h1>
                                        <p className="text-slate-600 text-lg">Analytics avanzados para tu negocio freelance</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Filtros de tiempo */}
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 gap-2"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            {selectedTimeRange.label}
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                        
                                        {showFilters && (
                                            <div className="absolute top-12 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                                                {timeRanges.map((range) => (
                                                    <button
                                                        key={range.label}
                                                        onClick={() => {
                                                            setSelectedTimeRange(range);
                                                            setShowFilters(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                                    >
                                                        {range.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón compartir */}
                                    <Button
                                        variant="outline"
                                        onClick={shareReport}
                                        className="border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 gap-2"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Compartir
                                    </Button>

                                    {/* Botones de exportación */}
                                    <Button
                                        variant="outline"
                                        onClick={() => exportReport('pdf')}
                                        disabled={exportLoading}
                                        className="border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 gap-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        PDF
                                    </Button>
                                    
                                    <Button
                                        variant="outline"
                                        onClick={() => exportReport('excel')}
                                        disabled={exportLoading}
                                        className="border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Excel
                                    </Button>

                                    <Button
                                        onClick={loadReportsData}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 h-10 px-4 gap-2"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        Actualizar
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Navegación de Reportes */}
                        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl shadow-lg mb-6">
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-semibold text-slate-900">Tipo de Reporte</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { id: 'overview', label: 'Vista General', icon: BarChart3, desc: 'Métricas principales' },
                                        { id: 'revenue', label: 'Ingresos', icon: Euro, desc: 'Análisis financiero' },
                                        { id: 'productivity', label: 'Productividad', icon: Clock, desc: 'Eficiencia temporal' },
                                        { id: 'clients', label: 'Clientes', icon: Users, desc: 'Análisis de cartera' },
                                        { id: 'projects', label: 'Proyectos', icon: Briefcase, desc: 'Estado y rendimiento' },
                                        { id: 'insights', label: 'Insights IA', icon: Brain, desc: 'Recomendaciones' }
                                    ].map((report) => {
                                        const IconComponent = report.icon;
                                        const isActive = selectedReport === report.id;
                                        return (
                                            <button
                                                key={report.id}
                                                onClick={() => setSelectedReport(report.id)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                                    isActive 
                                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/25' 
                                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                <div className="text-left">
                                                    <div className="text-sm font-medium">{report.label}</div>
                                                    <div className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                        {report.desc}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Métricas Principales */}
                        {metrics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                                {/* Revenue Total */}
                                <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                      onClick={() => setSelectedKPI(selectedKPI === 'revenue' ? null : 'revenue')}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Ingresos Totales</p>
                                                <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.totalRevenue)}</p>
                                                {metrics.previousMetrics && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {(() => {
                                                            const indicator = getChangeIndicator(metrics.totalRevenue, metrics.previousMetrics.totalRevenue);
                                                            const IconComponent = indicator.icon;
                                                            return (
                                                                <>
                                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${indicator.bgColor}`}>
                                                                        <IconComponent className={`w-3 h-3 ${indicator.color}`} />
                                                                        <span className={`text-xs font-medium ${indicator.color}`}>{indicator.value}</span>
                                                                    </div>
                                                                    <span className="text-xs text-slate-500">vs período anterior</span>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                                <Euro className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        {selectedKPI === 'revenue' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-xs text-slate-600 mb-2">Desglose:</p>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Horas facturables:</span>
                                                        <span className="font-medium">{formatCurrency(metrics.billableHours * metrics.avgHourlyRate)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Bonificaciones:</span>
                                                        <span className="font-medium">{formatCurrency(metrics.totalRevenue - (metrics.billableHours * metrics.avgHourlyRate))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Otras métricas... */}
                                <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Horas Trabajadas</p>
                                                <p className="text-3xl font-bold text-slate-900">{formatNumber(metrics.totalHours)}h</p>
                                                {metrics.previousMetrics && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {(() => {
                                                            const indicator = getChangeIndicator(metrics.totalHours, metrics.previousMetrics.totalHours);
                                                            const IconComponent = indicator.icon;
                                                            return (
                                                                <>
                                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${indicator.bgColor}`}>
                                                                        <IconComponent className={`w-3 h-3 ${indicator.color}`} />
                                                                        <span className={`text-xs font-medium ${indicator.color}`}>{indicator.value}</span>
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Tarifa Promedio</p>
                                                <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.avgHourlyRate)}/h</p>
                                                {metrics.previousMetrics && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        {(() => {
                                                            const indicator = getChangeIndicator(metrics.avgHourlyRate, metrics.previousMetrics.avgHourlyRate);
                                                            const IconComponent = indicator.icon;
                                                            return (
                                                                <>
                                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${indicator.bgColor}`}>
                                                                        <IconComponent className={`w-3 h-3 ${indicator.color}`} />
                                                                        <span className={`text-xs font-medium ${indicator.color}`}>{indicator.value}</span>
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                                                <TrendingUp className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Proyectos Activos</p>
                                                <p className="text-3xl font-bold text-slate-900">{formatNumber(metrics.totalProjects - metrics.completedProjects)}</p>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50">
                                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                                        <span className="text-xs font-medium text-green-600">{formatNumber(metrics.completedProjects)} completados</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                                                <Briefcase className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Gráficos Simples con CSS */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        Evolución de Ingresos
                                    </CardTitle>
                                    <CardDescription>Tendencia de ingresos mensuales</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 relative">
                                        {revenueData && (
                                            <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
                                                {revenueData.datasets[0].data.map((value, index) => {
                                                    const maxValue = Math.max(...revenueData.datasets[0].data);
                                                    const height = (value / maxValue) * 100;
                                                    return (
                                                        <div key={index} className="flex flex-col items-center group cursor-pointer">
                                                            <div className="relative mb-2">
                                                                <div
                                                                    className="w-8 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-lg transition-all duration-500 hover:from-emerald-600 hover:to-green-500 shadow-lg"
                                                                    style={{ height: `${height * 1.8}px` }}
                                                                />
                                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                                    {formatCurrency(value)}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-slate-600 font-medium">
                                                                {revenueData.labels[index]}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-purple-600" />
                                        Top Clientes
                                    </CardTitle>
                                    <CardDescription>Distribución de ingresos por cliente</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {clientData?.labels.map((client, index) => {
                                            const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'];
                                            const value = clientData.datasets[0].data[index];
                                            const total = clientData.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((value / total) * 100);
                                            return (
                                                <div key={client} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full ${colors[index]}`}></div>
                                                        <span className="text-sm font-medium text-slate-700">{client}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-slate-900">{formatCurrency(value)}</div>
                                                        <div className="text-xs text-slate-500">{percentage}%</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alertas y Recomendaciones */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-600" />
                                        Alertas Inteligentes
                                        <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                            {alerts.filter(a => a.priority === 'high').length} críticas
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                                    {alerts.map((alert) => {
                                        const alertIcons = {
                                            success: CheckCircle,
                                            warning: AlertTriangle,
                                            error: AlertCircle,
                                            info: Lightbulb
                                        };
                                        const alertColors = {
                                            success: 'bg-green-50 border-green-200 text-green-800',
                                            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                                            error: 'bg-red-50 border-red-200 text-red-800',
                                            info: 'bg-blue-50 border-blue-200 text-blue-800'
                                        };
                                        const iconColors = {
                                            success: 'text-green-600',
                                            warning: 'text-yellow-600',
                                            error: 'text-red-600',
                                            info: 'text-blue-600'
                                        };
                                        
                                        const IconComponent = alertIcons[alert.type];
                                        
                                        return (
                                            <div key={alert.id} className={`flex items-start gap-3 p-3 border rounded-lg transition-all duration-200 hover:shadow-sm ${alertColors[alert.type]}`}>
                                                <IconComponent className={`w-5 h-5 mt-0.5 ${iconColors[alert.type]}`} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium text-sm">{alert.title}</p>
                                                        {alert.priority === 'high' && (
                                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                                                Alta
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs opacity-90">{alert.message}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 border-indigo-200/60 shadow-xl shadow-indigo-500/10">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-indigo-600" />
                                        IA: Recomendaciones
                                        <div className="ml-auto flex items-center gap-1">
                                            <Sparkles className="w-4 h-4 text-indigo-500" />
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                                Powered by AI
                                            </span>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                                    {recommendations.slice(0, 2).map((rec) => {
                                        const typeIcons = {
                                            revenue: Euro,
                                            productivity: Clock,
                                            client: Users,
                                            project: Briefcase
                                        };
                                        const typeColors = {
                                            revenue: 'from-green-500 to-emerald-600',
                                            productivity: 'from-blue-500 to-cyan-600',
                                            client: 'from-purple-500 to-violet-600',
                                            project: 'from-orange-500 to-red-600'
                                        };
                                        
                                        const IconComponent = typeIcons[rec.type];
                                        
                                        return (
                                            <div key={rec.id} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 bg-gradient-to-br ${typeColors[rec.type]} rounded-lg flex items-center justify-center shadow-md`}>
                                                        <IconComponent className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-slate-900 text-sm mb-1">{rec.title}</h4>
                                                        <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${rec.impact === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                Impacto: {rec.impact}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
