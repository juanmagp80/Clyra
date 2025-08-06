'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Chart, SimpleBarChart } from '@/components/ui/Chart';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
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

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

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
    const [shareLoading, setShareLoading] = useState(false);
    
    // Referencias para la exportación
    const reportRef = useRef<HTMLDivElement>(null);
    
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
            if (format === 'pdf') {
                // Exportación PDF real con jsPDF y html2canvas
                if (!reportRef.current) return;
                
                const canvas = await html2canvas(reportRef.current, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    removeContainer: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = 30;
                
                // Añadir header del PDF
                pdf.setFontSize(20);
                pdf.setTextColor(31, 41, 55); // slate-900
                pdf.text('Reporte Taskelia', 20, 20);
                
                pdf.setFontSize(12);
                pdf.setTextColor(107, 114, 128); // slate-500
                pdf.text(`Período: ${selectedTimeRange.label}`, 20, 28);
                pdf.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 35);
                
                // Añadir imagen del reporte
                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
                
                // Añadir footer
                const pageCount = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(8);
                    pdf.setTextColor(156, 163, 175); // gray-400
                    pdf.text(`Página ${i} de ${pageCount} - Taskelia CRM`, pdfWidth - 60, pdfHeight - 10);
                }
                
                const fileName = `Reporte_Taskelia_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
                pdf.save(fileName);
                
            } else {
                // Exportación Excel (CSV simulado)
                if (!metrics) return;
                
                const csvData = [
                    ['Métrica', 'Valor Actual', 'Valor Anterior', 'Cambio %'],
                    ['Ingresos Totales', `€${metrics.totalRevenue}`, `€${metrics.previousMetrics?.totalRevenue || 0}`, ''],
                    ['Horas Trabajadas', `${metrics.totalHours}h`, `${metrics.previousMetrics?.totalHours || 0}h`, ''],
                    ['Tarifa Promedio', `€${metrics.avgHourlyRate}`, `€${metrics.previousMetrics?.avgHourlyRate || 0}`, ''],
                    ['Proyectos Activos', `${metrics.totalProjects - metrics.completedProjects}`, '', ''],
                    ['Proyectos Completados', `${metrics.completedProjects}`, `${metrics.previousMetrics?.completedProjects || 0}`, ''],
                    ['Clientes Activos', `${metrics.activeClients}`, `${metrics.previousMetrics?.activeClients || 0}`, ''],
                    ['Horas Facturables', `${metrics.billableHours}h`, `${metrics.previousMetrics?.billableHours || 0}h`, ''],
                    ['Horas No Facturables', `${metrics.nonBillableHours}h`, `${metrics.previousMetrics?.nonBillableHours || 0}h`, ''],
                    [],
                    ['Recomendaciones IA'],
                    ...recommendations.map(rec => [rec.title, rec.description, `Impacto: ${rec.impact}`, `Esfuerzo: ${rec.effort}`])
                ];
                
                const csvContent = csvData.map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `Reporte_Taskelia_${format(new Date(), 'yyyy-MM-dd')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // Mostrar notificación de éxito
            alert(`✅ Reporte exportado exitosamente en formato ${format.toUpperCase()}!`);
            
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('❌ Error al exportar el reporte. Inténtalo de nuevo.');
    const shareReport = async () => {
        setShareLoading(true);
        try {
            // Generar URL compartible (en implementación real sería un endpoint)
            const shareData = {
                title: 'Reporte Taskelia',
                text: `Reporte de rendimiento - ${selectedTimeRange.label}`,
                url: `${window.location.origin}/reports/shared/${Date.now()}`
            };
            
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback: copiar al portapapeles
                await navigator.clipboard.writeText(shareData.url);
                alert('🔗 Enlace copiado al portapapeles! Puedes compartirlo con tus clientes.');
            }
        } catch (error) {
            console.error('Error sharing report:', error);
            alert('Error al compartir el reporte');
        } finally {
            setShareLoading(false);
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
                    <div className="p-6" ref={reportRef}>
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

                                    {/* Botones de exportación y compartir */}
                                    <Button
                                        variant="outline"
                                        onClick={() => exportReport('pdf')}
                                        disabled={exportLoading}
                                        className="border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 gap-2"
                                    >
                                        {exportLoading ? (
                                            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                        ) : (
                                            <FileText className="w-4 h-4" />
                                        )}
                                        PDF
                                    </Button>
                                    
                                    <Button
                                        variant="outline"
                                        onClick={() => exportReport('excel')}
                                        disabled={exportLoading}
                                        className="border-slate-200 hover:bg-slate-50 text-slate-700 h-10 px-4 gap-2"
                                    >
                                        {exportLoading ? (
                                            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Excel
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={shareReport}
                                        disabled={shareLoading}
                                        className="border-indigo-200 hover:bg-indigo-50 text-indigo-700 h-10 px-4 gap-2"
                                    >
                                        {shareLoading ? (
                                            <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                                        ) : (
                                            <Share2 className="w-4 h-4" />
                                        )}
                                        Compartir
                                    </Button>

                                    <Button
                                        onClick={loadReportsData}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 h-10 px-4 gap-2"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        Actualizar
                                    </Button>

                                    {/* Botón Compartir */}
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            const shareUrl = `${window.location.origin}/shared-report/${Date.now()}`;
                                            navigator.clipboard.writeText(shareUrl);
                                            alert('🔗 Enlace del reporte copiado al portapapeles!\n\nPuedes compartir este enlace con tus clientes para mostrar tu progreso y resultados.');
                                        }}
                                        className="border-emerald-200 hover:bg-emerald-50 text-emerald-700 h-10 px-4 gap-2"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Compartir
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

                        {/* Panel de Monitoreo en Tiempo Real */}
                        <div className="mb-6">
                            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700 shadow-2xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Activity className="w-6 h-6 text-emerald-400" />
                                        Centro de Control en Tiempo Real
                                        <div className="ml-auto flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-slate-300">Live</span>
                                        </div>
                                    </CardTitle>
                                    <CardDescription className="text-slate-300">
                                        Monitoreo en vivo de tu negocio freelance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                                                    <Euro className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs text-slate-400">Ingresos hoy</span>
                                            </div>
                                            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(425)}</div>
                                            <div className="text-xs text-emerald-300">+15% vs ayer</div>
                                        </div>
                                        
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs text-slate-400">Horas activas</span>
                                            </div>
                                            <div className="text-2xl font-bold text-blue-400">6.5h</div>
                                            <div className="text-xs text-blue-300">de 8h planificadas</div>
                                        </div>
                                        
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs text-slate-400">Clientes activos</span>
                                            </div>
                                            <div className="text-2xl font-bold text-purple-400">4</div>
                                            <div className="text-xs text-purple-300">2 nuevos este mes</div>
                                        </div>
                                        
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                                    <Target className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs text-slate-400">Eficiencia</span>
                                            </div>
                                            <div className="text-2xl font-bold text-amber-400">92%</div>
                                            <div className="text-xs text-amber-300">Por encima promedio</div>
                                        </div>
                                        
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                                    <AlertTriangle className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs text-slate-400">Pendientes</span>
                                            </div>
                                            <div className="text-2xl font-bold text-red-400">3</div>
                                            <div className="text-xs text-red-300">Facturas vencidas</div>
                                        </div>
                                        
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                                                    <TrendingUp className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-xs text-slate-400">Proyección</span>
                                            </div>
                                            <div className="text-2xl font-bold text-cyan-400">{formatCurrency(5200)}</div>
                                            <div className="text-xs text-cyan-300">Este mes</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
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

                                {/* Horas Trabajadas */}
                                <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                      onClick={() => setSelectedKPI(selectedKPI === 'hours' ? null : 'hours')}>
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
                                                                    <span className="text-xs text-slate-500">vs período anterior</span>
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
                                        {selectedKPI === 'hours' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-600">Facturables:</span>
                                                        <span className="font-medium text-green-600">{formatNumber(metrics.billableHours)}h</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                                        <div 
                                                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(metrics.billableHours / metrics.totalHours) * 100}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-600">No facturables:</span>
                                                        <span className="font-medium text-orange-600">{formatNumber(metrics.nonBillableHours)}h</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Tarifa Promedio */}
                                <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                      onClick={() => setSelectedKPI(selectedKPI === 'rate' ? null : 'rate')}>
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
                                                                    <span className="text-xs text-slate-500">vs período anterior</span>
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
                                        {selectedKPI === 'rate' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <p className="text-xs text-slate-600 mb-2">Potencial de mejora:</p>
                                                <div className="text-xs space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Tarifa recomendada:</span>
                                                        <span className="font-medium text-purple-600">{formatCurrency(Math.round(metrics.avgHourlyRate * 1.15))}/h</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Impacto mensual:</span>
                                                        <span className="font-medium text-green-600">+{formatCurrency(Math.round(metrics.billableHours * metrics.avgHourlyRate * 0.15))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Proyectos Activos */}
                                <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                      onClick={() => setSelectedKPI(selectedKPI === 'projects' ? null : 'projects')}>
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
                                        {selectedKPI === 'projects' && (
                                            <div className="mt-4 pt-4 border-t border-slate-100">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-600">Tasa de finalización:</span>
                                                        <span className="font-medium text-green-600">
                                                            {Math.round((metrics.completedProjects / metrics.totalProjects) * 100)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                                        <div 
                                                            className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${(metrics.completedProjects / metrics.totalProjects) * 100}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-600">Promedio cliente:</span>
                                                        <span className="font-medium">{Math.round(metrics.totalProjects / metrics.activeClients)} proyectos</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Sección de Comparativas y Benchmarks */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                            {/* Comparativa Período vs Período */}
                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                                        Comparativa Temporal
                                        <div className="ml-auto">
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                                vs. Período anterior
                                            </span>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Evolución de métricas clave comparado con período anterior</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Ingresos */}
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                    <Euro className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">Ingresos</div>
                                                    <div className="text-sm text-slate-600">{formatCurrency(15420)} actual</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 justify-end mb-1">
                                                    <ArrowUp className="w-4 h-4 text-emerald-600" />
                                                    <span className="font-bold text-emerald-600">+20%</span>
                                                </div>
                                                <div className="text-xs text-slate-500">+{formatCurrency(2570)}</div>
                                            </div>
                                        </div>
                                        
                                        {/* Horas */}
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">Horas trabajadas</div>
                                                    <div className="text-sm text-slate-600">240h actual</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 justify-end mb-1">
                                                    <ArrowUp className="w-4 h-4 text-blue-600" />
                                                    <span className="font-bold text-blue-600">+14%</span>
                                                </div>
                                                <div className="text-xs text-slate-500">+30h</div>
                                            </div>
                                        </div>
                                        
                                        {/* Tarifa promedio */}
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">Tarifa promedio</div>
                                                    <div className="text-sm text-slate-600">{formatCurrency(65)}/h actual</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 justify-end mb-1">
                                                    <ArrowUp className="w-4 h-4 text-purple-600" />
                                                    <span className="font-bold text-purple-600">+7%</span>
                                                </div>
                                                <div className="text-xs text-slate-500">+{formatCurrency(4)}/h</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Benchmarks del Sector */}
                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-600" />
                                        Benchmarks del Sector
                                        <div className="ml-auto">
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                                Top 25%
                                            </span>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Tu rendimiento comparado con otros freelancers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Tarifa vs Mercado */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-slate-700">Tarifa vs. Mercado</span>
                                                <span className="text-sm font-bold text-emerald-600">+18% sobre promedio</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full relative" style={{ width: '75%' }}>
                                                    <div className="absolute right-0 top-0 w-2 h-3 bg-emerald-700 rounded-r-full"></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>€40/h (promedio)</span>
                                                <span>€65/h (tú)</span>
                                                <span>€80/h (top 10%)</span>
                                            </div>
                                        </div>
                                        
                                        {/* Productividad */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-slate-700">Productividad</span>
                                                <span className="text-sm font-bold text-blue-600">Top 15%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full relative" style={{ width: '85%' }}>
                                                    <div className="absolute right-0 top-0 w-2 h-3 bg-blue-700 rounded-r-full"></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>65% (promedio)</span>
                                                <span>92% (tú)</span>
                                                <span>95% (top 10%)</span>
                                            </div>
                                        </div>
                                        
                                        {/* Retención de clientes */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-slate-700">Retención de Clientes</span>
                                                <span className="text-sm font-bold text-purple-600">Excelente</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-3">
                                                <div className="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full relative" style={{ width: '90%' }}>
                                                    <div className="absolute right-0 top-0 w-2 h-3 bg-purple-700 rounded-r-full"></div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                <span>70% (promedio)</span>
                                                <span>95% (tú)</span>
                                                <span>98% (top 10%)</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="flex items-center gap-2 text-amber-800">
                                            <Star className="w-4 h-4" />
                                            <span className="text-sm font-medium">Reconocimiento del Sector</span>
                                        </div>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Estás en el top 25% de freelancers en tu área. ¡Sigue así!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts y Visualizaciones Avanzadas con Chart.js */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                            {/* Gráfico de Líneas - Evolución de Ingresos */}
                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        Evolución de Ingresos
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                                +20% vs anterior
                                            </span>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Tendencia de ingresos mensuales con proyección IA</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        {revenueData && (
                                            <Line
                                                data={{
                                                    labels: revenueData.labels,
                                                    datasets: [
                                                        {
                                                            label: 'Ingresos Reales',
                                                            data: revenueData.datasets[0].data,
                                                            borderColor: '#10B981',
                                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                            fill: true,
                                                            tension: 0.4,
                                                            pointBackgroundColor: '#10B981',
                                                            pointBorderColor: '#ffffff',
                                                            pointBorderWidth: 2,
                                                            pointRadius: 6,
                                                            pointHoverRadius: 8
                                                        },
                                                        {
                                                            label: 'Proyección IA',
                                                            data: [null, null, null, null, 4500, 5200, 5800],
                                                            borderColor: '#8B5CF6',
                                                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                                            borderDash: [5, 5],
                                                            fill: false,
                                                            tension: 0.4,
                                                            pointBackgroundColor: '#8B5CF6',
                                                            pointBorderColor: '#ffffff',
                                                            pointBorderWidth: 2,
                                                            pointRadius: 4
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    interaction: {
                                                        intersect: false,
                                                        mode: 'index'
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            display: true,
                                                            position: 'top',
                                                            labels: {
                                                                usePointStyle: true,
                                                                padding: 20,
                                                                font: {
                                                                    size: 12,
                                                                    family: 'Inter'
                                                                }
                                                            }
                                                        },
                                                        tooltip: {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                            titleColor: '#ffffff',
                                                            bodyColor: '#ffffff',
                                                            borderColor: '#374151',
                                                            borderWidth: 1,
                                                            cornerRadius: 8,
                                                            displayColors: true,
                                                            callbacks: {
                                                                label: function(context) {
                                                                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        x: {
                                                            grid: {
                                                                display: false
                                                            },
                                                            ticks: {
                                                                color: '#6B7280',
                                                                font: {
                                                                    size: 11
                                                                }
                                                            }
                                                        },
                                                        y: {
                                                            grid: {
                                                                color: '#F3F4F6'
                                                            },
                                                            ticks: {
                                                                color: '#6B7280',
                                                                font: {
                                                                    size: 11
                                                                },
                                                                callback: function(value) {
                                                                    return formatCurrency(value as number);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                        <div className="text-center p-2 bg-emerald-50 rounded-lg">
                                            <div className="font-bold text-emerald-700">{formatCurrency(4500)}</div>
                                            <div className="text-emerald-600 text-xs">Mes actual</div>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                                            <div className="font-bold text-blue-700">{formatCurrency(3200)}</div>
                                            <div className="text-blue-600 text-xs">Promedio</div>
                                        </div>
                                        <div className="text-center p-2 bg-violet-50 rounded-lg">
                                            <div className="font-bold text-violet-700">{formatCurrency(5200)}</div>
                                            <div className="text-violet-600 text-xs">Proyección IA</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Gráfico de Donut - Distribución por Cliente */}
                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-purple-600" />
                                        Top Clientes
                                        <div className="ml-auto">
                                            <Button size="sm" variant="ghost" className="h-6 text-xs">
                                                <Eye className="w-3 h-3 mr-1" />
                                                Ver todos
                                            </Button>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Distribución de ingresos por cliente activo</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        {clientData && (
                                            <Doughnut
                                                data={{
                                                    labels: clientData.labels,
                                                    datasets: [
                                                        {
                                                            data: clientData.datasets[0].data,
                                                            backgroundColor: [
                                                                '#8B5CF6',
                                                                '#06B6D4',
                                                                '#10B981',
                                                                '#F59E0B'
                                                            ],
                                                            borderColor: [
                                                                '#7C3AED',
                                                                '#0891B2',
                                                                '#059669',
                                                                '#D97706'
                                                            ],
                                                            borderWidth: 2,
                                                            hoverOffset: 8
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    cutout: '60%',
                                                    plugins: {
                                                        legend: {
                                                            display: false
                                                        },
                                                        tooltip: {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                            titleColor: '#ffffff',
                                                            bodyColor: '#ffffff',
                                                            borderColor: '#374151',
                                                            borderWidth: 1,
                                                            cornerRadius: 8,
                                                            callbacks: {
                                                                label: function(context) {
                                                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                    const percentage = Math.round((context.parsed / total) * 100);
                                                                    return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {clientData?.labels.map((client, index) => {
                                            const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'];
                                            const value = clientData.datasets[0].data[index];
                                            const total = clientData.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((value / total) * 100);
                                            return (
                                                <div key={client} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
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

                        {/* Análisis de Productividad con Chart.js */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                            {/* Horas Facturables vs No Facturables - Gráfico de Barras */}
                            <Card className="xl:col-span-2 bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Análisis de Productividad Semanal
                                        <div className="ml-auto flex items-center gap-2">
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                75% eficiencia
                                            </span>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>Distribución de horas facturables vs actividades internas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        {productivityData && (
                                            <Bar
                                                data={{
                                                    labels: productivityData.labels,
                                                    datasets: [
                                                        {
                                                            label: 'Horas Facturables',
                                                            data: productivityData.datasets[0].data,
                                                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                                            borderColor: '#3B82F6',
                                                            borderWidth: 1,
                                                            borderRadius: 4,
                                                            borderSkipped: false
                                                        },
                                                        {
                                                            label: 'Horas No Facturables',
                                                            data: productivityData.datasets[1].data,
                                                            backgroundColor: 'rgba(245, 158, 11, 0.8)',
                                                            borderColor: '#F59E0B',
                                                            borderWidth: 1,
                                                            borderRadius: 4,
                                                            borderSkipped: false
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    interaction: {
                                                        intersect: false,
                                                        mode: 'index'
                                                    },
                                                    plugins: {
                                                        legend: {
                                                            display: true,
                                                            position: 'top',
                                                            labels: {
                                                                usePointStyle: true,
                                                                padding: 20,
                                                                font: {
                                                                    size: 12,
                                                                    family: 'Inter'
                                                                }
                                                            }
                                                        },
                                                        tooltip: {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                            titleColor: '#ffffff',
                                                            bodyColor: '#ffffff',
                                                            borderColor: '#374151',
                                                            borderWidth: 1,
                                                            cornerRadius: 8,
                                                            callbacks: {
                                                                label: function(context) {
                                                                    return `${context.dataset.label}: ${context.parsed.y}h`;
                                                                },
                                                                afterBody: function(tooltipItems) {
                                                                    const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
                                                                    const billable = tooltipItems[0]?.parsed.y || 0;
                                                                    const efficiency = total > 0 ? Math.round((billable / total) * 100) : 0;
                                                                    return [`Total: ${total}h`, `Eficiencia: ${efficiency}%`];
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        x: {
                                                            stacked: true,
                                                            grid: {
                                                                display: false
                                                            },
                                                            ticks: {
                                                                color: '#6B7280',
                                                                font: {
                                                                    size: 11
                                                                }
                                                            }
                                                        },
                                                        y: {
                                                            stacked: true,
                                                            grid: {
                                                                color: '#F3F4F6'
                                                            },
                                                            ticks: {
                                                                color: '#6B7280',
                                                                font: {
                                                                    size: 11
                                                                },
                                                                callback: function(value) {
                                                                    return `${value}h`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                            <span className="text-slate-600">Facturables: {metrics?.billableHours}h</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                                            <span className="text-slate-600">Internas: {metrics?.nonBillableHours}h</span>
                                        </div>
                                        <div className="text-slate-500 text-xs">
                                            Meta: 8h/día | Eficiencia: {metrics ? Math.round((metrics.billableHours / metrics.totalHours) * 100) : 0}%
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Panel de Alertas y Notificaciones */}
                            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-600" />
                                        Alertas Inteligentes
                                        <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                            {alerts.filter(a => a.priority === 'high').length} críticas
                                        </span>
                                    </CardTitle>
                                    <CardDescription>Notificaciones y recomendaciones en tiempo real</CardDescription>
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
                                                    {alert.actionable && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="mt-2 h-6 text-xs px-2 hover:bg-white/60"
                                                        >
                                                            Actuar
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recomendaciones Inteligentes */}
                        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 border-indigo-200/60 shadow-xl shadow-indigo-500/10 mt-6">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-indigo-600" />
                                    IA: Recomendaciones Estratégicas
                                    <div className="ml-auto flex items-center gap-1">
                                        <Sparkles className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                            Powered by AI
                                        </span>
                                    </div>
                                </CardTitle>
                                <CardDescription>Insights personalizados basados en tus patrones de trabajo</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recommendations.map((rec) => {
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
                                        const impactBadges = {
                                            high: 'bg-green-100 text-green-700 border-green-200',
                                            medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                                            low: 'bg-gray-100 text-gray-700 border-gray-200'
                                        };
                                        const effortBadges = {
                                            low: 'bg-green-100 text-green-700',
                                            medium: 'bg-yellow-100 text-yellow-700',
                                            high: 'bg-red-100 text-red-700'
                                        };
                                        
                                        const IconComponent = typeIcons[rec.type];
                                        
                                        return (
                                            <div key={rec.id} className="group p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${typeColors[rec.type]} rounded-lg flex items-center justify-center shadow-md`}>
                                                        <IconComponent className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-slate-900 text-sm">{rec.title}</h4>
                                                            <div className="flex gap-1">
                                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${impactBadges[rec.impact]}`}>
                                                                    Impacto: {rec.impact}
                                                                </span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${effortBadges[rec.effort]}`}>
                                                                    Esfuerzo: {rec.effort}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="h-7 text-xs px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0"
                                                            >
                                                                Implementar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs px-3 text-slate-600 hover:bg-slate-100"
                                                            >
                                                                Más detalles
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Footer con estadísticas adicionales */}
                                <div className="mt-6 pt-4 border-t border-indigo-200/60">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="p-3 bg-white/60 rounded-lg">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                                <span className="text-lg font-bold text-emerald-600">
                                                    +{formatCurrency(2400)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600">Potencial adicional/mes</p>
                                        </div>
                                        <div className="p-3 bg-white/60 rounded-lg">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Activity className="w-4 h-4 text-blue-600" />
                                                <span className="text-lg font-bold text-blue-600">92%</span>
                                            </div>
                                            <p className="text-xs text-slate-600">Precisión IA</p>
                                        </div>
                                        <div className="p-3 bg-white/60 rounded-lg">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Award className="w-4 h-4 text-purple-600" />
                                                <span className="text-lg font-bold text-purple-600">A+</span>
                                            </div>
                                            <p className="text-xs text-slate-600">Performance score</p>
                                        </div>
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
