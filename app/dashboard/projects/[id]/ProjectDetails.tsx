'use client';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { showToast } from '@/utils/toast';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Mail,
    Phone,
    Plus,
    Save,
    Trash2,
    User,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipo Task
type Task = {
    id: string;
    project_id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    created_at: string;
};

// Tipo Project
type Project = {
    id: string;
    name: string;
    description?: string;
    client_id: string;
    user_id: string;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    budget?: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at?: string;
    // Relación con cliente
    client?: {
        id: string;
        name: string;
        company?: string;
        email?: string;
        phone?: string;
    };
    // Relación con tareas
    tasks?: Task[];
};

interface ProjectDetailsProps {
    projectId: string;
    userEmail: string;
}

export default function ProjectDetails({ projectId, userEmail }: ProjectDetailsProps) {
    // Estados
    const [project, setProject] = useState<Project | null>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState(userEmail);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client_id: '',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'active'
    });

    const supabase = createSupabaseClient();
    const router = useRouter();

    // Función para obtener el proyecto
    const fetchProject = async () => {
        try {
            setLoading(true);

            if (!supabase) return;
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) {
                router.push('/login');
                return;
            }

            // Actualizar email del usuario si no se proporcionó
            if (!currentUserEmail) {
                setCurrentUserEmail(user.email || '');
            }

            const { data: projectData, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    client:clients(id, name, company, email, phone)
                `)
                .eq('id', projectId)
                .eq('user_id', user.id)
                .single();

            if (error) {
                console.error('Error fetching project:', error);
                // Si no se encuentra el proyecto, redirigir después de un breve delay
                if (error.code === 'PGRST116') {
                    setTimeout(() => {
                        router.push('/dashboard/projects');
                    }, 2000);
                }
            } else {
                setProject(projectData);

                // Obtener tareas del proyecto
                const { data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('project_id', projectId)
                    .order('created_at', { ascending: false });

                if (!tasksError) {
                    setTasks(tasksData || []);
                }

                // Llenar formulario para edición
                setFormData({
                    name: projectData.name,
                    description: projectData.description || '',
                    client_id: projectData.client_id || '',
                    budget: projectData.budget?.toString() || '',
                    start_date: projectData.start_date || '',
                    end_date: projectData.end_date || '',
                    status: projectData.status
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener clientes
    const fetchClients = async () => {
        try {
            if (!supabase) return;
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: clientsData, error } = await supabase
                .from('clients')
                .select('id, name, company')
                .eq('user_id', user.id)
                .order('name');

            if (error) {
                console.error('Error fetching clients:', error);
            } else {
                setClients(clientsData || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para actualizar proyecto
    const updateProject = async () => {
        try {
            if (!project) return;

            if (!supabase) return;
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase
                .from('projects')
                .update({
                    name: formData.name,
                    description: formData.description || null,
                    client_id: formData.client_id || null,
                    budget: formData.budget ? parseFloat(formData.budget) : null,
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null,
                    status: formData.status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', project.id);

            if (error) {
                console.error('Error updating project:', error);
                showToast.error('Error al actualizar el proyecto');
            } else {
                setIsEditing(false);
                fetchProject(); // Recargar datos
                showToast.success('Proyecto actualizado exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al actualizar el proyecto');
        }
    };

    // Función para añadir tarea
    const addTask = async () => {
        try {
            if (!project || !taskFormData.title.trim()) return;

            if (!supabase) return;
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase.from('tasks').insert([
                {
                    project_id: project.id,
                    title: taskFormData.title.trim(),
                    description: taskFormData.description.trim() || null,
                    status: taskFormData.status,
                    priority: taskFormData.priority,
                    due_date: taskFormData.due_date || null,
                },
            ]);

            if (error) {
                console.error('Error adding task:', error);
                showToast.error('Error al crear la tarea');
            } else {
                setTaskFormData({
                    title: '',
                    description: '',
                    status: 'pending',
                    priority: 'medium',
                    due_date: ''
                });
                setShowTaskForm(false);
                fetchProject(); // Recargar datos para actualizar progreso
            }
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al crear la tarea');
        }
    };

    // Función para actualizar tarea
    const updateTask = async () => {
        try {
            if (!editingTask || !taskFormData.title.trim()) return;

            if (!supabase) return;
            const { error } = await supabase
                .from('tasks')
                .update({
                    title: taskFormData.title.trim(),
                    description: taskFormData.description.trim() || null,
                    status: taskFormData.status,
                    priority: taskFormData.priority,
                    due_date: taskFormData.due_date || null,
                })
                .eq('id', editingTask.id);

            if (error) {
                console.error('Error updating task:', error);
                showToast.error('Error al actualizar la tarea');
            } else {
                setTaskFormData({
                    title: '',
                    description: '',
                    status: 'pending',
                    priority: 'medium',
                    due_date: ''
                });
                setEditingTask(null);
                setShowTaskForm(false);
                fetchProject(); // Recargar datos para actualizar progreso
            }
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al actualizar la tarea');
        }
    };

    // Función para eliminar tarea
    const deleteTask = async (taskId: string) => {
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) {
                console.error('Error deleting task:', error);
                showToast.error('Error al eliminar la tarea');
            } else {
                fetchProject(); // Recargar datos para actualizar progreso
            }
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al eliminar la tarea');
        }
    };

    // Función para iniciar edición de tarea
    const startEditingTask = (task: Task) => {
        setEditingTask(task);
        setTaskFormData({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: task.priority || 'medium',
            due_date: task.due_date ? task.due_date.split('T')[0] : ''
        });
        setShowTaskForm(true);
    };

    // Función para cambiar el estado de una tarea rápidamente
    const toggleTaskStatus = async (task: Task) => {
        try {
            const newStatus =
                task.status === 'pending' ? 'in_progress' :
                    task.status === 'in_progress' ? 'completed' :
                        'pending';

            if (!supabase) return;
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', task.id);

            if (error) {
                console.error('Error updating task status:', error);
            } else {
                fetchProject(); // Recargar datos para actualizar progreso
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Función para obtener el badge de estado
    const getStatusBadge = (status: string) => {
        const badges = {
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            paused: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const labels = {
            active: 'Activo',
            completed: 'Completado',
            paused: 'Pausado',
            cancelled: 'Cancelado'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    // Función para obtener el progreso del proyecto basado en tareas
    const getProjectProgress = () => {
        if (!tasks || tasks.length === 0) {
            // Si no hay tareas, usar progreso basado en estado
            const statusProgress = {
                active: 25,
                completed: 100,
                paused: 10,
                cancelled: 0
            };
            return statusProgress[project?.status as keyof typeof statusProgress] || 0;
        }

        // Calcular progreso ponderado basado en estado de tareas
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
        const totalTasks = tasks.length;

        // Progreso ponderado: completadas = 100%, en progreso = 50%, pendientes = 0%
        const weightedProgress = (completedTasks * 1.0) + (inProgressTasks * 0.5);

        return Math.round((weightedProgress / totalTasks) * 100);
    };

    // Función para ordenar tareas por prioridad y fecha de vencimiento
    const getSortedTasks = () => {
        return [...tasks].sort((a, b) => {
            // Primero ordenar por estado (pendientes y en progreso antes que completadas)
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (a.status !== 'completed' && b.status === 'completed') return -1;

            // Luego por prioridad (alta > media > baja)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2;
            const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2;

            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }

            // Finalmente por fecha de vencimiento (más próximas primero)
            if (a.due_date && b.due_date) {
                return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            }
            if (a.due_date && !b.due_date) return -1;
            if (!a.due_date && b.due_date) return 1;

            // Si no tienen fecha, ordenar por fecha de creación
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    };

    // Cargar datos al montar
    useEffect(() => {
        fetchProject();
        fetchClients();
    }, [projectId]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-900">
                <div className="w-64 flex-shrink-0 bg-white shadow h-full">
                    <Sidebar userEmail={currentUserEmail} onLogout={async () => {
                        if (supabase) await supabase.auth.signOut();
                        router.push('/login');
                    }} />
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Cargando proyecto...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex h-screen bg-gray-50 text-gray-900">
                <div className="w-64 flex-shrink-0 bg-white shadow h-full">
                    <Sidebar userEmail={currentUserEmail} onLogout={async () => {
                        if (supabase) await supabase.auth.signOut();
                        router.push('/login');
                    }} />
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <div className="text-2xl">🔍</div>
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">
                                Proyecto no encontrado
                            </h2>
                            <p className="text-slate-600 mb-4">
                                El proyecto que buscas no existe o no tienes permisos para verlo.
                            </p>
                            <p className="text-sm text-slate-500 mb-4">
                                Redirigiendo automáticamente en 2 segundos...
                            </p>
                            <Button 
                                onClick={() => router.push('/dashboard/projects')}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a Proyectos
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // ...existing code...

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <Sidebar userEmail={currentUserEmail} onLogout={async () => {
                if (supabase) await supabase.auth.signOut();
                router.push('/login');
            }} />

            <main className="flex-1 ml-64 overflow-auto">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/dashboard/projects')}
                                    className="rounded-lg border-slate-200 hover:bg-slate-50"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Button>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                        {project.name}
                                    </h1>
                                    <p className="text-slate-600 mt-1 font-medium">Detalles y gestión del proyecto</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                    project.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        project.status === 'paused' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                    {project.status === 'active' ? '🟢 Activo' :
                                        project.status === 'completed' ? '✅ Completado' :
                                            project.status === 'paused' ? '⏸️ Pausado' :
                                                '❌ Cancelado'}
                                </span>
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={updateProject}
                                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Guardar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    name: project.name,
                                                    description: project.description || '',
                                                    client_id: project.client_id || '',
                                                    budget: project.budget?.toString() || '',
                                                    start_date: project.start_date || '',
                                                    end_date: project.end_date || '',
                                                    status: project.status
                                                });
                                            }}
                                            className="rounded-xl border-slate-200 hover:bg-slate-50"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Contenido principal */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Información principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Detalles básicos */}
                            <Card className="rounded-2xl shadow-sm border-slate-100">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-2xl">
                                    <CardTitle className="flex items-center gap-2 text-slate-900">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                            <Edit className="h-4 w-4 text-white" />
                                        </div>
                                        Información del Proyecto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre del Proyecto</label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Nombre del proyecto"
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Descripción</label>
                                                <textarea
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    rows={4}
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Descripción del proyecto"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Estado</label>
                                                <select
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="active">🟢 Activo</option>
                                                    <option value="paused">⏸️ Pausado</option>
                                                    <option value="completed">✅ Completado</option>
                                                    <option value="cancelled">❌ Cancelado</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-3">Descripción</h3>
                                                <p className="text-slate-600 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    {project.description || 'Sin descripción disponible'}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-3">Estado y Progreso</h3>
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-slate-700 font-medium">Progreso del proyecto</span>
                                                            <span className="text-lg font-bold text-blue-700">{getProjectProgress()}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-3">
                                                            <div
                                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                                                style={{ width: `${getProjectProgress()}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    {tasks.length > 0 && (
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                                                                <div className="text-2xl font-bold text-emerald-700">{tasks.filter(t => t.status === 'completed').length}</div>
                                                                <div className="text-sm text-emerald-600 font-semibold">Completadas</div>
                                                            </div>
                                                            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                                                                <div className="text-2xl font-bold text-amber-700">{tasks.filter(t => t.status === 'in_progress').length}</div>
                                                                <div className="text-sm text-amber-600 font-semibold">En progreso</div>
                                                            </div>
                                                            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                                                                <div className="text-2xl font-bold text-red-700">{tasks.filter(t => t.status === 'pending').length}</div>
                                                                <div className="text-sm text-red-600 font-semibold">Pendientes</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {tasks.length === 0 && (
                                                        <p className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                            📝 Sin tareas asignadas. El progreso se basa en el estado del proyecto.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Fechas y presupuesto */}
                            <Card className="rounded-2xl shadow-sm border-slate-100">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-slate-50 rounded-t-2xl">
                                    <CardTitle className="flex items-center gap-2 text-slate-900">
                                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                            <Calendar className="h-4 w-4 text-white" />
                                        </div>
                                        Cronograma y Presupuesto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {isEditing ? (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Presupuesto</label>
                                                <Input
                                                    type="number"
                                                    value={formData.budget}
                                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                    placeholder="0"
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div></div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Fecha de Inicio</label>
                                                <Input
                                                    type="date"
                                                    value={formData.start_date}
                                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Fecha de Fin</label>
                                                <Input
                                                    type="date"
                                                    value={formData.end_date}
                                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-slate-50 rounded-xl border border-emerald-100">
                                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                                    <DollarSign className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 font-semibold">Presupuesto</p>
                                                    <p className="text-xl font-bold text-slate-900">
                                                        {project.budget ? `€${project.budget.toLocaleString()}` : 'No definido'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div></div>
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                                    <Calendar className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 font-semibold">Fecha de Inicio</p>
                                                    <p className="text-lg font-bold text-slate-900">
                                                        {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'No definida'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-slate-50 rounded-xl border border-red-100">
                                                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                                    <Calendar className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-600 font-semibold">Fecha de Fin</p>
                                                    <p className="text-lg font-bold text-slate-900">
                                                        {project.end_date ? new Date(project.end_date).toLocaleDateString('es-ES') : 'No definida'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar derecha */}
                        <div className="space-y-6">
                            {/* Tareas del proyecto */}
                            <Card className="rounded-2xl shadow-sm border-slate-100">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50 rounded-t-2xl">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                                <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-slate-900">Tareas</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-3 py-1 rounded-full font-semibold border border-purple-200">
                                                {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
                                            </span>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setEditingTask(null);
                                                    setTaskFormData({
                                                        title: '',
                                                        description: '',
                                                        status: 'pending',
                                                        priority: 'medium',
                                                        due_date: ''
                                                    });
                                                    setShowTaskForm(true);
                                                }}
                                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Formulario de tarea */}
                                    {showTaskForm && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-slate-50 rounded-xl border border-purple-100 space-y-4">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                                    {editingTask ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
                                                </label>
                                                <Input
                                                    placeholder="Nombre de la tarea"
                                                    value={taskFormData.title}
                                                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                                    className="rounded-xl border-slate-200"
                                                />
                                            </div>
                                            <div>
                                                <textarea
                                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                                                    rows={2}
                                                    placeholder="Descripción (opcional)"
                                                    value={taskFormData.description}
                                                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Prioridad</label>
                                                    <select
                                                        className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                        value={taskFormData.priority}
                                                        onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                                                    >
                                                        <option value="low">🟢 Baja</option>
                                                        <option value="medium">🟡 Media</option>
                                                        <option value="high">🔴 Alta</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Fecha límite</label>
                                                    <Input
                                                        type="date"
                                                        value={taskFormData.due_date}
                                                        onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                                                        className="text-sm rounded-xl border-slate-200"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Estado</label>
                                                <select
                                                    className="w-full p-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                    value={taskFormData.status}
                                                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                                                >
                                                    <option value="pending">⏳ Pendiente</option>
                                                    <option value="in_progress">⚡ En progreso</option>
                                                    <option value="completed">✅ Completada</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={editingTask ? updateTask : addTask}
                                                    disabled={!taskFormData.title.trim()}
                                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800"
                                                >
                                                    <Save className="h-4 w-4 mr-1" />
                                                    {editingTask ? 'Actualizar' : 'Crear'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowTaskForm(false);
                                                        setEditingTask(null);
                                                    }}
                                                    className="rounded-xl border-slate-200 hover:bg-slate-50"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resumen de tareas por prioridad */}
                                    {tasks.length > 0 && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-100">
                                            <div className="text-sm font-semibold text-slate-700 mb-3">📊 Resumen por prioridad:</div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                                                    <div className="text-lg font-bold text-red-700">
                                                        {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}
                                                    </div>
                                                    <div className="text-xs text-red-600 font-semibold">🔴 Alta</div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                                                    <div className="text-lg font-bold text-amber-700">
                                                        {tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length}
                                                    </div>
                                                    <div className="text-xs text-amber-600 font-semibold">🟡 Media</div>
                                                </div>
                                                <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                                                    <div className="text-lg font-bold text-emerald-700">
                                                        {tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length}
                                                    </div>
                                                    <div className="text-xs text-emerald-600 font-semibold">🟢 Baja</div>
                                                </div>
                                            </div>
                                            {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length > 0 && (
                                                <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
                                                    <div className="text-sm text-red-700 font-semibold">
                                                        ⚠️ {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length} tarea(s) vencida(s)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Lista de tareas */}
                                    {tasks.length > 0 ? (
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {getSortedTasks().map((task) => (
                                                <div key={task.id} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-all duration-200">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <button
                                                                onClick={() => toggleTaskStatus(task)}
                                                                className="flex-shrink-0 mt-0.5 transition-colors"
                                                            >
                                                                {task.status === 'completed' ? (
                                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                                ) : task.status === 'in_progress' ? (
                                                                    <Clock className="h-5 w-5 text-amber-600" />
                                                                ) : (
                                                                    <div className="h-5 w-5 border-2 border-slate-300 rounded-full hover:border-slate-400 transition-colors" />
                                                                )}
                                                            </button>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className={`font-semibold text-sm truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                                                        {task.title}
                                                                    </p>
                                                                    {task.priority && (
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                                                'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                            }`}>
                                                                            {task.priority === 'high' ? '🔴' :
                                                                                task.priority === 'medium' ? '🟡' : '🟢'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {task.description && (
                                                                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                                                                )}
                                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full font-semibold ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                        task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                                                            'bg-slate-100 text-slate-700'
                                                                        }`}>
                                                                        {task.status === 'completed' ? '✅' :
                                                                            task.status === 'in_progress' ? '⚡' : '⏳'}
                                                                    </span>
                                                                    {task.due_date && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            <span className={`${new Date(task.due_date) < new Date() && task.status !== 'completed'
                                                                                ? 'text-red-600 font-semibold'
                                                                                : 'text-slate-500'
                                                                                }`}>
                                                                                {new Date(task.due_date).toLocaleDateString('es-ES', {
                                                                                    day: 'numeric',
                                                                                    month: 'short'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <button
                                                                onClick={() => startEditingTask(task)}
                                                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                                            >
                                                                <Edit className="h-4 w-4 text-blue-600" />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const confirmed = await showToast.confirm('¿Estás seguro de que quieres eliminar esta tarea?');
                                                                    if (confirmed) {
                                                                        deleteTask(task.id);
                                                                    }
                                                                }}
                                                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                                <CheckCircle className="h-8 w-8 text-purple-600" />
                                            </div>
                                            <h3 className="font-semibold text-slate-900 mb-1">No hay tareas</h3>
                                            <p className="text-slate-500 text-sm mb-3">
                                                Crea tu primera tarea para organizar el proyecto
                                            </p>
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setEditingTask(null);
                                                    setTaskFormData({
                                                        title: '',
                                                        description: '',
                                                        status: 'pending',
                                                        priority: 'medium',
                                                        due_date: ''
                                                    });
                                                    setShowTaskForm(true);
                                                }}
                                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Primera Tarea
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Información del cliente */}
                            <Card className="rounded-2xl shadow-sm border-slate-100">
                                <CardHeader className="bg-gradient-to-r from-amber-50 to-slate-50 rounded-t-2xl">
                                    <CardTitle className="flex items-center gap-2 text-slate-900">
                                        <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                        Cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {isEditing ? (
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Cliente</label>
                                            <select
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                                value={formData.client_id}
                                                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                            >
                                                <option value="">Sin cliente</option>
                                                {clients.map((client) => (
                                                    <option key={client.id} value={client.id}>
                                                        {client.name} {client.company ? `- ${client.company}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : project.client ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                    {project.client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{project.client.name}</h3>
                                                    {project.client.company && (
                                                        <p className="text-sm text-slate-600">{project.client.company}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {project.client.email && (
                                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <Mail className="h-4 w-4 text-slate-500" />
                                                        <span className="text-sm font-medium text-slate-900">{project.client.email}</span>
                                                    </div>
                                                )}
                                                {project.client.phone && (
                                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                        <Phone className="h-4 w-4 text-slate-500" />
                                                        <span className="text-sm font-medium text-slate-900">{project.client.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <User className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 text-sm">Sin cliente asignado</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Metadatos */}
                            <Card className="rounded-2xl shadow-sm border-slate-100">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
                                    <CardTitle className="flex items-center gap-2 text-slate-900">
                                        <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                                            <Clock className="h-4 w-4 text-white" />
                                        </div>
                                        Metadatos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-sm text-slate-600 font-semibold block mb-1">Creado:</span>
                                            <p className="text-sm font-medium text-slate-900">
                                                {new Date(project.created_at).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {project.updated_at && (
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="text-sm text-slate-600 font-semibold block mb-1">Última modificación:</span>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {new Date(project.updated_at).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="text-sm text-slate-600 font-semibold block mb-1">ID del proyecto:</span>
                                            <p className="font-mono text-xs text-slate-700 break-all">{project.id}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}   
