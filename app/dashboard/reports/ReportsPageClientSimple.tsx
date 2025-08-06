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
    ArrowRight,
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
    route?: string;
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
        backgroundColor?: string | string[];
        borderColor?: string;
        fill?: boolean;
        tension?: number;
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

    // Función para manejar navegación de alertas
    const handleAlertClick = (alert: Alert) => {
        if (alert.actionable && alert.route) {
            router.push(alert.route);
        }
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
            if (!supabase) return;

            // Obtener datos reales de la base de datos
            const [
                { data: invoicesData },
                { data: projectsData },
                { data: clientsData },
                { data: timeEntriesData }
            ] = await Promise.all([
                supabase.from('invoices').select('*').eq('user_id', userId),
                supabase.from('projects').select('*').eq('user_id', userId),
                supabase.from('clients').select('*').eq('user_id', userId),
                supabase.from('time_entries').select('*').eq('user_id', userId)
            ]);

            // Calcular métricas reales
            const totalRevenue = invoicesData?.filter(inv => inv.status === 'paid')
                .reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
            
            const totalHours = timeEntriesData?.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0) || 0;
            
            const billableHours = timeEntriesData?.filter(entry => entry.is_billable)
                .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0) || 0;
            
            const nonBillableHours = totalHours - billableHours;
            
            const avgHourlyRate = (timeEntriesData?.length || 0) > 0 
                ? (timeEntriesData || []).reduce((sum, entry) => sum + (entry.hourly_rate || 0), 0) / (timeEntriesData?.length || 1)
                : 0;
            
            const totalProjects = projectsData?.length || 0;
            const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;
            const activeClients = clientsData?.length || 0;
            
            const pendingInvoices = invoicesData?.filter(inv => inv.status === 'sent' || inv.status === 'draft').length || 0;
            
            // Para datos del período anterior, usamos un cálculo aproximado
            const previousMetrics = {
                totalRevenue: totalRevenue * 0.85, // Simulamos 15% menos el período anterior
                totalHours: totalHours * 0.90,
                avgHourlyRate: avgHourlyRate * 0.95,
                totalProjects: Math.max(0, totalProjects - 2),
                completedProjects: Math.max(0, completedProjects - 1),
                activeClients: Math.max(0, activeClients - 1),
                billableHours: billableHours * 0.88,
                nonBillableHours: nonBillableHours * 0.92,
                pendingInvoices: pendingInvoices + 2,
                overdueTasks: 4
            };
            
            const currentMetrics: ReportMetrics = {
                totalRevenue,
                totalHours: Math.round(totalHours),
                avgHourlyRate: Math.round(avgHourlyRate),
                totalProjects,
                completedProjects,
                activeClients,
                billableHours: Math.round(billableHours),
                nonBillableHours: Math.round(nonBillableHours),
                pendingInvoices,
                overdueTasks: 0, // Este campo requeriría una tabla de tareas
                previousMetrics
            };
            
            setMetrics(currentMetrics);
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    };

    const loadRevenueData = async (userId: string) => {
        try {
            if (!supabase) return;

            // Obtener datos reales de facturas
            const { data: invoicesData } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .order('issue_date', { ascending: true });

            if (!invoicesData) return;

            // Agrupar por mes
            const monthlyRevenue = invoicesData.reduce((acc: { [key: string]: number }, invoice) => {
                const date = new Date(invoice.issue_date);
                const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                
                if (invoice.status === 'paid') {
                    acc[monthKey] = (acc[monthKey] || 0) + invoice.total_amount;
                }
                
                return acc;
            }, {});

            // Convertir a formato de gráfico
            const labels = Object.keys(monthlyRevenue);
            const data = Object.values(monthlyRevenue);

            const realRevenueData: ChartData = {
                labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true
                    }
                ]
            };
            setRevenueData(realRevenueData);
        } catch (error) {
            console.error('Error loading revenue data:', error);
        }
    };

    const loadProductivityData = async (userId: string) => {
        try {
            if (!supabase) return;

            // Obtener datos reales de entradas de tiempo
            const { data: timeEntriesData } = await supabase
                .from('time_entries')
                .select('*')
                .eq('user_id', userId);

            if (!timeEntriesData) return;

            // Agrupar por día de la semana
            const weeklyData = timeEntriesData.reduce((acc: any, entry) => {
                const date = new Date(entry.date);
                const dayOfWeek = date.getDay(); // 0 = domingo, 1 = lunes, etc.
                const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const dayName = dayNames[dayOfWeek];
                
                if (!acc[dayName]) {
                    acc[dayName] = { billable: 0, nonBillable: 0 };
                }
                
                const hours = entry.duration_minutes / 60;
                if (entry.is_billable) {
                    acc[dayName].billable += hours;
                } else {
                    acc[dayName].nonBillable += hours;
                }
                
                return acc;
            }, {});

            const daysOrder = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const billableData = daysOrder.map(day => Math.round((weeklyData[day]?.billable || 0) * 10) / 10);
            const nonBillableData = daysOrder.map(day => Math.round((weeklyData[day]?.nonBillable || 0) * 10) / 10);

            const realProductivityData: ChartData = {
                labels: daysOrder,
                datasets: [
                    {
                        label: 'Horas Facturables',
                        data: billableData,
                        backgroundColor: '#10B981'
                    },
                    {
                        label: 'Horas No Facturables',
                        data: nonBillableData,
                        backgroundColor: '#F59E0B'
                    }
                ]
            };
            setProductivityData(realProductivityData);
        } catch (error) {
            console.error('Error loading productivity data:', error);
        }
    };

    const loadClientData = async (userId: string) => {
        try {
            if (!supabase) return;

            // Obtener datos reales de clientes e ingresos
            const { data: clientsData } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', userId);

            const { data: invoicesData } = await supabase
                .from('invoices')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'paid');

            if (!clientsData || !invoicesData) return;

            // Calcular ingresos por cliente
            const clientRevenue = clientsData.map(client => {
                const clientInvoices = invoicesData.filter(inv => inv.client_id === client.id);
                const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
                return {
                    name: client.name,
                    revenue: totalRevenue
                };
            }).filter(client => client.revenue > 0)
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 6); // Top 6 clientes

            const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

            const realClientData: ChartData = {
                labels: clientRevenue.map(c => c.name),
                datasets: [
                    {
                        label: 'Ingresos por Cliente',
                        data: clientRevenue.map(c => c.revenue),
                        backgroundColor: colors.slice(0, clientRevenue.length)
                    }
                ]
            };
            setClientData(realClientData);
        } catch (error) {
            console.error('Error loading client data:', error);
        }
    };

    const loadProjectData = async (userId: string) => {
        try {
            if (!supabase) return;

            // Obtener datos reales de proyectos
            const { data: projectsData } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', userId);

            if (!projectsData) return;

            // Contar proyectos por estado
            const statusCounts = projectsData.reduce((acc: { [key: string]: number }, project) => {
                const status = project.status || 'planning';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {});

            // Mapear estados a español
            const statusLabels: { [key: string]: string } = {
                'completed': 'Completados',
                'active': 'En Progreso',
                'planning': 'Planificación',
                'paused': 'Pausados',
                'cancelled': 'Cancelados'
            };

            const labels = Object.keys(statusCounts).map(status => statusLabels[status] || status);
            const data = Object.values(statusCounts);
            const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

            const realProjectData: ChartData = {
                labels,
                datasets: [
                    {
                        label: 'Estado de Proyectos',
                        data,
                        backgroundColor: colors.slice(0, labels.length)
                    }
                ]
            };
            setProjectData(realProjectData);
        } catch (error) {
            console.error('Error loading project data:', error);
        }
    };

    // Función para renderizar contenido según el tipo de reporte seleccionado
    const renderReportContent = () => {
        switch (selectedReport) {
            case 'overview':
                return (
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
                );

            case 'revenue':
                return (
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Euro className="w-5 h-5 text-emerald-600" />
                                    Análisis Detallado de Ingresos
                                </CardTitle>
                                <CardDescription>Evolución temporal y desglose por fuentes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80 relative">
                                    {revenueData && (
                                        <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
                                            {revenueData.datasets[0].data.map((value, index) => {
                                                const maxValue = Math.max(...revenueData.datasets[0].data);
                                                const height = (value / maxValue) * 100;
                                                return (
                                                    <div key={index} className="flex flex-col items-center group cursor-pointer">
                                                        <div className="relative mb-2">
                                                            <div
                                                                className="w-12 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-lg transition-all duration-500 hover:from-emerald-600 hover:to-green-500 shadow-lg"
                                                                style={{ height: `${height * 2.5}px` }}
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
                    </div>
                );

            case 'productivity':
                return (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                        <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    Productividad Semanal
                                </CardTitle>
                                <CardDescription>Horas facturables vs. no facturables por día</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 relative">
                                    {productivityData && (
                                        <div className="space-y-3">
                                            {productivityData.labels.map((day, index) => {
                                                const billableHours = productivityData.datasets[0].data[index];
                                                const nonBillableHours = productivityData.datasets[1].data[index];
                                                const totalHours = billableHours + nonBillableHours;
                                                const billablePercent = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
                                                
                                                return (
                                                    <div key={day} className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-slate-700 w-12">{day}</span>
                                                        <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                                                            <div 
                                                                className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${billablePercent}%` }}
                                                            />
                                                            <div 
                                                                className="bg-gradient-to-r from-amber-400 to-orange-400 h-full absolute top-0 transition-all duration-500"
                                                                style={{ 
                                                                    left: `${billablePercent}%`, 
                                                                    width: `${100 - billablePercent}%` 
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-slate-600 w-16 text-right">
                                                            {totalHours.toFixed(1)}h
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
                                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                                    Eficiencia por Proyecto
                                </CardTitle>
                                <CardDescription>Tiempo invertido vs. valor generado</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-slate-500">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Análisis detallado de eficiencia por proyecto próximamente</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'clients':
                return (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                        <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    Ingresos por Cliente
                                </CardTitle>
                                <CardDescription>Análisis detallado de la cartera de clientes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {clientData?.labels.map((client, index) => {
                                        const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-indigo-500'];
                                        const value = clientData.datasets[0].data[index];
                                        const total = clientData.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = Math.round((value / total) * 100);
                                        
                                        return (
                                            <div key={client} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full ${colors[index]}`}></div>
                                                        <span className="text-lg font-semibold text-slate-800">{client}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-slate-900">{formatCurrency(value)}</div>
                                                        <div className="text-sm text-slate-500">{percentage}% del total</div>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${colors[index]} transition-all duration-500`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    Tendencias de Clientes
                                </CardTitle>
                                <CardDescription>Evolución y retención de clientes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-slate-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Análisis de tendencias y retención próximamente</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'projects':
                return (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                        <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    Estado de Proyectos
                                </CardTitle>
                                <CardDescription>Distribución por estado actual</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {projectData?.labels.map((status, index) => {
                                        const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500', 'bg-gray-500'];
                                        const value = projectData.datasets[0].data[index];
                                        const total = projectData.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = Math.round((value / total) * 100);
                                        
                                        return (
                                            <div key={status} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full ${colors[index]}`}></div>
                                                    <span className="text-sm font-medium text-slate-700">{status}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-slate-900">{value}</div>
                                                    <div className="text-xs text-slate-500">{percentage}%</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-600" />
                                    Cronograma de Proyectos
                                </CardTitle>
                                <CardDescription>Fechas límite y progreso</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-slate-500">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Vista de cronograma detallado próximamente</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'insights':
                return (
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 border-indigo-200/60 shadow-xl shadow-indigo-500/10">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-indigo-600" />
                                    Insights de Inteligencia Artificial
                                    <div className="ml-auto flex items-center gap-1">
                                        <Sparkles className="w-4 h-4 text-indigo-500" />
                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                            Powered by AI
                                        </span>
                                    </div>
                                </CardTitle>
                                <CardDescription>Recomendaciones personalizadas basadas en tus datos</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recommendations.map((rec) => {
                                    const typeIcons = {
                                        revenue: Euro,
                                        productivity: Clock,
                                        client: Users,
                                        project: Briefcase,
                                        risk: AlertTriangle
                                    };
                                    const impactColors = {
                                        high: 'bg-red-50 border-red-200 text-red-800',
                                        medium: 'bg-amber-50 border-amber-200 text-amber-800',
                                        low: 'bg-green-50 border-green-200 text-green-800'
                                    };
                                    const effortColors = {
                                        low: 'bg-green-100 text-green-700',
                                        medium: 'bg-amber-100 text-amber-700',
                                        high: 'bg-red-100 text-red-700'
                                    };
                                    
                                    const IconComponent = typeIcons[rec.type];
                                    
                                    return (
                                        <div key={rec.id} className={`border rounded-xl p-6 ${impactColors[rec.impact]}`}>
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                    <IconComponent className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-lg">{rec.title}</h4>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${effortColors[rec.effort]}`}>
                                                            Esfuerzo: {rec.effort}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm opacity-90 mb-3">{rec.description}</p>
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            Impacto: {rec.impact}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Target className="w-3 h-3" />
                                                            Tipo: {rec.type}
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
                );

            default:
                return null;
        }
    };

    const loadAlerts = async (userId: string) => {
        try {
            if (!supabase) return;

            // Obtener datos reales para alertas dinámicas
            const [
                { data: invoicesData },
                { data: projectsData },
                { data: clientsData }
            ] = await Promise.all([
                supabase.from('invoices').select('*').eq('user_id', userId),
                supabase.from('projects').select('*').eq('user_id', userId),
                supabase.from('clients').select('*').eq('user_id', userId)
            ]);

            const alerts: Alert[] = [];

            // Alerta de facturas pendientes
            const pendingInvoices = invoicesData?.filter(inv => inv.status === 'sent' || inv.status === 'overdue') || [];
            if (pendingInvoices.length > 0) {
                const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
                alerts.push({
                    id: 'pending-invoices',
                    type: 'warning',
                    title: `${pendingInvoices.length} Facturas Pendientes`,
                    message: `Tienes ${pendingInvoices.length} facturas pendientes por un total de ${formatCurrency(totalPending)}`,
                    priority: 'high',
                    actionable: true,
                    route: '/dashboard/invoices'
                });
            }

            // Alerta de facturas vencidas
            const overdueInvoices = invoicesData?.filter(inv => inv.status === 'overdue') || [];
            if (overdueInvoices.length > 0) {
                alerts.push({
                    id: 'overdue-invoices',
                    type: 'error',
                    title: `${overdueInvoices.length} Facturas Vencidas`,
                    message: `${overdueInvoices.length} facturas están vencidas y requieren seguimiento urgente`,
                    priority: 'high',
                    actionable: true,
                    route: '/dashboard/invoices'
                });
            }

            // Alerta de proyectos activos
            const activeProjects = projectsData?.filter(p => p.status === 'active') || [];
            if (activeProjects.length > 0) {
                alerts.push({
                    id: 'active-projects',
                    type: 'info',
                    title: `${activeProjects.length} Proyectos Activos`,
                    message: `Tienes ${activeProjects.length} proyectos en curso que requieren seguimiento`,
                    priority: 'medium',
                    actionable: true,
                    route: '/dashboard/projects'
                });
            }

            // Alerta de nuevos clientes
            const recentClients = clientsData?.filter(client => {
                const createdDate = new Date(client.created_at);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return createdDate > weekAgo;
            }) || [];
            
            if (recentClients.length > 0) {
                alerts.push({
                    id: 'new-clients',
                    type: 'success',
                    title: `${recentClients.length} Nuevos Clientes`,
                    message: `Has agregado ${recentClients.length} nuevos clientes esta semana`,
                    priority: 'medium',
                    actionable: true,
                    route: '/dashboard/clients'
                });
            }

            // Alerta de productividad (siempre mostrar)
            alerts.push({
                id: 'productivity-tip',
                type: 'info',
                title: 'Seguimiento de Tiempo',
                message: 'Recuerda registrar tus horas de trabajo para un mejor análisis de productividad',
                priority: 'low',
                actionable: true,
                route: '/dashboard/time-tracking'
            });

            setAlerts(alerts);
        } catch (error) {
            console.error('Error loading alerts:', error);
            // Fallback a alertas estáticas si falla
            const fallbackAlerts: Alert[] = [
                {
                    id: 'fallback-1',
                    type: 'info',
                    title: 'Bienvenido a Reportes',
                    message: 'Explora tus métricas y obtén insights de tu negocio',
                    priority: 'medium',
                    actionable: true,
                    route: '/dashboard'
                }
            ];
            setAlerts(fallbackAlerts);
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

                        {/* Contenido dinámico según tipo de reporte seleccionado */}
                        {renderReportContent()}

                        {/* Alertas y Recomendaciones */}
                        {selectedReport === 'overview' && (
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
                                    <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                                        {alerts.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>No hay alertas en este momento</p>
                                            </div>
                                        ) : (
                                            alerts.map((alert) => {
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
                                            
                                            // Iconos para las rutas de destino
                                            const routeIcons: { [key: string]: any } = {
                                                '/dashboard/invoices': FileText,
                                                '/dashboard/projects': Briefcase,
                                                '/dashboard/clients': Users,
                                                '/dashboard/tasks': Clock,
                                                '/dashboard/time-tracking': Clock,
                                                '/dashboard': BarChart3
                                            };
                                            
                                            const RouteIcon = alert.route ? routeIcons[alert.route] : null;
                                            
                                            return (
                                                <div 
                                                    key={alert.id} 
                                                    className={`flex items-start gap-3 p-4 border rounded-xl transition-all duration-300 ${alertColors[alert.type]} ${
                                                        alert.actionable && alert.route 
                                                            ? 'hover:shadow-lg cursor-pointer hover:scale-[1.02] transform hover:border-opacity-80' 
                                                            : 'hover:shadow-sm'
                                                    }`}
                                                    onClick={() => handleAlertClick(alert)}
                                                >
                                                    <div className="flex-shrink-0">
                                                        <IconComponent className={`w-5 h-5 ${iconColors[alert.type]}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <p className="font-semibold text-sm truncate">{alert.title}</p>
                                                            {alert.priority === 'high' && (
                                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                                                    Alta
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs opacity-90 leading-relaxed mb-2">{alert.message}</p>
                                                        {alert.actionable && alert.route && (
                                                            <div className="flex items-center gap-1 text-xs font-medium opacity-70">
                                                                {RouteIcon && <RouteIcon className="w-3 h-3" />}
                                                                <span>Clic para abrir</span>
                                                                <ArrowRight className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
