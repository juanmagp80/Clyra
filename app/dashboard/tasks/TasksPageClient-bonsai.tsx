'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from "@/components/ui/Button";
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Calendar,
    CheckCircle,
    Clock,
    Filter,
    Play,
    Plus,
    Search,
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
    category?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    is_running?: boolean;
    total_time_seconds?: number;
    last_start?: string;
    last_stop?: string;
}

interface Project {
    id: string;
    name: string;
}

interface TasksPageClientProps {
    initialTasks: Task[];
    initialProjects: Project[];
}

const TasksPageClient: React.FC<TasksPageClientProps> = ({
    initialTasks,
    initialProjects
}) => {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState('');
    const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
    const [projects, setProjects] = useState<Project[]>(initialProjects || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [activeTimer, setActiveTimer] = useState<string | null>(null);
    const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium' as TaskPriority,
        status: 'pending' as TaskStatus,
        project_id: '',
        category: 'general',
        due_date: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        const loadUserData = async () => {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserEmail(user.email);
            }
        };
        loadUserData();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTimer && timerStartTime) {
            interval = setInterval(() => {
                setElapsedTime(Date.now() - timerStartTime.getTime());
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTimer, timerStartTime]);

    // Filtrar tareas
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
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
    };

    // Función para formatear tiempo
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Funciones del timer
    const startTimer = (taskId: string) => {
        setActiveTimer(taskId);
        setTimerStartTime(new Date());
        setElapsedTime(0);
    };

    const pauseTimer = () => {
        setActiveTimer(null);
        setTimerStartTime(null);
        setElapsedTime(0);
    };

    // Función de logout
    const handleLogout = async () => {
        try {
            const supabase = createSupabaseClient();
            await supabase.auth.signOut();
            router.push('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    // Función para crear nueva tarea
    const createTask = async () => {
        if (!newTask.title.trim()) return;

        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('Usuario no autenticado');
                return;
            }

            const taskData = {
                ...newTask,
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('tasks')
                .insert([taskData])
                .select()
                .single();

            if (error) {
                console.error('Error al crear tarea:', error);
                return;
            }

            setTasks([...tasks, data]);
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                status: 'pending',
                project_id: '',
                category: 'general',
                due_date: ''
            });
            setShowNewTaskModal(false);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para actualizar estado de tarea
    const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
                })
                .eq('id', taskId);

            if (error) {
                console.error('Error al actualizar tarea:', error);
                return;
            }

            setTasks(tasks.map(task =>
                task.id === taskId
                    ? { ...task, status: newStatus, ...(newStatus === 'completed' && { completed_at: new Date().toISOString() }) }
                    : task
            ));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para eliminar tarea
    const deleteTask = async (taskId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) {
                console.error('Error al eliminar tarea:', error);
                return;
            }

            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para editar tarea
    const updateTask = async () => {
        if (!editingTask) return;

        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: editingTask.title,
                    description: editingTask.description,
                    priority: editingTask.priority,
                    status: editingTask.status,
                    project_id: editingTask.project_id,
                    category: editingTask.category,
                    due_date: editingTask.due_date,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingTask.id);

            if (error) {
                console.error('Error al actualizar tarea:', error);
                return;
            }

            setTasks(tasks.map(task =>
                task.id === editingTask.id ? editingTask : task
            ));
            setShowEditTaskModal(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para obtener color de estado
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

    // Función para obtener color de prioridad
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/30 to-indigo-300/30 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-200/30 to-purple-300/30 blur-3xl"></div>
            </div>

            <div className="flex min-h-screen relative z-10">
                {/* Sidebar Premium */}
                <Sidebar
                    userEmail={userEmail}
                    onLogout={handleLogout}
                />

                {/* Contenido principal */}
                <div className="flex-1 ml-56 p-8">
                    {/* Header Premium */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-2">
                                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                                    ✅ Gestión de Tareas
                                </h1>
                                <p className="text-slate-600 text-lg font-medium">Organiza y controla tus tareas de forma eficiente con estilo profesional</p>
                            </div>
                            <div className="group">
                                <Button
                                    onClick={() => setShowNewTaskModal(true)}
                                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 group-hover:shadow-xl border border-white/20"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Nueva Tarea
                                </Button>
                            </div>
                        </div>

                        {/* Stats Premium */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-slate-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
                                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl hover:shadow-slate-500/20 transition-all duration-500 transform hover:scale-105">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                                            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl">
                                            <Tag className="h-6 w-6 text-slate-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
                                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 transform hover:scale-105">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pendientes</p>
                                            <p className="text-3xl font-black text-amber-600">{stats.pending}</p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl">
                                            <Clock className="h-6 w-6 text-amber-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
                                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:scale-105">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">En Progreso</p>
                                            <p className="text-3xl font-black text-blue-600">{stats.inProgress}</p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl">
                                            <Timer className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
                                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-2xl hover:shadow-green-500/20 transition-all duration-500 transform hover:scale-105">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Completadas</p>
                                            <p className="text-3xl font-black text-green-600">{stats.completed}</p>
                                        </div>
                                        <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl">
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filtros y búsqueda Premium */}
                        <div className="group relative mb-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-500/10 rounded-2xl blur-xl transition-all duration-500"></div>
                            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar tareas..."
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
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
                                        className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
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
                                        className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
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
                                        className="flex items-center px-6 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                    >
                                        <Filter className="mr-2 h-5 w-5" />
                                        Limpiar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de tareas Premium con estilos Bonsai */}
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
                            filteredTasks.map((task) => (
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
                                                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${task.status === 'completed' ? 'from-green-400 to-emerald-500' :
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
                                                            className={`${activeTimer === task.id
                                                                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                                                                } text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105`}
                                                        >
                                                            <Timer className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => deleteTask(task.id)}
                                                        className="p-3 rounded-xl border-2 border-red-200 hover:border-red-300 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {task.total_time_seconds && task.total_time_seconds > 0 && (
                                                    <div className="bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                                        <span className="text-xs font-mono text-slate-700">
                                                            {formatTime(task.total_time_seconds * 1000)}
                                                        </span>
                                                    </div>
                                                )}

                                                {activeTimer === task.id && (
                                                    <div className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                                                        <span className="text-xs font-mono text-blue-700">
                                                            {formatTime(elapsedTime)}
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
                                                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600">En progreso</span>
                                                    {activeTimer === task.id && (
                                                        <div className="flex items-center gap-1 text-xs text-blue-600 font-mono">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                            Activo
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Nueva Tarea Premium */}
            {showNewTaskModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-3xl blur-xl"></div>
                        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/30">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">✨ Nueva Tarea</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Título *</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="Escribe el título de la tarea..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                        rows={3}
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        placeholder="Describe la tarea..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Prioridad</label>
                                        <select
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
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
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
                                        <select
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
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
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowNewTaskModal(false)}
                                    className="px-6 py-3 rounded-xl"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={createTask}
                                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg"
                                >
                                    Crear Tarea
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPageClient;
