// src/app/dashboard/DashboardClient.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { createSupabaseClient } from '@/src/lib/supabase-client';
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
    const [recentActivity, setRecentActivity] = useState<Array<{
        id: string;
        type: string;
        title: string;
        subtitle: string;
        date: string;
        icon: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

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

            // Calcular ingresos del mes (proyectos completados)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const { data: monthlyData } = await supabase
                .from('projects')
                .select('budget, created_at')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .gte('created_at', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);

            const monthlyRevenue = monthlyData?.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) || 0;

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
    useEffect(() => {
        loadDashboardData();
        loadRecentActivity();
    }, []);
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Elementos decorativos de fondo mejorados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-indigo-500/8 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-indigo-400/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/8 via-pink-500/8 to-indigo-500/8 dark:from-purple-400/5 dark:via-pink-400/5 dark:to-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/8 via-blue-500/8 to-purple-500/8 dark:from-indigo-400/5 dark:via-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 ml-56 overflow-hidden relative">
                <div className="h-full overflow-y-auto">
                    {/* Trial Banner - Solo si no es demo */}
                    {!isDemo && <TrialBanner userEmail={userEmail} />}

                    <div className="min-h-screen relative">
                        <div className="container mx-auto px-6 py-8">
                            {/* Header Premium con Animaciones */}
                            <div className="relative mb-8 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"></div>
                                <div className="relative backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 rounded-3xl p-8 border border-white/80 dark:border-slate-700/80 shadow-2xl shadow-blue-500/10 dark:shadow-purple-500/20 transition-all duration-300">
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
                                                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <h3 className="text-lg font-semibold text-gray-900">Cargando dashboard</h3>
                                                <p className="text-sm text-gray-500">Preparando tus métricas...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Header Section */}
                                            <div className="mb-8">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div>
                                                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                                            Dashboard
                                                        </h1>
                                                        <p className="text-gray-600 mt-1">
                                                            Una visión completa de tu negocio
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-gray-700">En vivo</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Stats Grid - Silicon Valley Style */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                                    {/* Total Clients */}
                                                    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                                        <div className="absolute top-4 right-4">
                                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                                                                <Users className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                                                            <p className="text-3xl font-bold text-gray-900">{metrics.totalClients}</p>
                                                            <div className="flex items-center text-sm">
                                                                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                                                                <span className="text-emerald-600 font-medium">Cartera activa</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Active Projects */}
                                                    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                                        <div className="absolute top-4 right-4">
                                                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-200">
                                                                <Target className="w-5 h-5 text-emerald-600" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                                                            <p className="text-3xl font-bold text-gray-900">{metrics.activeProjects}</p>
                                                            <div className="flex items-center text-sm">
                                                                <div className="w-4 h-4 bg-emerald-500 rounded-full mr-1 animate-pulse"></div>
                                                                <span className="text-emerald-600 font-medium">En progreso</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Monthly Revenue */}
                                                    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                                        <div className="absolute top-4 right-4">
                                                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-200">
                                                                <DollarSign className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
                                                            <p className="text-3xl font-bold text-gray-900">€{metrics.monthlyRevenue.toLocaleString()}</p>
                                                            <div className="flex items-center text-sm">
                                                                <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                                                                <span className="text-gray-600">Proyectos completados</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Hours This Month */}
                                                    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                                        <div className="absolute top-4 right-4">
                                                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-200">
                                                                <Clock className="w-5 h-5 text-orange-600" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-medium text-gray-600">Horas Este Mes</p>
                                                            <p className="text-3xl font-bold text-gray-900">{metrics.hoursThisMonth}h</p>
                                                            <div className="flex items-center text-sm">
                                                                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                                                                <span className="text-gray-600">{metrics.hoursThisWeek}h esta semana</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Modern Activity Feed */}
                                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                                                <div className="p-6 border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                                <Clock className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                                                                <p className="text-sm text-gray-500">Últimas acciones en tu workspace</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-medium">
                                                            ACTUALIZADO AHORA
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    {recentActivity.length === 0 ? (
                                                        <div className="text-center py-12">
                                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                                <Clock className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Aún no hay actividad</h4>
                                                            <p className="text-gray-500 max-w-sm mx-auto">
                                                                Cuando comiences a trabajar con clientes y proyectos, la actividad aparecerá aquí
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {recentActivity.map((activity, index) => {
                                                                const IconComponent = activity.icon === 'briefcase' ? Briefcase :
                                                                    activity.icon === 'clock' ? Clock : User;

                                                                const iconColors: { [key: string]: string } = {
                                                                    briefcase: 'bg-blue-50 text-blue-600',
                                                                    clock: 'bg-green-50 text-green-600',
                                                                    user: 'bg-purple-50 text-purple-600'
                                                                };

                                                                return (
                                                                    <div key={`${activity.type}-${activity.id}`}
                                                                        className="group flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-150">
                                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[activity.icon] || iconColors.user} group-hover:scale-105 transition-transform duration-150`}>
                                                                            <IconComponent className="w-6 h-6" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-semibold text-gray-900 truncate">{activity.title}</p>
                                                                            <p className="text-sm text-gray-500 truncate">{activity.subtitle}</p>
                                                                        </div>
                                                                        <div className="flex flex-col items-end">
                                                                            <div className="text-xs font-medium text-gray-900">
                                                                                {new Date(activity.date).toLocaleDateString('es-ES')}
                                                                            </div>
                                                                            <div className="text-xs text-gray-400">
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