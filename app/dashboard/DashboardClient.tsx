// src/app/dashboard/DashboardClient.tsx
'use client';

import DashboardStats from '@/components/DashboardStats';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createSupabaseClient } from '@/src/lib/supabase';
import { Briefcase, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardClient({ userEmail }: { userEmail: string }) {
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
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Cargar métricas del dashboard
    const loadDashboardData = async () => {
        try {
            setLoading(true);
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
        <div className="flex h-screen bg-background">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <main className="flex-1 ml-64 overflow-auto">
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-lg text-gray-600">Cargando métricas...</div>
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

                            {/* Actividad Reciente */}
                            <div className="mt-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Actividad Reciente
                                        </CardTitle>
                                        <CardDescription>
                                            Últimas acciones en tu CRM
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {recentActivity.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No hay actividad reciente
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {recentActivity.map((activity) => {
                                                    const IconComponent = activity.icon === 'briefcase' ? Briefcase : 
                                                                         activity.icon === 'clock' ? Clock : User;
                                                    return (
                                                        <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                                            <div className="p-2 rounded-full bg-primary/10">
                                                                <IconComponent className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{activity.title}</p>
                                                                <p className="text-xs text-gray-600">{activity.subtitle}</p>
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(activity.date).toLocaleDateString('es-ES')}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}