'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Plus, 
    Play, 
    Pause, 
    MapPin, 
    Target, 
    TrendingUp,
    Users,
    DollarSign,
    Activity,
    CheckCircle,
    AlertCircle,
    Brain,
    Lightbulb,
    Zap,
    BarChart3,
    Filter,
    Search,
    Download,
    Share2,
    Bell,
    Star,
    Hash,
    Tag,
    Calendar as CalendarGridIcon
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, addHours, subHours } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos demo importados
import { demoCalendarEvents, demoClients, demoProjects } from '../../demo/demo-data';

// ==================== TIPOS ====================
interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    event_type: 'meeting' | 'task' | 'break' | 'focus';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    client_id?: string;
    project_id?: string;
    location?: string;
    is_billable: boolean;
    hourly_rate?: number;
    tags?: string[];
}

interface ExtendedCalendarEvent extends CalendarEvent {
    clients?: { name: string; company?: string };
    projects?: { name: string; description?: string };
}

interface Client {
    id: string;
    name: string;
    company?: string;
}

interface Project {
    id: string;
    name: string;
    description?: string;
    client_id: string;
}

interface DashboardMetrics {
    events_today: number;
    completed_today: number;
    revenue_today: number;
    billable_hours_today: number;
    events_this_week: number;
    avg_productivity_week: number;
    pending_insights: number;
    active_automations: number;
    revenue_forecast_week: number;
}

interface SmartSuggestion {
    type: string;
    title: string;
    description: string;
    confidence: number;
    reasoning: string;
}

interface AIInsight {
    id: string;
    insight_type: string;
    type: string;
    title: string;
    description: string;
    confidence_score: number;
    impact_score: number;
    actionability_score: number;
    recommendations: string[];
    suggested_actions: string[];
    status: string;
    category: string;
    created_at: string;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function CalendarPageClientDemo() {
    // Estados principales
    const [events, setEvents] = useState<ExtendedCalendarEvent[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);

    // Estados de tracking
    const [activeTracking, setActiveTracking] = useState<string | null>(null);
    const [trackingTime, setTrackingTime] = useState(0);

    // Estados de formulario
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        event_type: 'meeting',
        priority: 'medium',
        is_billable: false,
        tags: []
    });

    // Estados de filtros
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [filters, setFilters] = useState({
        client: '',
        project: '',
        status: '',
        type: ''
    });

    // Estados de IA y métricas
    const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
        events_today: 0,
        completed_today: 0,
        revenue_today: 0,
        billable_hours_today: 0,
        events_this_week: 0,
        avg_productivity_week: 75,
        pending_insights: 3,
        active_automations: 2,
        revenue_forecast_week: 1200
    });
    const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
    const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
    const [aiLoading, setAILoading] = useState(false);

    // ==================== EFECTOS Y INICIALIZACIÓN ====================
    useEffect(() => {
        initializeCalendar();
    }, []);

    useEffect(() => {
        if (newEvent.client_id) {
            const clientProjects = projects.filter(p => p.client_id === newEvent.client_id);
            setFilteredProjects(clientProjects);
        } else {
            setFilteredProjects([]);
        }
    }, [newEvent.client_id, projects]);

    useEffect(() => {
        if (events.length > 0) {
            loadAIData();
            updateMetrics();
        }
    }, [events, currentDate]);

    // Tracking timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTracking) {
            interval = setInterval(() => {
                setTrackingTime(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTracking]);

    const initializeCalendar = () => {
        setLoading(true);
        try {
            // Cargar datos demo
            const processedEvents = demoCalendarEvents.map(event => ({
                ...event,
                clients: event.client_id ? demoClients.find(c => c.id === event.client_id) : undefined,
                projects: event.project_id ? demoProjects.find(p => p.id === event.project_id) : undefined
            }));

            setEvents(processedEvents);
            setClients(demoClients);
            setProjects(demoProjects);
            
            // Verificar si hay eventos en progreso
            const eventInProgress = processedEvents.find(event => event.status === 'in_progress');
            if (eventInProgress) {
                setActiveTracking(eventInProgress.id);
            }
        } catch (error) {
            console.error('Error initializing calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateMetrics = () => {
        const today = new Date();
        const todayEvents = events.filter(e => 
            new Date(e.start_time).toDateString() === today.toDateString()
        );
        const completedToday = todayEvents.filter(e => e.status === 'completed');
        const billableToday = completedToday.filter(e => e.is_billable);
        
        const revenueToday = billableToday.reduce((sum, event) => {
            const duration = (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60);
            return sum + (duration * (event.hourly_rate || 50));
        }, 0);

        const billableHoursToday = billableToday.reduce((sum, event) => {
            const duration = (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60);
            return sum + duration;
        }, 0);

        setDashboardMetrics({
            events_today: todayEvents.length,
            completed_today: completedToday.length,
            revenue_today: Math.round(revenueToday),
            billable_hours_today: Math.round(billableHoursToday * 10) / 10,
            events_this_week: events.length,
            avg_productivity_week: Math.round((completedToday.length / Math.max(todayEvents.length, 1)) * 100),
            pending_insights: 3,
            active_automations: 2,
            revenue_forecast_week: 1500
        });
    };

    const loadAIData = () => {
        setAILoading(true);
        try {
            // Generar sugerencias inteligentes basadas en los datos
            const suggestions: SmartSuggestion[] = [
                {
                    type: 'optimal_time',
                    title: '🎯 Horario Óptimo Detectado',
                    description: 'Eres más productivo entre las 9:00 y 11:00. Considera programar tareas importantes en este horario.',
                    confidence: 87,
                    reasoning: 'Análisis de patrones de completación de tareas'
                },
                {
                    type: 'break_suggestion',
                    title: '☕ Sugerencia de Descanso',
                    description: 'Has trabajado 3 horas seguidas. Un descanso de 15 minutos puede mejorar tu productividad.',
                    confidence: 92,
                    reasoning: 'Patrones de fatiga detectados'
                },
                {
                    type: 'revenue_optimization',
                    title: '💰 Optimización de Ingresos',
                    description: 'Aumentar tu tarifa por hora en un 10% podría generar €150 adicionales esta semana.',
                    confidence: 78,
                    reasoning: 'Análisis de mercado y tiempo facturable'
                }
            ];

            // Generar insights de IA
            const insights: AIInsight[] = [
                {
                    id: 'productivity-' + Date.now(),
                    insight_type: 'productivity',
                    type: 'productivity',
                    title: '📊 Análisis de Productividad Semanal',
                    description: `Tu productividad ha aumentado un 15% esta semana. Has completado ${dashboardMetrics.completed_today} de ${dashboardMetrics.events_today} tareas hoy.`,
                    confidence_score: 85,
                    impact_score: 80,
                    actionability_score: 75,
                    recommendations: [
                        'Mantén el ritmo actual de trabajo',
                        'Considera delegar tareas menos prioritarias',
                        'Programa más reuniones en tu horario óptimo'
                    ],
                    suggested_actions: [],
                    status: 'new',
                    category: 'productivity',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'revenue-' + Date.now(),
                    insight_type: 'revenue',
                    type: 'revenue',
                    title: '💰 Oportunidades de Ingresos',
                    description: `Ingresos proyectados: €${dashboardMetrics.revenue_forecast_week}. Horas facturables esta semana: ${dashboardMetrics.billable_hours_today * 5}h.`,
                    confidence_score: 90,
                    impact_score: 95,
                    actionability_score: 85,
                    recommendations: [
                        'Aumenta las horas facturables en un 10%',
                        'Revisa tarifas con clientes de larga duración',
                        'Identifica oportunidades de servicios premium'
                    ],
                    suggested_actions: [],
                    status: 'new',
                    category: 'revenue',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'optimization-' + Date.now(),
                    insight_type: 'optimization',
                    type: 'optimization',
                    title: '🚀 Optimización de Horarios',
                    description: 'Detectamos que tu mejor rendimiento es entre las 9:00 y 11:00 (95% de tareas completadas).',
                    confidence_score: 93,
                    impact_score: 88,
                    actionability_score: 95,
                    recommendations: [
                        'Programa reuniones importantes en horario de alta productividad',
                        'Reserva las tardes para tareas administrativas',
                        'Bloquea tiempo de enfoque profundo por las mañanas'
                    ],
                    suggested_actions: [],
                    status: 'new',
                    category: 'optimization',
                    created_at: new Date().toISOString()
                }
            ];

            setSmartSuggestions(suggestions);
            setAIInsights(insights);
        } catch (error) {
            console.error('Error loading AI data:', error);
        } finally {
            setAILoading(false);
        }
    };

    // ==================== FUNCIONES DE EVENTOS ====================
    const createEvent = () => {
        if (!newEvent.title?.trim() || !newEvent.start_time || !newEvent.end_time) return;

        try {
            const eventId = `event_${Date.now()}`;
            const eventToCreate: ExtendedCalendarEvent = {
                id: eventId,
                title: newEvent.title,
                description: newEvent.description || '',
                start_time: newEvent.start_time,
                end_time: newEvent.end_time,
                event_type: newEvent.event_type || 'meeting',
                status: 'scheduled',
                priority: newEvent.priority || 'medium',
                client_id: newEvent.client_id,
                project_id: newEvent.project_id,
                location: newEvent.location,
                is_billable: newEvent.is_billable || false,
                hourly_rate: newEvent.hourly_rate,
                tags: newEvent.tags || [],
                clients: newEvent.client_id ? clients.find(c => c.id === newEvent.client_id) : undefined,
                projects: newEvent.project_id ? projects.find(p => p.id === newEvent.project_id) : undefined
            };

            setEvents(prev => [...prev, eventToCreate]);
            resetEventForm();
            setShowEventForm(false);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const updateEvent = () => {
        if (!editingEvent || !newEvent.title?.trim()) return;

        try {
            const updatedEvent: ExtendedCalendarEvent = {
                ...editingEvent,
                title: newEvent.title,
                description: newEvent.description || '',
                start_time: newEvent.start_time || editingEvent.start_time,
                end_time: newEvent.end_time || editingEvent.end_time,
                event_type: newEvent.event_type || editingEvent.event_type,
                priority: newEvent.priority || editingEvent.priority,
                client_id: newEvent.client_id || editingEvent.client_id,
                project_id: newEvent.project_id || editingEvent.project_id,
                location: newEvent.location || editingEvent.location,
                is_billable: newEvent.is_billable ?? editingEvent.is_billable,
                hourly_rate: newEvent.hourly_rate || editingEvent.hourly_rate,
                tags: newEvent.tags || editingEvent.tags,
                clients: newEvent.client_id ? clients.find(c => c.id === newEvent.client_id) : undefined,
                projects: newEvent.project_id ? projects.find(p => p.id === newEvent.project_id) : undefined
            };

            setEvents(prev => prev.map(e => e.id === editingEvent.id ? updatedEvent : e));
            resetEventForm();
            setShowEventForm(false);
            setEditingEvent(null);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const deleteEvent = (eventId: string) => {
        try {
            setEvents(prev => prev.filter(e => e.id !== eventId));
            if (activeTracking === eventId) {
                setActiveTracking(null);
                setTrackingTime(0);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const toggleEventStatus = (eventId: string) => {
        try {
            setEvents(prev => prev.map(event => {
                if (event.id === eventId) {
                    const newStatus = event.status === 'completed' ? 'scheduled' : 'completed';
                    return { ...event, status: newStatus };
                }
                return event;
            }));
        } catch (error) {
            console.error('Error updating event status:', error);
        }
    };

    const startTracking = (eventId: string) => {
        try {
            if (activeTracking) {
                stopTracking();
            }

            setActiveTracking(eventId);
            setTrackingTime(0);
            
            setEvents(prev => prev.map(event => 
                event.id === eventId 
                    ? { ...event, status: 'in_progress' }
                    : event
            ));
        } catch (error) {
            console.error('Error starting tracking:', error);
        }
    };

    const stopTracking = () => {
        try {
            if (!activeTracking) return;

            setEvents(prev => prev.map(event => 
                event.id === activeTracking 
                    ? { ...event, status: 'completed' }
                    : event
            ));

            setActiveTracking(null);
            setTrackingTime(0);
        } catch (error) {
            console.error('Error stopping tracking:', error);
        }
    };

    // ==================== FUNCIONES DE UTILIDAD ====================
    const resetEventForm = () => {
        setNewEvent({
            title: '',
            description: '',
            start_time: '',
            end_time: '',
            event_type: 'meeting',
            priority: 'medium',
            is_billable: false,
            tags: []
        });
    };

    const openEditForm = (event: CalendarEvent) => {
        setEditingEvent(event);
        setNewEvent({
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            event_type: event.event_type,
            priority: event.priority,
            client_id: event.client_id,
            project_id: event.project_id,
            location: event.location,
            is_billable: event.is_billable,
            hourly_rate: event.hourly_rate,
            tags: event.tags
        });
        setShowEventForm(true);
    };

    const formatTrackingTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case 'meeting': return <Users className="w-4 h-4" />;
            case 'task': return <Target className="w-4 h-4" />;
            case 'break': return <Clock className="w-4 h-4" />;
            case 'focus': return <Brain className="w-4 h-4" />;
            default: return <CalendarIcon className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Filtrar eventos según filtros activos
    const filteredEvents = events.filter(event => {
        if (filters.client && event.client_id !== filters.client) return false;
        if (filters.project && event.project_id !== filters.project) return false;
        if (filters.status && event.status !== filters.status) return false;
        if (filters.type && event.event_type !== filters.type) return false;
        return true;
    });

    // Obtener eventos para la vista actual
    const getEventsForView = () => {
        const now = new Date();
        switch (viewMode) {
            case 'day':
                return filteredEvents.filter(event => 
                    isSameDay(new Date(event.start_time), selectedDate || now)
                );
            case 'week':
                const weekStart = startOfWeek(selectedDate || now, { locale: es });
                const weekEnd = endOfWeek(selectedDate || now, { locale: es });
                return filteredEvents.filter(event => {
                    const eventDate = new Date(event.start_time);
                    return eventDate >= weekStart && eventDate <= weekEnd;
                });
            case 'month':
                return filteredEvents.filter(event => {
                    const eventDate = new Date(event.start_time);
                    const targetDate = selectedDate || now;
                    return eventDate.getMonth() === targetDate.getMonth() && 
                           eventDate.getFullYear() === targetDate.getFullYear();
                });
            default:
                return filteredEvents;
        }
    };

    const viewEvents = getEventsForView();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando calendario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con métricas */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">📅 Calendario Inteligente</h1>
                        <p className="text-blue-100">
                            {format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {activeTracking && (
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="font-mono text-lg">
                                        {formatTrackingTime(trackingTime)}
                                    </span>
                                </div>
                            </div>
                        )}
                        <Button 
                            onClick={() => setShowEventForm(true)}
                            className="bg-white text-blue-600 hover:bg-blue-50"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nuevo Evento
                        </Button>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-blue-100">Eventos Hoy</p>
                                <p className="text-xl font-bold">{dashboardMetrics.events_today}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-blue-100">Completados</p>
                                <p className="text-xl font-bold">{dashboardMetrics.completed_today}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-blue-100">Ingresos Hoy</p>
                                <p className="text-xl font-bold">€{dashboardMetrics.revenue_today}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-blue-100">Horas Facturables</p>
                                <p className="text-xl font-bold">{dashboardMetrics.billable_hours_today}h</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles de vista y filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                {/* Controles de vista */}
                <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 rounded-lg p-1 flex">
                        {['day', 'week', 'month'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === mode
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {mode === 'day' && '📅 Día'}
                                {mode === 'week' && '📊 Semana'}
                                {mode === 'month' && '🗓️ Mes'}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(subHours(currentDate, 24))}
                        >
                            ←
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                        >
                            Hoy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(addHours(currentDate, 24))}
                        >
                            →
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">Todos los estados</option>
                        <option value="scheduled">Programado</option>
                        <option value="in_progress">En progreso</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="meeting">Reunión</option>
                        <option value="task">Tarea</option>
                        <option value="break">Descanso</option>
                        <option value="focus">Enfoque</option>
                    </select>
                </div>
            </div>

            {/* Panel principal con dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal - Lista de eventos */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Eventos {viewMode === 'day' ? 'del Día' : viewMode === 'week' ? 'de la Semana' : 'del Mes'}
                            </h3>
                            <span className="text-sm text-gray-500">
                                {viewEvents.length} eventos
                            </span>
                        </div>

                        {viewEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No hay eventos programados</p>
                                <Button 
                                    onClick={() => setShowEventForm(true)}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear primer evento
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {viewEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                                            activeTracking === event.id ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getEventTypeIcon(event.event_type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className="font-medium text-gray-900 truncate">
                                                            {event.title}
                                                        </h4>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(event.priority)}`}>
                                                            {event.priority === 'high' && '🔴 Alta'}
                                                            {event.priority === 'medium' && '🟡 Media'}
                                                            {event.priority === 'low' && '🟢 Baja'}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                                                            {event.status === 'scheduled' && '📅 Programado'}
                                                            {event.status === 'in_progress' && '▶️ En progreso'}
                                                            {event.status === 'completed' && '✅ Completado'}
                                                            {event.status === 'cancelled' && '❌ Cancelado'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                                        <span className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                                                        </span>
                                                        {event.clients && (
                                                            <span className="flex items-center">
                                                                <Users className="w-4 h-4 mr-1" />
                                                                {event.clients.name}
                                                            </span>
                                                        )}
                                                        {event.projects && (
                                                            <span className="flex items-center">
                                                                <Target className="w-4 h-4 mr-1" />
                                                                {event.projects.name}
                                                            </span>
                                                        )}
                                                        {event.is_billable && (
                                                            <span className="flex items-center text-green-600">
                                                                <DollarSign className="w-4 h-4 mr-1" />
                                                                €{event.hourly_rate || 50}/h
                                                            </span>
                                                        )}
                                                    </div>

                                                    {event.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                                    )}

                                                    {event.location && (
                                                        <div className="flex items-center text-sm text-gray-500 mb-2">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {event.location}
                                                        </div>
                                                    )}

                                                    {event.tags && event.tags.length > 0 && (
                                                        <div className="flex items-center space-x-1 mb-2">
                                                            {event.tags.map((tag, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                                                                    <Hash className="w-3 h-3 mr-1" />
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                {event.status !== 'completed' && event.status !== 'cancelled' && (
                                                    <Button
                                                        size="sm"
                                                        variant={activeTracking === event.id ? "destructive" : "default"}
                                                        onClick={() => 
                                                            activeTracking === event.id ? stopTracking() : startTracking(event.id)
                                                        }
                                                    >
                                                        {activeTracking === event.id ? (
                                                            <>
                                                                <Pause className="w-4 h-4 mr-1" />
                                                                Parar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="w-4 h-4 mr-1" />
                                                                Iniciar
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                                
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => toggleEventStatus(event.id)}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                                
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openEditForm(event)}
                                                >
                                                    Editar
                                                </Button>
                                                
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => deleteEvent(event.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Columna lateral - IA y sugerencias */}
                <div className="space-y-4">
                    {/* Sugerencias inteligentes */}
                    <Card className="p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold">IA Asistente</h3>
                            {aiLoading && <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        
                        {smartSuggestions.length > 0 ? (
                            <div className="space-y-3">
                                {smartSuggestions.map((suggestion, index) => (
                                    <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    {suggestion.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {suggestion.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-purple-600 font-medium">
                                                        {suggestion.confidence}% confianza
                                                    </span>
                                                    <Button size="sm" variant="outline" className="text-xs">
                                                        Aplicar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <Brain className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Analizando patrones...</p>
                            </div>
                        )}
                    </Card>

                    {/* Insights de IA */}
                    <Card className="p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold">Insights</h3>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {aiInsights.length}
                            </span>
                        </div>
                        
                        {aiInsights.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {aiInsights.map((insight) => (
                                    <div key={insight.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {insight.title}
                                            </h4>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                <span className="text-xs text-gray-500">
                                                    {insight.confidence_score}%
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3">
                                            {insight.description}
                                        </p>
                                        {insight.recommendations.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-700">Recomendaciones:</p>
                                                {insight.recommendations.slice(0, 2).map((rec, index) => (
                                                    <p key={index} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200">
                                                        • {rec}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Generando insights...</p>
                            </div>
                        )}
                    </Card>

                    {/* Métricas detalladas */}
                    <Card className="p-4">
                        <h3 className="font-semibold mb-4">📊 Métricas Detalladas</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Productividad Semanal</span>
                                <span className="font-medium">{dashboardMetrics.avg_productivity_week}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Eventos esta Semana</span>
                                <span className="font-medium">{dashboardMetrics.events_this_week}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Ingresos Proyectados</span>
                                <span className="font-medium text-green-600">€{dashboardMetrics.revenue_forecast_week}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Insights Pendientes</span>
                                <span className="font-medium">{dashboardMetrics.pending_insights}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Automatizaciones</span>
                                <span className="font-medium text-blue-600">{dashboardMetrics.active_automations}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal de formulario */}
            {showEventForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">
                                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowEventForm(false);
                                    setEditingEvent(null);
                                    resetEventForm();
                                }}
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título del Evento *
                                </label>
                                <Input
                                    value={newEvent.title || ''}
                                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                    placeholder="Ej. Reunión con cliente, Desarrollo de feature..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={newEvent.description || ''}
                                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                    placeholder="Detalles adicionales del evento..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha y Hora de Inicio *
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={newEvent.start_time || ''}
                                        onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha y Hora de Fin *
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={newEvent.end_time || ''}
                                        onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo de Evento
                                    </label>
                                    <select
                                        value={newEvent.event_type || 'meeting'}
                                        onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="meeting">🤝 Reunión</option>
                                        <option value="task">✅ Tarea</option>
                                        <option value="break">☕ Descanso</option>
                                        <option value="focus">🎯 Enfoque</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prioridad
                                    </label>
                                    <select
                                        value={newEvent.priority || 'medium'}
                                        onChange={(e) => setNewEvent({...newEvent, priority: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="low">🟢 Baja</option>
                                        <option value="medium">🟡 Media</option>
                                        <option value="high">🔴 Alta</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cliente
                                    </label>
                                    <select
                                        value={newEvent.client_id || ''}
                                        onChange={(e) => setNewEvent({...newEvent, client_id: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="">Seleccionar cliente...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.company && `(${client.company})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Proyecto
                                    </label>
                                    <select
                                        value={newEvent.project_id || ''}
                                        onChange={(e) => setNewEvent({...newEvent, project_id: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        disabled={!newEvent.client_id}
                                    >
                                        <option value="">Seleccionar proyecto...</option>
                                        {filteredProjects.map(project => (
                                            <option key={project.id} value={project.id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ubicación
                                </label>
                                <Input
                                    value={newEvent.location || ''}
                                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                    placeholder="Ej. Oficina, Zoom, Google Meet..."
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.is_billable || false}
                                        onChange={(e) => setNewEvent({...newEvent, is_billable: e.target.checked})}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Tiempo facturable</span>
                                </label>
                                
                                {newEvent.is_billable && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700">Tarifa por hora:</span>
                                        <Input
                                            type="number"
                                            value={newEvent.hourly_rate || ''}
                                            onChange={(e) => setNewEvent({...newEvent, hourly_rate: parseFloat(e.target.value)})}
                                            placeholder="50"
                                            className="w-20"
                                        />
                                        <span className="text-sm text-gray-700">€/h</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (separadas por comas)
                                </label>
                                <Input
                                    value={newEvent.tags?.join(', ') || ''}
                                    onChange={(e) => setNewEvent({
                                        ...newEvent, 
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                                    })}
                                    placeholder="Ej. urgente, desarrollo, cliente-vip"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <Button
                                    onClick={editingEvent ? updateEvent : createEvent}
                                    className="flex-1"
                                    disabled={!newEvent.title?.trim() || !newEvent.start_time || !newEvent.end_time}
                                >
                                    {editingEvent ? 'Actualizar Evento' : 'Crear Evento'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowEventForm(false);
                                        setEditingEvent(null);
                                        resetEventForm();
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
