'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Plus, 
    MapPin, 
    Target, 
    TrendingUp,
    DollarSign,
    CheckCircle,
    Brain,
    Lightbulb,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Zap,
    Users,
    Activity,
    Globe,
    Star,
    Sparkles,
    Workflow,
    BarChart3,
    Timer,
    Video,
    Phone,
    Settings
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

// ==================== TIPOS ====================
interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    type: string; // Usamos 'type' que viene de la base de datos
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    priority?: number;
    client_id?: string;
    project_id?: string;
    is_billable: boolean;
    tags?: string[];
    location?: string;
    meeting_url?: string;
    hourly_rate?: number;
    created_at: string;
}

interface ExtendedCalendarEvent extends CalendarEvent {
    clients?: Client;
    projects?: Project;
}

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    created_at: string;
}

interface Project {
    id: string;
    client_id: string;
    name: string;
    description: string;
    status: string;
    budget: number;
    start_date: string;
    end_date: string;
    created_at: string;
}

interface DashboardMetrics {
    events_today: number;
    completed_today: number;
    revenue_today: number;
    billable_hours_today: number;
    events_this_week: number;
    avg_productivity_week: number;
    pending_insights: number;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function CalendarPageClientDemo() {
    // Estados principales
    const [events, setEvents] = useState<ExtendedCalendarEvent[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Estados de formulario
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        type: 'meeting',
        is_billable: false,
        tags: []
    });

    // Estados de métricas
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
        events_today: 0,
        completed_today: 0,
        revenue_today: 0,
        billable_hours_today: 0,
        events_this_week: 0,
        avg_productivity_week: 75,
        pending_insights: 3,
    });

    // Hook para manejar el router
    const router = useRouter();
    const supabase = createSupabaseClient();

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        router.push('/login');
    };

    // ==================== EFECTOS ====================
    useEffect(() => {
        loadRealData();
    }, []);

    // ==================== FUNCIONES ====================
    const loadRealData = async () => {
        try {
            setLoading(true);
            
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }

            // Obtener usuario actual
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
                console.error('Error getting user:', userError);
                router.push('/login');
                return;
            }

            setUserEmail(user.email || '');

            // Cargar eventos del calendario desde la base de datos
            const { data: calendarEvents, error: eventsError } = await supabase
                .from('calendar_events')
                .select(`
                    *,
                    clients (
                        id,
                        name,
                        email,
                        company
                    ),
                    projects (
                        id,
                        name,
                        description,
                        status
                    )
                `)
                .eq('user_id', user.id)
                .order('start_time', { ascending: true });

            if (eventsError) {
                console.error('Error loading calendar events:', eventsError);
                setEvents([]);
            } else {
                // Procesar eventos
                const processedEvents: ExtendedCalendarEvent[] = (calendarEvents || []).map((event: any) => ({
                    ...event,
                    clients: event.clients,
                    projects: event.projects
                }));
                setEvents(processedEvents);
            }

            // Cargar clientes
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (clientsError) {
                console.error('Error loading clients:', clientsError);
                setClients([]);
            } else {
                setClients(clientsData || []);
            }

            // Cargar proyectos
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (projectsError) {
                console.error('Error loading projects:', projectsError);
                setProjects([]);
            } else {
                setProjects(projectsData || []);
            }

            // Calcular métricas
            const today = new Date();
            const todayEvents = (calendarEvents || []).filter((event: any) => 
                isSameDay(new Date(event.start_time), today)
            );

            setDashboardMetrics({
                events_today: todayEvents.length,
                completed_today: todayEvents.filter((e: any) => e.status === 'completed').length,
                revenue_today: todayEvents.filter((e: any) => e.is_billable).length * 150,
                billable_hours_today: todayEvents.filter((e: any) => e.is_billable).length * 2,
                events_this_week: (calendarEvents || []).length,
                avg_productivity_week: 78,
                pending_insights: 3
            });

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title || !newEvent.start_time || !newEvent.end_time || !supabase) return;

        try {
            setLoading(true);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) return;

            const eventData = {
                user_id: user.id,
                title: newEvent.title,
                description: newEvent.description || '',
                start_time: newEvent.start_time,
                end_time: newEvent.end_time,
                type: newEvent.type || 'meeting',
                status: 'scheduled',
                priority: 2,
                client_id: newEvent.client_id || null,
                project_id: newEvent.project_id || null,
                is_billable: newEvent.is_billable || false,
                location: newEvent.location || '',
                meeting_url: newEvent.meeting_url || '',
                hourly_rate: newEvent.hourly_rate || null,
                tags: newEvent.tags || []
            };

            if (editingEvent) {
                // Actualizar evento existente
                const { error } = await supabase
                    .from('calendar_events')
                    .update(eventData)
                    .eq('id', editingEvent.id);

                if (error) {
                    console.error('Error updating event:', error);
                    return;
                }
            } else {
                // Crear nuevo evento
                const { error } = await supabase
                    .from('calendar_events')
                    .insert([eventData]);

                if (error) {
                    console.error('Error creating event:', error);
                    return;
                }
            }

            // Recargar datos
            await loadRealData();
            
            // Limpiar formulario
            setShowEventForm(false);
            setEditingEvent(null);
            setNewEvent({
                title: '',
                description: '',
                start_time: '',
                end_time: '',
                type: 'meeting',
                is_billable: false,
                tags: []
            });

        } catch (error) {
            console.error('Error saving event:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderWeekView = () => {
        const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
        const days: Date[] = [];
        
        for (let i = 0; i < 7; i++) {
            days.push(addDays(startOfCurrentWeek, i));
        }

        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="p-6">
                {/* Header con días de la semana */}
                <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="text-xs font-medium text-slate-500 text-center py-2">Hora</div>
                    {days.map((day, index) => (
                        <div key={index} className="text-center py-2 border-b border-slate-200">
                            <div className="text-xs font-medium text-slate-500 uppercase">
                                {format(day, 'EEE', { locale: es })}
                            </div>
                            <div className={`text-lg font-bold ${isToday(day) ? 'text-indigo-600' : 'text-slate-900'}`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid de horas */}
                <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-8 gap-2">
                        {hours.map((hour) => (
                            <React.Fragment key={hour}>
                                <div className="text-xs text-slate-500 text-right pr-2 py-4 border-t border-slate-100">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                                {days.map((day, dayIndex) => {
                                    const dayEvents = events.filter(event => {
                                        const eventDate = new Date(event.start_time);
                                        const eventHour = eventDate.getHours();
                                        return isSameDay(eventDate, day) && eventHour === hour;
                                    });

                                    return (
                                        <div 
                                            key={`${hour}-${dayIndex}`}
                                            className="min-h-12 border-t border-slate-100 relative cursor-pointer hover:bg-slate-50 transition-colors"
                                            onClick={() => {
                                                const newEventTime = new Date(day);
                                                newEventTime.setHours(hour, 0, 0, 0);
                                                const endTime = new Date(newEventTime);
                                                endTime.setHours(hour + 1, 0, 0, 0);
                                                
                                                setNewEvent({
                                                    ...newEvent,
                                                    start_time: newEventTime.toISOString().slice(0, 16),
                                                    end_time: endTime.toISOString().slice(0, 16)
                                                });
                                                setShowEventForm(true);
                                            }}
                                        >
                                            {dayEvents.map((event) => (
                                                <div 
                                                    key={event.id}
                                                    className="absolute inset-x-1 bg-indigo-100 border-l-4 border-indigo-500 rounded p-1 text-xs hover:bg-indigo-200 transition-colors cursor-pointer"
                                                    style={{ 
                                                        top: '2px',
                                                        height: 'calc(100% - 4px)'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingEvent(event);
                                                        setNewEvent({
                                                            ...event,
                                                            start_time: new Date(event.start_time).toISOString().slice(0, 16),
                                                            end_time: new Date(event.end_time).toISOString().slice(0, 16)
                                                        });
                                                        setShowEventForm(true);
                                                    }}
                                                >
                                                    <div className="font-medium text-indigo-900 truncate">{event.title}</div>
                                                    {event.clients && (
                                                        <div className="text-indigo-700 truncate">{event.clients.name}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const days: Date[] = [];
        let day = startDate;
        
        while (day <= endDate) {
            days.push(day);
            day = addDays(day, 1);
        }

        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return (
            <div className="p-6">
                {/* Header con días de la semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dayName) => (
                        <div key={dayName} className="text-center text-sm font-medium text-slate-500 py-2">
                            {dayName}
                        </div>
                    ))}
                </div>

                {/* Grid del mes */}
                <div className="space-y-2">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7 gap-2">
                            {week.map((day, dayIndex) => {
                                const dayEvents = events.filter(event => 
                                    isSameDay(new Date(event.start_time), day)
                                );
                                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                                
                                return (
                                    <div 
                                        key={dayIndex}
                                        className={`min-h-24 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                                            !isCurrentMonth ? 'bg-slate-50 text-slate-400' : 'bg-white'
                                        } ${isToday(day) ? 'ring-2 ring-indigo-500' : ''}`}
                                        onClick={() => {
                                            const newEventTime = new Date(day);
                                            newEventTime.setHours(9, 0, 0, 0);
                                            const endTime = new Date(newEventTime);
                                            endTime.setHours(10, 0, 0, 0);
                                            
                                            setNewEvent({
                                                ...newEvent,
                                                start_time: newEventTime.toISOString().slice(0, 16),
                                                end_time: endTime.toISOString().slice(0, 16)
                                            });
                                            setShowEventForm(true);
                                        }}
                                    >
                                        <div className={`text-sm font-medium ${isToday(day) ? 'text-indigo-600' : ''}`}>
                                            {format(day, 'd')}
                                        </div>
                                        <div className="space-y-1 mt-1">
                                            {dayEvents.slice(0, 2).map((event) => (
                                                <div 
                                                    key={event.id}
                                                    className="text-xs p-1 bg-indigo-100 text-indigo-800 rounded truncate cursor-pointer hover:bg-indigo-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingEvent(event);
                                                        setNewEvent({
                                                            ...event,
                                                            start_time: new Date(event.start_time).toISOString().slice(0, 16),
                                                            end_time: new Date(event.end_time).toISOString().slice(0, 16)
                                                        });
                                                        setShowEventForm(true);
                                                    }}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 2 && (
                                                <div className="text-xs text-slate-500">
                                                    +{dayEvents.length - 2} más
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const dayEvents = events.filter(event => 
            isSameDay(new Date(event.start_time), currentDate)
        );

        return (
            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                        {format(currentDate, "EEEE, d 'de' MMMM", { locale: es })}
                    </h3>
                    <p className="text-slate-600">{dayEvents.length} eventos programados</p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {hours.map((hour) => {
                        const hourEvents = dayEvents.filter(event => {
                            const eventHour = new Date(event.start_time).getHours();
                            return eventHour === hour;
                        });

                        return (
                            <div 
                                key={hour}
                                className="flex border-t border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => {
                                    const newEventTime = new Date(currentDate);
                                    newEventTime.setHours(hour, 0, 0, 0);
                                    const endTime = new Date(newEventTime);
                                    endTime.setHours(hour + 1, 0, 0, 0);
                                    
                                    setNewEvent({
                                        ...newEvent,
                                        start_time: newEventTime.toISOString().slice(0, 16),
                                        end_time: endTime.toISOString().slice(0, 16)
                                    });
                                    setShowEventForm(true);
                                }}
                            >
                                <div className="w-20 text-xs text-slate-500 text-right pr-4 py-4">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>
                                <div className="flex-1 min-h-16 relative py-2">
                                    {hourEvents.map((event) => (
                                        <div 
                                            key={event.id}
                                            className="mb-2 p-3 bg-indigo-100 border-l-4 border-indigo-500 rounded-r-lg cursor-pointer hover:bg-indigo-200 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingEvent(event);
                                                setNewEvent({
                                                    ...event,
                                                    start_time: new Date(event.start_time).toISOString().slice(0, 16),
                                                    end_time: new Date(event.end_time).toISOString().slice(0, 16)
                                                });
                                                setShowEventForm(true);
                                            }}
                                        >
                                            <div className="font-medium text-indigo-900">{event.title}</div>
                                            <div className="text-sm text-indigo-700">
                                                {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                                            </div>
                                            {event.clients && (
                                                <div className="text-sm text-indigo-600">{event.clients.name}</div>
                                            )}
                                            {event.description && (
                                                <div className="text-xs text-indigo-600 mt-1">{event.description}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="flex">
                {/* Sidebar */}
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                
                {/* Contenido principal */}
                <main className="flex-1 ml-64 p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Hero Header Premium */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-violet-600/10"></div>
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute inset-0" style={{ 
                                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(156, 146, 172, 0.15) 1px, transparent 0)`,
                                    backgroundSize: '24px 24px'
                                }}></div>
                            </div>
                            
                            {/* Content */}
                            <div className="relative p-8 lg:p-12">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
                                                    <Sparkles className="w-7 h-7 text-white" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tight">
                                                    Calendar<span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">AI</span>
                                                </h1>
                                                <p className="text-slate-300 text-lg font-medium">
                                                    Calendario Inteligente · Productividad Avanzada
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Globe className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                            </span>
                                            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                                            <Timer className="w-4 h-4" />
                                            <span className="text-sm">Tiempo real</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <Button 
                                            onClick={() => setShowEventForm(true)}
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 px-8 py-4 font-semibold rounded-2xl group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                            <Plus className="w-5 h-5 mr-2 relative z-10" />
                                            <span className="relative z-10">Nuevo Evento</span>
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            className="text-slate-300 hover:text-white hover:bg-white/10 border border-slate-600/50 hover:border-slate-500 backdrop-blur-lg rounded-2xl px-6 py-4 transition-all duration-200"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configurar
                                        </Button>
                                    </div>
                                </div>

                                {/* Premium Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                                <CalendarIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-emerald-400 text-xs font-semibold px-2 py-1 bg-emerald-500/20 rounded-full">
                                                +12%
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium mb-1">Eventos Hoy</p>
                                            <p className="text-white text-2xl font-bold mb-2">{dashboardMetrics.events_today}</p>
                                            <div className="flex items-center text-emerald-400 text-xs">
                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                <span>vs ayer</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-blue-400 text-xs font-semibold px-2 py-1 bg-blue-500/20 rounded-full">
                                                ✓ {Math.round((dashboardMetrics.completed_today / Math.max(dashboardMetrics.events_today, 1)) * 100)}%
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium mb-1">Completados</p>
                                            <p className="text-white text-2xl font-bold mb-2">{dashboardMetrics.completed_today}</p>
                                            <div className="flex items-center text-blue-400 text-xs">
                                                <Activity className="w-3 h-3 mr-1" />
                                                <span>tasa de completado</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-amber-400 text-xs font-semibold px-2 py-1 bg-amber-500/20 rounded-full">
                                                Focus
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium mb-1">Horas Facturables</p>
                                            <p className="text-white text-2xl font-bold mb-2">{dashboardMetrics.billable_hours_today}h</p>
                                            <div className="flex items-center text-amber-400 text-xs">
                                                <Zap className="w-3 h-3 mr-1" />
                                                <span>productividad alta</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                                                <DollarSign className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-green-400 text-xs font-semibold px-2 py-1 bg-green-500/20 rounded-full">
                                                +€{Math.round(dashboardMetrics.revenue_today * 0.15)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-sm font-medium mb-1">Ingresos Hoy</p>
                                            <p className="text-white text-2xl font-bold mb-2">€{dashboardMetrics.revenue_today}</p>
                                            <div className="flex items-center text-green-400 text-xs">
                                                <BarChart3 className="w-3 h-3 mr-1" />
                                                <span>tendencia positiva</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Control Bar */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                {/* Left Section - View Controls */}
                                <div className="flex items-center gap-6">
                                    {/* View Mode Toggle */}
                                    <div className="relative bg-gradient-to-r from-slate-100 to-slate-50 p-1 rounded-xl border border-slate-200/80 shadow-inner">
                                        <div className="flex relative">
                                            <Button
                                                onClick={() => setViewMode('day')}
                                                className={`relative z-10 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                                    viewMode === 'day' 
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                                }`}
                                            >
                                                Día
                                            </Button>
                                            <Button
                                                onClick={() => setViewMode('week')}
                                                className={`relative z-10 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                                    viewMode === 'week' 
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                                }`}
                                            >
                                                Semana
                                            </Button>
                                            <Button
                                                onClick={() => setViewMode('month')}
                                                className={`relative z-10 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                                                    viewMode === 'month' 
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                                }`}
                                            >
                                                Mes
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Navigation Controls */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'month' ? -30 : viewMode === 'week' ? -7 : -1))}
                                            className="w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentDate(new Date())}
                                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border border-slate-200/60 text-slate-700 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            Hoy
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1))}
                                            className="w-10 h-10 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Current Date Display */}
                                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-slate-700">
                                            {viewMode === 'month' && format(currentDate, "MMMM yyyy", { locale: es })}
                                            {viewMode === 'week' && `Semana del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: es })}`}
                                            {viewMode === 'day' && format(currentDate, "d 'de' MMMM", { locale: es })}
                                        </span>
                                    </div>
                                </div>

                                {/* Right Section - Search & Actions */}
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <Input
                                            placeholder="Buscar eventos..."
                                            className="pl-10 pr-4 py-2 w-64 bg-slate-50/80 border-slate-200/60 rounded-xl focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        />
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost" 
                                            className="w-10 h-10 rounded-xl bg-slate-100/60 hover:bg-slate-200/80 border border-slate-200/60 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <Filter className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="w-10 h-10 rounded-xl bg-slate-100/60 hover:bg-slate-200/80 border border-slate-200/60 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Calendar View */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                            {/* Calendar Header */}
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 px-6 py-4 border-b border-slate-200/60">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <CalendarIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">
                                                {viewMode === 'month' && 'Vista Mensual'}
                                                {viewMode === 'week' && 'Vista Semanal'}
                                                {viewMode === 'day' && 'Vista Diaria'}
                                            </h3>
                                            <p className="text-sm text-slate-600">
                                                {events.length} evento{events.length !== 1 ? 's' : ''} en este período
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span>Reuniones</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Trabajo</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                            <span>Personal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Calendar Content */}
                            <div className="min-h-[600px]">
                                {viewMode === 'week' && renderWeekView()}
                                {viewMode === 'month' && renderMonthView()}
                                {viewMode === 'day' && renderDayView()}
                            </div>
                        </div>

                        {/* Enhanced Side Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Actions & Time Blocks */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quick Actions */}
                                <div className="bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-lg">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                        Acciones Rápidas
                                    </h3>
                                    <div className="space-y-3">
                                        <Button 
                                            onClick={() => setShowEventForm(true)}
                                            className="w-full justify-start bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-slate-700 border border-blue-200/60 rounded-xl"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Crear evento rápido
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            className="w-full justify-start text-slate-600 hover:bg-slate-100/80 rounded-xl"
                                        >
                                            <Video className="w-4 h-4 mr-2" />
                                            Reunión virtual
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            className="w-full justify-start text-slate-600 hover:bg-slate-100/80 rounded-xl"
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Llamada telefónica
                                        </Button>
                                    </div>
                                </div>

                                {/* Time Blocks */}
                                <div className="bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/60 shadow-lg">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Workflow className="w-5 h-5 text-blue-500" />
                                        Bloques de Tiempo
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-xl border border-blue-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-slate-700">Trabajo Concentrado</span>
                                            </div>
                                            <span className="text-xs text-slate-500">09:00-11:00</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50/80 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-slate-700">Reuniones</span>
                                            </div>
                                            <span className="text-xs text-slate-500">14:00-16:00</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-amber-50/80 rounded-xl border border-amber-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-slate-700">Tareas Admin</span>
                                            </div>
                                            <span className="text-xs text-slate-500">16:30-17:30</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Upcoming Events Sidebar */}
                            <div className="space-y-6">
                                {/* Premium Upcoming Events */}
                                <div className="bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">Próximos Eventos</h3>
                                                    <p className="text-blue-100 text-sm">Agenda de hoy</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{events.length}</div>
                                                <div className="text-blue-100 text-xs">eventos</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 space-y-4">
                                        {events.slice(0, 4).map((event, index) => (
                                            <div key={event.id} className="group relative p-4 bg-slate-50/60 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200 cursor-pointer hover:shadow-md">
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                                        event.type === 'meeting' ? 'bg-blue-500' :
                                                        event.type === 'work' ? 'bg-green-500' :
                                                        event.type === 'break' ? 'bg-amber-500' :
                                                        'bg-purple-500'
                                                    }`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-semibold text-slate-900 text-sm truncate">{event.title}</h4>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                                event.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {event.status === 'completed' ? 'Completado' :
                                                                 event.status === 'in_progress' ? 'En progreso' : 'Programado'}
                                                            </span>
                                                        </div>
                                                        {event.description && (
                                                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">{event.description}</p>
                                                        )}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</span>
                                                            </div>
                                                            {event.is_billable && (
                                                                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    <span>Facturable</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {event.clients && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                                                                <Users className="w-3 h-3" />
                                                                <span>{event.clients.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {events.length === 0 && (
                                            <div className="text-center py-8 text-slate-500">
                                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <CalendarIcon className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <p className="font-medium">No hay eventos próximos</p>
                                                <p className="text-sm mt-1">Crea tu primer evento para comenzar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights - Horizontal Layout */}
                        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl border border-purple-300/20 shadow-2xl overflow-hidden">
                            <div className="relative p-8">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0" style={{ 
                                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(156, 146, 172, 0.3) 1px, transparent 0)`,
                                        backgroundSize: '24px 24px'
                                    }}></div>
                                </div>
                                
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                                                <Brain className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-2xl">AI Insights</h3>
                                                <p className="text-purple-200 text-lg">Inteligencia artificial en tiempo real</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-purple-200 text-sm font-medium">Activo</span>
                                            </div>
                                            <div className="text-purple-200 text-sm bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/20">
                                                {dashboardMetrics.pending_insights} nuevos insights
                                            </div>
                                        </div>
                                    </div>

                                    {/* Horizontal Insights Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="group relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                                    <TrendingUp className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-white text-lg">Productividad</h4>
                                                        <div className="text-emerald-400 text-xs bg-emerald-500/20 px-2 py-1 rounded-full font-bold">
                                                            +15%
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 text-sm leading-relaxed mb-3">Tu productividad ha mejorado significativamente con la organización del calendario.</p>
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-emerald-400 text-xs font-medium">Recomendación principal</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="group relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                                                    <Lightbulb className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-white text-lg">Horario Óptimo</h4>
                                                        <div className="text-amber-400 text-xs bg-amber-500/20 px-2 py-1 rounded-full font-bold">
                                                            Smart
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 text-sm leading-relaxed mb-3">Programa reuniones entre 10:00-11:30 para máxima efectividad cognitiva.</p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-amber-400" />
                                                        <span className="text-amber-400 text-xs font-medium">Horario detectado por IA</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="group relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                                    <Target className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-white text-lg">Patrones</h4>
                                                        <div className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full font-bold">
                                                            Análisis
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 text-sm leading-relaxed mb-3">Eres más productivo los martes y miércoles. Programa tareas complejas entonces.</p>
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-blue-400" />
                                                        <span className="text-blue-400 text-xs font-medium">Patrón identificado</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Actions Footer */}
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-purple-200">
                                                <Sparkles className="w-5 h-5" />
                                                <span className="font-medium">Powered by CalendarAI • Aprendizaje continuo activado</span>
                                            </div>
                                            <Button 
                                                variant="ghost"
                                                className="text-purple-200 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl font-medium transition-all duration-200"
                                            >
                                                Ver análisis completo →
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Event Form Modal */}
                        {showEventForm && (
                            <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-slate-900/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
                                <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden border border-slate-200/60">
                                    {/* Modal Header */}
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold mb-1">
                                                        {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
                                                    </h3>
                                                    <p className="text-blue-100">Programa tu próxima actividad</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setShowEventForm(false);
                                                    setEditingEvent(null);
                                                    setNewEvent({
                                                        title: '',
                                                        description: '',
                                                        start_time: '',
                                                        end_time: '',
                                                        type: 'meeting',
                                                        is_billable: false,
                                                        tags: []
                                                    });
                                                }}
                                                variant="ghost"
                                                className="text-white hover:bg-white/20 w-10 h-10 rounded-xl"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Modal Content */}
                                    <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
                                        <div className="space-y-8">
                                            {/* Información básica */}
                                            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-blue-500 rounded-lg"></div>
                                                    Información Básica
                                                </h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Título del evento</label>
                                                        <Input
                                                            value={newEvent.title || ''}
                                                            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                                            placeholder="Ej. Reunión con cliente, Workshop, Llamada de seguimiento..."
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                                                        <textarea
                                                            value={newEvent.description || ''}
                                                            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                                            placeholder="Agenda, objetivos, notas importantes..."
                                                            rows={3}
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tiempo y duración */}
                                            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-green-500 rounded-lg"></div>
                                                    Fecha y Hora
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Inicio</label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={newEvent.start_time || ''}
                                                            onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Fin</label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={newEvent.end_time || ''}
                                                            onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Categorización */}
                                            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-purple-500 rounded-lg"></div>
                                                    Categorización
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de evento</label>
                                                        <select
                                                            value={newEvent.type || 'meeting'}
                                                            onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        >
                                                            <option value="meeting">🤝 Reunión</option>
                                                            <option value="work">💻 Trabajo</option>
                                                            <option value="break">☕ Descanso</option>
                                                            <option value="focus">🎯 Trabajo Concentrado</option>
                                                            <option value="client_call">📞 Llamada con Cliente</option>
                                                            <option value="project_review">📋 Revisión de Proyecto</option>
                                                            <option value="planning">📝 Planificación</option>
                                                            <option value="development">⚡ Desarrollo</option>
                                                            <option value="design_work">🎨 Trabajo de Diseño</option>
                                                            <option value="admin">📊 Administración</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cliente</label>
                                                        <select
                                                            value={newEvent.client_id || ''}
                                                            onChange={(e) => setNewEvent({...newEvent, client_id: e.target.value})}
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        >
                                                            <option value="">Sin cliente específico</option>
                                                            {clients.map((client) => (
                                                                <option key={client.id} value={client.id}>
                                                                    {client.name} - {client.company}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Proyecto relacionado</label>
                                                    <select
                                                        value={newEvent.project_id || ''}
                                                        onChange={(e) => setNewEvent({...newEvent, project_id: e.target.value})}
                                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                    >
                                                        <option value="">Sin proyecto específico</option>
                                                        {projects.map((project) => (
                                                            <option key={project.id} value={project.id}>
                                                                {project.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Ubicación y conexión */}
                                            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-amber-500 rounded-lg"></div>
                                                    Ubicación y Conexión
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Ubicación física</label>
                                                        <Input
                                                            value={newEvent.location || ''}
                                                            onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                                            placeholder="Oficina, dirección, sala de reuniones..."
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">URL de reunión virtual</label>
                                                        <Input
                                                            value={newEvent.meeting_url || ''}
                                                            onChange={(e) => setNewEvent({...newEvent, meeting_url: e.target.value})}
                                                            placeholder="https://meet.google.com/..."
                                                            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Facturación */}
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/60">
                                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-green-500 rounded-lg"></div>
                                                    Información de Facturación
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            id="is_billable"
                                                            checked={newEvent.is_billable || false}
                                                            onChange={(e) => setNewEvent({...newEvent, is_billable: e.target.checked})}
                                                            className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                                        />
                                                        <label htmlFor="is_billable" className="text-sm font-semibold text-slate-700">
                                                            ✅ Este evento es facturable
                                                        </label>
                                                    </div>
                                                    {newEvent.is_billable && (
                                                        <div className="mt-4">
                                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tarifa por hora (€)</label>
                                                            <Input
                                                                type="number"
                                                                value={newEvent.hourly_rate || ''}
                                                                onChange={(e) => setNewEvent({...newEvent, hourly_rate: parseFloat(e.target.value) || 0})}
                                                                placeholder="75"
                                                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/60">
                                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-indigo-500 rounded-lg"></div>
                                                    Etiquetas y Organización
                                                </h4>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (separados por comas)</label>
                                                    <Input
                                                        value={(newEvent.tags || []).join(', ')}
                                                        onChange={(e) => setNewEvent({
                                                            ...newEvent, 
                                                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                                                        })}
                                                        placeholder="importante, urgente, cliente-vip, estratégico..."
                                                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-2">Usa etiquetas para organizar y filtrar tus eventos fácilmente</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-4 pt-8 border-t border-slate-200 mt-8">
                                            <Button
                                                onClick={() => {
                                                    setShowEventForm(false);
                                                    setEditingEvent(null);
                                                    setNewEvent({
                                                        title: '',
                                                        description: '',
                                                        start_time: '',
                                                        end_time: '',
                                                        type: 'meeting',
                                                        is_billable: false,
                                                        tags: []
                                                    });
                                                }}
                                                variant="ghost"
                                                className="flex-1 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleCreateEvent}
                                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Guardando...
                                                    </div>
                                                ) : (
                                                    editingEvent ? '✅ Actualizar Evento' : '🚀 Crear Evento'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
