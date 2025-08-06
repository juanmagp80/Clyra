'use client';
import Sidebar from '@/components/Sidebar';
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
import Link from 'next/link';
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
                return;
            }

            setClients(clientsData || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchProjects = async () => {
        try {
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
                    client:clients!inner(name, company)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
                return;
            }

            setProjects(projectsData || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async () => {
        try {
            if (!supabase || !formData.name || !formData.client_id) return;
            
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    name: formData.name,
                    description: formData.description,
                    client_id: formData.client_id,
                    user_id: user.id,
                    status: formData.status,
                    budget: formData.budget ? parseFloat(formData.budget) : null,
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null
                }])
                .select(`
                    *,
                    client:clients!inner(name, company)
                `);

            if (error) {
                console.error('Error creating project:', error);
                return;
            }

            if (data && data[0]) {
                setProjects(prev => [data[0], ...prev]);
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
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateProject = async () => {
        try {
            if (!supabase || !editingProject || !formData.name) return;

            const { data, error } = await supabase
                .from('projects')
                .update({
                    name: formData.name,
                    description: formData.description,
                    client_id: formData.client_id,
                    status: formData.status,
                    budget: formData.budget ? parseFloat(formData.budget) : null,
                    start_date: formData.start_date || null,
                    end_date: formData.end_date || null
                })
                .eq('id', editingProject.id)
                .select(`
                    *,
                    client:clients!inner(name, company)
                `);

            if (error) {
                console.error('Error updating project:', error);
                return;
            }

            if (data && data[0]) {
                setProjects(prev => prev.map(p => p.id === editingProject.id ? data[0] : p));
                setEditingProject(null);
                setShowEditForm(false);
                setFormData({
                    name: '',
                    description: '',
                    client_id: '',
                    budget: '',
                    start_date: '',
                    end_date: '',
                    status: 'active'
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteProject = async (id: string) => {
        try {
            if (!supabase) return;

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting project:', error);
                return;
            }

            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = async () => {
        try {
            if (!supabase) return;
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchClients();
    }, []);

    // Filtrar proyectos
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        paused: projects.filter(p => p.status === 'paused').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        activeBudget: projects.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.budget || 0), 0)
    };

    // Render
    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 ml-56 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/90 to-indigo-100/80 backdrop-blur-3xl">
                        <div className="container mx-auto px-6 py-8">
                            {/* Header Premium */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-indigo-500/10 p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
                                                Gestión de Proyectos
                                            </h1>
                                            <p className="text-slate-600 text-lg font-medium">
                                                Controla el progreso de todos tus proyectos desde un panel centralizado
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-xl rounded-xl px-4 py-3 shadow-lg border border-white/60">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-semibold text-slate-700">En vivo</span>
                                            </div>
                                            <button
                                                onClick={() => setShowForm(true)}
                                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-200 flex items-center gap-3"
                                            >
                                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                                                Nuevo Proyecto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Premium */}
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-blue-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Total Proyectos</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                                    {stats.total}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                                <Briefcase className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-green-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Activos</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                                    {stats.active}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-emerald-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Completados</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                                                    {stats.completed}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-indigo-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Presupuesto Total</p>
                                                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                                                    {formatCurrency(stats.totalBudget)}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                                                <DollarSign className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Filters Premium */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
                                                Proyectos ({filteredProjects.length})
                                            </h2>
                                            <p className="text-slate-600 font-medium">
                                                Gestiona todos tus proyectos activos y completados
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:flex-none">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar proyectos..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 w-full sm:w-64 px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                />
                                            </div>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                            >
                                                <option value="all">Todos</option>
                                                <option value="active">Activos</option>
                                                <option value="completed">Completados</option>
                                                <option value="paused">Pausados</option>
                                                <option value="cancelled">Cancelados</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulario Premium de nuevo proyecto */}
                            {showForm && (
                                <div className="mb-8">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-indigo-500/5">
                                        <div className="p-6 border-b border-white/30">
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                                Crear Nuevo Proyecto
                                            </h3>
                                            <p className="text-slate-600 font-medium mt-1">Completa la información del proyecto</p>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre del Proyecto *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre del proyecto"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Cliente *</label>
                                                    <select
                                                        value={formData.client_id}
                                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                                    >
                                                        <option value="">Seleccionar cliente</option>
                                                        {clients.map((client) => (
                                                            <option key={client.id} value={client.id}>
                                                                {client.name} {client.company && `(${client.company})`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Descripción</label>
                                                    <textarea
                                                        placeholder="Describe el proyecto..."
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        rows={3}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400 resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Presupuesto (€)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={formData.budget}
                                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Estado</label>
                                                    <select
                                                        value={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                                    >
                                                        <option value="active">Activo</option>
                                                        <option value="paused">Pausado</option>
                                                        <option value="completed">Completado</option>
                                                        <option value="cancelled">Cancelado</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Fecha de Inicio</label>
                                                    <input
                                                        type="date"
                                                        value={formData.start_date}
                                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Fecha de Fin</label>
                                                    <input
                                                        type="date"
                                                        value={formData.end_date}
                                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 mt-8 pt-6 border-t border-white/30">
                                                <button
                                                    onClick={createProject}
                                                    disabled={!formData.name || !formData.client_id}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    Crear Proyecto
                                                </button>
                                                <button
                                                    onClick={() => setShowForm(false)}
                                                    className="px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lista Premium de Proyectos */}
                            <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-6">
                                        Directorio de Proyectos
                                    </h2>
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <h3 className="text-lg font-bold text-slate-900">Cargando proyectos</h3>
                                                <p className="text-sm text-slate-600 font-medium">Obteniendo información...</p>
                                            </div>
                                        </div>
                                    ) : filteredProjects.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                <Briefcase className="w-10 h-10 text-slate-400" />
                                            </div>
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3">
                                                {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos todavía'}
                                            </h3>
                                            <p className="text-slate-600 max-w-sm mx-auto font-medium mb-6">
                                                {searchTerm ? 
                                                    `No hay proyectos que coincidan con "${searchTerm}"` : 
                                                    'Comienza creando tu primer proyecto para organizar tu trabajo'
                                                }
                                            </p>
                                            {searchTerm && (
                                                <button 
                                                    onClick={() => setSearchTerm('')} 
                                                    className="px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200"
                                                >
                                                    Limpiar búsqueda
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredProjects.map((project) => (
                                                <div
                                                    key={project.id}
                                                    className="bg-white/60 backdrop-blur-xl border border-white/70 rounded-xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                                                >
                                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="font-bold text-slate-900">
                                                                    {project.name || 'Sin nombre'}
                                                                </h3>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)} flex items-center gap-1`}>
                                                                    {getStatusIcon(project.status)}
                                                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600 mb-1">
                                                                <strong>Cliente:</strong> {project.client?.name || 'Sin cliente'}
                                                                {project.client?.company && ` (${project.client.company})`}
                                                            </p>
                                                            {project.description && (
                                                                <p className="text-slate-500 text-sm mb-3">
                                                                    {project.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                <span>Creado: {formatDate(project.created_at)}</span>
                                                                {project.budget && (
                                                                    <span className="font-semibold text-slate-700">
                                                                        {formatCurrency(project.budget)}
                                                                    </span>
                                                                )}
                                                                {project.start_date && (
                                                                    <span>Inicio: {formatDate(project.start_date)}</span>
                                                                )}
                                                                {project.end_date && (
                                                                    <span>Fin: {formatDate(project.end_date)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Link href={`/dashboard/projects/${project.id}`}>
                                                                <button className="px-4 py-2 text-sm bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 flex items-center gap-2">
                                                                    <Eye className="w-4 h-4" />
                                                                    Ver
                                                                </button>
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingProject(project);
                                                                    setFormData({
                                                                        name: project.name,
                                                                        description: project.description || '',
                                                                        client_id: project.client_id,
                                                                        budget: project.budget?.toString() || '',
                                                                        start_date: project.start_date || '',
                                                                        end_date: project.end_date || '',
                                                                        status: project.status
                                                                    });
                                                                    setShowEditForm(true);
                                                                }}
                                                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
                                                                        deleteProject(project.id);
                                                                    }
                                                                }}
                                                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
