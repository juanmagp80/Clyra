'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Trash2,
    User,
    Briefcase,
    Flag,
    Timer,
    Target
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Task = {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    project_id?: string;
    created_at: string;
    updated_at: string;
    project?: {
        id: string;
        name: string;
        client?: {
            name: string;
        };
    };
};

interface TasksPageClientProps {
    userEmail: string;
}

export default function TasksPageClient({ userEmail }: TasksPageClientProps) {
    const supabase = createSupabaseClient();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    // Estados para el formulario de nueva tarea
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'pending' as const,
        priority: 'medium' as const,
        due_date: '',
        project_id: ''
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    project:projects(
                        id,
                        name,
                        client:clients(name)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error);
            } else {
                setTasks(data as Task[]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('id, name')
                .eq('status', 'active')
                .order('name');

            if (!error) {
                setProjects(data || []);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const addTask = async () => {
        if (!formData.title.trim()) return;

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase.from('tasks').insert([
                {
                    ...formData,
                    user_id: user.id,
                    project_id: formData.project_id || null,
                    due_date: formData.due_date || null
                },
            ]);

            if (error) {
                console.error('Error adding task:', error);
            } else {
                setFormData({
                    title: '',
                    description: '',
                    status: 'pending',
                    priority: 'medium',
                    due_date: '',
                    project_id: ''
                });
                setShowForm(false);
                fetchTasks();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', taskId);

            if (!error) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (!error) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchProjects();
    }, []);

    // Filtros
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Estadísticas
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return CheckCircle;
            case 'in_progress': return Timer;
            case 'pending': return Clock;
            default: return Clock;
        }
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

            <div className="relative z-10 flex h-screen">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                
                <main className="flex-1 ml-56 overflow-auto">
                    <div className="p-4">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent">
                                        Gestión de Tareas
                                    </h1>
                                    <p className="text-slate-600 text-sm font-medium">
                                        Organiza y gestiona todas tus tareas
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-10 px-4 rounded-lg shadow-lg shadow-indigo-500/25"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nueva Tarea
                                </Button>
                            </div>
                        </div>

                        {/* Estadísticas compactas */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-lg shadow-slate-900/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                        <Target className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{totalTasks}</p>
                                        <p className="text-xs text-slate-600 font-medium">Total</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-lg shadow-slate-900/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{completedTasks}</p>
                                        <p className="text-xs text-slate-600 font-medium">Completadas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-lg shadow-slate-900/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                        <Timer className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{inProgressTasks}</p>
                                        <p className="text-xs text-slate-600 font-medium">En Progreso</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-lg shadow-slate-900/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{pendingTasks}</p>
                                        <p className="text-xs text-slate-600 font-medium">Pendientes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-lg shadow-slate-900/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-slate-900">{overdueTasks}</p>
                                        <p className="text-xs text-slate-600 font-medium">Vencidas</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filtros y búsqueda compactos */}
                        <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 mb-6 shadow-lg shadow-slate-900/5">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex-1 min-w-64">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="Buscar tareas..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-9 text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="pending">Pendientes</option>
                                    <option value="in_progress">En Progreso</option>
                                    <option value="completed">Completadas</option>
                                </select>

                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="all">Todas las prioridades</option>
                                    <option value="high">Alta</option>
                                    <option value="medium">Media</option>
                                    <option value="low">Baja</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <span className="text-slate-700 font-medium">Cargando tareas...</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Lista de tareas */}
                                {filteredTasks.length === 0 ? (
                                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-8 text-center shadow-lg shadow-slate-900/5">
                                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <Target className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">No hay tareas</h3>
                                        <p className="text-slate-600 mb-4">
                                            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                                                ? 'No se encontraron tareas con los filtros aplicados'
                                                : 'Comienza creando tu primera tarea'
                                            }
                                        </p>
                                        {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                                            <Button
                                                onClick={() => setShowForm(true)}
                                                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-10 px-4 rounded-lg"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Nueva Tarea
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {filteredTasks.map((task) => {
                                            const StatusIcon = getStatusIcon(task.status);
                                            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                                            
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 ${
                                                        isOverdue ? 'border-red-200 bg-red-50/50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(task.status)}`}>
                                                                    <StatusIcon className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h3 className="font-bold text-slate-900 text-base">{task.title}</h3>
                                                                    {task.description && (
                                                                        <p className="text-slate-600 text-sm mt-1">{task.description}</p>
                                                                    )}
                                                                </div>
                                                                <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                                                                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                                                {task.project && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Briefcase className="w-3 h-3" />
                                                                        <span>{task.project.name}</span>
                                                                        {task.project.client && (
                                                                            <span className="text-slate-400">• {task.project.client.name}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {task.due_date && (
                                                                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                                                                        <Calendar className="w-3 h-3" />
                                                                        <span>
                                                                            {new Date(task.due_date).toLocaleDateString('es-ES')}
                                                                            {isOverdue && ' (Vencida)'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{new Date(task.created_at).toLocaleDateString('es-ES')}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2 ml-4">
                                                            {task.status !== 'completed' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => updateTaskStatus(task.id, task.status === 'pending' ? 'in_progress' : 'completed')}
                                                                    className="h-8 px-2 text-xs hover:bg-green-50 hover:text-green-700"
                                                                >
                                                                    {task.status === 'pending' ? 'Iniciar' : 'Completar'}
                                                                </Button>
                                                            )}
                                                            {task.status === 'completed' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                                                    className="h-8 px-2 text-xs hover:bg-blue-50 hover:text-blue-700"
                                                                >
                                                                    Reabrir
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteTask(task.id)}
                                                                className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal para nueva tarea */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-slate-900/10">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Nueva Tarea</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Título</label>
                                <Input
                                    placeholder="Título de la tarea"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                                <textarea
                                    placeholder="Descripción opcional"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-20"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Prioridad</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="low">Baja</option>
                                        <option value="medium">Media</option>
                                        <option value="high">Alta</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="in_progress">En Progreso</option>
                                        <option value="completed">Completada</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Proyecto (opcional)</label>
                                <select
                                    value={formData.project_id}
                                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Sin proyecto específico</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de vencimiento (opcional)</label>
                                <Input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    className="h-10"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={() => setShowForm(false)}
                                variant="ghost"
                                className="flex-1 h-10 border border-slate-200 hover:bg-slate-50"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={addTask}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-10"
                                disabled={!formData.title.trim()}
                            >
                                Crear Tarea
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
