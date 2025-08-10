'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
    CheckCircle2, 
    Circle, 
    Plus, 
    Clock, 
    Flag, 
    Calendar,
    Target,
    TrendingUp,
    Filter,
    Search,
    Star,
    Users,
    Tag,
    AlertCircle,
    Play,
    Pause,
    MoreHorizontal,
    Archive,
    Trash2,
    Edit3,
    Brain,
    Lightbulb,
    BarChart3,
    Timer
} from 'lucide-react';
import { format, addDays, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos demo importados
import { demoTasks, demoClients, demoProjects } from '../../demo/demo-data';

// ==================== TIPOS ====================
interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    client_id?: string;
    project_id?: string;
    tags?: string[];
    is_billable: boolean;
    hourly_rate?: number;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

interface ExtendedTask extends Task {
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

interface TaskMetrics {
    total_tasks: number;
    completed_today: number;
    pending_tasks: number;
    in_progress_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
    avg_completion_time: number;
    total_estimated_hours: number;
    total_actual_hours: number;
    billable_hours: number;
    revenue_generated: number;
}

interface AIInsight {
    id: string;
    type: string;
    title: string;
    description: string;
    confidence: number;
    impact: number;
    recommendations: string[];
    created_at: string;
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function TasksPageClientDemo() {
    // Estados principales
    const [tasks, setTasks] = useState<ExtendedTask[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados de tracking
    const [activeTracking, setActiveTracking] = useState<string | null>(null);
    const [trackingTime, setTrackingTime] = useState(0);

    // Estados de formulario
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        is_billable: false,
        tags: []
    });

    // Estados de filtros y búsqueda
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        client: '',
        project: '',
        tags: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at' | 'title'>('due_date');

    // Estados de vista
    const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');

    // Estados de métricas e IA
    const [metrics, setMetrics] = useState<TaskMetrics>({
        total_tasks: 0,
        completed_today: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        overdue_tasks: 0,
        completion_rate: 0,
        avg_completion_time: 0,
        total_estimated_hours: 0,
        total_actual_hours: 0,
        billable_hours: 0,
        revenue_generated: 0
    });
    const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);
    const [aiLoading, setAILoading] = useState(false);

    // ==================== EFECTOS Y INICIALIZACIÓN ====================
    useEffect(() => {
        initializeTasks();
    }, []);

    useEffect(() => {
        if (newTask.client_id) {
            const clientProjects = projects.filter(p => p.client_id === newTask.client_id);
            setFilteredProjects(clientProjects);
        } else {
            setFilteredProjects([]);
        }
    }, [newTask.client_id, projects]);

    useEffect(() => {
        if (tasks.length > 0) {
            updateMetrics();
            loadAIInsights();
        }
    }, [tasks]);

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

    const initializeTasks = () => {
        setLoading(true);
        try {
            // Cargar datos demo
            const processedTasks = demoTasks.map(task => ({
                ...task,
                updated_at: task.created_at, // Agregar updated_at usando created_at como fallback
                status: task.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
                priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
                clients: task.client_id ? {
                    name: demoClients.find(c => c.id === task.client_id)?.name || '',
                    company: demoClients.find(c => c.id === task.client_id)?.company
                } : undefined,
                projects: task.project_id ? {
                    name: demoProjects.find(p => p.id === task.project_id)?.title || '',
                    description: demoProjects.find(p => p.id === task.project_id)?.description
                } : undefined
            })) as ExtendedTask[];

            setTasks(processedTasks);
            setClients(demoClients);
            // Convertir demoProjects para que coincida con la interfaz Project
            const convertedProjects = demoProjects.map(project => ({
                id: project.id,
                name: project.title, // title -> name
                description: project.description,
                client_id: project.client_id
            }));
            setProjects(convertedProjects);
            
            // Verificar si hay tareas en progreso
            const taskInProgress = processedTasks.find(task => task.status === 'in_progress');
            if (taskInProgress) {
                setActiveTracking(taskInProgress.id);
            }
        } catch (error) {
            console.error('Error initializing tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateMetrics = () => {
        const today = new Date();
        const completedToday = tasks.filter(t => 
            t.status === 'completed' && 
            t.completed_at && 
            new Date(t.completed_at).toDateString() === today.toDateString()
        );
        
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const overdueTasks = tasks.filter(t => 
            t.due_date && 
            isPast(new Date(t.due_date)) && 
            t.status !== 'completed'
        );

        const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
        const totalActual = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);
        const billableHours = tasks
            .filter(t => t.is_billable && t.status === 'completed')
            .reduce((sum, task) => sum + (task.actual_hours || 0), 0);
        
        const revenueGenerated = tasks
            .filter(t => t.is_billable && t.status === 'completed')
            .reduce((sum, task) => {
                const hours = task.actual_hours || 0;
                const rate = task.hourly_rate || 50;
                return sum + (hours * rate);
            }, 0);

        const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

        setMetrics({
            total_tasks: tasks.length,
            completed_today: completedToday.length,
            pending_tasks: pendingTasks.length,
            in_progress_tasks: inProgressTasks.length,
            overdue_tasks: overdueTasks.length,
            completion_rate: Math.round(completionRate),
            avg_completion_time: 4.5, // Promedio demo
            total_estimated_hours: totalEstimated,
            total_actual_hours: totalActual,
            billable_hours: billableHours,
            revenue_generated: Math.round(revenueGenerated)
        });
    };

    const loadAIInsights = () => {
        setAILoading(true);
        try {
            const insights: AIInsight[] = [
                {
                    id: 'productivity-' + Date.now(),
                    type: 'productivity',
                    title: '🎯 Optimización de Productividad',
                    description: `Has completado ${metrics.completed_today} tareas hoy. Tu tasa de finalización es del ${metrics.completion_rate}%.`,
                    confidence: 87,
                    impact: 85,
                    recommendations: [
                        'Concéntrate en tareas de alta prioridad por las mañanas',
                        'Agrupa tareas similares para mayor eficiencia',
                        'Toma descansos cada 90 minutos para mantener el enfoque'
                    ],
                    created_at: new Date().toISOString()
                },
                {
                    id: 'time-management-' + Date.now(),
                    type: 'time_management',
                    title: '⏰ Gestión de Tiempo',
                    description: `Tienes ${metrics.overdue_tasks} tareas vencidas. El tiempo promedio de completación es ${metrics.avg_completion_time}h.`,
                    confidence: 92,
                    impact: 90,
                    recommendations: [
                        'Establece recordatorios para tareas próximas a vencer',
                        'Revisa estimaciones de tiempo para mayor precisión',
                        'Prioriza tareas vencidas al inicio del día'
                    ],
                    created_at: new Date().toISOString()
                },
                {
                    id: 'revenue-optimization-' + Date.now(),
                    type: 'revenue',
                    title: '💰 Optimización de Ingresos',
                    description: `Has generado €${metrics.revenue_generated} con ${metrics.billable_hours}h facturables.`,
                    confidence: 88,
                    impact: 95,
                    recommendations: [
                        'Aumenta el porcentaje de tareas facturables',
                        'Considera ajustar tarifas por hora según complejidad',
                        'Implementa tracking automático de tiempo'
                    ],
                    created_at: new Date().toISOString()
                }
            ];

            setAIInsights(insights);
        } catch (error) {
            console.error('Error loading AI insights:', error);
        } finally {
            setAILoading(false);
        }
    };

    // ==================== FUNCIONES DE TAREAS ====================
    const createTask = () => {
        if (!newTask.title?.trim()) return;

        try {
            const taskId = `task_${Date.now()}`;
            const taskToCreate: ExtendedTask = {
                id: taskId,
                title: newTask.title,
                description: newTask.description || '',
                status: 'pending',
                priority: newTask.priority || 'medium',
                due_date: newTask.due_date,
                estimated_hours: newTask.estimated_hours,
                client_id: newTask.client_id,
                project_id: newTask.project_id,
                tags: newTask.tags || [],
                is_billable: newTask.is_billable || false,
                hourly_rate: newTask.hourly_rate,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                clients: newTask.client_id ? clients.find(c => c.id === newTask.client_id) : undefined,
                projects: newTask.project_id ? projects.find(p => p.id === newTask.project_id) : undefined
            };

            setTasks(prev => [...prev, taskToCreate]);
            resetTaskForm();
            setShowTaskForm(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const updateTask = () => {
        if (!editingTask || !newTask.title?.trim()) return;

        try {
            const updatedTask: ExtendedTask = {
                ...editingTask,
                title: newTask.title,
                description: newTask.description || '',
                priority: newTask.priority || editingTask.priority,
                due_date: newTask.due_date || editingTask.due_date,
                estimated_hours: newTask.estimated_hours || editingTask.estimated_hours,
                client_id: newTask.client_id || editingTask.client_id,
                project_id: newTask.project_id || editingTask.project_id,
                tags: newTask.tags || editingTask.tags,
                is_billable: newTask.is_billable ?? editingTask.is_billable,
                hourly_rate: newTask.hourly_rate || editingTask.hourly_rate,
                updated_at: new Date().toISOString(),
                clients: newTask.client_id ? clients.find(c => c.id === newTask.client_id) : undefined,
                projects: newTask.project_id ? projects.find(p => p.id === newTask.project_id) : undefined
            };

            setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
            resetTaskForm();
            setShowTaskForm(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = (taskId: string) => {
        try {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            if (activeTracking === taskId) {
                setActiveTracking(null);
                setTrackingTime(0);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const toggleTaskStatus = (taskId: string, newStatus: Task['status']) => {
        try {
            setTasks(prev => prev.map(task => {
                if (task.id === taskId) {
                    const updates: Partial<Task> = {
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    };

                    if (newStatus === 'completed') {
                        updates.completed_at = new Date().toISOString();
                        if (activeTracking === taskId) {
                            updates.actual_hours = trackingTime / 3600; // Convertir segundos a horas
                        }
                    }

                    return { ...task, ...updates };
                }
                return task;
            }));

            if (newStatus === 'completed' && activeTracking === taskId) {
                setActiveTracking(null);
                setTrackingTime(0);
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const startTracking = (taskId: string) => {
        try {
            if (activeTracking) {
                stopTracking();
            }

            setActiveTracking(taskId);
            setTrackingTime(0);
            
            setTasks(prev => prev.map(task => 
                task.id === taskId 
                    ? { ...task, status: 'in_progress', updated_at: new Date().toISOString() }
                    : task
            ));
        } catch (error) {
            console.error('Error starting tracking:', error);
        }
    };

    const stopTracking = () => {
        try {
            if (!activeTracking) return;

            const hours = trackingTime / 3600;
            setTasks(prev => prev.map(task => 
                task.id === activeTracking 
                    ? { 
                        ...task, 
                        actual_hours: (task.actual_hours || 0) + hours,
                        updated_at: new Date().toISOString()
                    }
                    : task
            ));

            setActiveTracking(null);
            setTrackingTime(0);
        } catch (error) {
            console.error('Error stopping tracking:', error);
        }
    };

    // ==================== FUNCIONES DE UTILIDAD ====================
    const resetTaskForm = () => {
        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            status: 'pending',
            is_billable: false,
            tags: []
        });
    };

    const openEditForm = (task: Task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            due_date: task.due_date,
            estimated_hours: task.estimated_hours,
            client_id: task.client_id,
            project_id: task.project_id,
            tags: task.tags,
            is_billable: task.is_billable,
            hourly_rate: task.hourly_rate
        });
        setShowTaskForm(true);
    };

    const formatTrackingTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-700 bg-red-100 border-red-300';
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

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <AlertCircle className="w-4 h-4 text-red-700" />;
            case 'high': return <Flag className="w-4 h-4 text-red-600" />;
            case 'medium': return <Flag className="w-4 h-4 text-yellow-600" />;
            case 'low': return <Flag className="w-4 h-4 text-green-600" />;
            default: return <Flag className="w-4 h-4 text-gray-600" />;
        }
    };

    // Filtrar y ordenar tareas
    const filteredAndSortedTasks = tasks
        .filter(task => {
            if (filters.status && task.status !== filters.status) return false;
            if (filters.priority && task.priority !== filters.priority) return false;
            if (filters.client && task.client_id !== filters.client) return false;
            if (filters.project && task.project_id !== filters.project) return false;
            if (filters.tags && !task.tags?.some(tag => tag.toLowerCase().includes(filters.tags.toLowerCase()))) return false;
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'due_date':
                    if (!a.due_date && !b.due_date) return 0;
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                case 'priority':
                    const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                case 'created_at':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tareas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con métricas */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">✅ Gestión de Tareas Inteligente</h1>
                        <p className="text-green-100">
                            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
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
                            onClick={() => setShowTaskForm(true)}
                            className="bg-white text-green-600 hover:bg-green-50"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Tarea
                        </Button>
                    </div>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <Target className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-green-100">Total Tareas</p>
                                <p className="text-xl font-bold">{metrics.total_tasks}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-green-100">Completadas Hoy</p>
                                <p className="text-xl font-bold">{metrics.completed_today}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-green-100">Tasa Completación</p>
                                <p className="text-xl font-bold">{metrics.completion_rate}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5" />
                            <div>
                                <p className="text-sm text-green-100">Ingresos</p>
                                <p className="text-xl font-bold">€{metrics.revenue_generated}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles y filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                {/* Búsqueda */}
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Buscar tareas..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                        />
                    </div>
                </div>

                {/* Filtros y ordenación */}
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En progreso</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({...filters, priority: e.target.value})}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="">Todas las prioridades</option>
                        <option value="urgent">Urgente</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                    >
                        <option value="due_date">Fecha de vencimiento</option>
                        <option value="priority">Prioridad</option>
                        <option value="created_at">Fecha de creación</option>
                        <option value="title">Título</option>
                    </select>
                </div>
            </div>

            {/* Panel principal con dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal - Lista de tareas */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                                Lista de Tareas
                            </h3>
                            <span className="text-sm text-gray-500">
                                {filteredAndSortedTasks.length} tareas
                            </span>
                        </div>

                        {filteredAndSortedTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No hay tareas que coincidan con los filtros</p>
                                <Button 
                                    onClick={() => setShowTaskForm(true)}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear primera tarea
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredAndSortedTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                                            activeTracking === task.id ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                        } ${
                                            task.due_date && isPast(new Date(task.due_date)) && task.status !== 'completed' 
                                                ? 'border-red-200 bg-red-50' 
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <div className="flex-shrink-0 mt-1">
                                                    <button
                                                        onClick={() => toggleTaskStatus(
                                                            task.id, 
                                                            task.status === 'completed' ? 'pending' : 'completed'
                                                        )}
                                                        className="transition-colors"
                                                    >
                                                        {task.status === 'completed' ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className={`font-medium truncate ${
                                                            task.status === 'completed' 
                                                                ? 'text-gray-500 line-through' 
                                                                : 'text-gray-900'
                                                        }`}>
                                                            {task.title}
                                                        </h4>
                                                        {getPriorityIcon(task.priority)}
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                            {task.priority === 'urgent' && '🚨 Urgente'}
                                                            {task.priority === 'high' && '🔴 Alta'}
                                                            {task.priority === 'medium' && '🟡 Media'}
                                                            {task.priority === 'low' && '🟢 Baja'}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                                            {task.status === 'pending' && '⏳ Pendiente'}
                                                            {task.status === 'in_progress' && '▶️ En progreso'}
                                                            {task.status === 'completed' && '✅ Completada'}
                                                            {task.status === 'cancelled' && '❌ Cancelada'}
                                                        </span>
                                                    </div>
                                                    
                                                    {task.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                                                    )}

                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                                        {task.due_date && (
                                                            <span className={`flex items-center ${
                                                                isPast(new Date(task.due_date)) && task.status !== 'completed'
                                                                    ? 'text-red-600 font-medium'
                                                                    : ''
                                                            }`}>
                                                                <Calendar className="w-4 h-4 mr-1" />
                                                                {format(new Date(task.due_date), 'dd/MM/yyyy')}
                                                                {isPast(new Date(task.due_date)) && task.status !== 'completed' && ' (Vencida)'}
                                                            </span>
                                                        )}
                                                        {task.estimated_hours && (
                                                            <span className="flex items-center">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {task.estimated_hours}h estimadas
                                                            </span>
                                                        )}
                                                        {task.actual_hours && (
                                                            <span className="flex items-center">
                                                                <Timer className="w-4 h-4 mr-1" />
                                                                {task.actual_hours.toFixed(1)}h reales
                                                            </span>
                                                        )}
                                                        {task.clients && (
                                                            <span className="flex items-center">
                                                                <Users className="w-4 h-4 mr-1" />
                                                                {task.clients.name}
                                                            </span>
                                                        )}
                                                        {task.projects && (
                                                            <span className="flex items-center">
                                                                <Target className="w-4 h-4 mr-1" />
                                                                {task.projects.name}
                                                            </span>
                                                        )}
                                                        {task.is_billable && (
                                                            <span className="flex items-center text-green-600">
                                                                <Star className="w-4 h-4 mr-1" />
                                                                €{task.hourly_rate || 50}/h
                                                            </span>
                                                        )}
                                                    </div>

                                                    {task.tags && task.tags.length > 0 && (
                                                        <div className="flex items-center space-x-1 mb-2">
                                                            {task.tags.map((tag, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                                                                    <Tag className="w-3 h-3 mr-1" />
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                {task.status !== 'completed' && task.status !== 'cancelled' && (
                                                    <Button
                                                        size="sm"
                                                        variant={activeTracking === task.id ? "destructive" : "default"}
                                                        onClick={() => 
                                                            activeTracking === task.id ? stopTracking() : startTracking(task.id)
                                                        }
                                                    >
                                                        {activeTracking === task.id ? (
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
                                                    onClick={() => openEditForm(task)}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => deleteTask(task.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Columna lateral - IA y métricas */}
                <div className="space-y-4">
                    {/* Insights de IA */}
                    <Card className="p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Brain className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold">Insights IA</h3>
                            {aiLoading && <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        
                        {aiInsights.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {aiInsights.map((insight) => (
                                    <div key={insight.id} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                                        <div className="flex items-start space-x-2">
                                            <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    {insight.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    {insight.description}
                                                </p>
                                                <div className="space-y-1">
                                                    {insight.recommendations.slice(0, 2).map((rec, index) => (
                                                        <p key={index} className="text-xs text-gray-600 pl-2 border-l-2 border-purple-200">
                                                            • {rec}
                                                        </p>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-purple-600 font-medium">
                                                        {insight.confidence}% confianza
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
                                <p className="text-sm text-gray-500">Analizando tareas...</p>
                            </div>
                        )}
                    </Card>

                    {/* Métricas detalladas */}
                    <Card className="p-4">
                        <h3 className="font-semibold mb-4">📊 Métricas Detalladas</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Tareas Pendientes</span>
                                <span className="font-medium">{metrics.pending_tasks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">En Progreso</span>
                                <span className="font-medium text-blue-600">{metrics.in_progress_tasks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Vencidas</span>
                                <span className="font-medium text-red-600">{metrics.overdue_tasks}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Horas Estimadas</span>
                                <span className="font-medium">{metrics.total_estimated_hours}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Horas Reales</span>
                                <span className="font-medium">{metrics.total_actual_hours.toFixed(1)}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Horas Facturables</span>
                                <span className="font-medium text-green-600">{metrics.billable_hours.toFixed(1)}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Tiempo Promedio</span>
                                <span className="font-medium">{metrics.avg_completion_time}h</span>
                            </div>
                        </div>
                    </Card>

                    {/* Tareas vencidas (si las hay) */}
                    {metrics.overdue_tasks > 0 && (
                        <Card className="p-4 border-red-200 bg-red-50">
                            <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <h3 className="font-semibold text-red-800">⚠️ Atención Requerida</h3>
                            </div>
                            <p className="text-sm text-red-700 mb-3">
                                Tienes {metrics.overdue_tasks} tareas vencidas que requieren atención inmediata.
                            </p>
                            <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setFilters({...filters, status: 'pending'})}
                            >
                                Ver Tareas Vencidas
                            </Button>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal de formulario */}
            {showTaskForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">
                                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowTaskForm(false);
                                    setEditingTask(null);
                                    resetTaskForm();
                                }}
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título de la Tarea *
                                </label>
                                <Input
                                    value={newTask.title || ''}
                                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    placeholder="Ej. Desarrollar login, Reunión cliente..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={newTask.description || ''}
                                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                    placeholder="Detalles adicionales de la tarea..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prioridad
                                    </label>
                                    <select
                                        value={newTask.priority || 'medium'}
                                        onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                    >
                                        <option value="low">🟢 Baja</option>
                                        <option value="medium">🟡 Media</option>
                                        <option value="high">🔴 Alta</option>
                                        <option value="urgent">🚨 Urgente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Vencimiento
                                    </label>
                                    <Input
                                        type="date"
                                        value={newTask.due_date?.split('T')[0] || ''}
                                        onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cliente
                                    </label>
                                    <select
                                        value={newTask.client_id || ''}
                                        onChange={(e) => setNewTask({...newTask, client_id: e.target.value})}
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
                                        value={newTask.project_id || ''}
                                        onChange={(e) => setNewTask({...newTask, project_id: e.target.value})}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        disabled={!newTask.client_id}
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
                                    Horas Estimadas
                                </label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={newTask.estimated_hours || ''}
                                    onChange={(e) => setNewTask({...newTask, estimated_hours: parseFloat(e.target.value)})}
                                    placeholder="Ej. 2.5"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={newTask.is_billable || false}
                                        onChange={(e) => setNewTask({...newTask, is_billable: e.target.checked})}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm text-gray-700">Tiempo facturable</span>
                                </label>
                                
                                {newTask.is_billable && (
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700">Tarifa por hora:</span>
                                        <Input
                                            type="number"
                                            value={newTask.hourly_rate || ''}
                                            onChange={(e) => setNewTask({...newTask, hourly_rate: parseFloat(e.target.value)})}
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
                                    value={newTask.tags?.join(', ') || ''}
                                    onChange={(e) => setNewTask({
                                        ...newTask, 
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                                    })}
                                    placeholder="Ej. frontend, urgente, revisión"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <Button
                                    onClick={editingTask ? updateTask : createTask}
                                    className="flex-1"
                                    disabled={!newTask.title?.trim()}
                                >
                                    {editingTask ? 'Actualizar Tarea' : 'Crear Tarea'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowTaskForm(false);
                                        setEditingTask(null);
                                        resetTaskForm();
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
