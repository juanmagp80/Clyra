'use client';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase';
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
    const [filterClient, setFilterClient] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
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
            if (!editingProject) return;

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

    const filteredProjects = projects.filter(project => {
        // Filtro por término de búsqueda
        const matchesSearch = searchTerm === '' ||
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client?.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro por estado
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

        // Filtro por cliente
        const matchesClient = filterClient === 'all' || project.client_id === filterClient;

        return matchesSearch && matchesStatus && matchesClient;
    }).sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            case 'budget':
                aValue = a.budget || 0;
                bValue = b.budget || 0;
                break;
            case 'start_date':
                aValue = a.start_date || '0000-00-00';
                bValue = b.start_date || '0000-00-00';
                break;
            default: // created_at
                aValue = a.created_at;
                bValue = b.created_at;
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Funciones para obtener estilos de estado
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'paused': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Clock className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'paused': return <Pause className="w-4 h-4" />;
            case 'cancelled': return <X className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    // Stats
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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <Sidebar userEmail={userEmail} onLogout={async () => {
                await supabase.auth.signOut();
                router.push('/login');
            }} />

            <main className="flex-1 ml-64 overflow-auto">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Proyectos
                                </h1>
                                <p className="text-slate-600 mt-1 font-medium">
                                    Gestiona tus proyectos y su progreso
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowForm(true)}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/25"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Proyecto
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Total Proyectos</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">{totalProjects}</p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Activos</p>
                                        <p className="text-2xl font-bold text-emerald-700 mt-1">{activeProjects}</p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Completados</p>
                                        <p className="text-2xl font-bold text-blue-700 mt-1">{completedProjects}</p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Valor Total</p>
                                        <p className="text-2xl font-bold text-amber-700 mt-1">${totalBudget.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                                        <DollarSign className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Barra de filtros */}
                    <Card className="rounded-2xl shadow-sm border-slate-100">
                        <CardContent className="p-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        <Search className="h-4 w-4 inline mr-1" />
                                        Buscar
                                    </label>
                                    <Input
                                        placeholder="Buscar proyectos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                        <Filter className="h-4 w-4 inline mr-1" />
                                        Estado
                                    </label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="active">Activo</option>
                                        <option value="paused">Pausado</option>
                                        <option value="completed">Completado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Cliente</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={filterClient}
                                        onChange={(e) => setFilterClient(e.target.value)}
                                    >
                                        <option value="all">Todos</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Ordenar por</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="created_at">Fecha creación</option>
                                        <option value="name">Nombre</option>
                                        <option value="status">Estado</option>
                                        <option value="budget">Presupuesto</option>
                                        <option value="start_date">Fecha inicio</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Orden</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                    >
                                        <option value="desc">Descendente</option>
                                        <option value="asc">Ascendente</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Formulario nuevo proyecto */}
                    {showForm && (
                        <Card className="rounded-2xl shadow-sm border-slate-100">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-2xl">
                                <CardTitle className="text-slate-900">Nuevo Proyecto</CardTitle>
                                <CardDescription className="text-slate-600">Crea un nuevo proyecto para tu cliente</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre del Proyecto</label>
                                        <Input
                                            placeholder="Ej: Desarrollo web corporativo"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Cliente</label>
                                        <select
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Presupuesto</label>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Estado</label>
                                        <select
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Descripción</label>
                                        <textarea
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            rows={3}
                                            placeholder="Describe el proyecto..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={addProject}
                                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800"
                                    >
                                        Crear Proyecto
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-xl border-slate-200 hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Formulario editar proyecto */}
                    {showEditForm && (
                        <Card className="rounded-2xl shadow-sm border-slate-100">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-slate-50 rounded-t-2xl">
                                <CardTitle className="text-slate-900">Editar Proyecto</CardTitle>
                                <CardDescription className="text-slate-600">Modifica los datos del proyecto</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre del Proyecto</label>
                                        <Input
                                            placeholder="Ej: Desarrollo web corporativo"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Cliente</label>
                                        <select
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Presupuesto</label>
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Estado</label>
                                        <select
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Descripción</label>
                                        <textarea
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            rows={3}
                                            placeholder="Describe el proyecto..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={updateProject}
                                        className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800"
                                    >
                                        Actualizar Proyecto
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowEditForm(false);
                                            setEditingProject(null);
                                        }}
                                        className="rounded-xl border-slate-200 hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Contenido */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600 font-medium">Cargando proyectos...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        No tienes proyectos aún
                                    </h3>
                                    <p className="text-slate-600 mb-6">
                                        Crea tu primer proyecto para empezar
                                    </p>
                                    <Button
                                        onClick={() => setShowForm(true)}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear Proyecto
                                    </Button>
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        No se encontraron proyectos
                                    </h3>
                                    <p className="text-slate-600 mb-4">
                                        Intenta ajustar los filtros de búsqueda
                                    </p>
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <Card
                                        key={project.id}
                                        className="rounded-2xl shadow-sm border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                        onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                        {project.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg text-slate-900">{project.name}</CardTitle>
                                                        <CardDescription className="text-slate-600">
                                                            {project.client?.name || 'Sin cliente asignado'}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                                    {getStatusIcon(project.status)}
                                                    {project.status}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2 text-sm">
                                                {project.budget && (
                                                    <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                                        <span className="text-slate-600 flex items-center gap-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            Presupuesto:
                                                        </span>
                                                        <span className="font-semibold text-slate-900">${project.budget.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {project.start_date && (
                                                    <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                                        <span className="text-slate-600 flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Inicio:
                                                        </span>
                                                        <span className="font-semibold text-slate-900">{new Date(project.start_date).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                )}
                                                {project.end_date && (
                                                    <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                                        <span className="text-slate-600 flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Fin:
                                                        </span>
                                                        <span className="font-semibold text-slate-900">{new Date(project.end_date).toLocaleDateString('es-ES')}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                                    <span className="text-slate-600">Creado:</span>
                                                    <span className="font-semibold text-slate-900">{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/dashboard/projects/${project.id}`);
                                                    }}
                                                    className="flex-1 border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Ver
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(project);
                                                    }}
                                                    className="flex-1 border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600"
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
                                                            deleteProject(project.id);
                                                        }
                                                    }}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-slate-200"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
    );
}