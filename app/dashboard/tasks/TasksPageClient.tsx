'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { 
    Plus, 
    Search, 
    Filter, 
    Clock, 
    CheckCircle, 
    Timer,
    Pause,
    Archive,
    Edit3,
    Edit,
    Trash2,
    Copy,
    Play,
    Square,
    MoreVertical,
    Calendar,
    User,
    Tag,
    AlertTriangle,
    Activity
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Tipos básicos
type TaskStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'archived';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    project_id?: string;
    user_id?: string;
    assigned_to?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

interface Project {
    id: string;
    name: string;
    status: string;
}

interface TasksPageClientProps {
    userEmail?: string;
}

export default function TasksPageClient({ userEmail }: TasksPageClientProps) {
    const router = useRouter();
    
    // Hook de trial status
    const { trialInfo, loading: trialLoading, hasReachedLimit, canUseFeatures } = useTrialStatus(userEmail);
    
    const supabase = createClient(
        'https://joyhaxtpmrmndmifsihn.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveWhheHRwbXJtbmRtaWZzaWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODA5NzUsImV4cCI6MjA2OTU1Njk3NX0.77Si27sIxzCtJqmw3Z81dJDejKcgaX9pm8eZMldPr4I'
    );

    // Estados básicos
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [userId, setUserId] = useState<string | null>(null);

    // Estados para modales
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Estado para nueva tarea
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'pending' as TaskStatus,
        priority: 'medium' as TaskPriority,
        due_date: '',
        project_id: ''
    });

    // Estados del timer
    const [activeTimer, setActiveTimer] = useState<string | null>(null);
    const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const handleLogout = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        router.push('/login');
    };

    // Función para manejar la creación de nueva tarea
    const handleNewTaskClick = () => {
        if (!canUseFeatures) {
            alert('Tu periodo de prueba ha expirado. Actualiza tu plan para continuar creando tareas.');
            return;
        }
        
        setShowNewTaskModal(true);
    };

    const resetNewTaskForm = () => {
        setNewTask({
            title: '',
            description: '',
            status: 'pending',
            priority: 'medium',
            due_date: '',
            project_id: ''
        });
    };

    const fetchTasks = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            console.log('🚀 Cargando TODAS las tareas (bypass completo)...');
            
            // BYPASS TOTAL - Usar cliente admin para obtener todos los datos
            const adminSupabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            
            // Intentar con múltiples estrategias
            let data = null;
            let error = null;
            
            // Estrategia 1: Consulta normal sin filtros
            const result1 = await adminSupabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (!result1.error) {
                data = result1.data;
                console.log('✅ Estrategia 1 funcionó:', data?.length || 0);
            } else {
                console.log('⚠️ Estrategia 1 falló:', result1.error.message);
                
                // Estrategia 2: Intentar con un usuario específico conocido
                const result2 = await adminSupabase
                    .from('tasks')
                    .select('*')
                    .eq('user_id', 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c')
                    .order('created_at', { ascending: false });
                
                if (!result2.error) {
                    data = result2.data;
                    console.log('✅ Estrategia 2 funcionó:', data?.length || 0);
                } else {
                    console.log('⚠️ Estrategia 2 falló:', result2.error.message);
                    error = result2.error;
                }
            }

            if (error) {
                console.error('❌ Error fetching tasks:', error);
                setTasks([]);
            } else {
                console.log('✅ Tareas cargadas:', data?.length || 0);
                if (data && data.length > 0) {
                    console.log('📋 Primeras 3 tareas:', data.slice(0, 3).map(t => ({
                        title: t.title,
                        user_id: t.user_id?.slice(0, 8) + '...',
                        status: t.status
                    })));
                }
                setTasks((data || []) as Task[]);
            }
        } catch (error) {
            console.error('💥 Error crítico:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        if (!supabase) return;
        try {
            console.log('🚀 Cargando TODOS los proyectos (sin filtro de usuario)...');
            
            // BYPASS TOTAL - Usar cliente admin para obtener todos los datos
            const adminSupabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            
            // Estrategia 2: Intentar con un usuario específico conocido
            const { data, error } = await adminSupabase
                .from('projects')
                .select('*')
                .eq('user_id', 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c')
                .order('name', { ascending: true });

            if (error) {
                console.error('❌ Error fetching projects:', error);
                setProjects([]);
            } else {
                console.log('✅ Proyectos cargados:', data?.length || 0);
                if (data && data.length > 0) {
                    console.log('� Primeros 3 proyectos:', data.slice(0, 3).map(p => ({
                        name: p.name,
                        user_id: p.user_id
                    })));
                }
                setProjects((data || []) as Project[]);
            }
        } catch (error) {
            console.error('💥 Error crítico:', error);
            setProjects([]);
        }
    };    const createTask = async () => {
        if (!newTask.title.trim()) {
            alert('⚠️ El título de la tarea es obligatorio');
            return;
        }
        if (!newTask.project_id) {
            alert('⚠️ Debes seleccionar un proyecto');
            return;
        }
        if (!supabase) return;

        try {
            // Usar el usuario consolidado
            const CONSOLIDATED_USER_ID = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
            
            const taskData = {
                title: newTask.title,
                description: newTask.description || null,
                status: newTask.status,
                priority: newTask.priority,
                project_id: newTask.project_id,
                user_id: CONSOLIDATED_USER_ID, // ✅ Agregamos user_id
                due_date: newTask.due_date || null,
                created_at: new Date().toISOString()
            };

            console.log('📤 Enviando datos de tarea:', taskData);

            const { data, error } = await supabase
                .from('tasks')
                .insert([taskData])
                .select()
                .single();

            if (error) {
                console.error('Error creating task:', error);
                alert('Error al crear la tarea: ' + error.message);
                return;
            }

            console.log('✅ Tarea creada:', data);
            alert('¡Tarea creada exitosamente! 🎉');
            setShowNewTaskModal(false);
            resetNewTaskForm();
            await fetchTasks();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error crítico al crear la tarea');
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ 
                    status: newStatus,
                    ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
                })
                .eq('id', taskId);

            if (error) {
                console.error('Error updating task:', error);
                alert('Error al actualizar la tarea');
                return;
            }

            await fetchTasks();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) {
                console.error('Error deleting task:', error);
                alert('Error al eliminar la tarea');
                return;
            }

            await fetchTasks();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateTask = async () => {
        if (!editingTask || !editingTask.id) return;
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: editingTask.title,
                    description: editingTask.description,
                    priority: editingTask.priority,
                    status: editingTask.status,
                    project_id: editingTask.project_id,
                    due_date: editingTask.due_date,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingTask.id);

            if (error) {
                console.error('Error updating task:', error);
                alert('Error al actualizar la tarea');
                return;
            }

            setShowEditTaskModal(false);
            setEditingTask(null);
            await fetchTasks();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Timer functions
    const startTimer = (taskId: string) => {
        setActiveTimer(taskId);
        setTimerStartTime(new Date());
        setElapsedTime(0);
    };

    const pauseTimer = () => {
        setActiveTimer(null);
        setTimerStartTime(null);
    };

    const formatTime = (milliseconds: number) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    };

    // Filtros
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    // Estadísticas
    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
    };

    useEffect(() => {
        // Usar el usuario consolidado directamente
        const CONSOLIDATED_USER_ID = 'e7ed7c8d-229a-42d1-8a44-37bcc64c440c';
        setUserId(CONSOLIDATED_USER_ID);
        console.log('✅ Usuario consolidado usado:', CONSOLIDATED_USER_ID);
        console.log('🚀 Cargando datos...');
        fetchTasks();
        fetchProjects();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTimer && timerStartTime) {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - timerStartTime.getTime());
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimer, timerStartTime]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Cargando tareas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={"min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"}>
            <div className="flex min-h-screen">
                {/* Sidebar Premium */}
                <Sidebar 
                    userEmail={userEmail} 
                    onLogout={handleLogout}
                />

                {/* Contenido principal */}
                <div className="flex-1 ml-56 p-8">
                    {/* Trial Banner */}
                    <div className="mb-8">
                        <TrialBanner />
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                    ✅ Gestión de Tareas
                                </h1>
                                <p className={"mt-2 text-slate-500 dark:text-slate-500"}>Organiza y controla tus tareas de forma eficiente</p>
                            </div>
                            <Button 
                                onClick={handleNewTaskClick}
                                disabled={!canUseFeatures}
                                className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                                    !canUseFeatures 
                                        ? 'opacity-50 cursor-not-allowed !bg-gray-400 hover:!bg-gray-400' 
                                        : ''
                                }`}
                            >
                                {!canUseFeatures ? (
                                    <AlertTriangle className="mr-2 h-4 w-4" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                {!canUseFeatures ? 'Trial Expirado' : 'Nueva Tarea'}
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total</p>
                                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                    </div>
                                    <Tag className="h-8 w-8 text-slate-500" />
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pendientes</p>
                                        <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-amber-500" />
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">En Progreso</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                                    </div>
                                    <Timer className="h-8 w-8 text-blue-500" />
                                </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Completadas</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* Filtros y búsqueda */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar tareas..."
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="pending">Pendientes</option>
                                    <option value="in_progress">En progreso</option>
                                    <option value="paused">Pausadas</option>
                                    <option value="completed">Completadas</option>
                                    <option value="archived">Archivadas</option>
                                </select>
                                <select
                                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    <option value="all">Todas las prioridades</option>
                                    <option value="urgent">Urgente</option>
                                    <option value="high">Alta</option>
                                    <option value="medium">Media</option>
                                    <option value="low">Baja</option>
                                </select>
                                <select
                                    className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={projectFilter}
                                    onChange={(e) => setProjectFilter(e.target.value)}
                                >
                                    <option value="all">Todos los proyectos</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setPriorityFilter('all');
                                        setProjectFilter('all');
                                    }}
                                    className="flex items-center"
                                >
                                    <Filter className="mr-2 h-4 w-4" />
                                    Limpiar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de tareas */}
                    <div className="space-y-4">
                        {filteredTasks.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 border border-white/20 shadow-lg text-center">
                                <Tag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay tareas</h3>
                                <p className="text-slate-500 mb-6">
                                    {tasks.length === 0 
                                        ? "Aún no has creado ninguna tarea. ¡Comienza creando tu primera tarea!"
                                        : "No hay tareas que coincidan con los filtros actuales."
                                    }
                                </p>
                                {tasks.length === 0 && (
                                    <Button 
                                        onClick={handleNewTaskClick}
                                        disabled={!canUseFeatures}
                                        className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white ${
                                            !canUseFeatures 
                                                ? 'opacity-50 cursor-not-allowed !bg-gray-400 hover:!bg-gray-400' 
                                                : ''
                                        }`}
                                    >
                                        {!canUseFeatures ? (
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Plus className="mr-2 h-4 w-4" />
                                        )}
                                        {!canUseFeatures ? 'Trial Expirado' : 'Crear primera tarea'}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <div key={task.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    task.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                    task.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-slate-100 text-slate-800'
                                                }`}>
                                                    {task.status === 'pending' ? 'Pendiente' :
                                                     task.status === 'in_progress' ? 'En progreso' :
                                                     task.status === 'paused' ? 'Pausada' :
                                                     task.status === 'completed' ? 'Completada' :
                                                     task.status === 'archived' ? 'Archivada' : task.status}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {task.priority === 'urgent' ? '🔥 Urgente' :
                                                     task.priority === 'high' ? '⚠️ Alta' :
                                                     task.priority === 'medium' ? '📋 Media' :
                                                     '📝 Baja'}
                                                </span>
                                            </div>
                                            {task.description && (
                                                <p className="text-slate-600 mb-3">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                {task.due_date && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(task.due_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(task.created_at).toLocaleDateString()}
                                                </div>
                                                {task.project_id && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {projects.find(p => p.id === task.project_id)?.name || 'Proyecto'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {/* Timer */}
                                            {activeTimer === task.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        {formatTime(elapsedTime)}
                                                    </span>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={pauseTimer}
                                                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                                    >
                                                        <Square className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => startTimer(task.id)}
                                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                                    disabled={task.status === 'completed'}
                                                >
                                                    <Play className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {/* Actions */}
                                            <div className="relative group">
                                                <Button size="sm" variant="outline" className="text-slate-600">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 min-w-[150px] opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingTask(task);
                                                            setShowEditTaskModal(true);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setShowTaskDetails(true);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Ver detalles
                                                    </button>
                                                    {task.status !== 'completed' && (
                                                        <button 
                                                            onClick={() => updateTaskStatus(task.id, 'completed')}
                                                            className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            Marcar completada
                                                        </button>
                                                    )}
                                                    {task.status !== 'archived' && (
                                                        <button 
                                                            onClick={() => updateTaskStatus(task.id, 'archived')}
                                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                        >
                                                            <Archive className="h-4 w-4" />
                                                            Archivar
                                                        </button>
                                                    )}
                                                    <hr className="my-1" />
                                                    <button 
                                                        onClick={() => deleteTask(task.id)}
                                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Nueva Tarea - Premium Design */}
            {showNewTaskModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-white/20 relative overflow-hidden">
                        {/* Background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 rounded-2xl"></div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Plus className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                            Nueva Tarea
                                        </h2>
                                        <p className="text-slate-600 text-sm">Crea una nueva tarea para tu proyecto</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowNewTaskModal(false);
                                        resetNewTaskForm();
                                    }}
                                    className="w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center transition-all duration-200"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Título */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="Ej: Implementar autenticación de usuarios"
                                    />
                                </div>

                                {/* Descripción */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Edit className="w-4 h-4" />
                                        Descripción
                                    </label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-200 text-slate-800 placeholder:text-slate-400 h-24 resize-none"
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        placeholder="Describe los detalles de la tarea, objetivos y requisitos..."
                                    />
                                </div>

                                {/* Prioridad */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Prioridad
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-200 text-slate-800 appearance-none cursor-pointer"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                                        >
                                            <option value="low">🟢 Baja</option>
                                            <option value="medium">🟡 Media</option>
                                            <option value="high">🟠 Alta</option>
                                            <option value="urgent">🔴 Urgente</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Estado
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-200 text-slate-800 appearance-none cursor-pointer"
                                            value={newTask.status}
                                            onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                                        >
                                            <option value="pending">⏳ Pendiente</option>
                                            <option value="in_progress">🚀 En progreso</option>
                                            <option value="paused">⏸️ Pausada</option>
                                            <option value="completed">✅ Completada</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Proyecto */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Proyecto *
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-200 text-slate-800 appearance-none cursor-pointer"
                                            value={newTask.project_id}
                                            onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                                        >
                                            <option value="">📁 Selecciona un proyecto...</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    🎯 {project.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Fecha límite */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Fecha límite
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition-all duration-200 text-slate-800"
                                        value={newTask.due_date}
                                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200/50">
                                <button
                                    onClick={() => {
                                        setShowNewTaskModal(false);
                                        resetNewTaskForm();
                                    }}
                                    className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200 hover:bg-slate-100/80 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={createTask}
                                    disabled={!newTask.title.trim() || !newTask.project_id}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" />
                                    Crear Tarea
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Tarea */}
            {showEditTaskModal && editingTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Editar Tarea</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingTask.title}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                    value={editingTask.description || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editingTask.priority}
                                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                        <option value="urgent">Urgente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editingTask.status}
                                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="in_progress">En progreso</option>
                                        <option value="paused">Pausada</option>
                                        <option value="completed">Completada</option>
                                        <option value="archived">Archivada</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingTask.project_id || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, project_id: e.target.value })}
                                >
                                    <option value="">Sin proyecto</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha límite</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingTask.due_date || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShowEditTaskModal(false);
                                    setEditingTask(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={updateTask}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalles de Tarea */}
            {showTaskDetails && selectedTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-slate-800">📋 {selectedTask.title}</h2>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowTaskDetails(false)}
                            >
                                ✕
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {selectedTask.description && (
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Descripción</h4>
                                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedTask.description}</p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Estado</h4>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        selectedTask.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        selectedTask.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                        selectedTask.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                        'bg-slate-100 text-slate-800'
                                    }`}>
                                        {selectedTask.status === 'pending' ? 'Pendiente' :
                                         selectedTask.status === 'in_progress' ? 'En progreso' :
                                         selectedTask.status === 'paused' ? 'Pausada' :
                                         selectedTask.status === 'completed' ? 'Completada' :
                                         selectedTask.status === 'archived' ? 'Archivada' : selectedTask.status}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Prioridad</h4>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        selectedTask.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                        selectedTask.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                        selectedTask.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedTask.priority === 'urgent' ? '🔥 Urgente' :
                                         selectedTask.priority === 'high' ? '⚠️ Alta' :
                                         selectedTask.priority === 'medium' ? '📋 Media' :
                                         '📝 Baja'}
                                    </span>
                                </div>
                            </div>
                            
                            {selectedTask.project_id && (
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Proyecto</h4>
                                    <p className="text-slate-600">{projects.find(p => p.id === selectedTask.project_id)?.name || 'Proyecto no encontrado'}</p>
                                </div>
                            )}
                            
                            {selectedTask.due_date && (
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Fecha límite</h4>
                                    <p className="text-slate-600 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(selectedTask.due_date).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 border-t pt-4">
                                <div>
                                    <p>Creada el:</p>
                                    <p className="font-medium">{new Date(selectedTask.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p>Actualizada el:</p>
                                    <p className="font-medium">{new Date(selectedTask.updated_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setEditingTask(selectedTask);
                                    setShowTaskDetails(false);
                                    setShowEditTaskModal(true);
                                }}
                            >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowTaskDetails(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
