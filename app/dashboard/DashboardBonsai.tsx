// src/app/dashboard/DashboardClient.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import {
    ArrowRight,
    Briefcase,
    CheckCircle,
    Clock,
    DollarSign,
    Target,
    TrendingUp,
    User,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipos básicos
interface Project {
    id: string;
    name: string;
    status: string;
    created_at: string;
}

export default function DashboardBonsai({
    userEmail,
    isDemo = false,
    totalTaskTime = 0
}: {
    userEmail: string;
    isDemo?: boolean;
    totalTaskTime?: number;
}) {
    console.log('🚀 DashboardBonsai INICIADO:', { userEmail, isDemo, totalTaskTime });
    const supabase = createSupabaseClient();
    const router = useRouter();

    // Hook de trial status
    const { trialInfo, loading: trialLoading, hasReachedLimit, canUseFeatures } = useTrialStatus(userEmail);

    // Estados para las métricas
    const [metrics, setMetrics] = useState({
        totalClients: 0,
        activeProjects: 0,
        completedProjects: 0,
        monthlyRevenue: 0,
        hoursThisWeek: 0,
        hoursThisMonth: 0,
        billableHoursThisWeek: 0
    });

    // Estado para los datos de la gráfica mensual
    const [monthlyChartData, setMonthlyChartData] = useState([
        { month: 'Mar', value: 0, amount: 0 },
        { month: 'Abr', value: 0, amount: 0 },
        { month: 'May', value: 0, amount: 0 },
        { month: 'Jun', value: 0, amount: 0 },
        { month: 'Jul', value: 0, amount: 0 },
        { month: 'Ago', value: 0, amount: 0 }
    ]);

    // Estados para datos dinámicos
    const [realProjects, setRealProjects] = useState<any[]>([]);
    const [realClients, setRealClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [recentActivity, setRecentActivity] = useState<Array<{
        id: string;
        type: string;
        title: string;
        subtitle: string;
        date: string;
        icon: string;
    }>>([]);

    const handleLogout = async () => {
        try {
            if (isDemo) {
                router.push('/login');
                return;
            }
            if (supabase) {
                await supabase.auth.signOut();
            }
            router.push('/login');
        } catch (error) {
            console.error('Error in handleLogout:', error);
        }
    };

    // Cargar métricas del dashboard
    const loadDashboardData = async () => {
        console.log('🔥 loadDashboardData EJECUTÁNDOSE');
        try {
            setLoading(true);

            // ✅ Si está en modo demo, usar datos ficticios
            if (isDemo) {
                console.log('🎭 Modo DEMO activado - usando datos ficticios');
                setMetrics({
                    totalClients: 12,
                    activeProjects: 5,
                    completedProjects: 8,
                    monthlyRevenue: 15750,
                    hoursThisWeek: 28,
                    hoursThisMonth: 140,
                    billableHoursThisWeek: 25
                });

                setRecentActivity([
                    {
                        id: '1',
                        type: 'project',
                        title: 'Nuevo proyecto creado',
                        subtitle: 'Diseño de App Móvil para TechCorp',
                        date: '2 horas',
                        icon: 'briefcase'
                    },
                    {
                        id: '2',
                        type: 'client',
                        title: 'Cliente agregado',
                        subtitle: 'María González - Consultoría Digital',
                        date: '1 día',
                        icon: 'user'
                    },
                    {
                        id: '3',
                        type: 'task',
                        title: 'Tarea completada',
                        subtitle: 'Wireframes de la landing page',
                        date: '2 días',
                        icon: 'clock'
                    }
                ]);

                setRealProjects([
                    {
                        id: '1',
                        name: 'Rediseño Web Corporativo',
                        status: 'active',
                        client_name: 'TechCorp Solutions',
                        budget: 8500,
                        created_at: '2024-01-15'
                    },
                    {
                        id: '2',
                        name: 'App Móvil E-commerce',
                        status: 'in_progress',
                        client_name: 'Digital Store SA',
                        budget: 12000,
                        created_at: '2024-01-10'
                    }
                ]);

                setRealClients([
                    {
                        id: '1',
                        name: 'TechCorp Solutions',
                        email: 'contact@techcorp.com',
                        company: 'TechCorp',
                        created_at: '2024-01-01'
                    },
                    {
                        id: '2',
                        name: 'María González',
                        email: 'maria@consultoria.com',
                        company: 'Consultoría Digital',
                        created_at: '2024-01-05'
                    }
                ]);

                setLoading(false);
                return;
            }

            console.log('💼 Modo REAL activado - cargando datos de Supabase');
            console.log('🔍 isDemo =', isDemo);

            if (!supabase) {
                console.error('Supabase client not available');
                setLoading(false);
                return;
            }

            // Obtener usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('No user found');
                setLoading(false);
                return;
            }

            // Cargar métricas reales
            const [
                { data: clients },
                { data: allProjects },
                { data: invoices },
                { data: weeklyTimeData },
                { data: monthlyTimeData }
            ] = await Promise.all([
                supabase.from('clients').select('*').eq('user_id', user.id),
                supabase.from('projects').select('*').eq('user_id', user.id),
                supabase.from('invoices').select('amount, created_at, issue_date, paid_date').eq('status', 'paid').eq('user_id', user.id),
                supabase.from('time_entries').select('duration_seconds').eq('user_id', user.id),
                supabase.from('time_entries').select('duration_seconds').eq('user_id', user.id)
            ]);

            const activeProjects = allProjects?.filter((p: Project) =>
                p.status === 'active' || p.status === 'in_progress'
            ) || [];

            const completedProjects = allProjects?.filter((p: Project) =>
                p.status === 'completed'
            ) || [];

            const totalMinutesThisWeek = weeklyTimeData?.reduce((sum: number, entry: any) => sum + (entry.duration_seconds / 60), 0) || 0;
            const billableMinutesThisWeek = weeklyTimeData?.reduce((sum: number, entry: any) =>
                sum + (entry.duration_seconds ? entry.duration_seconds / 60 : 0), 0) || 0;

            const totalRevenue = invoices?.reduce((sum: number, invoice: any) => {
                return sum + (invoice.amount || 0);
            }, 0) || 0;

            console.log('💰 Facturas encontradas:', invoices?.length || 0);
            console.log('💰 Total ingresos calculado:', totalRevenue);
            console.log('🔍 Facturas para gráfica:', invoices);

            // Calcular ingresos por mes para la gráfica
            const monthlyData = [
                { month: 'Mar', value: 0, amount: 0 },
                { month: 'Abr', value: 0, amount: 0 },
                { month: 'May', value: 0, amount: 0 },
                { month: 'Jun', value: 0, amount: 0 },
                { month: 'Jul', value: 0, amount: 0 },
                { month: 'Ago', value: 0, amount: 0 }
            ];

            // Sumar facturas por mes usando issue_date (fecha de emisión)
            invoices?.forEach((invoice: any) => {
                // Usar issue_date si existe, sino created_at
                const dateStr = invoice.issue_date || invoice.created_at;
                const invoiceDate = new Date(dateStr);
                const month = invoiceDate.getMonth(); // 0-11
                const year = invoiceDate.getFullYear();

                console.log('📅 Procesando factura:', {
                    amount: invoice.amount,
                    issue_date: invoice.issue_date,
                    created_at: invoice.created_at,
                    month: invoiceDate.getMonth() + 1,
                    year
                });

                if (year === 2025) {
                    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    const monthName = monthNames[month];
                    const chartMonth = monthlyData.find(m => m.month === monthName);
                    if (chartMonth) {
                        chartMonth.amount += parseFloat(invoice.amount) || 0;
                        console.log(`💰 Agregando €${invoice.amount} a ${monthName}. Total: €${chartMonth.amount}`);
                    }
                }
            });

            console.log('📊 Datos mensuales finales:', monthlyData);

            // Calcular valores relativos para la gráfica (basado en el máximo)
            const maxAmount = Math.max(...monthlyData.map(m => m.amount));
            monthlyData.forEach(month => {
                month.value = maxAmount > 0 ? Math.round((month.amount / maxAmount) * 100) : 0;
            });

            setMonthlyChartData(monthlyData);

            const totalMinutesThisMonth = monthlyTimeData?.reduce((sum: number, entry: any) => sum + (entry.duration_seconds / 60), 0) || 0;

            setMetrics({
                totalClients: clients?.length || 0,
                activeProjects: activeProjects.length,
                completedProjects: completedProjects.length,
                monthlyRevenue: totalRevenue,
                hoursThisWeek: Math.round((totalMinutesThisWeek / 60) * 10) / 10,
                hoursThisMonth: Math.round((totalMinutesThisMonth / 60) * 10) / 10,
                billableHoursThisWeek: Math.round((billableMinutesThisWeek / 60) * 10) / 10
            });

            setRealProjects(allProjects?.slice(0, 5) || []);
            setRealClients(clients?.slice(0, 5) || []);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRecentActivity = async () => {
        // En modo demo ya está cargado
        if (isDemo) return;

        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Obtener actividad reciente simulada basada en datos reales
            const { data: recentProjects } = await supabase
                .from('projects')
                .select('id, name, created_at, client_id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            const { data: recentClients } = await supabase
                .from('clients')
                .select('id, name, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(2);

            const activity: Array<{
                id: string;
                type: string;
                title: string;
                subtitle: string;
                date: string;
                icon: string;
            }> = [];

            // Agregar proyectos recientes
            recentProjects?.forEach((project: Project) => {
                activity.push({
                    id: project.id,
                    type: 'project',
                    title: 'Proyecto creado',
                    subtitle: project.name,
                    date: new Date(project.created_at).toLocaleDateString('es-ES'),
                    icon: 'briefcase'
                });
            });

            // Agregar clientes recientes
            recentClients?.forEach(client => {
                activity.push({
                    id: client.id,
                    type: 'client',
                    title: 'Cliente agregado',
                    subtitle: client.name,
                    date: new Date(client.created_at).toLocaleDateString('es-ES'),
                    icon: 'user'
                });
            });

            // Ordenar por fecha más reciente
            activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setRecentActivity(activity.slice(0, 5));

        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    };

    useEffect(() => {
        loadDashboardData();
        loadRecentActivity();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="ml-56 min-h-screen">
                {/* Trial Banner - Solo si no es demo */}
                {!isDemo && <TrialBanner userEmail={userEmail} />}

                {/* Header estilo Bonsai */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Hola, {userEmail?.split('@')[0] || 'Usuario'}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Aquí tienes el resumen de tu actividad
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-700">En línea</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-sm text-gray-600">Cargando dashboard...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Estadísticas Principales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                                {/* Total Clients */}
                                <div
                                    onClick={() => router.push('/dashboard/clients')}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Users className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Clientes</p>
                                                    <p className="text-2xl font-semibold text-gray-900">{metrics.totalClients}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Projects */}
                                <div
                                    onClick={() => router.push('/dashboard/projects')}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Briefcase className="h-8 w-8 text-green-600" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                                                    <p className="text-2xl font-semibold text-gray-900">{metrics.activeProjects}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Completed Projects */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-8 w-8 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Completados</p>
                                            <p className="text-2xl font-semibold text-gray-900">{metrics.completedProjects}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Revenue */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <DollarSign className="h-8 w-8 text-amber-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Ingresos</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                €{metrics.monthlyRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Task Time */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Clock className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">TIEMPO ACUMULADO (Clyra)</p>
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {(() => {
                                                    const h = Math.floor(totalTaskTime / 3600);
                                                    const m = Math.floor((totalTaskTime % 3600) / 60);
                                                    return `${h}h ${m}m`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gráficos y Estadísticas Adicionales - Estilo Bonsai */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Gráfico de Ingresos por Mes - Estilo Bonsai */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Ingresos Mensuales</h3>
                                            <p className="text-sm text-gray-600">Últimos 6 meses</p>
                                        </div>
                                    </div>

                                    {/* Gráfico de barras limpio */}
                                    <div className="space-y-4">
                                        <div className="flex items-end justify-between h-40 gap-3 px-2">
                                            {monthlyChartData.map((bar, index) => (
                                                <div key={bar.month} className="flex flex-col items-center flex-1 group">
                                                    <div className="relative w-full h-32 mb-2">
                                                        {/* Fondo de la barra */}
                                                        <div className="absolute bottom-0 w-full h-32 bg-gray-100 rounded"></div>
                                                        {/* Barra de datos */}
                                                        <div
                                                            className="absolute bottom-0 w-full bg-blue-600 rounded transition-all duration-700 ease-out group-hover:bg-blue-700"
                                                            style={{
                                                                height: `${Math.max(bar.value, 10)}%`,
                                                                minHeight: '8px'
                                                            }}
                                                        ></div>
                                                        {/* Tooltip hover */}
                                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                            €{bar.amount.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs font-medium text-gray-700">{bar.month}</p>
                                                        <p className="text-xs text-gray-500">€{(bar.amount / 1000).toFixed(1)}k</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Distribución de Tiempo - Estilo Bonsai */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Tiempo por Categoría</h3>
                                            <p className="text-sm text-gray-600">Esta semana</p>
                                        </div>
                                    </div>

                                    {/* Distribución de tiempo */}
                                    <div className="space-y-4">
                                        {[
                                            { category: 'Desarrollo', hours: Math.round(metrics.hoursThisWeek * 0.4), color: 'bg-blue-600', percentage: 40 },
                                            { category: 'Diseño', hours: Math.round(metrics.hoursThisWeek * 0.25), color: 'bg-purple-600', percentage: 25 },
                                            { category: 'Reuniones', hours: Math.round(metrics.hoursThisWeek * 0.2), color: 'bg-orange-600', percentage: 20 },
                                            { category: 'Administración', hours: Math.round(metrics.hoursThisWeek * 0.15), color: 'bg-gray-600', percentage: 15 }
                                        ].map((item, index) => (
                                            <div key={item.category} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                                                    <span className="text-sm text-gray-600">{item.hours}h ({item.percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                                                        style={{
                                                            width: `${item.percentage}%`,
                                                            animationDelay: `${index * 200}ms`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Estadísticas Adicionales - Estilo Bonsai */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {/* Proyectos Completados */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                    <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900">{metrics.completedProjects}</h4>
                                    <p className="text-sm text-gray-600">Completados</p>
                                </div>

                                {/* Facturación Promedio */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900">
                                        €{metrics.completedProjects > 0 ? Math.round(metrics.monthlyRevenue / metrics.completedProjects).toLocaleString() : '0'}
                                    </h4>
                                    <p className="text-sm text-gray-600">Por proyecto</p>
                                </div>

                                {/* Horas Facturables */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900">{metrics.billableHoursThisWeek}h</h4>
                                    <p className="text-sm text-gray-600">Facturables</p>
                                </div>

                                {/* Eficiencia */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                                    <div className="w-12 h-12 bg-orange-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900">
                                        {metrics.hoursThisWeek > 0 ? Math.round((metrics.billableHoursThisWeek / metrics.hoursThisWeek) * 100) : 0}%
                                    </h4>
                                    <p className="text-sm text-gray-600">Eficiencia</p>
                                </div>
                            </div>

                            {/* Productividad Semanal - Estilo Bonsai */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Productividad Semanal</h3>
                                        <p className="text-sm text-gray-600">Horas por día</p>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between h-40 gap-3">
                                    {[
                                        { day: 'Lun', hours: 8.5, percentage: 85 },
                                        { day: 'Mar', hours: 7.2, percentage: 72 },
                                        { day: 'Mié', hours: 9.1, percentage: 91 },
                                        { day: 'Jue', hours: 6.8, percentage: 68 },
                                        { day: 'Vie', hours: 7.5, percentage: 75 },
                                        { day: 'Sáb', hours: 3.2, percentage: 32 },
                                        { day: 'Dom', hours: 1.5, percentage: 15 }
                                    ].map((day, index) => (
                                        <div key={day.day} className="flex-1 flex flex-col items-center">
                                            <div className="w-full bg-gray-100 rounded-t overflow-hidden mb-2 relative group" style={{ height: '120px' }}>
                                                <div
                                                    className="w-full bg-emerald-600 transition-all duration-700 rounded-t relative group-hover:bg-emerald-700"
                                                    style={{
                                                        height: `${day.percentage}%`,
                                                        animationDelay: `${index * 150}ms`
                                                    }}
                                                ></div>
                                                {/* Tooltip */}
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                    {day.hours}h
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-gray-700">{day.day}</p>
                                                <p className="text-xs font-bold text-gray-900 mt-1">{day.hours}h</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Proyectos Recientes */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">Proyectos Recientes</h3>
                                            <button
                                                onClick={() => router.push('/dashboard/projects')}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Ver todos
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {realProjects.length === 0 ? (
                                            <div className="text-center py-6">
                                                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">No hay proyectos</h4>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Crea tu primer proyecto para comenzar
                                                </p>
                                                <button
                                                    onClick={() => router.push('/dashboard/projects')}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Crear proyecto
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {realProjects.slice(0, 5).map((project) => (
                                                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                                                <span className="text-white text-sm font-medium">
                                                                    {project.name?.charAt(0).toUpperCase() || 'P'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                                                                <p className="text-xs text-gray-600">
                                                                    {project.client_name || 'Sin cliente'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' :
                                                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                    project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {project.status === 'active' ? 'Activo' :
                                                                    project.status === 'completed' ? 'Completado' :
                                                                        project.status === 'paused' ? 'Pausado' :
                                                                            project.status === 'in_progress' ? 'En progreso' : 'Planificación'}
                                                            </span>
                                                            {project.budget && (
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    €{project.budget.toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actividad Reciente */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
                                    </div>
                                    <div className="p-6">
                                        {recentActivity.length === 0 ? (
                                            <div className="text-center py-6">
                                                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">Sin actividad reciente</h4>
                                                <p className="text-sm text-gray-600">
                                                    La actividad aparecerá aquí cuando comiences a trabajar
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentActivity.map((activity) => {
                                                    const IconComponent = activity.icon === 'briefcase' ? Briefcase :
                                                        activity.icon === 'clock' ? Clock : User;

                                                    return (
                                                        <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.icon === 'briefcase' ? 'bg-blue-100 text-blue-600' :
                                                                activity.icon === 'clock' ? 'bg-green-100 text-green-600' :
                                                                    'bg-purple-100 text-purple-600'
                                                                }`}>
                                                                <IconComponent className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {activity.title}
                                                                </p>
                                                                <p className="text-sm text-gray-600 truncate">
                                                                    {activity.subtitle}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {activity.date}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Top Clientes por Ingresos - Estilo Bonsai */}
                            <div className="mt-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">Top Clientes por Ingresos</h3>
                                            <button
                                                onClick={() => router.push('/dashboard/clients')}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Ver todos
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {[
                                                { name: 'TechCorp Solutions', revenue: Math.round(metrics.monthlyRevenue * 0.35) || 5250, percentage: 100 },
                                                { name: 'Digital Innovations', revenue: Math.round(metrics.monthlyRevenue * 0.25) || 3750, percentage: 75 },
                                                { name: 'StartupHub', revenue: Math.round(metrics.monthlyRevenue * 0.20) || 3000, percentage: 60 },
                                                { name: 'Creative Agency', revenue: Math.round(metrics.monthlyRevenue * 0.15) || 2250, percentage: 45 },
                                                { name: 'Local Business', revenue: Math.round(metrics.monthlyRevenue * 0.05) || 750, percentage: 20 }
                                            ].map((client, index) => (
                                                <div key={client.name} className="group hover:bg-gray-50 rounded-lg p-3 transition-all duration-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                                {index + 1}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                                                                {client.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900">
                                                            €{client.revenue.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-600 transition-all duration-1000 rounded-full"
                                                            style={{
                                                                width: `${client.percentage}%`,
                                                                animationDelay: `${index * 200}ms`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clientes Recientes */}
                            <div className="mt-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">Clientes Recientes</h3>
                                            <button
                                                onClick={() => router.push('/dashboard/clients')}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                Ver todos
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {realClients.length === 0 ? (
                                            <div className="text-center py-6">
                                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">No hay clientes</h4>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    Agrega tu primer cliente para comenzar
                                                </p>
                                                <button
                                                    onClick={() => router.push('/dashboard/clients')}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Agregar cliente
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {realClients.slice(0, 6).map((client) => (
                                                    <div key={client.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                                            <span className="text-white font-medium">
                                                                {client.name?.charAt(0).toUpperCase() || 'C'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                {client.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-600 truncate">
                                                                {client.company || client.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
