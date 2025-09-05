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
import TasksTimeBreakdown from './DashboardClient.tasksTime';

export default function DashboardBonsai({
    userEmail,
    isDemo = false,
    totalTaskTime = 0
}: {
    userEmail: string;
    isDemo?: boolean;
    totalTaskTime?: number;
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
        paidInvoices: 0,
        hoursThisWeek: 0,
        hoursThisMonth: 0,
        billableHoursThisWeek: 0
    });

    // Estado para las categorías reales
    const [categoryData, setCategoryData] = useState<Array<{
        category: string;
        hours: number;
        percentage: number;
        color: string;
        displayName: string;
    }>>([]);

    // Estados para datos dinámicos
    const [realProjects, setRealProjects] = useState<any[]>([]);
    const [realClients, setRealClients] = useState<any[]>([]);
    const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);
    const [weeklyProductivity, setWeeklyProductivity] = useState<Array<{
        day: string;
        hours: number;
        percentage: number;
    }>>([]);
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
        try {
            setLoading(true);

            console.log('🔍 Starting dashboard data load...');
            console.log('📋 Environment check:', {
                hasSupabase: !!supabase,
                isDemo: isDemo,
                userEmail: userEmail
            });

            // ✅ Si está en modo demo, usar datos ficticios
            if (isDemo) {
                console.log('🎭 Using demo data');
                setMetrics({
                    totalClients: 12,
                    activeProjects: 5,
                    completedProjects: 8,
                    monthlyRevenue: 15750,
                    paidInvoices: 8500,
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

            if (!supabase) {
                console.error('❌ Supabase client not available');
                setLoading(false);
                return;
            }

            console.log('🔐 Getting user...');
            // Obtener usuario actual
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            console.log('👤 User data:', {
                hasUser: !!user,
                userId: user?.id,
                userEmail: user?.email,
                userError: userError
            });

            if (!user) {
                console.error('❌ No user found:', userError);
                setLoading(false);
                return;
            }

            // Fechas para filtros de tiempo
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            console.log('📡 Making database queries...');
            // Cargar métricas reales con consultas optimizadas
            const [
                { data: clients, error: clientsError },
                { data: allProjects, error: projectsError },
                { data: tasks, error: tasksError },
                { data: invoices, error: invoicesError },
                { data: weeklyTimeData, error: weeklyError },
                { data: monthlyTimeData, error: monthlyError }
            ] = await Promise.all([
                supabase.from('clients').select('*').eq('user_id', user.id),
                supabase.from('projects').select('*').eq('user_id', user.id),
                supabase.from('tasks').select('total_time_seconds').eq('user_id', user.id).not('total_time_seconds', 'is', null),
                supabase.from('invoices').select('amount, status').eq('user_id', user.id),
                supabase.from('time_entries')
                    .select('duration_seconds, created_at')
                    .eq('user_id', user.id)
                    .gte('created_at', oneWeekAgo.toISOString()),
                supabase.from('time_entries')
                    .select('duration_seconds, created_at')
                    .eq('user_id', user.id)
                    .gte('created_at', oneMonthAgo.toISOString())
            ]);

            console.log('📋 Raw database results:', {
                clients: { data: clients, error: clientsError, count: clients?.length || 0 },
                projects: { data: allProjects, error: projectsError, count: allProjects?.length || 0 },
                tasks: { data: tasks, error: tasksError, count: tasks?.length || 0 },
                invoices: { data: invoices, error: invoicesError, count: invoices?.length || 0 },
                weeklyTimeData: { data: weeklyTimeData, error: weeklyError, count: weeklyTimeData?.length || 0 },
                monthlyTimeData: { data: monthlyTimeData, error: monthlyError, count: monthlyTimeData?.length || 0 }
            });

            const activeProjects = allProjects?.filter((p: any) =>
                p.status === 'active' || p.status === 'in_progress'
            ) || [];

            const completedProjects = allProjects?.filter((p: any) =>
                p.status === 'completed'
            ) || [];

            // Calcular tiempo total de tareas (en segundos)
            const totalTaskTime = tasks?.reduce((sum: number, task: any) => {
                return sum + (task.total_time_seconds || 0);
            }, 0) || 0;

            // Calcular tiempo de time_entries de la semana
            const totalMinutesThisWeek = weeklyTimeData?.reduce((sum: number, entry: any) => {
                return sum + ((entry.duration_seconds || 0) / 60);
            }, 0) || 0;

            // Usar el mayor entre tareas y time_entries para horas de la semana
            const hoursFromTasks = Math.round((totalTaskTime / 3600) * 10) / 10;
            const hoursFromTimeEntries = Math.round((totalMinutesThisWeek / 60) * 10) / 10;

            // Calcular ingresos totales desde múltiples fuentes
            const projectRevenue = allProjects?.reduce((sum: number, project: any) => {
                return sum + (parseFloat(project.budget) || 0);
            }, 0) || 0;

            const invoiceRevenue = invoices?.reduce((sum: number, invoice: any) => {
                return sum + (parseFloat(invoice.amount) || 0);
            }, 0) || 0;

            const paidInvoices = invoices?.reduce((sum: number, invoice: any) => {
                if (invoice.status === 'paid') {
                    return sum + (parseFloat(invoice.amount) || 0);
                }
                return sum;
            }, 0) || 0;

            // Usar el mayor entre presupuestos de proyectos y facturas
            const totalRevenue = Math.max(projectRevenue, invoiceRevenue, paidInvoices);

            console.log('📊 Dashboard Debug:', {
                totalClients: clients?.length || 0,
                totalProjects: allProjects?.length || 0,
                activeProjects: activeProjects.length,
                completedProjects: completedProjects.length,
                totalTaskTime: totalTaskTime,
                hoursFromTasks: hoursFromTasks,
                hoursFromTimeEntries: hoursFromTimeEntries,
                projectRevenue: projectRevenue,
                invoiceRevenue: invoiceRevenue,
                paidInvoices: paidInvoices,
                totalRevenue: totalRevenue,
                tasksWithTime: tasks?.length || 0,
                rawProjects: allProjects?.map((p: any) => ({ name: p.name, budget: p.budget })),
                rawInvoices: invoices?.map((i: any) => ({ number: i.invoice_number, amount: i.amount, status: i.status }))
            });

            const totalMinutesThisMonth = monthlyTimeData?.reduce((sum: number, entry: any) => {
                return sum + ((entry.duration_seconds || 0) / 60);
            }, 0) || 0;

            // Las horas facturables son aproximadamente el 80% de las horas totales
            const billableHoursThisWeek = Math.round((Math.max(hoursFromTasks, hoursFromTimeEntries) * 0.8) * 10) / 10;

            setMetrics({
                totalClients: clients?.length || 0,
                activeProjects: activeProjects.length,
                completedProjects: completedProjects.length,
                monthlyRevenue: totalRevenue,
                paidInvoices: paidInvoices,
                hoursThisWeek: Math.max(hoursFromTasks, hoursFromTimeEntries),
                hoursThisMonth: Math.round((totalMinutesThisMonth / 60) * 10) / 10,
                billableHoursThisWeek: billableHoursThisWeek
            });

            setRealProjects(allProjects?.slice(0, 5) || []);
            setRealClients(clients?.slice(0, 5) || []);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar datos de categorías reales
    const loadCategoryData = async () => {
        if (isDemo) return;

        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Consultar tareas con tiempo registrado agrupadas por categoría
            const { data: tasks } = await supabase
                .from('tasks')
                .select('category, total_time_seconds')
                .eq('user_id', user.id)
                .not('total_time_seconds', 'is', null)
                .gt('total_time_seconds', 0);

            if (!tasks || tasks.length === 0) {
                setCategoryData([]);
                return;
            }

            // Agrupar por categoría y sumar tiempos
            const categoryTotals: { [key: string]: number } = {};
            tasks.forEach((task: any) => {
                const category = task.category || 'general';
                categoryTotals[category] = (categoryTotals[category] || 0) + (task.total_time_seconds || 0);
            });

            // Calcular total de horas para porcentajes
            const totalSeconds = Object.values(categoryTotals).reduce((sum, seconds) => sum + seconds, 0);

            // Si no hay tiempo registrado, mostrar vacío
            if (totalSeconds === 0) {
                setCategoryData([]);
                return;
            }

            // Mapear categorías con nombres y colores
            const categoryMapping: { [key: string]: { name: string; color: string } } = {
                'web_development': { name: 'Desarrollo Web', color: 'bg-blue-600' },
                'frontend_development': { name: 'Frontend', color: 'bg-cyan-600' },
                'backend_development': { name: 'Backend', color: 'bg-blue-800' },
                'mobile_development': { name: 'Desarrollo Móvil', color: 'bg-purple-600' },
                'ui_ux_design': { name: 'Diseño UI/UX', color: 'bg-pink-600' },
                'graphic_design': { name: 'Diseño Gráfico', color: 'bg-purple-500' },
                'design': { name: 'Diseño', color: 'bg-purple-600' },
                'seo_sem': { name: 'SEO/SEM', color: 'bg-green-600' },
                'social_media': { name: 'Redes Sociales', color: 'bg-blue-500' },
                'content_creation': { name: 'Contenido', color: 'bg-yellow-600' },
                'marketing': { name: 'Marketing', color: 'bg-green-600' },
                'consulting': { name: 'Consultoría', color: 'bg-indigo-600' },
                'research_analysis': { name: 'Investigación', color: 'bg-teal-600' },
                'client_meetings': { name: 'Reuniones', color: 'bg-orange-600' },
                'proposals_presentations': { name: 'Propuestas', color: 'bg-amber-600' },
                'client_communication': { name: 'Comunicación', color: 'bg-orange-500' },
                'invoicing_payments': { name: 'Facturación', color: 'bg-emerald-600' },
                'business_admin': { name: 'Administración', color: 'bg-gray-600' },
                'email_management': { name: 'Emails', color: 'bg-slate-600' },
                'testing_qa': { name: 'Testing', color: 'bg-red-600' },
                'learning_training': { name: 'Formación', color: 'bg-violet-600' },
                'general': { name: 'General', color: 'bg-gray-500' },
                // Backward compatibility
                'development': { name: 'Desarrollo', color: 'bg-blue-600' },
                'meetings': { name: 'Reuniones', color: 'bg-orange-600' },
                'administration': { name: 'Administración', color: 'bg-gray-600' }
            };

            // Convertir a formato del componente
            const categoryArray = Object.entries(categoryTotals)
                .map(([category, seconds]) => ({
                    category,
                    hours: Math.round((seconds / 3600) * 10) / 10,
                    percentage: Math.round((seconds / totalSeconds) * 100),
                    color: categoryMapping[category]?.color || 'bg-gray-500',
                    displayName: categoryMapping[category]?.name || category
                }))
                .sort((a, b) => b.hours - a.hours); // Ordenar por horas descendente

            setCategoryData(categoryArray);

        } catch (error) {
            console.error('Error loading category data:', error);
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
            recentProjects?.forEach((project: any) => {
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
            recentClients?.forEach((client: any) => {
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

    // Función para cargar datos de ingresos por mes
    const loadMonthlyRevenueData = async () => {
        if (isDemo) {
            // Datos demo para los últimos 6 meses
            setMonthlyRevenueData([
                { month: 'Mar', value: 85, amount: 8500 },
                { month: 'Abr', value: 70, amount: 7200 },
                { month: 'May', value: 95, amount: 12300 },
                { month: 'Jun', value: 80, amount: 9800 },
                { month: 'Jul', value: 60, amount: 6400 },
                { month: 'Ago', value: 100, amount: 15750 }
            ]);
            return;
        }

        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Obtener facturas de los últimos 6 meses
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const { data: invoices, error } = await supabase
                .from('invoices')
                .select('amount, status, created_at')
                .eq('user_id', user.id)
                .gte('created_at', sixMonthsAgo.toISOString())
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error loading monthly revenue:', error);
                return;
            }

            // Agrupar por mes
            const monthlyData: { [key: string]: number } = {};
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            invoices?.forEach((invoice: any) => {
                if (invoice.status === 'paid') {
                    const date = new Date(invoice.created_at);
                    const monthKey = `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
                    const shortMonth = monthNames[date.getMonth()];
                    
                    monthlyData[shortMonth] = (monthlyData[shortMonth] || 0) + (parseFloat(invoice.amount) || 0);
                }
            });

            // Crear array para los últimos 6 meses
            const revenueData = [];
            const maxAmount = Math.max(...Object.values(monthlyData), 1);
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthName = monthNames[date.getMonth()];
                const amount = monthlyData[monthName] || 0;
                
                revenueData.push({
                    month: monthName,
                    value: Math.round((amount / maxAmount) * 100),
                    amount: amount
                });
            }

            console.log('📊 Monthly revenue data:', revenueData);
            setMonthlyRevenueData(revenueData);

        } catch (error) {
            console.error('Error loading monthly revenue data:', error);
        }
    };

    // Función para cargar productividad semanal real
    const loadWeeklyProductivity = async () => {
        console.log('📊 Loading weekly productivity...', { isDemo });
        
        if (isDemo) {
            console.log('🎭 Using demo data for weekly productivity');
            // Datos demo
            setWeeklyProductivity([
                { day: 'Lun', hours: 8.5, percentage: 85 },
                { day: 'Mar', hours: 7.2, percentage: 72 },
                { day: 'Mié', hours: 9.1, percentage: 91 },
                { day: 'Jue', hours: 6.8, percentage: 68 },
                { day: 'Vie', hours: 7.5, percentage: 75 },
                { day: 'Sáb', hours: 3.2, percentage: 32 },
                { day: 'Dom', hours: 1.5, percentage: 15 }
            ]);
            return;
        }

        console.log('🔍 Loading real weekly productivity data...');

        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Obtener el inicio de esta semana (lunes)
            const now = new Date();
            const dayOfWeek = now.getDay();
            const monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            monday.setHours(0, 0, 0, 0);

            // Obtener tareas con tiempo registrado de esta semana
            const { data: tasks, error: tasksError } = await supabase
                .from('tasks')
                .select('total_time_seconds, updated_at')
                .eq('user_id', user.id)
                .not('total_time_seconds', 'is', null)
                .gte('updated_at', monday.toISOString());

            // Obtener time_entries de esta semana
            const { data: timeEntries, error: timeError } = await supabase
                .from('time_entries')
                .select('duration_seconds, created_at')
                .eq('user_id', user.id)
                .gte('created_at', monday.toISOString());

            if (tasksError && timeError) {
                console.error('Error loading weekly data:', { tasksError, timeError });
                return;
            }

            // Agrupar por día de la semana
            const dailyHours: { [key: number]: number } = {};
            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

            // Procesar tareas (usando updated_at como proxy para cuándo se registró el tiempo)
            tasks?.forEach((task: any) => {
                const date = new Date(task.updated_at);
                const dayIndex = date.getDay();
                const hours = (task.total_time_seconds || 0) / 3600;
                dailyHours[dayIndex] = (dailyHours[dayIndex] || 0) + hours;
            });

            // Procesar time_entries
            timeEntries?.forEach((entry: any) => {
                const date = new Date(entry.created_at);
                const dayIndex = date.getDay();
                const hours = (entry.duration_seconds || 0) / 3600;
                dailyHours[dayIndex] = (dailyHours[dayIndex] || 0) + hours;
            });

            // Crear array para la semana (Lun-Dom)
            const weeklyData: Array<{ day: string; hours: number; percentage: number }> = [];
            const maxHours = Math.max(...Object.values(dailyHours), 8); // Mínimo 8h para el 100%
            
            console.log('📈 Daily hours data:', dailyHours);
            console.log('📊 Max hours for percentage calc:', maxHours);
            
            // Reordenar para empezar en lunes
            const orderedDays = [1, 2, 3, 4, 5, 6, 0]; // Lun, Mar, Mié, Jue, Vie, Sáb, Dom
            const orderedNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

            orderedDays.forEach((dayIndex, i) => {
                const hours = dailyHours[dayIndex] || 0;
                const percentage = Math.min(Math.round((hours / maxHours) * 100), 100);
                
                const dayData = {
                    day: orderedNames[i],
                    hours: Math.round(hours * 10) / 10, // Redondear a 1 decimal
                    percentage: Math.max(percentage, hours > 0 ? 5 : 0) // Mínimo 5% si hay tiempo
                };
                
                console.log(`� ${dayData.day}: ${dayData.hours}h (${dayData.percentage}%)`);
                weeklyData.push(dayData);
            });

            console.log('📊 Final weekly productivity data:', weeklyData);

            setWeeklyProductivity(weeklyData);

        } catch (error) {
            console.error('Error loading weekly productivity:', error);
            // Fallback a datos demo en caso de error
            setWeeklyProductivity([
                { day: 'Lun', hours: 0, percentage: 0 },
                { day: 'Mar', hours: 0, percentage: 0 },
                { day: 'Mié', hours: 0, percentage: 0 },
                { day: 'Jue', hours: 0, percentage: 0 },
                { day: 'Vie', hours: 0, percentage: 0 },
                { day: 'Sáb', hours: 0, percentage: 0 },
                { day: 'Dom', hours: 0, percentage: 0 }
            ]);
        }
    };

    // Función para crear datos de prueba
    const createTestTimeData = async () => {
        if (!supabase) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            console.log('🕒 Creating test time data...');
            
            // Obtener o crear tareas
            let { data: tasks } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .limit(5);
                
            if (!tasks || tasks.length === 0) {
                // Crear una tarea de prueba
                const { data: newTask } = await supabase
                    .from('tasks')
                    .insert([{
                        title: 'Tarea de Prueba - Productividad',
                        description: 'Tarea para probar la productividad semanal',
                        status: 'in_progress',
                        priority: 'medium',
                        user_id: user.id,
                        total_time_seconds: 0
                    }])
                    .select()
                    .single();
                    
                if (newTask) tasks = [newTask];
            }
            
            // Crear datos de tiempo para los últimos 7 días
            const now = new Date();
            const timeData = [
                { day: 0, hours: 2.5 },  // Domingo
                { day: 1, hours: 8.0 },  // Lunes  
                { day: 2, hours: 7.5 },  // Martes
                { day: 3, hours: 6.5 },  // Miércoles
                { day: 4, hours: 8.5 },  // Jueves
                { day: 5, hours: 7.0 },  // Viernes
                { day: 6, hours: 3.0 }   // Sábado
            ];
            
            for (let i = 0; i < timeData.length && tasks && tasks.length > 0; i++) {
                const dayData = timeData[i];
                const task = tasks[i % tasks.length];
                
                // Calcular fecha para este día
                const targetDate = new Date(now);
                const daysDiff = dayData.day - now.getDay();
                targetDate.setDate(now.getDate() + daysDiff);
                
                // Actualizar tarea con tiempo
                await supabase
                    .from('tasks')
                    .update({
                        total_time_seconds: Math.floor(dayData.hours * 3600),
                        updated_at: targetDate.toISOString()
                    })
                    .eq('id', task.id);
            }
            
            console.log('✅ Test data created!');
            // Recargar datos
            loadWeeklyProductivity();
            
        } catch (error) {
            console.error('❌ Error creating test data:', error);
        }
    };

    // Función para limpiar datos de prueba
    const cleanTestTimeData = async () => {
        if (!supabase) return;
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            console.log('🧹 Cleaning test time data...');
            
            // Limpiar tiempo de las tareas
            await supabase
                .from('tasks')
                .update({
                    total_time_seconds: 0,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);
                
            console.log('✅ Test data cleaned!');
            // Recargar datos
            loadWeeklyProductivity();
            
        } catch (error) {
            console.error('❌ Error cleaning test data:', error);
        }
    };

    useEffect(() => {
        loadDashboardData();
        loadRecentActivity();
        loadCategoryData();
        loadMonthlyRevenueData();
        loadWeeklyProductivity();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="ml-56 min-h-screen">
                {/* Trial Banner - Solo si no es demo */}
                {!isDemo && <TrialBanner userEmail={userEmail} />}

                {/* Header estilo Bonsai */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4 sm:px-6 py-4 sm:py-6">
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

                <div className="p-4 sm:p-6">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-8">
                                {/* Total Clients */}
                                <div
                                    onClick={() => router.push('/dashboard/clients')}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer min-h-[100px]"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Clientes</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">{metrics.totalClients}</p>
                                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 ml-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Projects */}
                                <div
                                    onClick={() => router.push('/dashboard/projects')}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer min-h-[100px]"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Proyectos Activos</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">{metrics.activeProjects}</p>
                                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 ml-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Completed Projects */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-h-[100px]">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Completados</p>
                                            <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">{metrics.completedProjects}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Revenue */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-h-[100px]">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Presupuestos</p>
                                            <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                                                €{metrics.monthlyRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Paid Invoices */}
                                <div 
                                    onClick={() => router.push('/dashboard/invoices')}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer min-h-[100px]"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Facturas Pagadas</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                                                    €{metrics.paidInvoices.toLocaleString()}
                                                </p>
                                                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0 ml-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Task Time */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-h-[100px]">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">TIEMPO ACUMULADO</p>
                                            <p className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
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

                            {/* Componente de desglose de tiempo por proyectos y tareas */}
                            <TasksTimeBreakdown />

                            {/* Gráficos y Estadísticas Adicionales - Estilo Bonsai */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Gráfico de Ingresos por Mes - Estilo Bonsai */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Facturas Pagadas por Mes</h3>
                                            <p className="text-sm text-gray-600">Últimos 6 meses</p>
                                        </div>
                                    </div>

                                    {/* Gráfico de barras limpio */}
                                    <div className="space-y-4">
                                        {monthlyRevenueData.length > 0 ? (
                                            <div className="flex items-end justify-between h-40 gap-3 px-2">
                                                {monthlyRevenueData.map((bar, index) => (
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
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500 mb-1">No hay facturas pagadas</p>
                                                <p className="text-xs text-gray-400">
                                                    {isDemo ? 'Cargando datos...' : 'Crea facturas y márcalas como pagadas para ver la gráfica'}
                                                </p>
                                            </div>
                                        )}
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
                                            <p className="text-sm text-gray-600">
                                                {isDemo ? 'Distribución estimada esta semana' :
                                                    categoryData.length > 0 ? 'Distribución real basada en tareas' : 'No hay datos registrados'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Distribución de tiempo */}
                                    {isDemo ? (
                                        <div className="space-y-4">
                                            {[
                                                { category: 'Desarrollo', hours: Math.round(metrics.hoursThisWeek * 0.4 * 10) / 10, color: 'bg-blue-600', percentage: 40 },
                                                { category: 'Diseño', hours: Math.round(metrics.hoursThisWeek * 0.25 * 10) / 10, color: 'bg-purple-600', percentage: 25 },
                                                { category: 'Reuniones', hours: Math.round(metrics.hoursThisWeek * 0.2 * 10) / 10, color: 'bg-orange-600', percentage: 20 },
                                                { category: 'Administración', hours: Math.round(metrics.hoursThisWeek * 0.15 * 10) / 10, color: 'bg-gray-600', percentage: 15 }
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
                                    ) : categoryData.length > 0 ? (
                                        <div className="space-y-4">
                                            {categoryData.map((item, index) => (
                                                <div key={item.category} className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-gray-700">{item.displayName}</span>
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
                                    ) : (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                                            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500 mb-1">No hay tiempo registrado por categorías</p>
                                            <p className="text-xs text-gray-400">
                                                Crea tareas con categorías y registra tiempo para ver la distribución
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Estadísticas Adicionales - Estilo Bonsai */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
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
                                        <p className="text-sm text-gray-600">
                                            {isDemo ? 'Horas por día (demo)' : 
                                             weeklyProductivity.length > 0 && weeklyProductivity.some(d => d.hours > 0) 
                                                ? 'Horas registradas esta semana' 
                                                : 'Sin tiempo registrado esta semana'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between h-40 gap-3">
                                    {(weeklyProductivity.length > 0 ? weeklyProductivity : 
                                        // Fallback inicial mientras carga
                                        [
                                            { day: 'Lun', hours: 0, percentage: 0 },
                                            { day: 'Mar', hours: 0, percentage: 0 },
                                            { day: 'Mié', hours: 0, percentage: 0 },
                                            { day: 'Jue', hours: 0, percentage: 0 },
                                            { day: 'Vie', hours: 0, percentage: 0 },
                                            { day: 'Sáb', hours: 0, percentage: 0 },
                                            { day: 'Dom', hours: 0, percentage: 0 }
                                        ]
                                    ).map((day, index) => (
                                        <div key={day.day} className="flex-1 flex flex-col items-center">
                                            <div className="w-full bg-gray-100 rounded-t overflow-hidden mb-2 relative group" style={{ height: '120px' }}>
                                                <div
                                                    className="w-full bg-emerald-600 transition-all duration-700 rounded-t relative group-hover:bg-emerald-700"
                                                    style={{
                                                        height: `${Math.max(day.percentage, day.hours > 0 ? 5 : 2)}%`,
                                                        animationDelay: `${index * 150}ms`
                                                    }}
                                                ></div>
                                                {/* Tooltip */}
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                                    {day.hours}h {day.hours === 0 ? '(sin tiempo)' : ''}
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
