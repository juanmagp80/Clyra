// src/app/dashboard/DashboardClient.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import {
    Briefcase,
    Clock,
    DollarSign,
    Target,
    TrendingUp,
    User,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardClient({
    userEmail,
    isDemo = false
}: {
    userEmail: string;
    isDemo?: boolean;
}) {
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
        console.log('🔧 handleLogout called'); // Debug log
        try {
            if (isDemo) {
                console.log('🔧 Demo mode - redirecting to login'); // Debug log
                router.push('/login');
                return;
            }
            console.log('🔧 Calling supabase signOut'); // Debug log
            if (supabase) {
                await supabase.auth.signOut();
                console.log('🔧 Supabase signOut completed'); // Debug log
            }
            console.log('🔧 Redirecting to login'); // Debug log
            router.push('/login');
        } catch (error) {
            console.error('🔧 Error in handleLogout:', error); // Debug log
        }
    };

    // Cargar métricas del dashboard
    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // ✅ Si está en modo demo, usar datos ficticios
            if (isDemo) {
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
                        subtitle: 'María González - Startup Local',
                        date: '1 día',
                        icon: 'user'
                    },
                    {
                        id: '3',
                        type: 'time',
                        title: 'Tiempo registrado',
                        subtitle: '4.5 horas en desarrollo frontend',
                        date: '2 días',
                        icon: 'clock'
                    }
                ]);

                setLoading(false);
                return;
            }

            // Verificar que supabase esté disponible
            if (!supabase) {
                setLoading(false);
                return;
            }

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            // Contar clientes
            const { count: clientsCount } = await supabase
                .from('clients')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Contar proyectos por estado
            const { data: projectsData } = await supabase
                .from('projects')
                .select('status')
                .eq('user_id', user.id);

            const activeProjects = projectsData?.filter((p: any) => p.status === 'active').length || 0;
            const completedProjects = projectsData?.filter((p: any) => p.status === 'completed').length || 0;

            // Calcular ingresos del mes (facturas pagadas)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const { data: paidInvoicesData } = await supabase
                .from('invoices')
                .select('total_amount, issue_date, status')
                .eq('user_id', user.id)
                .eq('status', 'paid')
                .gte('issue_date', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);

            const monthlyRevenue = paidInvoicesData?.reduce((sum: number, invoice: any) => sum + (invoice.total_amount || 0), 0) || 0;

            // Calcular horas de esta semana
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const { data: weeklyTimeData } = await supabase
                .from('time_entries')
                .select('duration_minutes, is_billable')
                .eq('user_id', user.id)
                .gte('created_at', startOfWeek.toISOString());

            const totalMinutesThisWeek = weeklyTimeData?.reduce((sum: number, entry: any) => sum + entry.duration_minutes, 0) || 0;
            const billableMinutesThisWeek = weeklyTimeData?.reduce((sum: number, entry: any) =>
                sum + (entry.is_billable ? entry.duration_minutes : 0), 0) || 0;

            // Calcular horas de este mes
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const { data: monthlyTimeData } = await supabase
                .from('time_entries')
                .select('duration_minutes')
                .eq('user_id', user.id)
                .gte('created_at', startOfMonth.toISOString());

            const totalMinutesThisMonth = monthlyTimeData?.reduce((sum: number, entry: any) => sum + entry.duration_minutes, 0) || 0;

            // Actualizar todas las métricas
            setMetrics({
                totalClients: clientsCount || 0,
                activeProjects,
                completedProjects,
                monthlyRevenue,
                hoursThisWeek: Math.round((totalMinutesThisWeek / 60) * 10) / 10,
                hoursThisMonth: Math.round((totalMinutesThisMonth / 60) * 10) / 10,
                billableHoursThisWeek: Math.round((billableMinutesThisWeek / 60) * 10) / 10
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };


    // Cargar actividad reciente
    const loadRecentActivity = async () => {
        try {
            // Verificar que supabase esté disponible
            if (!supabase) return;

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            // Últimos proyectos creados
            const { data: recentProjects } = await supabase
                .from('projects')
                .select(`
                id,
                name,
                created_at,
                clients!inner(name)
            `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(2);

            // Últimos clientes añadidos
            const { data: recentClients } = await supabase
                .from('clients')
                .select('id, name, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(2);

            // Últimas entradas de tiempo
            const { data: recentTimeEntries } = await supabase
                .from('time_entries')
                .select(`
                id,
                description,
                duration_minutes,
                created_at,
                projects!left(name),
                clients!left(name)
            `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            // Combinar y ordenar actividad
            const activity = [
                ...(recentProjects?.map((project: any) => ({
                    id: project.id,
                    type: 'project',
                    title: `Nuevo proyecto: ${project.name}`,
                    subtitle: `Cliente: ${project.clients?.[0]?.name || 'Sin cliente'}`,
                    date: project.created_at,
                    icon: 'briefcase'
                })) || []),
                ...(recentClients?.map((client: any) => ({
                    id: client.id,
                    type: 'client',
                    title: `Nuevo cliente: ${client.name}`,
                    subtitle: 'Cliente añadido',
                    date: client.created_at,
                    icon: 'user'
                })) || []),
                ...(recentTimeEntries?.map((entry: any) => ({
                    id: entry.id,
                    type: 'time',
                    title: entry.description,
                    subtitle: `${Math.floor(entry.duration_minutes / 60)}h ${entry.duration_minutes % 60}m${(entry.projects as any)?.name ? ` • ${(entry.projects as any).name}` : ''}`,
                    date: entry.created_at,
                    icon: 'clock'
                })) || [])
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 6);

            setRecentActivity(activity);
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    };

    // Cargar proyectos reales para las alertas
    const loadRealProjects = async () => {
        try {
            if (!supabase) return;

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: projects } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .limit(5)
                .order('created_at', { ascending: false });

            setRealProjects(projects || []);
        } catch (error) {
            console.error('Error loading real projects:', error);
        }
    };

    useEffect(() => {
        loadDashboardData();
        loadRecentActivity();
        loadRealProjects();
    }, []);
    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            {/* Elementos decorativos de fondo mejorados con colores más suaves */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/4 via-purple-500/4 to-indigo-500/4 dark:from-blue-400/3 dark:via-purple-400/3 dark:to-indigo-400/3 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/4 via-pink-500/4 to-indigo-500/4 dark:from-purple-400/3 dark:via-pink-400/3 dark:to-indigo-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/4 via-blue-500/4 to-purple-500/4 dark:from-indigo-400/3 dark:via-blue-400/3 dark:to-purple-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            {/* Main Content - Responsive with proper spacing */}
            <div className="flex-1 pl-56 overflow-hidden relative">
                <div className="h-full overflow-y-auto">
                    {/* Trial Banner - Solo si no es demo */}
                    {!isDemo && <TrialBanner userEmail={userEmail} />}

                    <div className="min-h-screen relative bg-gradient-to-b from-transparent via-slate-50/20 to-blue-50/30">
                        <div className="container mx-auto px-4 lg:px-6 py-8">
                            {/* Header Premium con Animaciones */}
                            <div className="relative mb-8 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl"></div>
                                <div className="relative backdrop-blur-sm bg-white/70 dark:bg-slate-800/60 rounded-3xl p-8 border border-white/80 dark:border-slate-700/80 shadow-2xl shadow-blue-500/5 dark:shadow-purple-500/20 transition-all duration-300">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="space-y-2">
                                            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                ¡Hola {userEmail?.split('@')[0] || 'Usuario'}! 👋
                                            </h1>
                                            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                                                Aquí tienes el resumen de tu actividad
                                            </p>
                                        </div>
                                        <div className="mt-4 lg:mt-0 flex items-center gap-4">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-bold text-green-700 dark:text-green-300">En línea</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-purple-100 dark:border-purple-900/30 rounded-full"></div>
                                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Cargando dashboard
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400">Preparando tus métricas...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Estadísticas Principales - Diseño Premium */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                        {/* Total Clients */}
                                        <div
                                            onClick={() => router.push('/dashboard/clients')}
                                            className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-105"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300">
                                                        <Users className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                            Total
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                                        {metrics.totalClients}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-400 font-semibold">
                                                        Clientes
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">Cartera activa</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Projects */}
                                        <div
                                            onClick={() => router.push('/dashboard/projects')}
                                            className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/20 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer hover:scale-105"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all duration-300">
                                                        <Target className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                            Activos
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                                        {metrics.activeProjects}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-400 font-semibold">
                                                        Proyectos
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">En progreso</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Monthly Revenue */}
                                        <div
                                            onClick={() => router.push('/dashboard/invoices')}
                                            className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 hover:shadow-purple-500/20 dark:hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer hover:scale-105"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25 group-hover:shadow-purple-500/40 group-hover:scale-110 transition-all duration-300">
                                                        <DollarSign className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                                            Este mes
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                                        €{metrics.monthlyRevenue.toLocaleString()}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-400 font-semibold">
                                                        Ingresos
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                                                            {metrics.completedProjects} completados
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hours This Month */}
                                        <div
                                            onClick={() => router.push('/dashboard/time-tracking')}
                                            className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-orange-500/10 dark:shadow-orange-500/20 hover:shadow-orange-500/20 dark:hover:shadow-orange-500/30 transition-all duration-300 cursor-pointer hover:scale-105"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/25 group-hover:shadow-orange-500/40 group-hover:scale-110 transition-all duration-300">
                                                        <Clock className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                                                            Trabajadas
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                                                        {metrics.hoursThisMonth}h
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-400 font-semibold">
                                                        Este mes
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                                        <span className="text-orange-600 dark:text-orange-400 font-bold">
                                                            {metrics.hoursThisWeek}h esta semana
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gráficos y Estadísticas Adicionales */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                        {/* Gráfico de Ingresos por Mes */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-600/10 rounded-3xl blur-xl"></div>
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
                                                            <TrendingUp className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Ingresos Mensuales</h3>
                                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Últimos 6 meses</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Gráfico de barras mejorado */}
                                                <div className="space-y-4">
                                                    <div className="flex items-end justify-between h-40 gap-3 px-2">
                                                        {[
                                                            { month: 'Mar', value: 85, amount: 8500 },
                                                            { month: 'Abr', value: 70, amount: 7200 },
                                                            { month: 'May', value: 95, amount: 12300 },
                                                            { month: 'Jun', value: 80, amount: 9800 },
                                                            { month: 'Jul', value: 60, amount: 6400 },
                                                            { month: 'Ago', value: 100, amount: metrics.monthlyRevenue }
                                                        ].map((bar, index) => (
                                                            <div key={bar.month} className="flex flex-col items-center flex-1 group">
                                                                <div className="relative w-full h-32 mb-2">
                                                                    {/* Fondo de la barra */}
                                                                    <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg opacity-30"></div>
                                                                    {/* Barra de datos */}
                                                                    <div
                                                                        className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 rounded-lg shadow-lg transition-all duration-700 ease-out group-hover:shadow-indigo-500/50 group-hover:scale-105"
                                                                        style={{
                                                                            height: `${Math.max(bar.value, 10)}%`,
                                                                            animationDelay: `${index * 150}ms`,
                                                                            minHeight: '8px'
                                                                        }}
                                                                    >
                                                                        {/* Brillo en la parte superior */}
                                                                        <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 rounded-t-lg"></div>
                                                                    </div>
                                                                    {/* Tooltip hover */}
                                                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                                        €{bar.amount.toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{bar.month}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400">€{(bar.amount / 1000).toFixed(1)}k</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Distribución de Tiempo */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-600/10 rounded-3xl blur-xl"></div>
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
                                                            <Clock className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Tiempo por Categoría</h3>
                                                            <p className="text-slate-500 dark:text-slate-400 font-medium">Esta semana</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Distribución de tiempo */}
                                                <div className="space-y-4">
                                                    {[
                                                        { category: 'Desarrollo', hours: Math.round(metrics.hoursThisWeek * 0.4), color: 'from-blue-500 to-blue-600', percentage: 40 },
                                                        { category: 'Diseño', hours: Math.round(metrics.hoursThisWeek * 0.25), color: 'from-purple-500 to-purple-600', percentage: 25 },
                                                        { category: 'Reuniones', hours: Math.round(metrics.hoursThisWeek * 0.2), color: 'from-orange-500 to-orange-600', percentage: 20 },
                                                        { category: 'Administración', hours: Math.round(metrics.hoursThisWeek * 0.15), color: 'from-slate-500 to-slate-600', percentage: 15 }
                                                    ].map((item, index) => (
                                                        <div key={item.category} className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.category}</span>
                                                                <span className="text-sm text-slate-500 dark:text-slate-400">{item.hours}h ({item.percentage}%)</span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                                <div
                                                                    className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500 rounded-full`}
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
                                    </div>

                                    {/* Estadísticas Rápidas */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                        {/* Proyectos Completados */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 dark:border-slate-700/60 shadow-xl shadow-emerald-500/10">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                                    <Briefcase className="w-6 h-6 text-white" />
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics.completedProjects}</h4>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completados</p>
                                            </div>
                                        </div>

                                        {/* Facturación Promedio */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 dark:border-slate-700/60 shadow-xl shadow-purple-500/10">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                                    <DollarSign className="w-6 h-6 text-white" />
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                                                    €{metrics.completedProjects > 0 ? Math.round(metrics.monthlyRevenue / metrics.completedProjects).toLocaleString() : '0'}
                                                </h4>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Por proyecto</p>
                                            </div>
                                        </div>

                                        {/* Horas Facturables */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 dark:border-slate-700/60 shadow-xl shadow-blue-500/10">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                                    <Clock className="w-6 h-6 text-white" />
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{metrics.billableHoursThisWeek}h</h4>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Facturables</p>
                                            </div>
                                        </div>

                                        {/* Eficiencia */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 dark:border-slate-700/60 shadow-xl shadow-orange-500/10">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-white" />
                                                </div>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {metrics.hoursThisWeek > 0 ? Math.round((metrics.billableHoursThisWeek / metrics.hoursThisWeek) * 100) : 0}%
                                                </h4>
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Eficiencia</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estadísticas Avanzadas con Gráficos de Barras */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                        {/* Proyectos por Estado - Con barras de progreso */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/10 rounded-3xl blur-xl"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
                                                        <Target className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Estado de Proyectos</h3>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Progreso actual</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {[
                                                        { status: 'En Progreso', count: metrics.activeProjects, color: 'from-emerald-500 to-emerald-600', percentage: 70 },
                                                        { status: 'Completados', count: metrics.completedProjects, color: 'from-blue-500 to-blue-600', percentage: 90 },
                                                        { status: 'En Revisión', count: Math.max(1, Math.floor(metrics.activeProjects * 0.3)), color: 'from-orange-500 to-orange-600', percentage: 45 },
                                                        { status: 'Pausados', count: Math.max(0, Math.floor(metrics.activeProjects * 0.1)), color: 'from-slate-500 to-slate-600', percentage: 15 }
                                                    ].map((item, index) => (
                                                        <div key={item.status} className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.status}</span>
                                                                <div className="text-right">
                                                                    <span className="text-lg font-black text-slate-900 dark:text-white">{item.count}</span>
                                                                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">proyectos</span>
                                                                </div>
                                                            </div>
                                                            <div className="relative w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                                                                <div
                                                                    className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000 rounded-full shadow-lg`}
                                                                    style={{
                                                                        width: `${item.percentage}%`,
                                                                        animationDelay: `${index * 300}ms`
                                                                    }}
                                                                ></div>
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Top Clientes por Ingresos */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-600/10 rounded-3xl blur-xl"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25">
                                                        <Users className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Top Clientes</h3>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Por ingresos generados</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {[
                                                        { name: 'TechCorp Solutions', revenue: Math.round(metrics.monthlyRevenue * 0.35) || 5250, percentage: 100 },
                                                        { name: 'Digital Innovations', revenue: Math.round(metrics.monthlyRevenue * 0.25) || 3750, percentage: 75 },
                                                        { name: 'StartupHub', revenue: Math.round(metrics.monthlyRevenue * 0.20) || 3000, percentage: 60 },
                                                        { name: 'Creative Agency', revenue: Math.round(metrics.monthlyRevenue * 0.15) || 2250, percentage: 45 },
                                                        { name: 'Local Business', revenue: Math.round(metrics.monthlyRevenue * 0.05) || 750, percentage: 20 }
                                                    ].map((client, index) => (
                                                        <div key={client.name} className="group hover:bg-purple-50/50 dark:hover:bg-purple-900/20 rounded-xl p-3 transition-all duration-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                                                                        {index + 1}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                                                        {client.name}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                                                    €{client.revenue.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000 rounded-full"
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

                                    {/* Productividad y Alertas */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                                        {/* Productividad por Día */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-600/10 rounded-3xl blur-xl"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25">
                                                        <Clock className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Productividad Semanal</h3>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Horas por día</p>
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
                                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg overflow-hidden mb-2 relative group" style={{ height: '120px' }}>
                                                                <div
                                                                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700 rounded-t-lg relative"
                                                                    style={{
                                                                        height: `${day.percentage}%`,
                                                                        animationDelay: `${index * 150}ms`
                                                                    }}
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                                </div>
                                                                {/* Tooltip */}
                                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                                    {day.hours}h
                                                                </div>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{day.day}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Proyectos Críticos */}
                                        <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-red-500/10 dark:shadow-red-500/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-600/10 rounded-3xl blur-xl"></div>
                                            <div className="relative">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/25">
                                                        <TrendingUp className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Alertas de Proyectos</h3>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Requieren atención</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {realProjects.length > 0 ? realProjects.slice(0, 3).map((project, index) => (
                                                        <div
                                                            key={project.id}
                                                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                                                            className={`group p-4 rounded-xl border-l-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${project.status === 'active' ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 hover:bg-green-50/70 dark:hover:bg-green-900/30' :
                                                                    project.status === 'paused' ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-50/70 dark:hover:bg-orange-900/30' :
                                                                        project.status === 'completed' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50/70 dark:hover:bg-blue-900/30' :
                                                                            'border-red-500 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-50/70 dark:hover:bg-red-900/30'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                                                                        {project.name}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                                        Estado: {project.status === 'active' ? '🟢 Activo' :
                                                                            project.status === 'paused' ? '⏸️ Pausado' :
                                                                                project.status === 'completed' ? '✅ Completado' : '❌ Cancelado'}
                                                                    </p>
                                                                    {project.budget && (
                                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                                            Presupuesto: €{project.budget.toLocaleString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="ml-4 flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Hacer clic para ver</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="text-center py-8">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                                <div className="text-2xl">📋</div>
                                                            </div>
                                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No hay proyectos</h3>
                                                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                                                                Crea tu primer proyecto para comenzar
                                                            </p>
                                                            <button
                                                                onClick={() => router.push('/dashboard/projects')}
                                                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-medium"
                                                            >
                                                                Ir a Proyectos
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actividad Reciente - Diseño Premium */}
                                    <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-slate-500/10 dark:shadow-slate-500/20 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50"></div>

                                        {/* Header con gradiente */}
                                        <div className="relative p-8 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-800/80 dark:to-slate-800/80">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
                                                        <Clock className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                                            Actividad Reciente
                                                        </h3>
                                                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                            Últimas acciones en tu workspace
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100/80 dark:bg-emerald-900/30 rounded-full backdrop-blur-sm">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                                        En tiempo real
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative p-8">
                                            {recentActivity.length === 0 ? (
                                                <div className="text-center py-16">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                                        <Clock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                                    </div>
                                                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                                        Aún no hay actividad
                                                    </h4>
                                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                                        Cuando comiences a trabajar con clientes y proyectos,
                                                        la actividad aparecerá aquí en tiempo real
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {recentActivity.map((activity, index) => {
                                                        const IconComponent = activity.icon === 'briefcase' ? Briefcase :
                                                            activity.icon === 'clock' ? Clock : User;

                                                        const gradientColors: { [key: string]: string } = {
                                                            briefcase: 'from-blue-400 to-blue-600',
                                                            clock: 'from-emerald-400 to-emerald-600',
                                                            user: 'from-purple-400 to-purple-600'
                                                        };

                                                        const bgColors: { [key: string]: string } = {
                                                            briefcase: 'bg-blue-50 dark:bg-blue-900/30',
                                                            clock: 'bg-emerald-50 dark:bg-emerald-900/30',
                                                            user: 'bg-purple-50 dark:bg-purple-900/30'
                                                        };

                                                        return (
                                                            <div key={`${activity.type}-${activity.id}`}
                                                                className={`group flex items-center gap-6 p-6 rounded-2xl ${bgColors[activity.icon] || bgColors.user} border border-white/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm`}>
                                                                <div className={`w-16 h-16 bg-gradient-to-br ${gradientColors[activity.icon] || gradientColors.user} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                                                                    <IconComponent className="w-8 h-8 text-white" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-slate-900 dark:text-white text-lg mb-1 truncate">
                                                                        {activity.title}
                                                                    </p>
                                                                    <p className="text-slate-600 dark:text-slate-400 font-medium truncate">
                                                                        {activity.subtitle}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                                                        {new Date(activity.date).toLocaleDateString('es-ES', {
                                                                            day: 'numeric',
                                                                            month: 'short'
                                                                        })}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                                        {new Date(activity.date).toLocaleTimeString('es-ES', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}