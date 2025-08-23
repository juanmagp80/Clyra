'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import {
    Briefcase,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    Eye,
    Filter,
    Grid3x3,
    List,
    Pause,
    Plus,
    Search,
    Trash2,
    User,
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
export default function ProjectsPageBonsai({ userEmail }: ProjectsPageClientProps) {
    // Hook de trial status
    const { trialInfo, loading: trialLoading, hasReachedLimit, canUseFeatures } = useTrialStatus(userEmail);

    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
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
    const [editFormData, setEditFormData] = useState({
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

    const handleLogout = async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
            router.push('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

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
            console.error('Error fetching clients:', error);
        }
    };

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
                return;
            }

            setProjects(projectsData || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchProjects();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef?.focus();
            }
            if (event.key === 'Escape') {
                setSearchTerm('');
                searchInputRef?.blur();
                setShowForm(false);
                setShowEditForm(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [searchInputRef]);

    const handleNewProjectClick = () => {
        if (trialLoading) return;
        
        if (!canUseFeatures) {
            alert('❌ Tu trial ha expirado. Actualiza tu suscripción para continuar creando proyectos.');
            return;
        }

        if (hasReachedLimit('projects')) {
            alert(`❌ Has alcanzado el límite de proyectos de tu plan (${trialInfo?.limits.maxProjects}). Actualiza tu suscripción para crear más proyectos.`);
            return;
        }

        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (!supabase) return;

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const projectData = {
                name: formData.name,
                description: formData.description || null,
                client_id: formData.client_id || null,
                user_id: user.id,
                status: formData.status,
                budget: formData.budget ? parseFloat(formData.budget) : null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null
            };

            const { error } = await supabase
                .from('projects')
                .insert([projectData]);

            if (error) {
                console.error('Error creating project:', error);
                alert('Error al crear el proyecto');
                return;
            }

            // Reset form
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
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear el proyecto');
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setEditFormData({
            name: project.name,
            description: project.description || '',
            client_id: project.client_id || '',
            budget: project.budget?.toString() || '',
            start_date: project.start_date || '',
            end_date: project.end_date || '',
            status: project.status
        });
        setShowEditForm(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingProject) return;

        try {
            if (!supabase) return;

            const projectData = {
                name: editFormData.name,
                description: editFormData.description || null,
                client_id: editFormData.client_id || null,
                status: editFormData.status,
                budget: editFormData.budget ? parseFloat(editFormData.budget) : null,
                start_date: editFormData.start_date || null,
                end_date: editFormData.end_date || null
            };

            const { error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', editingProject.id);

            if (error) {
                console.error('Error updating project:', error);
                alert('Error al actualizar el proyecto');
                return;
            }

            setShowEditForm(false);
            setEditingProject(null);
            fetchProjects();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el proyecto');
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
            return;
        }

        try {
            if (!supabase) return;

            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) {
                console.error('Error deleting project:', error);
                alert('Error al eliminar el proyecto');
                return;
            }

            fetchProjects();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el proyecto');
        }
    };

    // Filtrar proyectos
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    // Obtener estadísticas
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        paused: projects.filter(p => p.status === 'paused').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0)
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'completed': return 'Completado';
            case 'paused': return 'Pausado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Briefcase className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'paused': return <Pause className="w-4 h-4" />;
            case 'cancelled': return <X className="w-4 h-4" />;
            default: return <Briefcase className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="ml-56 min-h-screen">
                <TrialBanner userEmail={userEmail} />

                {/* Header estilo Bonsai */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Proyectos</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Gestiona tus proyectos y su progreso
                                </p>
                            </div>
                            <button
                                onClick={handleNewProjectClick}
                                disabled={trialLoading || (!canUseFeatures || hasReachedLimit('projects'))}
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                                    trialLoading
                                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-wait'
                                        : (!canUseFeatures || hasReachedLimit('projects'))
                                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700'
                                    }`}
                            >
                                {trialLoading ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        Cargando...
                                    </>
                                ) : (!canUseFeatures || hasReachedLimit('projects')) ? (
                                    <>
                                        <X className="w-4 h-4 mr-2" />
                                        Trial Expirado
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Nuevo Proyecto
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white border-b border-gray-200 px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Briefcase className="h-8 w-8 text-gray-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                                        <Briefcase className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Activos</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completados</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                                        <Pause className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pausados</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stats.paused}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                        <DollarSign className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Presupuesto</p>
                                    <p className="text-2xl font-semibold text-gray-900">€{stats.totalBudget.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Nueva card de tiempo tracking */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-blue-700">Time Tracking</p>
                                    <p className="text-xs text-blue-600">Haz clic en un proyecto para gestionar tiempo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Controls */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    ref={setSearchInputRef}
                                    type="text"
                                    placeholder="Buscar proyectos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filter */}
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="active">Activos</option>
                                    <option value="completed">Completados</option>
                                    <option value="paused">Pausados</option>
                                    <option value="cancelled">Cancelados</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-sm text-gray-600">Cargando proyectos...</p>
                                </div>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-12">
                                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-sm font-medium text-gray-900 mb-2">
                                    {searchTerm || filterStatus !== 'all'
                                        ? 'No hay proyectos que coincidan'
                                        : 'No hay proyectos'
                                    }
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    {searchTerm || filterStatus !== 'all'
                                        ? `No hay proyectos que coincidan con "${searchTerm}" y filtros actuales`
                                        : 'Comienza creando tu primer proyecto.'
                                    }
                                </p>
                                {(!searchTerm && filterStatus === 'all') && (
                                    <button
                                        onClick={handleNewProjectClick}
                                        disabled={trialLoading || (!canUseFeatures || hasReachedLimit('projects'))}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                            trialLoading
                                                ? 'bg-gray-400 cursor-wait'
                                                : (!canUseFeatures || hasReachedLimit('projects'))
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                            }`}
                                    >
                                        {trialLoading ? (
                                            <>
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Cargando...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Nuevo Proyecto
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'list' ? (
                            /* Vista Lista */
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Proyecto
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cliente
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Presupuesto
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fechas
                                            </th>
                                            <th className="relative px-6 py-3">
                                                <span className="sr-only">Acciones</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {project.name}
                                                        </div>
                                                        {project.description && (
                                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                {project.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {project.client?.name || 'Sin cliente'}
                                                    </div>
                                                    {project.client?.company && (
                                                        <div className="text-sm text-gray-500">
                                                            {project.client.company}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                        {getStatusIcon(project.status)}
                                                        <span className="ml-1">{getStatusText(project.status)}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {project.budget ? `€${project.budget.toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {project.start_date ? (
                                                        <div>
                                                            <div>Inicio: {new Date(project.start_date).toLocaleDateString('es-ES')}</div>
                                                            {project.end_date && (
                                                                <div>Fin: {new Date(project.end_date).toLocaleDateString('es-ES')}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={`/dashboard/projects/${project.id}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleEdit(project)}
                                                            className="text-gray-600 hover:text-gray-900"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(project.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Vista Grid */
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProjects.map((project) => (
                                    <div key={project.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {project.name}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                    {getStatusIcon(project.status)}
                                                    <span className="ml-1">{getStatusText(project.status)}</span>
                                                </span>
                                            </div>
                                            
                                            {project.description && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {project.description}
                                                </p>
                                            )}
                                            
                                            <div className="space-y-2 mb-4">
                                                {project.client && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <User className="h-4 w-4 mr-2" />
                                                        {project.client.name}
                                                    </div>
                                                )}
                                                
                                                {project.budget && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <DollarSign className="h-4 w-4 mr-2" />
                                                        €{project.budget.toLocaleString()}
                                                    </div>
                                                )}
                                                
                                                {project.start_date && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar className="h-4 w-4 mr-2" />
                                                        {new Date(project.start_date).toLocaleDateString('es-ES')}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        href={`/dashboard/projects/${project.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEdit(project)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(project.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(project.created_at).toLocaleDateString('es-ES')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Nuevo Proyecto */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Nuevo Proyecto
                                </h3>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cliente
                                </label>
                                <select
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Sin cliente asignado</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} {client.company && `(${client.company})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Activo</option>
                                    <option value="paused">Pausado</option>
                                    <option value="completed">Completado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Presupuesto (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Fin
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Crear Proyecto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Proyecto */}
            {showEditForm && editingProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Editar Proyecto
                                </h3>
                                <button
                                    onClick={() => setShowEditForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cliente
                                </label>
                                <select
                                    value={editFormData.client_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, client_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Sin cliente asignado</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} {client.company && `(${client.company})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Activo</option>
                                    <option value="paused">Pausado</option>
                                    <option value="completed">Completado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Presupuesto (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editFormData.budget}
                                    onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Inicio
                                    </label>
                                    <input
                                        type="date"
                                        value={editFormData.start_date}
                                        onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Fin
                                    </label>
                                    <input
                                        type="date"
                                        value={editFormData.end_date}
                                        onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditForm(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
