'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import TemplateForm from '@/components/templates/TemplateForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Plus,
    Search,
    Filter,
    Code,
    Palette,
    TrendingUp,
    MessageSquare,
    Users,
    Clock,
    DollarSign,
    Copy,
    Edit3,
    Trash2,
    Eye,
    Star,
    Bookmark,
    Grid3X3,
    List,
    ChevronDown,
    Zap,
    BookTemplate,
    X,
    Calendar,
    Save
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    template_data: {
        phases: Array<{
            name: string;
            duration: string;
            tasks: string[];
        }>;
        deliverables: string[];
        milestones: string[];
        pricing?: {
            base_price?: number;
            hourly_rate?: number;
            estimated_hours?: number;
            packages?: string[];
        };
    };
    is_public: boolean;
    usage_count: number;
    created_at: string;
}

interface TemplatesPageClientProps {
    userEmail: string;
}

export default function TemplatesPageClient({ userEmail }: TemplatesPageClientProps) {
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
    // Estados para editar template
    const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
    const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
    
    // Estados para el modal de crear proyecto
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [projectForm, setProjectForm] = useState({
        name: '',
        description: '',
        client_id: '',
        budget: '',
        start_date: '',
        end_date: ''
    });

    // Estados para el modal de crear/editar template
    const [templateForm, setTemplateForm] = useState({
        name: '',
        category: 'web_development',
        description: '',
        template_data: {}
    });
    
    const router = useRouter();
    const supabase = createSupabaseClient();

    const categories = [
        { id: 'all', name: 'Todos', icon: Grid3X3, color: 'text-slate-600' },
        { id: 'web_development', name: 'Desarrollo Web', icon: Code, color: 'text-blue-600' },
        { id: 'design', name: 'Diseño', icon: Palette, color: 'text-purple-600' },
        { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: 'text-green-600' },
        { id: 'consulting', name: 'Consultoría', icon: MessageSquare, color: 'text-amber-600' },
        { id: 'writing', name: 'Redacción', icon: Edit3, color: 'text-indigo-600' }
    ];

    const handleLogout = async () => {
        try {
            if (!supabase) return;
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const loadTemplates = async () => {
        try {
            setLoading(true);
            
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar templates públicos y del usuario
            const { data, error } = await supabase
                .from('project_templates')
                .select('*')
                .or(`user_id.eq.${user.id},is_public.eq.true`)
                .order('usage_count', { ascending: false });

            if (error) {
                console.error('Error loading templates:', error);
                return;
            }

            setTemplates(data || []);
            setFilteredTemplates(data || []);
            
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTemplates = () => {
        let filtered = templates;

        // Filtrar por búsqueda
        if (searchQuery) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por categoría
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(template => template.category === selectedCategory);
        }

        setFilteredTemplates(filtered);
    };

    const loadClients = async () => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('clients')
                .select('id, name, company, email')
                .eq('user_id', user.id)
                .order('name');

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const useTemplate = (template: ProjectTemplate) => {
        setSelectedTemplate(template);
        setProjectForm({
            name: `Proyecto desde ${template.name}`,
            description: template.description || '',
            client_id: '',
            budget: '',
            start_date: '',
            end_date: ''
        });
        loadClients();
        setShowProjectModal(true);
    };

    const createProjectFromTemplate = async () => {
        try {
            if (!supabase || !selectedTemplate) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Crear proyecto con los datos del formulario
            const projectData = {
                user_id: user.id,
                name: projectForm.name,
                description: projectForm.description,
                client_id: projectForm.client_id || null,
                budget: projectForm.budget ? parseFloat(projectForm.budget) : null,
                start_date: projectForm.start_date || null,
                end_date: projectForm.end_date || null,
                status: 'Activo'
            };

            const { data: newProject, error: projectError } = await supabase
                .from('projects')
                .insert([projectData])
                .select()
                .single();

            if (projectError) {
                console.error('Error creating project:', projectError);
                alert('Error al crear el proyecto. Por favor, inténtalo de nuevo.');
                return;
            }

            // Incrementar contador de uso del template
            const { error: updateError } = await supabase
                .from('project_templates')
                .update({ usage_count: selectedTemplate.usage_count + 1 })
                .eq('id', selectedTemplate.id);

            if (updateError) {
                console.error('Error updating usage count:', updateError);
            }

            // Cerrar modal y redirigir
            setShowProjectModal(false);
            setSelectedTemplate(null);
            router.push('/dashboard/projects');
            
        } catch (error) {
            console.error('Error creating project from template:', error);
            alert('Error al crear el proyecto. Por favor, inténtalo de nuevo.');
        }
    };

    const createNewTemplate = async () => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const templateData = {
                user_id: user.id,
                name: templateForm.name,
                category: templateForm.category,
                description: templateForm.description,
                template_data: templateForm.template_data,
                is_public: false,
                usage_count: 0
            };

            const { data, error } = await supabase
                .from('project_templates')
                .insert([templateData])
                .select()
                .single();

            if (error) {
                console.error('Error creating template:', error);
                alert('Error al crear el template. Por favor, inténtalo de nuevo.');
                return;
            }

            // Actualizar la lista de templates
            setTemplates(prev => [data, ...prev]);
            setFilteredTemplates(prev => [data, ...prev]);

            // Cerrar modal y resetear formulario
            setShowNewTemplateModal(false);
            setTemplateForm({
                name: '',
                category: 'web_development',
                description: '',
                template_data: {}
            });

            alert('Template creado exitosamente!');

        } catch (error) {
            console.error('Error creating template:', error);
            alert('Error al crear el template. Por favor, inténtalo de nuevo.');
        }
    };

    // --- FUNCIONES DE EDICIÓN Y BORRADO DE TEMPLATE ---
    const handleEditTemplate = (template: ProjectTemplate) => {
        setEditTemplateId(template.id);
        setTemplateForm({
            name: template.name || '',
            category: template.category || 'web_development',
            description: template.description || '',
            template_data: {
                phases: Array.isArray(template.template_data?.phases) ? template.template_data.phases.length : (typeof template.template_data?.phases === 'number' ? template.template_data.phases : ''),
                deliverables: Array.isArray(template.template_data?.deliverables) ? template.template_data.deliverables.length : (typeof template.template_data?.deliverables === 'number' ? template.template_data.deliverables : ''),
                pricing: template.template_data?.pricing || {}
            }
        });
        setShowEditTemplateModal(true);
    };

    const updateTemplate = async () => {
        try {
            if (!supabase || !editTemplateId) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Buscar el template original para preservar campos
            const originalTemplate = templates.find(t => t.id === editTemplateId);
            if (!originalTemplate) {
                alert('Template no encontrado');
                return;
            }

            // Normalizar phases y deliverables según el modelo original (array o número)
            let templateDataToSave = { ...templateForm.template_data };
            
            // Convertir números a arrays si es necesario
            if (typeof templateDataToSave.phases === 'number') {
                templateDataToSave.phases = Array(templateDataToSave.phases).fill({ name: '', duration: '', tasks: [] });
            }
            if (typeof templateDataToSave.deliverables === 'number') {
                templateDataToSave.deliverables = Array(templateDataToSave.deliverables).fill('');
            }

            // Realizar la actualización
            const { error } = await supabase
                .from('project_templates')
                .update({
                    name: templateForm.name,
                    category: templateForm.category,
                    description: templateForm.description,
                    template_data: templateDataToSave
                })
                .eq('id', editTemplateId)
                .eq('user_id', user.id); // Añadir restricción de usuario

            if (error) {
                console.error('Error updating template:', error);
                alert('Error al actualizar el template: ' + error.message);
                return;
            }

            // Actualizar localmente preservando todos los campos originales
            const updatedTemplate = {
                ...originalTemplate,
                name: templateForm.name,
                category: templateForm.category,
                description: templateForm.description,
                template_data: templateDataToSave
            };

            setTemplates(prev => prev.map(t => 
                t.id === editTemplateId ? updatedTemplate : t
            ));

            setFilteredTemplates(prev => prev.map(t => 
                t.id === editTemplateId ? updatedTemplate : t
            ));

            setShowEditTemplateModal(false);
            setEditTemplateId(null);
            setTemplateForm({
                name: '',
                category: 'web_development',
                description: '',
                template_data: {}
            });
            
            alert('Template actualizado correctamente.');
        } catch (error) {
            console.error('Error updating template:', error);
            alert('Error al actualizar el template.');
        }
    };

    const deleteTemplate = async (templateId: string) => {
        if (!window.confirm('¿Seguro que deseas borrar este template? Esta acción no se puede deshacer.')) return;
        try {
            if (!supabase) return;
            const { error } = await supabase
                .from('project_templates')
                .delete()
                .eq('id', templateId);
            if (error) {
                console.error('Error deleting template:', error);
                alert('Error al borrar el template.');
                return;
            }
            await loadTemplates();
            alert('Template borrado correctamente.');
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Error al borrar el template.');
        }
    };

    const duplicateTemplate = async (template: ProjectTemplate) => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newTemplate = {
                user_id: user.id,
                name: `${template.name} (Copia)`,
                category: template.category,
                description: template.description,
                template_data: template.template_data,
                is_public: false
            };

            const { error } = await supabase
                .from('project_templates')
                .insert([newTemplate]);

            if (error) {
                console.error('Error duplicating template:', error);
                return;
            }

            await loadTemplates();
            
        } catch (error) {
            console.error('Error duplicating template:', error);
        }
    };

    // --- FUNCIÓN PARA MARCAR PROYECTO COMO COMPLETADO (CORREGIDA) ---
    const completarProyecto = async (projectId: string) => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('projects')
                .update({ 
                    status: 'Completado', 
                    end_date: new Date().toISOString() 
                })
                .eq('id', projectId)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error al completar el proyecto:', error);
                alert('No se pudo completar el proyecto. Verifica el ID y permisos.');
                return;
            }

            alert('Proyecto marcado como completado exitosamente.');
            router.refresh(); // Recargar la página para reflejar cambios
        } catch (error) {
            console.error('Error al completar proyecto:', error);
            alert('Ocurrió un error al intentar completar el proyecto.');
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        filterTemplates();
    }, [searchQuery, selectedCategory, templates]);

    const getCategoryIcon = (category: string) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.icon : BookTemplate;
    };

    const getCategoryColor = (category: string) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.color : 'text-slate-600';
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                <div className="flex-1 ml-56 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600">Cargando templates...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 ml-56 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/90 to-indigo-100/80 backdrop-blur-3xl">
                        <div className="container mx-auto px-6 py-8">
                            {/* Header */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-indigo-500/10 p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                                    <BookTemplate className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                                        Templates de Proyecto
                                                    </h1>
                                                    <p className="text-slate-600 font-medium">
                                                        Acelera tu trabajo con plantillas profesionales optimizadas para freelancers
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => setShowNewTemplateModal(true)}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-200"
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                Crear Template
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters and Search */}
                            <div className="mb-8">
                                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-6">
                                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                        
                                        {/* Search */}
                                        <div className="flex-1 max-w-md">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <Input
                                                    type="text"
                                                    placeholder="Buscar templates..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white/80 border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Categories */}
                                        <div className="flex items-center gap-2 overflow-x-auto">
                                            {categories.map((category) => {
                                                const IconComponent = category.icon;
                                                const isActive = selectedCategory === category.id;
                                                
                                                return (
                                                    <button
                                                        key={category.id}
                                                        onClick={() => setSelectedCategory(category.id)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                                                            isActive
                                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                                                : 'bg-white/80 text-slate-700 hover:bg-white hover:shadow-md'
                                                        }`}
                                                    >
                                                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : category.color}`} />
                                                        {category.name}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* View Mode */}
                                        <div className="flex items-center gap-2 bg-white/80 rounded-xl p-1">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 rounded-lg transition-all duration-200 ${
                                                    viewMode === 'grid'
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                <Grid3X3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-2 rounded-lg transition-all duration-200 ${
                                                    viewMode === 'list'
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Templates Grid/List */}
                            <div className={`${
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                    : 'space-y-4'
                            }`}>
                                {filteredTemplates.map((template) => {
                                    const IconComponent = getCategoryIcon(template.category);
                                    const categoryColor = getCategoryColor(template.category);
                                    return (
                                        <Card
                                            key={template.id}
                                            className={`group bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ${
                                                viewMode === 'list' ? 'flex items-center' : ''
                                            }`}
                                        >
                                            <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'flex-1' : ''}`}> 
                                                        <div className={`w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                            <IconComponent className={`w-6 h-6 ${categoryColor}`} />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                                                                {template.name}
                                                            </CardTitle>
                                                            <p className="text-sm text-slate-600">
                                                                {categories.find(c => c.id === template.category)?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1 text-xs">
                                                        {template.is_public && (
                                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                                                                Público
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-1 text-slate-500">
                                                            <Star className="w-3 h-3" />
                                                            {template.usage_count}
                                                        </div>
                                                    </div>
                                                </div>

                                                {viewMode === 'grid' && (
                                                    <>
                                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                                            {template.description}
                                                        </p>

                                                        {/* Template Info */}
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-slate-600">Fases:</span>
                                                                <span className="font-semibold text-slate-900">
                                                                    {template.template_data.phases?.length || 0}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="text-slate-600">Entregables:</span>
                                                                <span className="font-semibold text-slate-900">
                                                                    {template.template_data.deliverables?.length || 0}
                                                                </span>
                                                            </div>
                                                            {template.template_data.pricing?.base_price && (
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-slate-600">Precio base:</span>
                                                                    <span className="font-bold text-green-600">
                                                                        {formatPrice(template.template_data.pricing.base_price)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </CardHeader>

                                            <CardContent className={`pt-0 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                                                <div className={`flex items-center gap-2 ${viewMode === 'list' ? '' : 'w-full'}`}>
                                                    <Button
                                                        onClick={() => useTemplate(template)}
                                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                                        size="sm"
                                                    >
                                                        <Zap className="w-4 h-4 mr-2" />
                                                        Usar Template
                                                    </Button>
                                                    
                                                    <Button
                                                        onClick={() => duplicateTemplate(template)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-200 hover:bg-slate-50"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    <Button
                                                        onClick={() => handleEditTemplate(template)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-200 hover:bg-slate-50"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteTemplate(template.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-200 hover:bg-slate-50 text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                             {/* Empty State */}
                            {filteredTemplates.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <BookTemplate className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        No se encontraron templates
                                    </h3>
                                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                        {searchQuery || selectedCategory !== 'all'
                                            ? 'Intenta ajustar los filtros de búsqueda'
                                            : 'Comienza creando tu primer template personalizado'
                                        }
                                    </p>
                                    <Button
                                        onClick={() => setShowNewTemplateModal(true)}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Crear Primer Template
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para editar template */}
            {showEditTemplateModal && (
                <TemplateForm
                    title="Editar Template"
                    subtitle="Modifica los datos del template"
                    formData={templateForm}
                    setFormData={setTemplateForm}
                    onCancel={() => {
                        setShowEditTemplateModal(false);
                        setEditTemplateId(null);
                        setTemplateForm({
                            name: '',
                            category: 'web_development',
                            description: '',
                            template_data: {}
                        });
                    }}
                    onSubmit={updateTemplate}
                    categories={categories}
                    submitLabel="Guardar Cambios"
                />
            )}

            {/* Modal para crear proyecto desde template */}
            {showProjectModal && selectedTemplate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Crear Proyecto desde Template
                                    </h3>
                                    <p className="text-slate-600 mt-1">
                                        Template: {selectedTemplate.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowProjectModal(false);
                                        setSelectedTemplate(null);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={(e) => { e.preventDefault(); createProjectFromTemplate(); }} className="space-y-6">
                                {/* Nombre del proyecto */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nombre del Proyecto *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={projectForm.name}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Nombre del proyecto"
                                    />
                                </div>

                                {/* Cliente */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Users className="h-4 w-4 inline mr-1" />
                                        Cliente
                                    </label>
                                    <select
                                        value={projectForm.client_id}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, client_id: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="">Sin cliente asignado</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.company ? `(${client.company})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Presupuesto */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            <DollarSign className="h-4 w-4 inline mr-1" />
                                            Presupuesto (€)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={projectForm.budget}
                                            onChange={(e) => setProjectForm(prev => ({ ...prev, budget: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {/* Fecha de inicio */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            <Calendar className="h-4 w-4 inline mr-1" />
                                            Fecha de Inicio
                                        </label>
                                        <input
                                            type="date"
                                            value={projectForm.start_date}
                                            onChange={(e) => setProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Fecha de finalización */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <Calendar className="h-4 w-4 inline mr-1" />
                                        Fecha de Finalización
                                    </label>
                                    <input
                                        type="date"
                                        value={projectForm.end_date}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, end_date: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={projectForm.description}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Describe los objetivos del proyecto..."
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowProjectModal(false);
                                            setSelectedTemplate(null);
                                        }}
                                        className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Crear Proyecto
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para crear nuevo template */}
            {showNewTemplateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Crear Nuevo Template
                                    </h3>
                                    <p className="text-slate-600 mt-1">
                                        Define un template reutilizable para tus proyectos
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowNewTemplateModal(false);
                                        setTemplateForm({
                                            name: '',
                                            category: 'web_development',
                                            description: '',
                                            template_data: {}
                                        });
                                    }}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={(e) => { e.preventDefault(); createNewTemplate(); }} className="space-y-6">
                                {/* Nombre del template */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nombre del Template *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={templateForm.name}
                                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Ej: Desarrollo Web E-commerce"
                                    />
                                </div>

                                {/* Categoría */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Categoría *
                                    </label>
                                    <select
                                        value={templateForm.category}
                                        onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="web_development">Desarrollo Web</option>
                                        <option value="design">Diseño</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="consulting">Consultoría</option>
                                        <option value="writing">Redacción</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Descripción *
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={templateForm.description}
                                        onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Describe qué tipo de proyectos abarca este template, qué incluye, y cuándo usarlo..."
                                    />
                                </div>

                                {/* Información adicional */}
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <BookTemplate className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                                                Sobre los Templates
                                            </h4>
                                            <p className="text-sm text-indigo-700">
                                                Los templates te permiten crear proyectos con estructura predefinida. 
                                                Podrás usar este template para generar proyectos similares de forma rápida, 
                                                personalizando los detalles específicos de cada cliente.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewTemplateModal(false);
                                            setTemplateForm({
                                                name: '',
                                                category: 'web_development',
                                                description: '',
                                                template_data: {}
                                            });
                                        }}
                                        className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Crear Template
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
                