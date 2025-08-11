'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import Sidebar from '@/components/Sidebar';
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
    Trash2,
    Copy,
    Play,
    Square,
    MoreVertical,
    Calendar,
    User,
    Tag,
    AlertTriangle
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
    user_id?: string; // Opcional ya que trabajamos a través de projects
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
    const supabase = createClientComponentClient();

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
            // Obtener todas las tareas (RLS se encargará de filtrar)
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error);
                setTasks([]);
            } else {
                console.log('✅ Tareas cargadas:', data?.length || 0);
                setTasks((data || []) as Task[]);
            }
        } catch (error) {
            console.error('Error crítico:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        if (!supabase) return;
        try {
            // Asegurar userId
            let uid = userId;
            if (!uid) {
                const { data: authData } = await supabase.auth.getUser();
                uid = authData.user?.id || null;
                setUserId(uid);
            }
            if (!uid) {
                setProjects([]);
                return;
            }
            const { data, error } = await supabase
                .from('projects')
                .select('id, name, status')
                .eq('user_id', uid)
                .order('name');

            if (!error && data) {
                const activeProjects = data.filter(project => !project.status || project.status === 'active');
                setProjects(activeProjects as Project[]);
            } else {
                console.error('Error fetching projects:', error);
                setProjects([]);
            }
        } catch (error) {
            console.error('Error crítico proyectos:', error);
            setProjects([]);
        }
    };

    const createTask = async () => {
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
            const taskData = {
                title: newTask.title,
                description: newTask.description || null,
                status: newTask.status,
                priority: newTask.priority,
                project_id: newTask.project_id,
                due_date: newTask.due_date || null
            };

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
            const updateData: any = { 
                status: newStatus, 
                updated_at: new Date().toISOString() 
            };

            if (newStatus === 'completed') {
                updateData.completed_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('tasks')
                .update(updateData)
                .eq('id', taskId);

            if (!error) {
                await fetchTasks();
                
                if (newStatus === 'completed') {
                    alert('¡Tarea completada! 🎉');
                } else if (newStatus === 'in_progress') {
                    alert('Tarea iniciada ▶️');
                } else if (newStatus === 'paused') {
                    alert('Tarea pausada ⏸️');
                }
            }
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Error al actualizar el estado de la tarea');
        }
    };

    const updateTask = async () => {
        if (!editingTask || !editingTask.title.trim()) {
            alert('⚠️ El título de la tarea es obligatorio');
            return;
        }
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: editingTask.title,
                    description: editingTask.description,
                    status: editingTask.status,
                    priority: editingTask.priority,
                    due_date: editingTask.due_date || null,
                    project_id: editingTask.project_id || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingTask.id);

            if (error) {
                console.error('Error updating task:', error);
                alert('Error al actualizar la tarea: ' + error.message);
                return;
            }

            alert('¡Tarea actualizada exitosamente! ✨');
            setShowEditTaskModal(false);
            setEditingTask(null);
            await fetchTasks();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error crítico al actualizar la tarea');
        }
    };

    const deleteTask = async (taskId: string, taskTitle: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar la tarea "${taskTitle}"?\n\nEsta acción no se puede deshacer.`)) return;
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (!error) {
                alert('¡Tarea eliminada correctamente! 🗑️');
                await fetchTasks();
            } else {
                console.error('Error deleting task:', error);
                alert('Error al eliminar la tarea');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error crítico al eliminar la tarea');
        }
    };

    const startTimer = (taskId: string) => {
        try {
            if (activeTimer && activeTimer !== taskId) {
                stopTimer();
            }

            const startTime = new Date();
            setActiveTimer(taskId);
            setTimerStartTime(startTime);
            setElapsedTime(0);

            const task = tasks.find(t => t.id === taskId);
            if (task && task.status !== 'in_progress') {
                updateTaskStatus(taskId, 'in_progress');
            }

            console.log('Timer iniciado para la tarea:', taskId);

        } catch (error) {
            console.error('Error starting timer:', error);
        }
    };

    const stopTimer = () => {
        if (!activeTimer || !timerStartTime) return;

        try {
            const endTime = new Date();
            const timeSpent = Math.round((endTime.getTime() - timerStartTime.getTime()) / 1000 / 60);

            setActiveTimer(null);
            setTimerStartTime(null);
            setElapsedTime(0);

            if (timeSpent > 0) {
                alert(`⏱️ Tiempo registrado: ${timeSpent} minutos`);
            }

        } catch (error) {
            console.error('Error stopping timer:', error);
        }
    };

    useEffect(() => {
        // Cargar usuario y luego datos
        (async () => {
            try {
                const { data: authData } = await supabase.auth.getUser();
                if (authData.user?.id) setUserId(authData.user.id);
            } catch (e) {
                console.warn('No se pudo obtener usuario al inicio', e);
            } finally {
                fetchTasks();
                fetchProjects();
            }
        })();
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

    // Filtros básicos
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesProject = projectFilter === 'all' || task.project_id === projectFilter;
        
        return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    // Estadísticas
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        overdue: tasks.filter(t => 
            t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
        ).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'urgent': return 'text-red-700 bg-red-100 border-red-300';
            case 'high': return 'text-orange-700 bg-orange-100 border-orange-300';
            case 'medium': return 'text-amber-700 bg-amber-100 border-amber-300';
            case 'low': return 'text-green-700 bg-green-100 border-green-300';
            default: return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'completed': return 'text-emerald-700 bg-emerald-100 border-emerald-300';
            case 'in_progress': return 'text-blue-700 bg-blue-100 border-blue-300';
            case 'paused': return 'text-purple-700 bg-purple-100 border-purple-300';
            case 'archived': return 'text-gray-700 bg-gray-100 border-gray-300';
            case 'pending': return 'text-slate-700 bg-slate-100 border-slate-300';
            default: return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case 'completed': return CheckCircle;
            case 'in_progress': return Timer;
            case 'paused': return Pause;
            case 'archived': return Archive;
            case 'pending': return Clock;
            default: return Clock;
        }
    };

    const formatTime = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        }
        return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    };

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="flex min-h-screen">
                {/* Sidebar Premium */}
                <Sidebar 
                    userEmail={userEmail} 
                    onLogout={handleLogout}
                />

                {/* Contenido principal */}
                <div className="flex-1 ml-56 p-8">{/* ml-56 para compensar el ancho fijo del sidebar */}
                            Dashboard
                        </a>
                        <a href="/dashboard/tasks" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium">
                            ✅ Tareas
                        </a>
                    </nav>

                    <div className="absolute bottom-4 left-4 right-4">
                        <Button 
                            onClick={handleLogout}
                            variant="outline" 
                            className="w-full text-slate-600"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 ml-56 overflow-auto">
                    <div className="p-6">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                        ✅ Gestión de Tareas
                                    </h1>
                                    <p className="text-slate-600 text-sm font-medium mt-2">
                                        Organiza, gestiona y completa todas tus tareas con eficiencia
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => setShowNewTaskModal(true)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-11 px-6 rounded-xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-200"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Nueva Tarea
                                    </Button>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl">
                                    <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                                    <div className="text-sm text-slate-600">Total</div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl">
                                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                                    <div className="text-sm text-slate-600">En Progreso</div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl">
                                    <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
                                    <div className="text-sm text-slate-600">Completadas</div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl">
                                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                                    <div className="text-sm text-slate-600">Pendientes</div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-xl">
                                    <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
                                    <div className="text-sm text-slate-600">Completado</div>
                                </div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar tareas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="pending">⏳ Pendiente</option>
                                    <option value="in_progress">🚀 En Progreso</option>
                                    <option value="paused">⏸️ Pausada</option>
                                    <option value="completed">✅ Completada</option>
                                </select>
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todas las prioridades</option>
                                    <option value="urgent">🔴 Urgente</option>
                                    <option value="high">🟠 Alta</option>
                                    <option value="medium">🟡 Media</option>
                                    <option value="low">🟢 Baja</option>
                                </select>
                                <select
                                    value={projectFilter}
                                    onChange={(e) => setProjectFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Todos los proyectos</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Lista de Tareas */}
                        <div className="space-y-4">
                            {filteredTasks.length === 0 ? (
                                <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center shadow-xl">
                                    <div className="text-6xl mb-4">📋</div>
                                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No hay tareas</h3>
                                    <p className="text-slate-500 mb-6">
                                        {tasks.length === 0 
                                            ? "Crea tu primera tarea para comenzar"
                                            : "No hay tareas que coincidan con los filtros aplicados"
                                        }
                                    </p>
                                    <Button
                                        onClick={() => setShowNewTaskModal(true)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nueva Tarea
                                    </Button>
                                </div>
                            ) : (
                                filteredTasks.map((task) => {
                                    const StatusIcon = getStatusIcon(task.status);
                                    const isTimerActive = activeTimer === task.id;
                                    
                                    return (
                                        <div key={task.id} className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <StatusIcon className="w-5 h-5 text-slate-500" />
                                                        <h3 className="text-lg font-semibold text-slate-800 cursor-pointer hover:text-blue-600"
                                                            onClick={() => {
                                                                setSelectedTask(task);
                                                                setShowTaskDetails(true);
                                                            }}
                                                        >
                                                            {task.title}
                                                        </h3>
                                                        <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getPriorityColor(task.priority)}`}>
                                                            {task.priority === 'urgent' && '🔴 Urgente'}
                                                            {task.priority === 'high' && '🟠 Alta'}
                                                            {task.priority === 'medium' && '🟡 Media'}
                                                            {task.priority === 'low' && '🟢 Baja'}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getStatusColor(task.status)}`}>
                                                            {task.status === 'pending' && '⏳ Pendiente'}
                                                            {task.status === 'in_progress' && '🚀 En Progreso'}
                                                            {task.status === 'paused' && '⏸️ Pausada'}
                                                            {task.status === 'completed' && '✅ Completada'}
                                                            {task.status === 'archived' && '📁 Archivada'}
                                                        </span>
                                                    </div>
                                                    
                                                    {task.description && (
                                                        <p className="text-slate-600 mb-3 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                                        {task.due_date && (
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(task.due_date).toLocaleDateString('es-ES')}
                                                            </div>
                                                        )}
                                                        {task.project_id && (
                                                            <div className="flex items-center gap-1">
                                                                <Tag className="w-4 h-4" />
                                                                {projects.find(p => p.id === task.project_id)?.name || 'Proyecto'}
                                                            </div>
                                                        )}
                                                        {isTimerActive && (
                                                            <div className="flex items-center gap-1 text-blue-600 font-medium">
                                                                <Timer className="w-4 h-4" />
                                                                {formatTime(elapsedTime)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    {/* Botones de estado */}
                                                    {task.status !== 'completed' && (
                                                        <div className="flex items-center gap-1">
                                                            {task.status === 'pending' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                >
                                                                    <Play className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            
                                                            {task.status === 'in_progress' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => updateTaskStatus(task.id, 'paused')}
                                                                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                                                    >
                                                                        <Pause className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => updateTaskStatus(task.id, 'completed')}
                                                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            
                                                            {task.status === 'paused' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                >
                                                                    <Play className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Timer */}
                                                    {task.status !== 'completed' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => isTimerActive ? stopTimer() : startTimer(task.id)}
                                                            className={isTimerActive 
                                                                ? "text-red-600 border-red-200 hover:bg-red-50" 
                                                                : "text-gray-600 border-gray-200 hover:bg-gray-50"
                                                            }
                                                        >
                                                            {isTimerActive ? <Square className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
                                                        </Button>
                                                    )}

                                                    {/* Acciones */}
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingTask(task);
                                                                setShowEditTaskModal(true);
                                                            }}
                                                            className="text-slate-600 border-slate-200 hover:bg-slate-50"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => deleteTask(task.id, task.title)}
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Nueva Tarea */}
            {showNewTaskModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-slate-800">✨ Nueva Tarea</h2>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📝 Título de la Tarea *
                                </label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Ej: Completar informe mensual"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📄 Descripción
                                </label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Describe los detalles de la tarea..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        🎯 Prioridad
                                    </label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">🟢 Baja</option>
                                        <option value="medium">🟡 Media</option>
                                        <option value="high">🟠 Alta</option>
                                        <option value="urgent">🔴 Urgente</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        📊 Estado Inicial
                                    </label>
                                    <select
                                        value={newTask.status}
                                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">⏳ Pendiente</option>
                                        <option value="in_progress">🚀 En Progreso</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    💼 Proyecto Asociado
                                </label>
                                <select
                                    value={newTask.project_id}
                                    onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">🏠 Sin proyecto específico</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            🗂️ {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📅 Fecha Límite
                                </label>
                                <input
                                    type="date"
                                    value={newTask.due_date}
                                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl">
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setShowNewTaskModal(false);
                                        resetNewTaskForm();
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={createTask}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    ✨ Crear Tarea
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Tarea */}
            {showEditTaskModal && editingTask && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-slate-800">✏️ Editar Tarea</h2>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📝 Título de la Tarea *
                                </label>
                                <input
                                    type="text"
                                    value={editingTask.title}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📄 Descripción
                                </label>
                                <textarea
                                    value={editingTask.description || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        🎯 Prioridad
                                    </label>
                                    <select
                                        value={editingTask.priority}
                                        onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">🟢 Baja</option>
                                        <option value="medium">🟡 Media</option>
                                        <option value="high">🟠 Alta</option>
                                        <option value="urgent">🔴 Urgente</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        📊 Estado
                                    </label>
                                    <select
                                        value={editingTask.status}
                                        onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">⏳ Pendiente</option>
                                        <option value="in_progress">🚀 En Progreso</option>
                                        <option value="paused">⏸️ Pausada</option>
                                        <option value="completed">✅ Completada</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    💼 Proyecto Asociado
                                </label>
                                <select
                                    value={editingTask.project_id || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, project_id: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">🏠 Sin proyecto específico</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            🗂️ {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📅 Fecha Límite
                                </label>
                                <input
                                    type="date"
                                    value={editingTask.due_date || ''}
                                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl">
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setShowEditTaskModal(false);
                                        setEditingTask(null);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={updateTask}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    💾 Guardar Cambios
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detalles de Tarea */}
            {showTaskDetails && selectedTask && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-slate-800">📋 {selectedTask.title}</h2>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                                    {selectedTask.priority === 'urgent' && '🔴 Urgente'}
                                    {selectedTask.priority === 'high' && '🟠 Alta'}
                                    {selectedTask.priority === 'medium' && '🟡 Media'}
                                    {selectedTask.priority === 'low' && '🟢 Baja'}
                                </span>
                                <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(selectedTask.status)}`}>
                                    {selectedTask.status === 'pending' && '⏳ Pendiente'}
                                    {selectedTask.status === 'in_progress' && '🚀 En Progreso'}
                                    {selectedTask.status === 'paused' && '⏸️ Pausada'}
                                    {selectedTask.status === 'completed' && '✅ Completada'}
                                </span>
                            </div>

                            {selectedTask.description && (
                                <div>
                                    <h3 className="font-semibold text-slate-700 mb-2">📄 Descripción</h3>
                                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">
                                        {selectedTask.description}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                {selectedTask.due_date && (
                                    <div>
                                        <h3 className="font-semibold text-slate-700 mb-2">📅 Fecha Límite</h3>
                                        <p className="text-slate-600">
                                            {new Date(selectedTask.due_date).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-semibold text-slate-700 mb-2">📅 Creada</h3>
                                    <p className="text-slate-600">
                                        {new Date(selectedTask.created_at).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            </div>

                            {selectedTask.project_id && (
                                <div>
                                    <h3 className="font-semibold text-slate-700 mb-2">💼 Proyecto</h3>
                                    <p className="text-slate-600">
                                        {projects.find(p => p.id === selectedTask.project_id)?.name || 'Proyecto no encontrado'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl">
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setShowTaskDetails(false);
                                        setSelectedTask(null);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    onClick={() => {
                                        setEditingTask(selectedTask);
                                        setShowTaskDetails(false);
                                        setSelectedTask(null);
                                        setShowEditTaskModal(true);
                                    }}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}