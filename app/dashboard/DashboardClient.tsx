// src/app/dashboard/DashboardClient.tsx
'use client';

import DashboardStats from '@/components/DashboardStats';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { Briefcase, Clock, User } from 'lucide-react';
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
        if (isDemo) {
            router.push('/login');
            return;
        }
        await supabase.auth.signOut();
        router.push('/login');
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

            const activeProjects = projectsData?.filter(p => p.status === 'active').length || 0;
            const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;

            // Calcular ingresos del mes (proyectos completados)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const { data: monthlyData } = await supabase
                .from('projects')
                .select('budget, created_at')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .gte('created_at', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);

            const monthlyRevenue = monthlyData?.reduce((sum, project) => sum + (project.budget || 0), 0) || 0;

            // Calcular horas de esta semana
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const { data: weeklyTimeData } = await supabase
                .from('time_entries')
                .select('duration_minutes, is_billable')
                .eq('user_id', user.id)
                .gte('created_at', startOfWeek.toISOString());

            const totalMinutesThisWeek = weeklyTimeData?.reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0;
            const billableMinutesThisWeek = weeklyTimeData?.reduce((sum, entry) =>
                sum + (entry.is_billable ? entry.duration_minutes : 0), 0) || 0;

            // Calcular horas de este mes
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const { data: monthlyTimeData } = await supabase
                .from('time_entries')
                .select('duration_minutes')
                .eq('user_id', user.id)
                .gte('created_at', startOfMonth.toISOString());

            const totalMinutesThisMonth = monthlyTimeData?.reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0;

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
                ...(recentProjects?.map(project => ({
                    id: project.id,
                    type: 'project',
                    title: `Nuevo proyecto: ${project.name}`,
                    subtitle: `Cliente: ${project.clients?.[0]?.name || 'Sin cliente'}`,
                    date: project.created_at,
                    icon: 'briefcase'
                })) || []),
                ...(recentClients?.map(client => ({
                    id: client.id,
                    type: 'client',
                    title: `Nuevo cliente: ${client.name}`,
                    subtitle: 'Cliente añadido',
                    date: client.created_at,
                    icon: 'user'
                })) || []),
                ...(recentTimeEntries?.map(entry => ({
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-slate-900 relative overflow-hidden">
            {/* Subtle Premium Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(99,102,241,0.03),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.03),transparent_50%)]" />
            </div>

            <div className="flex h-screen relative z-10">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />

                <main className="flex-1 ml-56 overflow-auto">
                    <div className="p-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <span className="text-slate-700 font-medium">Cargando métricas...</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <DashboardStats
                                    totalClients={metrics.totalClients}
                                    activeProjects={metrics.activeProjects}
                                    monthlyRevenue={metrics.monthlyRevenue}
                                    hoursThisWeek={metrics.hoursThisWeek}
                                    hoursThisMonth={metrics.hoursThisMonth}
                                    billableHoursThisWeek={metrics.billableHoursThisWeek}
                                />

                                {/* Actividad Reciente - Compact Style */}
                                <div className="mt-4">
                                    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center">
                                                <Clock className="w-3 h-3 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-900">Actividad Reciente</h3>
                                                <p className="text-slate-600 text-xs">Últimas acciones en tu workspace</p>
                                            </div>
                                        </div>
                                        
                                        {recentActivity.length === 0 ? (
                                            <div className="text-center py-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                    <Clock className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 font-medium text-sm">No hay actividad reciente</p>
                                                <p className="text-slate-400 text-xs">La actividad aparecerá aquí cuando comiences a trabajar</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {recentActivity.map((activity) => {
                                                    const IconComponent = activity.icon === 'briefcase' ? Briefcase :
                                                        activity.icon === 'clock' ? Clock : User;
                                                    return (
                                                        <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                                                            <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center">
                                                                <IconComponent className="w-3 h-3 text-indigo-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-slate-900 text-xs truncate">{activity.title}</p>
                                                                <p className="text-xs text-slate-600 truncate">{activity.subtitle}</p>
                                                            </div>
                                                            <div className="text-xs text-slate-500 font-medium">
                                                                {new Date(activity.date).toLocaleDateString('es-ES')}
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
                </main>
            </div>
        </div>
    );
}