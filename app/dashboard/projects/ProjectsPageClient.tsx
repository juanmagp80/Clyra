'use client';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Eye,
    Filter,
    Pause,
    Plus,
    Search,
    Trash2,
    TrendingUp,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    // Relación con cliente
    client?: {
        name: string;
        company?: string;
    };
};

// Interface para props
interface ProjectsPageClientProps {
    userEmail: string;
}

// Componente principal
export default function ProjectsPageClient({ userEmail }: ProjectsPageClientProps) {
    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client_id: '',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'active'
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseClient();
    const router = useRouter();

    const fetchClients = async () => {
        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            
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

    // Funciones CRUD
    const fetchProjects = async () => {
        try {
            setLoading(true);

            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: projectsData, error } = await supabase
                .from('projects')
                .select(`
                *,
                client:clients(name, company)
            `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
            } else {
                setProjects(projectsData || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProject = async () => {
        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase.from('projects').insert([
                {
                    name: formData.name,
                    description: formData.description || null,
                    client_id: formData.client_id || null,
                    budget: formData.budget ? parseFloat(formData.budget) : null,
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null,
                    status: formData.status,
                    user_id: user.id,
                },
            ]);

            if (error) {
                console.error('Error adding project:', error);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    client_id: '',
                    budget: '',
                    start_date: '',
                    end_date: '',
                    status: 'active'
                });
                setShowForm(false);
                fetchProjects();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateProject = async () => {
        try {
            if (!editingProject || !supabase) return;

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
                })
                .eq('id', editingProject.id);

            if (error) {
                console.error('Error updating project:', error);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    client_id: '',
                    budget: '',
                    start_date: '',
                    end_date: '',
                    status: 'active'
                });
                setShowEditForm(false);
                setEditingProject(null);
                fetchProjects();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const startEditing = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            client_id: project.client_id || '',
            budget: project.budget?.toString() || '',
            start_date: project.start_date || '',
            end_date: project.end_date || '',
            status: project.status
        });
        setShowEditForm(true);
        setShowForm(false);
    };
    const deleteProject = async (projectId: string) => {
        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) {
                console.error('Error deleting project:', error);
            } else {
                fetchProjects(); // Recargar la lista
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Stats calculations
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

    // useEffect para cargar datos
    useEffect(() => {
        fetchProjects();
        fetchClients();
    }, []);

    // Render
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
            {/* Subtle mesh background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5"></div>

            <div className="flex h-screen relative z-10">
                <Sidebar userEmail={userEmail} onLogout={async () => {
                    if (supabase) {
                        await supabase.auth.signOut();
                    }
                    router.push('/login');
                }} />

                <main className="flex-1 ml-56 overflow-auto">
                    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        Proyectos
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Gestiona tus proyectos y controla el progreso
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium text-gray-700">En vivo</span>
                                    </div>
                                    <Button
                                        onClick={() => setShowForm(true)}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg shadow-sm flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Nuevo Proyecto
                                    </Button>
                                </div>
                            </div>

                            {/* Stats Cards - Silicon Valley Style */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {/* Total Projects */}
                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                                            <Briefcase className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                                        <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
                                        <div className="flex items-center text-sm">
                                            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                                            <span className="text-emerald-600 font-medium">En gestión</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Projects */}
                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-200">
                                            <Clock className="w-5 h-5 text-emerald-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
                                        <p className="text-3xl font-bold text-gray-900">{activeProjects}</p>
                                        <div className="flex items-center text-sm">
                                            <div className="w-4 h-4 bg-emerald-500 rounded-full mr-1 animate-pulse"></div>
                                            <span className="text-emerald-600 font-medium">En progreso</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Completed Projects */}
                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-200">
                                            <CheckCircle className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Completados</p>
                                        <p className="text-3xl font-bold text-gray-900">{completedProjects}</p>
                                        <div className="flex items-center text-sm">
                                            <CheckCircle className="w-4 h-4 text-purple-500 mr-1" />
                                            <span className="text-gray-600">Finalizados</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Budget */}
                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-200">
                                            <DollarSign className="w-5 h-5 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                        <p className="text-3xl font-bold text-gray-900">€{totalBudget.toLocaleString()}</p>
                                        <div className="flex items-center text-sm">
                                            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                                            <span className="text-gray-600">En proyectos</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                {/* Formulario nuevo proyecto */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Nuevo Proyecto</CardTitle>
                            <CardDescription>Crea un nuevo proyecto para tu cliente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Nombre del Proyecto</label>
                                    <Input
                                        placeholder="Ej: Desarrollo web corporativo"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Cliente</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    >
                                        <option value="">Selecciona un cliente</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.company ? `- ${client.company}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Presupuesto</label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Estado</label>
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
                                <div>
                                    <label className="text-sm font-medium">Fecha de Inicio</label>
                                    <Input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Fecha de Fin</label>
                                    <Input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">Descripción</label>
                                    <textarea
                                        className="w-full p-2 border rounded-md"
                                        rows={3}
                                        placeholder="Describe el proyecto..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={addProject}>
                                    Crear Proyecto
                                </Button>
                                <Button variant="outline" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Formulario editar proyecto */}
                {showEditForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Editar Proyecto</CardTitle>
                            <CardDescription>Modifica los datos del proyecto</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Nombre del Proyecto</label>
                                    <Input
                                        placeholder="Ej: Desarrollo web corporativo"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Cliente</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    >
                                        <option value="">Selecciona un cliente</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.company ? `- ${client.company}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Presupuesto</label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Estado</label>
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
                                <div>
                                    <label className="text-sm font-medium">Fecha de Inicio</label>
                                    <Input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Fecha de Fin</label>
                                    <Input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">Descripción</label>
                                    <textarea
                                        className="w-full p-2 border rounded-md"
                                        rows={3}
                                        placeholder="Describe el proyecto..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={updateProject}>
                                    Actualizar Proyecto
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setShowEditForm(false);
                                    setEditingProject(null);
                                }}>
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contenido */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Cargando proyectos...</div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No tienes proyectos aún
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Crea tu primer proyecto para empezar
                                </p>
                                <Button onClick={() => setShowForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Proyecto
                                </Button>
                            </div>
                        ) : (
                            projects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{project.name}</CardTitle>
                                        <CardDescription>
                                            {project.client?.name || 'Sin cliente asignado'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Estado:</span>
                                                <span className="capitalize font-medium">{project.status}</span>
                                            </div>
                                            {project.budget && (
                                                <div className="flex justify-between">
                                                    <span>Presupuesto:</span>
                                                    <span>€{project.budget}</span>
                                                </div>
                                            )}
                                            {project.start_date && (
                                                <div className="flex justify-between">
                                                    <span>Inicio:</span>
                                                    <span>{new Date(project.start_date).toLocaleDateString('es-ES')}</span>
                                                </div>
                                            )}
                                            {project.end_date && (
                                                <div className="flex justify-between">
                                                    <span>Fin:</span>
                                                    <span>{new Date(project.end_date).toLocaleDateString('es-ES')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Creado:</span>
                                                <span>{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => startEditing(project)}
                                            >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
                                                        deleteProject(project.id);
                                                    }
                                                }}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Eliminar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
                    </div>
                </main>
            </div>
        </div>
    );
}
