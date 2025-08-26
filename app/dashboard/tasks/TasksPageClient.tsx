'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from "@/components/ui/Button";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
    Archive,
    Calendar,
    CheckCircle,
    Clock,
    Edit3,
    Filter,
    MoreVertical,
    Play,
    Plus,
    Search,
    Square,
    Tag,
    Timer,
    Trash2,
    User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
                console.log('✅ Proyectos cargados:', activeProjects.length);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="flex min-h-screen">
                {/* Sidebar Premium */}
                <Sidebar
                    userEmail={userEmail}
                    onLogout={handleLogout}
                />

                {/* Contenido principal */}
                <div className="flex-1 ml-56 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                    ✅ Gestión de Tareas
                                </h1>
                                <p className="text-slate-600 mt-2">Organiza y controla tus tareas de forma eficiente</p>
                            </div>
                            <Button
                                onClick={() => setShowNewTaskModal(true)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Tarea
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

                    {/* Lista de tareas Premium */}
                    <div className="space-y-6">
                        {filteredTasks.length === 0 ? (
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-400/10 to-blue-500/10 rounded-2xl blur-xl"></div>
                                <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-16 border border-white/40 shadow-2xl text-center">
                                    <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl inline-block mb-6">
                                        <Tag className="h-20 w-20 text-slate-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-700 mb-4">No hay tareas</h3>
                                    <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                                        {tasks.length === 0
                                            ? "Aún no has creado ninguna tarea. ¡Comienza creando tu primera tarea!"
                                            : "No hay tareas que coincidan con los filtros actuales."
                                        }
                                    </p>
                                    {tasks.length === 0 && (
                                        <Button
                                            onClick={() => setShowNewTaskModal(true)}
                                            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
                                        >
                                            <Plus className="mr-2 h-5 w-5" />
                                            Crear primera tarea
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            filteredTasks.map((task) => {
                                const getStatusColor = (status: TaskStatus) => {
                                    const colors = {
                                        pending: 'from-amber-400/20 to-orange-500/20 border-amber-200/50',
                                        in_progress: 'from-blue-400/20 to-indigo-500/20 border-blue-200/50',
                                        paused: 'from-slate-400/20 to-gray-500/20 border-slate-200/50',
                                        completed: 'from-green-400/20 to-emerald-500/20 border-green-200/50',
                                        archived: 'from-purple-400/20 to-violet-500/20 border-purple-200/50'
                                    };
                                    return colors[status] || colors.pending;
                                };

                                const getPriorityColor = (priority: TaskPriority) => {
                                    const colors = {
                                        low: 'bg-green-100 text-green-800 border-green-200',
                                        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                        high: 'bg-orange-100 text-orange-800 border-orange-200',
                                        urgent: 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                                    };
                                    return colors[priority] || colors.medium;
                                };

                                return (
                                    <div key={task.id} className="group relative">
                                        <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(task.status)} rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-0 group-hover:opacity-100`}></div>
                                        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent group-hover:from-blue-900 group-hover:via-indigo-700 group-hover:to-purple-900 transition-all duration-500">
                                                            {task.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)} shadow-lg`}>
                                                                {task.priority === 'urgent' && '🔥'} {task.priority.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {task.description && (
                                                        <p className="text-slate-600 leading-relaxed bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                                                                task.status === 'completed' ? 'from-green-400 to-emerald-500' :
                                                                task.status === 'in_progress' ? 'from-blue-400 to-indigo-500' :
                                                                task.status === 'paused' ? 'from-slate-400 to-gray-500' :
                                                                'from-amber-400 to-orange-500'
                                                            } shadow-lg`}></div>
                                                            <span className="text-sm font-medium text-slate-700 capitalize">
                                                                {task.status === 'pending' ? 'Pendiente' :
                                                                task.status === 'in_progress' ? 'En progreso' :
                                                                task.status === 'paused' ? 'Pausada' :
                                                                task.status === 'completed' ? 'Completada' :
                                                                task.status === 'archived' ? 'Archivada' : task.status}
                                                            </span>
                                                        </div>
                                                        
                                                        {task.project_id && (
                                                            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                                                                <User className="h-4 w-4 text-indigo-600" />
                                                                <span className="text-sm font-medium text-indigo-700">
                                                                    {projects.find(p => p.id === task.project_id)?.name || 'Proyecto'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        {task.category && (
                                                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                                                                <Tag className="h-4 w-4 text-purple-600" />
                                                                <span className="text-sm font-medium text-purple-700 capitalize">
                                                                    {task.category}
                                                                </span>
                                                            </div>
                                                        )}
                                                        
                                                        {task.due_date && (
                                                            <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                                                                <Calendar className="h-4 w-4 text-rose-600" />
                                                                <span className="text-sm font-medium text-rose-700">
                                                                    {new Date(task.due_date).toLocaleDateString('es-ES')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col items-end gap-3 ml-6">
                                                    <div className="relative">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                setMenuAnchor(rect);
                                                                setMenuTaskId(task.id);
                                                            }}
                                                            className="p-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg group"
                                                        >
                                                            <MoreVertical className="h-5 w-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        {task.status !== 'completed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateTaskStatus(task.id, 'completed')}
                                                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        
                                                        {task.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    updateTaskStatus(task.id, 'in_progress');
                                                                    startTimer(task.id);
                                                                }}
                                                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                                                            >
                                                                <Play className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        
                                                        {(task.status === 'in_progress' || task.status === 'paused') && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (activeTimer === task.id) {
                                                                        pauseTimer();
                                                                        updateTaskStatus(task.id, 'paused');
                                                                    } else {
                                                                        startTimer(task.id);
                                                                        updateTaskStatus(task.id, 'in_progress');
                                                                    }
                                                                }}
                                                                className={`${
                                                                    activeTimer === task.id 
                                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                                                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                                                                } text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105`}
                                                            >
                                                                <Timer className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    {task.total_time_seconds && task.total_time_seconds > 0 && (
                                                        <div className="bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                                            <span className="text-xs font-mono text-slate-700">
                                                                {formatTime(task.total_time_seconds * 1000)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Progress bar para tareas en progreso */}
                                            {task.status === 'in_progress' && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{width: '65%'}}></div>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600">En progreso</span>
                                                        {activeTimer === task.id && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-600 font-mono">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                                {timerStartTime && formatTime(Date.now() - timerStartTime.getTime())}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                                <div key={task.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
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

            {/* Modal Nueva Tarea */}
            {showNewTaskModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Nueva Tarea</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Escribe el título de la tarea..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Describe la tarea..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
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
                                        value={newTask.status}
                                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value as TaskStatus })}
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="in_progress">En progreso</option>
                                        <option value="paused">Pausada</option>
                                        <option value="completed">Completada</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto *</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newTask.project_id}
                                    onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                                >
                                    <option value="">Selecciona un proyecto...</option>
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
                                    value={newTask.due_date}
                                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowNewTaskModal(false);
                                    resetNewTaskForm();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={createTask}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                Crear Tarea
                            </Button>
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
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedTask.priority === 'urgent' ? 'bg-red-100 text-red-800' :
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
