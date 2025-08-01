'use client';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Plus,
    Save,
    Trash2,
    User,
    X,
    AlertCircle,
    Zap,
    Circle
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
                // Si no se encuentra el proyecto, redirigir
                if (error.code === 'PGRST116') {
                    router.push('/dashboard/projects');
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
                alert('Error al actualizar el proyecto');
            } else {
                setIsEditing(false);
                fetchProject(); // Recargar datos
                alert('Proyecto actualizado exitosamente');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el proyecto');
        }
    };

    // Función para añadir tarea
    const addTask = async () => {
        try {
            if (!project || !taskFormData.title.trim()) return;

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
                alert('Error al crear la tarea');
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
            alert('Error al crear la tarea');
        }
    };

    // Función para actualizar tarea
    const updateTask = async () => {
        try {
            if (!editingTask || !taskFormData.title.trim()) return;

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
                alert('Error al actualizar la tarea');
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
            alert('Error al actualizar la tarea');
        }
    };

    // Función para eliminar tarea
    const deleteTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) {
                console.error('Error deleting task:', error);
                alert('Error al eliminar la tarea');
            } else {
                fetchProject(); // Recargar datos para actualizar progreso
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la tarea');
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
                        await supabase.auth.signOut();
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
                        await supabase.auth.signOut();
                        router.push('/login');
                    }} />
                </div>
                <div className="flex-1 overflow-auto p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Proyecto no encontrado
                            </h2>
                            <p className="text-gray-600 mb-4">
                                El proyecto que buscas no existe o no tienes permisos para verlo.
                            </p>
                            <Button onClick={() => router.push('/dashboard/projects')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a Proyectos
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            <div className="w-64 flex-shrink-0 bg-white shadow h-full">
                <Sidebar userEmail={currentUserEmail} onLogout={async () => {
                    await supabase.auth.signOut();
                    router.push('/login');
                }} />
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            onClick={() => router.push('/dashboard/projects')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                            <p className="text-gray-600 mt-1">Detalles del proyecto</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusBadge(project.status)}
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        ) : (
                            <div className="flex space-x-2">
                                <Button onClick={updateProject}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Restaurar datos originales
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
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Información principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Detalles básicos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Proyecto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Nombre del Proyecto</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Nombre del proyecto"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Descripción</label>
                                            <textarea
                                                className="w-full p-3 border rounded-md"
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Descripción del proyecto"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Estado</label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="active">Activo</option>
                                                <option value="paused">Pausado</option>
                                                <option value="completed">Completado</option>
                                                <option value="cancelled">Cancelado</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
                                            <p className="text-gray-600">
                                                {project.description || 'Sin descripción disponible'}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 mb-2">Estado y Progreso</h3>
                                            <div className="space-y-3">
                                                {getStatusBadge(project.status)}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Progreso del proyecto</span>
                                                        <span className="font-medium">{getProjectProgress()}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${getProjectProgress()}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                {tasks.length > 0 && (
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div className="text-center p-2 bg-gray-50 rounded">
                                                            <div className="font-medium text-gray-900">{tasks.filter(t => t.status === 'completed').length}</div>
                                                            <div className="text-xs text-gray-500">Completadas</div>
                                                        </div>
                                                        <div className="text-center p-2 bg-yellow-50 rounded">
                                                            <div className="font-medium text-gray-900">{tasks.filter(t => t.status === 'in_progress').length}</div>
                                                            <div className="text-xs text-gray-500">En progreso</div>
                                                        </div>
                                                        <div className="text-center p-2 bg-red-50 rounded">
                                                            <div className="font-medium text-gray-900">{tasks.filter(t => t.status === 'pending').length}</div>
                                                            <div className="text-xs text-gray-500">Pendientes</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {tasks.length === 0 && (
                                                    <p className="text-xs text-gray-500 italic">
                                                        Sin tareas asignadas. El progreso se basa en el estado del proyecto.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Fechas y presupuesto */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cronograma y Presupuesto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Presupuesto</label>
                                            <Input
                                                type="number"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div></div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Fecha de Inicio</label>
                                            <Input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Fecha de Fin</label>
                                            <Input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="flex items-center space-x-3">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Presupuesto</p>
                                                <p className="font-medium">
                                                    {project.budget ? `$${project.budget.toLocaleString()}` : 'No definido'}
                                                </p>
                                            </div>
                                        </div>
                                        <div></div>
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Fecha de Inicio</p>
                                                <p className="font-medium">
                                                    {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'No definida'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-5 w-5 text-red-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Fecha de Fin</p>
                                                <p className="font-medium">
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Tareas
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">
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
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Formulario de tarea */}
                                {showTaskForm && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">
                                                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                                            </label>
                                            <Input
                                                placeholder="Nombre de la tarea"
                                                value={taskFormData.title}
                                                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <textarea
                                                className="w-full p-2 border rounded text-sm"
                                                rows={2}
                                                placeholder="Descripción (opcional)"
                                                value={taskFormData.description}
                                                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium mb-1 block text-gray-600">Prioridad</label>
                                                <select
                                                    className="w-full p-2 border rounded text-sm"
                                                    value={taskFormData.priority}
                                                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                                                >
                                                    <option value="low">🟢 Baja</option>
                                                    <option value="medium">🟡 Media</option>
                                                    <option value="high">🔴 Alta</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium mb-1 block text-gray-600">Fecha límite</label>
                                                <Input
                                                    type="date"
                                                    value={taskFormData.due_date}
                                                    onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1 block text-gray-600">Estado</label>
                                            <select
                                                className="w-full p-2 border rounded text-sm"
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
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Resumen de tareas por prioridad */}
                                {tasks.length > 0 && (
                                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="text-xs font-medium text-gray-600 mb-2">Resumen por prioridad:</div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="text-center">
                                                <div className="text-red-600 font-bold">
                                                    {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}
                                                </div>
                                                <div className="text-gray-500">🔴 Alta</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-yellow-600 font-bold">
                                                    {tasks.filter(t => t.priority === 'medium' && t.status !== 'completed').length}
                                                </div>
                                                <div className="text-gray-500">🟡 Media</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-green-600 font-bold">
                                                    {tasks.filter(t => t.priority === 'low' && t.status !== 'completed').length}
                                                </div>
                                                <div className="text-gray-500">🟢 Baja</div>
                                            </div>
                                        </div>
                                        {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length > 0 && (
                                            <div className="mt-2 text-xs text-red-600 font-medium">
                                                ⚠️ {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length} tarea(s) vencida(s)
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Lista de tareas */}
                                {tasks.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {getSortedTasks().map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded text-sm hover:bg-gray-100 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => toggleTaskStatus(task)}
                                                            className="flex-shrink-0"
                                                        >
                                                            {task.status === 'completed' ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            ) : task.status === 'in_progress' ? (
                                                                <Clock className="h-4 w-4 text-yellow-600" />
                                                            ) : (
                                                                <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                                                            )}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2">
                                                                <p className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                                                    {task.title}
                                                                </p>
                                                                {/* Indicador de prioridad */}
                                                                {task.priority && (
                                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'
                                                                    }`}>
                                                                        {task.priority === 'high' ? '🔴' :
                                                                         task.priority === 'medium' ? '🟡' : '🟢'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                {task.description && (
                                                                    <p className="text-xs text-gray-500 truncate">{task.description}</p>
                                                                )}
                                                                {task.due_date && (
                                                                    <div className="flex items-center space-x-1">
                                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                                        <span className={`text-xs ${
                                                                            new Date(task.due_date) < new Date() && task.status !== 'completed'
                                                                                ? 'text-red-600 font-medium'
                                                                                : 'text-gray-500'
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
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {task.status === 'completed' ? '✅' :
                                                         task.status === 'in_progress' ? '⚡' : '⏳'}
                                                    </span>
                                                    <button
                                                        onClick={() => startEditingTask(task)}
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        <Edit className="h-3 w-3 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                                                                deleteTask(task.id);
                                                            }
                                                        }}
                                                        className="p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">No hay tareas asignadas</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Crea tu primera tarea haciendo clic en el botón +
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Información del cliente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Cliente</label>
                                        <select
                                            className="w-full p-2 border rounded-md"
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
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-gray-900">{project.client.name}</h3>
                                        {project.client.company && (
                                            <p className="text-sm text-gray-600">{project.client.company}</p>
                                        )}
                                        {project.client.email && (
                                            <p className="text-sm text-gray-600">{project.client.email}</p>
                                        )}
                                        {project.client.phone && (
                                            <p className="text-sm text-gray-600">{project.client.phone}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Sin cliente asignado</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Metadatos */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadatos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Creado:</span>
                                        <p className="font-medium">
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
                                        <div>
                                            <span className="text-gray-500">Última modificación:</span>
                                            <p className="font-medium">
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
                                    <div>
                                        <span className="text-gray-500">ID del proyecto:</span>
                                        <p className="font-mono text-xs">{project.id}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
