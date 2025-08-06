'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  MapPin,
  Video,
  Timer,
  Target,
  Play,
  Square,
  Plus,
  Eye,
  Zap,
  Brain,
  TrendingUp,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { demoCalendarEvents, demoCalendarStats, demoClients, demoProjects } from '../demo-data';

type ViewType = 'day' | 'week' | 'month';
type EventType = 'work' | 'meeting' | 'break' | 'admin' | 'focus' | 'client_call' | 'project_review' | 'invoice_prep' | 'proposal_work';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type: EventType;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  is_billable: boolean;
  hourly_rate: number;
  location?: string;
  meeting_url?: string;
  client_id?: string;
  project_id?: string;
  user_id: string;
  created_at: string;
}

interface ExtendedCalendarEvent extends CalendarEvent {
  clients?: {
    name: string;
    company?: string;
  };
  projects?: {
    name: string;
    description?: string;
  };
}

export default function DemoCalendarPage() {
  // States básicos
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('week');
  const [events, setEvents] = useState<ExtendedCalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedCalendarEvent | null>(null);
  const [activeTracking, setActiveTracking] = useState<string | null>(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(true);

  // Estados para nuevo evento
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    type: 'work' as EventType,
    is_billable: true,
    hourly_rate: 65,
    location: '',
    meeting_url: '',
    client_id: '',
    project_id: ''
  });

  // Cargar datos demo al inicializar
  useEffect(() => {
    const enrichedEvents = demoCalendarEvents.map(event => ({
      ...event,
      type: event.type as EventType, // Explicit type casting
      status: event.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled', // Explicit type casting
      clients: event.client_id ? demoClients.find(c => c.id === event.client_id) : undefined,
      projects: event.project_id ? (() => {
        const project = demoProjects.find(p => p.id === event.project_id);
        return project ? { name: project.title, description: project.description } : undefined;
      })() : undefined
    }));
    setEvents(enrichedEvents);

    // Detectar si hay algún evento en progreso
    const eventInProgress = enrichedEvents.find(event => event.status === 'in_progress');
    if (eventInProgress) {
      setActiveTracking(eventInProgress.id);
    }
  }, []);

  // Funciones de navegación
  const formatDateForView = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = 
      currentView === 'month' 
        ? { year: 'numeric', month: 'long' }
        : currentView === 'week'
        ? { month: 'long', day: 'numeric', year: 'numeric' }
        : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    
    return date.toLocaleDateString('es-ES', options);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  // Funciones de eventos
  const getEventColor = (type: EventType): string => {
    const colors: Record<EventType, string> = {
      meeting: 'bg-blue-500',
      work: 'bg-emerald-500',
      break: 'bg-amber-500',
      admin: 'bg-gray-500',
      focus: 'bg-purple-500',
      client_call: 'bg-indigo-500',
      project_review: 'bg-cyan-500',
      invoice_prep: 'bg-green-500',
      proposal_work: 'bg-rose-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getEventIcon = (type: EventType) => {
    const icons: Record<EventType, any> = {
      meeting: Users,
      work: Briefcase,
      break: Clock,
      admin: Target,
      focus: Zap,
      client_call: Users,
      project_review: Target,
      invoice_prep: DollarSign,
      proposal_work: Sparkles
    };
    return icons[type] || Briefcase;
  };

  // Time tracking
  const toggleTimeTracking = (eventId: string) => {
    if (activeTracking === eventId) {
      setActiveTracking(null);
      // Actualizar estado del evento
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, status: 'completed' as const } : e
      ));
    } else {
      // Parar cualquier otro tracking activo
      if (activeTracking) {
        setEvents(events.map(e => 
          e.id === activeTracking ? { ...e, status: 'completed' as const } : e
        ));
      }
      setActiveTracking(eventId);
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, status: 'in_progress' as const } : e
      ));
    }
  };

  // Crear nuevo evento (demo)
  const createEvent = () => {
    if (!newEvent.title.trim() || !newEvent.start_time || !newEvent.end_time) return;

    const newEventData: ExtendedCalendarEvent = {
      id: `demo-event-${Date.now()}`,
      ...newEvent,
      status: 'scheduled',
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      clients: newEvent.client_id ? demoClients.find(c => c.id === newEvent.client_id) : undefined,
      projects: newEvent.project_id ? (() => {
        const project = demoProjects.find(p => p.id === newEvent.project_id);
        return project ? { name: project.title, description: project.description } : undefined;
      })() : undefined
    };

    setEvents([...events, newEventData]);
    setNewEvent({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      type: 'work',
      is_billable: true,
      hourly_rate: 65,
      location: '',
      meeting_url: '',
      client_id: '',
      project_id: ''
    });
    setShowNewEventForm(false);
  };

  // Generar slots de tiempo
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour
      });
    }
    return slots;
  };

  // Filtrar eventos para la vista actual
  const getEventsForCurrentView = () => {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    if (currentView === 'week') {
      const startOfWeek = new Date(startOfDay);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return events.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      });
    }
    
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate >= startOfDay && eventDate <= endOfDay;
    });
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

      <div className="relative z-10">
        <div className="p-4">
          {/* Demo Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-4 mb-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">🎯 Modo Demo - Calendario Inteligente</h2>
                  <p className="text-indigo-100 text-sm">Explora todas las funcionalidades sin configuración</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-xs">Datos de demostración</div>
                <div className="text-lg font-bold">{events.length} eventos</div>
              </div>
            </div>
          </div>

          {/* Header del Calendario */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-xl shadow-slate-900/5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <CalendarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
                    Calendario Inteligente
                  </h1>
                  <p className="text-slate-600 text-sm">Gestiona tu tiempo como un pro</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Panel de IA Toggle */}
                <Button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  variant="outline"
                  className="border-slate-200 hover:bg-indigo-50 text-slate-700 h-9 px-3"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {showAIPanel ? 'Ocultar IA' : 'Mostrar IA'}
                </Button>
                
                <Button
                  onClick={() => setShowNewEventForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 h-9 px-4 text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Evento
                </Button>
              </div>
            </div>

            {/* Controles de Navegación */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <h2 className="text-lg font-bold text-slate-900 min-w-[200px]">
                  {formatDateForView(currentDate)}
                </h2>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="h-8 px-3 text-xs font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Hoy
                </Button>
              </div>

              {/* View Switcher */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                {(['day', 'week', 'month'] as ViewType[]).map((view) => (
                  <Button
                    key={view}
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentView(view)}
                    className={`h-7 px-3 text-xs font-semibold rounded-md transition-all duration-200 ${
                      currentView === view
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Vista del Calendario */}
          {currentView === 'week' && (
            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl shadow-xl shadow-slate-900/5 overflow-hidden mb-4">
              {/* Header de la semana */}
              <div className="grid grid-cols-8 border-b border-slate-200">
                <div className="p-3 bg-slate-50 text-xs font-semibold text-slate-600">
                  Hora
                </div>
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
                  <div key={day} className="p-3 bg-slate-50 text-center">
                    <div className="text-xs font-semibold text-slate-600">{day}</div>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(currentDate.getFullYear(), currentDate.getMonth(), 
                        currentDate.getDate() - currentDate.getDay() + 1 + index).getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="max-h-96 overflow-y-auto">
                {generateTimeSlots().map((slot) => (
                  <div key={slot.time} className="grid grid-cols-8 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <div className="p-2 text-xs text-slate-500 font-medium border-r border-slate-200">
                      {slot.time}
                    </div>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => (
                      <div key={dayOffset} className="p-2 min-h-[50px] border-r border-slate-100 relative">
                        {getEventsForCurrentView()
                          .filter(event => {
                            const eventDate = new Date(event.start_time);
                            const slotDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 
                              currentDate.getDate() - currentDate.getDay() + 1 + dayOffset);
                            return eventDate.toDateString() === slotDate.toDateString() &&
                                   eventDate.getHours() === slot.hour;
                          })
                          .map(event => {
                            const EventIcon = getEventIcon(event.type);
                            return (
                              <div
                                key={event.id}
                                className={`${getEventColor(event.type)} text-white text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 transition-opacity`}
                                onClick={() => setSelectedEvent(event)}
                              >
                                <div className="flex items-center gap-1">
                                  <EventIcon className="w-3 h-3" />
                                  <span className="truncate font-medium">{event.title}</span>
                                  {event.status === 'in_progress' && (
                                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse ml-auto"></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-700">{demoCalendarStats.hoursScheduledToday.toFixed(1)}h</p>
                    <p className="text-xs text-slate-600 font-medium">Hoy planificadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-700">€{demoCalendarStats.revenueToday.toFixed(0)}</p>
                    <p className="text-xs text-slate-600 font-medium">Revenue hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-purple-700">{demoCalendarStats.eventsToday}</p>
                    <p className="text-xs text-slate-600 font-medium">Eventos hoy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <Timer className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-700">{demoCalendarStats.productivityScore}%</p>
                    <p className="text-xs text-slate-600 font-medium">Productividad</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Eventos */}
          <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Eventos de Hoy
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Gestiona tu agenda y tiempo de manera inteligente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {getEventsForCurrentView().length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No hay eventos programados</p>
                  <p className="text-slate-400 text-sm">Crea tu primer evento para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getEventsForCurrentView().map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    const startTime = new Date(event.start_time);
                    const endTime = new Date(event.end_time);
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-200/60 bg-white/80 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-200 group backdrop-blur-sm cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className={`w-12 h-12 ${getEventColor(event.type)} rounded-xl flex items-center justify-center shadow-lg`}>
                          <EventIcon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 truncate text-lg">{event.title}</h3>
                            {event.is_billable && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                €{event.hourly_rate}/h
                              </span>
                            )}
                            {event.status === 'in_progress' && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                En progreso
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                            <span className="font-semibold text-slate-900">
                              {startTime.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})} - {endTime.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                            
                            {event.clients && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.clients.name}
                              </span>
                            )}
                            
                            {event.projects && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {event.projects.name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                            {event.meeting_url && (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                Reunión online
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTimeTracking(event.id)}
                            className={`h-9 w-9 p-0 rounded-lg transition-all duration-200 ${
                              activeTracking === event.id
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            }`}
                            title={activeTracking === event.id ? 'Parar tracking' : 'Iniciar tracking'}
                          >
                            {activeTracking === event.id ? (
                              <Square className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                            className="h-9 w-9 p-0 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Detalles del Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header del Modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const EventIcon = getEventIcon(selectedEvent.type);
                    return <EventIcon className="w-6 h-6 text-slate-600" />;
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedEvent.title}</h2>
                    <p className="text-sm text-slate-600 capitalize">{selectedEvent.type}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="text-slate-600 hover:bg-slate-50"
                >
                  ✕
                </Button>
              </div>

              {/* Contenido del Evento */}
              <div className="space-y-4">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Horario</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6">
                      <div>📅 {new Date(selectedEvent.start_time).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</div>
                      <div>🕐 {new Date(selectedEvent.start_time).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(selectedEvent.end_time).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</div>
                      <div>⏱️ Duración: {Math.round((new Date(selectedEvent.end_time).getTime() - new Date(selectedEvent.start_time).getTime()) / (1000 * 60))} minutos</div>
                    </div>
                  </div>

                  {selectedEvent.is_billable && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700">Facturación</span>
                      </div>
                      <div className="text-sm text-slate-600 pl-6">
                        <div>💰 Tarifa: €{selectedEvent.hourly_rate}/hora</div>
                        <div>💵 Ingresos: €{
                          ((new Date(selectedEvent.end_time).getTime() - new Date(selectedEvent.start_time).getTime()) / (1000 * 60 * 60) * selectedEvent.hourly_rate).toFixed(2)
                        }</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                {selectedEvent.description && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Descripción</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6 p-3 bg-slate-50 rounded-lg">
                      {selectedEvent.description}
                    </div>
                  </div>
                )}

                {/* Cliente y Proyecto */}
                {(selectedEvent.clients || selectedEvent.projects) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Información CRM</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6 space-y-2">
                      {selectedEvent.clients && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>Cliente: {selectedEvent.clients.name}</span>
                          {selectedEvent.clients.company && (
                            <span className="text-slate-500">({selectedEvent.clients.company})</span>
                          )}
                        </div>
                      )}
                      {selectedEvent.projects && (
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3" />
                          <span>Proyecto: {selectedEvent.projects.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {(selectedEvent.location || selectedEvent.meeting_url) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Ubicación</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6 space-y-2">
                      {selectedEvent.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}
                      {selectedEvent.meeting_url && (
                        <div className="flex items-center gap-2">
                          <Video className="w-3 h-3" />
                          <a 
                            href={selectedEvent.meeting_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Unirse a reunión
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nuevo evento */}
      {showNewEventForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Crear Evento Demo</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowNewEventForm(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Título del evento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Descripción del evento"
                    className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Inicio</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as EventType})}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="work">💼 Trabajo</option>
                    <option value="meeting">🤝 Reunión</option>
                    <option value="client_call">📞 Llamada cliente</option>
                    <option value="break">☕ Descanso</option>
                    <option value="admin">📋 Administrativo</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEvent.is_billable}
                      onChange={(e) => setNewEvent({...newEvent, is_billable: e.target.checked})}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Facturable</span>
                  </label>
                  {newEvent.is_billable && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Tarifa:</span>
                      <Input
                        type="number"
                        value={newEvent.hourly_rate}
                        onChange={(e) => setNewEvent({...newEvent, hourly_rate: Number(e.target.value)})}
                        className="w-20"
                      />
                      <span className="text-sm text-slate-600">€/hora</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <select
                      value={newEvent.client_id}
                      onChange={(e) => setNewEvent({...newEvent, client_id: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Sin cliente</option>
                      {demoClients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.company && `(${client.company})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
                    <select
                      value={newEvent.project_id}
                      onChange={(e) => setNewEvent({...newEvent, project_id: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Sin proyecto</option>
                      {demoProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={createEvent}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                  >
                    Crear Evento
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowNewEventForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
