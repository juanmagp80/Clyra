'use client';

import Sidebar from '@/components/Sidebar';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    AlertTriangle,
    Calendar,
    ChevronDown,
    Clock,
    Code,
    Copy,
    DollarSign,
    Edit,
    Eye,
    FileText,
    Filter,
    Grid3x3,
    LayoutGrid,
    List,
    Package,
    Palette,
    Plus,
    Search,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trash2,
    Users,
    X
} from 'lucide-react';
import Link from 'next/link';
import TrialBanner from '../../../components/TrialBanner';
import { useTrialStatus } from '../../../src/lib/useTrialStatus';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Tipo Template
type Template = {
    id: string;
    name: string;
    category: string;
    description: string;
    template_data: any;
    is_public: boolean;
    usage_count: number;
    created_at: string;
    user_id?: string;
};

// Interface para props
interface TemplatesPageClientProps {
    userEmail: string;
}

// Componente principal
export default function TemplatesPageClient({ userEmail }: TemplatesPageClientProps) {
    // Hook de trial status
    const { trialInfo, loading: trialLoading, hasReachedLimit, canUseFeatures } = useTrialStatus(userEmail);
    
    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
    const [showForm, setShowForm] = useState(false);
    
    // Estado para el formulario de nuevo template
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        category: 'web_development',
        is_public: false,
        phases: [{ name: '', duration: '', tasks: [''] }],
        deliverables: [''],
        pricing: {
            base_price: '',
            hourly_rate: '',
            fixed_price: true
        }
    });
    
    // Debug: Monitorear cambios en showForm
    useEffect(() => {
        console.log('showForm cambió a:', showForm);
    }, [showForm]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        category: 'web_development',
        description: '',
        phases: [
            { name: '', duration: '', tasks: [''] }
        ],
        deliverables: [''],
        pricing: {
            base_price: '',
            hourly_rate: '',
            estimated_hours: ''
        }
    });
    const supabase = createSupabaseClient();
    const router = useRouter();

    // Función para manejar la creación de nueva plantilla
    const handleNewTemplateClick = () => {
        if (!canUseFeatures) {
            alert('Tu periodo de prueba ha expirado. Actualiza tu plan para continuar creando plantillas.');
            return;
        }
        
        setShowForm(true);
    };

    const fetchTemplates = async () => {
        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: templatesData, error } = await supabase
                .from('project_templates')
                .select('*')
                .or(`user_id.eq.${user.id},is_public.eq.true`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching templates:', error);
                return;
            }

            setTemplates(templatesData || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const createTemplate = async () => {
        try {
            if (!supabase || !newTemplate.name) return;
            
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            // Construir el template_data
            const templateData = {
                phases: newTemplate.phases.filter(phase => phase.name.trim() !== ''),
                deliverables: newTemplate.deliverables.filter(d => d.trim() !== ''),
                pricing: {
                    base_price: newTemplate.pricing.base_price ? parseFloat(newTemplate.pricing.base_price) : 0,
                    hourly_rate: newTemplate.pricing.hourly_rate ? parseFloat(newTemplate.pricing.hourly_rate) : 0,
                    fixed_price: newTemplate.pricing.fixed_price
                }
            };

            const { data, error } = await supabase
                .from('project_templates')
                .insert([{
                    name: newTemplate.name,
                    category: newTemplate.category,
                    description: newTemplate.description,
                    template_data: templateData,
                    user_id: user.id,
                    is_public: newTemplate.is_public,
                    usage_count: 0
                }])
                .select();

            if (error) {
                console.error('Error creating template:', error);
                return;
            }

            if (data && data[0]) {
                setTemplates(prev => [data[0], ...prev]);
                setNewTemplate({
                    name: '',
                    description: '',
                    category: 'web_development',
                    is_public: false,
                    phases: [{ name: '', duration: '', tasks: [''] }],
                    deliverables: [''],
                    pricing: {
                        base_price: '',
                        hourly_rate: '',
                        fixed_price: true
                    }
                });
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addPhase = () => {
        setNewTemplate(prev => ({
            ...prev,
            phases: [...prev.phases, { name: '', duration: '', tasks: [''] }]
        }));
    };

    const removePhase = (index: number) => {
        setNewTemplate(prev => ({
            ...prev,
            phases: prev.phases.filter((_, i) => i !== index)
        }));
    };

    const updatePhase = (index: number, field: string, value: any) => {
        setNewTemplate(prev => ({
            ...prev,
            phases: prev.phases.map((phase, i) => 
                i === index ? { ...phase, [field]: value } : phase
            )
        }));
    };

    const addTask = (phaseIndex: number) => {
        setNewTemplate(prev => ({
            ...prev,
            phases: prev.phases.map((phase, i) => 
                i === phaseIndex 
                    ? { ...phase, tasks: [...phase.tasks, ''] }
                    : phase
            )
        }));
    };

    const removeTask = (phaseIndex: number, taskIndex: number) => {
        setNewTemplate(prev => ({
            ...prev,
            phases: prev.phases.map((phase, i) => 
                i === phaseIndex 
                    ? { ...phase, tasks: phase.tasks.filter((_, t) => t !== taskIndex) }
                    : phase
            )
        }));
    };

    const updateTask = (phaseIndex: number, taskIndex: number, value: string) => {
        setNewTemplate(prev => ({
            ...prev,
            phases: prev.phases.map((phase, i) => 
                i === phaseIndex 
                    ? { 
                        ...phase, 
                        tasks: phase.tasks.map((task, t) => 
                            t === taskIndex ? value : task
                        ) 
                    }
                    : phase
            )
        }));
    };

    const addDeliverable = () => {
        setNewTemplate(prev => ({
            ...prev,
            deliverables: [...prev.deliverables, '']
        }));
    };

    const removeDeliverable = (index: number) => {
        setNewTemplate(prev => ({
            ...prev,
            deliverables: prev.deliverables.filter((_, i) => i !== index)
        }));
    };

    const updateDeliverable = (index: number, value: string) => {
        setNewTemplate(prev => ({
            ...prev,
            deliverables: prev.deliverables.map((d, i) => i === index ? value : d)
        }));
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

    const duplicateTemplate = async (template: Template) => {
        try {
            if (!supabase) return;
            
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data, error } = await supabase
                .from('project_templates')
                .insert([{
                    name: `${template.name} (Copia)`,
                    category: template.category,
                    description: template.description,
                    template_data: template.template_data,
                    user_id: user.id,
                    is_public: false,
                    usage_count: 0
                }])
                .select();

            if (error) {
                console.error('Error duplicating template:', error);
                return;
            }

            if (data && data[0]) {
                setTemplates(prev => [data[0], ...prev]);
                // Incrementar contador de uso del template original si es público
                if (template.is_public && template.user_id !== user.id) {
                    await supabase
                        .from('project_templates')
                        .update({ usage_count: template.usage_count + 1 })
                        .eq('id', template.id);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Atajos de teclado
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + K para focus en búsqueda
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef?.focus();
            }
            // Escape para limpiar búsqueda
            if (event.key === 'Escape') {
                setSearchTerm('');
                searchInputRef?.blur();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [searchInputRef]);

    // Manejar tecla Escape para cerrar formulario
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowForm(false);
            }
        };

        if (showForm) {
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [showForm]);

    // Filtrar templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'web_development': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'design': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'consulting': return 'bg-green-100 text-green-800 border-green-200';
            case 'marketing': return 'bg-pink-100 text-pink-800 border-pink-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'web_development': return <FileText className="w-4 h-4" />;
            case 'design': return <Sparkles className="w-4 h-4" />;
            case 'consulting': return <Target className="w-4 h-4" />;
            case 'marketing': return <TrendingUp className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
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
        total: templates.length,
        public: templates.filter(t => t.is_public).length,
        private: templates.filter(t => !t.is_public).length,
        categories: [...new Set(templates.map(t => t.category))].length
    };

    // Render
    return (
        <div className={"flex h-screen relative overflow-hidden bg-white dark:bg-slate-900"}>
            {/* Elementos decorativos animados de fondo mejorados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-indigo-500/8 dark:from-blue-400/5 dark:via-purple-400/5 dark:to-indigo-400/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/8 via-pink-500/8 to-indigo-500/8 dark:from-purple-400/5 dark:via-pink-400/5 dark:to-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/8 via-blue-500/8 to-purple-500/8 dark:from-indigo-400/5 dark:via-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-pink-500/8 via-purple-500/8 to-blue-500/8 dark:from-pink-400/5 dark:via-purple-400/5 dark:to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            {/* Main Content */}
            <main className="flex-1 ml-64 overflow-auto relative z-10">
                {/* Trial Banner */}
                <div className="p-8 pb-0">
                    <TrialBanner />
                </div>

                {/* Header Ultra Premium Mejorado */}
                <div className="border-b sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-500 dark:via-pink-500 dark:to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 dark:shadow-purple-500/20 relative">
                                    <FileText className="w-8 h-8 text-white" />
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-300 dark:to-orange-300 rounded-full border-2 border-white dark:border-slate-200 shadow-lg animate-pulse"></div>
                                </div>
                                <div>
                                    <h1 className={"text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"}>
                                        Templates de Proyecto
                                    </h1>
                                    <p className={"mt-2 font-semibold text-lg flex items-center gap-2 text-slate-600 dark:text-slate-400"}>
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse block"></span>
                                        Acelera tu trabajo con plantillas profesionales
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2 rounded-2xl px-6 py-3 shadow-lg border transition-colors duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className={"text-sm font-bold text-slate-900 dark:text-white"}>Panel en Vivo</span>
                                </div>
                                <button
                                    onClick={handleNewTemplateClick}
                                    disabled={!canUseFeatures}
                                    className={`group bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 ${
                                        !canUseFeatures 
                                            ? 'opacity-50 cursor-not-allowed !bg-gray-400 hover:!bg-gray-400 !shadow-gray-400/30 hover:!shadow-gray-400/30 hover:!scale-100 hover:!translate-y-0' 
                                            : ''
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        {!canUseFeatures ? (
                                            <AlertTriangle className="w-5 h-5" />
                                        ) : (
                                            <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                        )}
                                        {!canUseFeatures ? 'Trial Expirado' : 'Nuevo Template'}
                                        {canUseFeatures && <Sparkles className="w-4 h-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" />}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Stats Ultra Premium con Animaciones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Templates */}
                        <div className={"group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"}>
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-400/5 dark:via-pink-400/5 dark:to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-2xl shadow-2xl shadow-purple-500/40 dark:shadow-purple-400/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className={"text-4xl font-black group-hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"}>
                                            {stats.total}
                                        </p>
                                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse ml-auto"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"}>Total Templates</p>
                                    <p className={"text-xs font-medium mt-1 text-slate-500 dark:text-slate-500"}>Disponibles</p>
                                </div>
                            </div>
                        </div>

                        {/* Templates Públicos */}
                        <div className={"group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"}>
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-400/5 dark:via-emerald-400/5 dark:to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl shadow-green-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-700 dark:from-green-400 dark:to-green-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                                            {stats.public}
                                        </p>
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"}>Públicos</p>
                                    <p className={"text-xs font-medium mt-1 text-slate-500 dark:text-slate-500"}>Compartidos</p>
                                </div>
                            </div>
                        </div>

                        {/* Templates Privados */}
                        <div className={"group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"}>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-400/5 dark:via-indigo-400/5 dark:to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl shadow-2xl shadow-blue-500/40 dark:shadow-blue-400/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Eye className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                                            {stats.private}
                                        </p>
                                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse ml-auto"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className={"text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"}>Privados</p>
                                    <p className={"text-xs font-medium mt-1 text-slate-500 dark:text-slate-500"}>Solo tuyos</p>
                                </div>
                            </div>
                        </div>

                        {/* Categorías */}
                        <div className={"group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"}>
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 dark:from-yellow-400/5 dark:via-orange-400/5 dark:to-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl shadow-yellow-500/40 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Target className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                                            {stats.categories}
                                        </p>
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse ml-auto"></div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Categorías</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Diferentes tipos</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Búsqueda y Filtros Ultra Premium */}
                    <div className={"p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"}>
                        <div className="flex flex-col space-y-6">
                            {/* Header con título y estadísticas */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h2 className={"text-3xl font-black mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"}>
                                        🎯 Directorio de Templates ({filteredTemplates.length})
                                    </h2>
                                    <p className={"font-semibold flex items-center gap-2 text-slate-600 dark:text-slate-400"}>
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse block"></span>
                                        Plantillas profesionales para acelerar tus proyectos
                                    </p>
                                </div>
                                
                                {/* Botones de Vista */}
                                <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/80 dark:border-slate-600/80 transition-colors duration-300">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                                            viewMode === 'grid'
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                                        }`}
                                    >
                                        <Grid3x3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                        Tarjetas
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                                            viewMode === 'list'
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
                                        }`}
                                    >
                                        <List className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                        Lista
                                    </button>
                                </div>
                            </div>

                            {/* Barra de Búsqueda Ultra Premium */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                                {/* Cuadro de Búsqueda Premium Ultra Avanzado */}
                                <div className="lg:col-span-2 relative group/search">
                                    {/* Fondo Decorativo con Gradientes Animados */}
                                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-3xl opacity-0 group-focus-within/search:opacity-30 group-hover/search:opacity-20 blur-lg transition-all duration-700"></div>
                                    
                                    {/* Contenedor Principal */}
                                    <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border-2 border-white/80 dark:border-slate-600/80 rounded-3xl shadow-2xl shadow-slate-500/10 dark:shadow-black/20 group-focus-within/search:shadow-purple-500/25 group-focus-within/search:border-purple-300 dark:group-focus-within/search:border-purple-500 group-focus-within/search:scale-[1.02] group-hover/search:shadow-xl transition-all duration-700">
                                        
                                        {/* Icono de Búsqueda con Animaciones */}
                                        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                                            <div className="relative">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-2 group-focus-within/search:scale-125 group-focus-within/search:rotate-12 group-hover/search:scale-110 transition-all duration-700 shadow-2xl shadow-purple-500/40">
                                                    <Search className="w-full h-full text-white" />
                                                </div>
                                                {/* Efecto de ondas al hacer focus */}
                                                <div className="absolute inset-0 bg-purple-500/20 rounded-2xl opacity-0 group-focus-within/search:opacity-100 group-focus-within/search:animate-ping"></div>
                                            </div>
                                        </div>

                                        {/* Campo de Input Premium */}
                                        <input
                                            ref={(el) => setSearchInputRef(el)}
                                            type="text"
                                            placeholder="🔍 Buscar templates por nombre, descripción o categoría... (Ctrl+K)"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className={"w-full h-16 pl-16 pr-16 text-lg font-semibold placeholder-slate-500 dark:placeholder-slate-400 bg-transparent border-0 rounded-3xl focus:outline-none focus:ring-0 transition-all duration-500 text-slate-900 dark:text-white"}
                                            autoComplete="off"
                                            spellCheck="false"
                                        />

                                        {/* Botón de Limpiar */}
                                        {searchTerm && (
                                            <button 
                                                onClick={() => setSearchTerm('')}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                                                title="Limpiar búsqueda (ESC)"
                                            >
                                                <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
                                            </button>
                                        )}

                                        {/* Atajos de teclado visibles */}
                                        <div className={"absolute right-4 bottom-1 text-xs font-medium opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-300 text-slate-500 dark:text-slate-500"}>
                                            ESC para limpiar
                                        </div>
                                    </div>

                                    {/* Sugerencias flotantes mejoradas */}
                                    {searchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-2xl border border-white/60 dark:border-slate-700/60 shadow-2xl shadow-slate-500/20 dark:shadow-black/20 p-4 z-50 animate-in slide-in-from-top-2 duration-300 transition-colors duration-300">
                                            <div className={"text-xs font-bold uppercase tracking-wider mb-2 text-slate-500 dark:text-slate-500"}>Buscando en:</div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold transition-colors duration-300">📝 Nombres</span>
                                                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-xl text-xs font-semibold transition-colors duration-300">📋 Descripciones</span>
                                                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-colors duration-300">🏷️ Categorías</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Filtro de Categoría Premium */}
                                <div className="relative group/filter">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl opacity-0 group-hover/filter:opacity-20 blur-sm transition-all duration-500"></div>
                                    <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border-2 border-white/80 dark:border-slate-600/80 rounded-2xl shadow-xl shadow-slate-500/10 dark:shadow-black/20 group-hover/filter:shadow-lg transition-all duration-500">
                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                            <Target className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <select
                                            value={filterCategory}
                                            onChange={(e) => setFilterCategory(e.target.value)}
                                            className={"w-full h-16 pl-12 pr-8 text-base font-semibold bg-transparent border-0 rounded-2xl focus:outline-none focus:ring-0 transition-all duration-300 appearance-none cursor-pointer text-slate-900 dark:text-white"}
                                        >
                                            <option value="all">🎯 Todas las Categorías</option>
                                            <option value="web_development">💻 Desarrollo Web</option>
                                            <option value="design">🎨 Diseño</option>
                                            <option value="consulting">🎯 Consultoría</option>
                                            <option value="marketing">📈 Marketing</option>
                                        </select>
                                        {/* Flecha personalizada */}
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <div className="w-3 h-3 bg-purple-500 rotate-45 transform origin-center"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Nuevo Template Premium */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        console.log('Botón clickeado, showForm actual:', showForm);
                                        if (!canUseFeatures) {
                                            alert('Tu periodo de prueba ha expirado. Actualiza tu plan para continuar creando plantillas.');
                                            return;
                                        }
                                        setShowForm(true);
                                        console.log('setShowForm(true) llamado');
                                    }}
                                    disabled={!canUseFeatures}
                                    className={`group px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-black rounded-3xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 hover:-translate-y-2 transition-all duration-500 flex items-center gap-4 text-lg relative overflow-hidden ${
                                        !canUseFeatures 
                                            ? 'opacity-50 cursor-not-allowed !bg-gray-400 hover:!bg-gray-400 !shadow-gray-400/30 hover:!shadow-gray-400/30 hover:!scale-100 hover:!translate-y-0' 
                                            : ''
                                    }`}
                                >
                                    {/* Efecto de brillo en hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="p-2 bg-white/20 rounded-2xl group-hover:scale-125 group-hover:rotate-180 transition-all duration-500">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span>Crear Nuevo Template</span>
                                        <Sparkles className="w-5 h-5 group-hover:rotate-45 group-hover:scale-125 transition-all duration-500" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista Ultra Premium de Templates */}
                    <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-500/10">
                        <div className="p-8">
                            <h2 className="text-2xl font-black bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-8 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-purple-600" />
                                Directorio de Templates
                            </h2>
                            
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-slate-200 rounded-full"></div>
                                        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="space-y-3 text-center">
                                        <h3 className="text-2xl font-black text-slate-900">Cargando templates</h3>
                                        <p className="text-base text-slate-600 font-semibold">Obteniendo plantillas...</p>
                                    </div>
                                </div>
                            ) : filteredTemplates.length === 0 ? (
                                <div className="text-center py-20 relative">
                                    {/* Elementos decorativos flotantes */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-64 h-64 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-slate-500/20 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <FileText className="w-12 h-12 text-slate-500 relative z-10 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white text-xs font-bold">0</span>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-3xl font-black bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 bg-clip-text text-transparent mb-4">
                                            {searchTerm ? '🔍 Sin resultados para tu búsqueda' : '📋 Aún no tienes templates'}
                                        </h3>
                                        
                                        <p className="text-slate-600 max-w-2xl mx-auto font-semibold text-lg mb-8">
                                            {searchTerm 
                                                ? `No encontramos templates que coincidan con "${searchTerm}". Prueba con otros términos.`
                                                : 'Comienza creando tu primer template para acelerar el desarrollo de futuros proyectos'
                                            }
                                        </p>
                                        
                                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                            {searchTerm ? (
                                                <>
                                                    <button 
                                                        onClick={() => setSearchTerm('')} 
                                                        className="group px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                                                    >
                                                        <X className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                                        Limpiar búsqueda
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (!canUseFeatures) {
                                                                alert('Tu periodo de prueba ha expirado. Actualiza tu plan para continuar creando plantillas.');
                                                                return;
                                                            }
                                                            setShowForm(true);
                                                            setSearchTerm('');
                                                        }}
                                                        disabled={!canUseFeatures}
                                                        className={`group px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 ${
                                                            !canUseFeatures 
                                                                ? 'opacity-50 cursor-not-allowed !bg-gray-400 hover:!bg-gray-400 !shadow-gray-400/30 hover:!shadow-gray-400/30 hover:!scale-100 hover:!translate-y-0' 
                                                                : ''
                                                        }`}
                                                    >
                                                        {!canUseFeatures ? (
                                                            <AlertTriangle className="w-5 h-5" />
                                                        ) : (
                                                            <Plus className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
                                                        )}
                                                        {!canUseFeatures ? 'Límite Alcanzado' : 'Crear template nuevo'}
                                                        {canUseFeatures && <Sparkles className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />}
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setShowForm(true)}
                                                    className="group px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 hover:-translate-y-2 transition-all duration-300 flex items-center justify-center gap-4 text-xl"
                                                >
                                                    <Plus className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
                                                    Crear tu primer template
                                                    <Sparkles className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {viewMode === 'grid' ? (
                                    /* Vista de Tarjetas (Grid) */
                                    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                                        {filteredTemplates.map((template, index) => {
                                            const getAvatarColor = (category: string) => {
                                                const colors = {
                                                    'web_development': 'from-blue-500 to-blue-600',
                                                    'design': 'from-purple-500 to-purple-600',
                                                    'consulting': 'from-green-500 to-green-600',
                                                    'marketing': 'from-pink-500 to-pink-600',
                                                    'default': 'from-slate-500 to-slate-600'
                                                };
                                                return colors[category as keyof typeof colors] || colors.default;
                                            };

                                            const avatarColor = getAvatarColor(template.category);
                                            const phases = template.template_data?.phases?.length || 0;
                                            const basePrice = template.template_data?.pricing?.base_price || 0;

                                            return (
                                                <div
                                                    key={template.id}
                                                    className={"group p-6 relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"}
                                                    style={{
                                                        animationDelay: `${index * 100}ms`
                                                    }}
                                                >
                                                    {/* Hover Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    
                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center space-x-4">
                                                                <div className={`relative w-16 h-16 bg-gradient-to-br ${avatarColor} rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                                                    {getCategoryIcon(template.category)}
                                                                    {template.is_public && (
                                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white dark:border-slate-200 shadow-lg">
                                                                            <Star className="w-3 h-3 text-white absolute inset-0 m-auto" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <h3 className={"font-black text-lg group-hover:text-purple-900 dark:group-hover:text-purple-300 transition-colors duration-300 max-w-[160px] truncate text-slate-900 dark:text-white"} title={template.name}>
                                                                        {template.name || 'Sin nombre'}
                                                                    </h3>
                                                                    <span className={`px-3 py-1 rounded-2xl text-xs font-bold border-2 shadow-lg group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 flex items-center gap-1 w-fit ${getCategoryColor(template.category)}`}>
                                                                        {getCategoryIcon(template.category)}
                                                                        {template.category.replace('_', ' ').charAt(0).toUpperCase() + template.category.replace('_', ' ').slice(1)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3 mb-6">
                                                            {template.description && (
                                                                <div className="group/item flex items-start gap-3 text-sm p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300">
                                                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover/item:bg-purple-100 dark:group-hover/item:bg-purple-900/30 group-hover/item:scale-110 transition-all duration-300 flex-shrink-0">
                                                                        <FileText className={"w-4 h-4 group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-300 text-slate-600 dark:text-slate-400"} />
                                                                    </div>
                                                                    <p className={"font-semibold group-hover/item:text-purple-700 dark:group-hover/item:text-purple-300 line-clamp-2 transition-colors duration-300 text-slate-600 dark:text-slate-400"} title={template.description}>
                                                                        {template.description}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            
                                                            {phases > 0 && (
                                                                <div className="group/item flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300">
                                                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/30 group-hover/item:scale-110 transition-all duration-300">
                                                                        <Target className={"w-4 h-4 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300 text-slate-600 dark:text-slate-400"} />
                                                                    </div>
                                                                    <span className={"font-bold text-lg group-hover/item:text-blue-700 dark:group-hover/item:text-blue-300 transition-colors duration-300 text-slate-600 dark:text-slate-400"}>{phases} fases</span>
                                                                </div>
                                                            )}
                                                            
                                                            {basePrice > 0 && (
                                                                <div className="group/item flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300">
                                                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl group-hover/item:bg-green-100 dark:group-hover/item:bg-green-900/30 group-hover/item:scale-110 transition-all duration-300">
                                                                        <DollarSign className={"w-4 h-4 group-hover/item:text-green-600 dark:group-hover/item:text-green-400 transition-colors duration-300 text-slate-600 dark:text-slate-400"} />
                                                                    </div>
                                                                    <span className={"font-black text-lg group-hover/item:text-green-700 dark:group-hover/item:text-green-300 transition-colors duration-300 text-slate-600 dark:text-slate-400"}>{formatCurrency(basePrice)}</span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className={"flex items-center justify-between text-sm p-3 rounded-xl transition-colors duration-300 text-slate-500 dark:text-slate-500"}>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span className="font-semibold">{formatDate(template.created_at)}</span>
                                                                </div>
                                                                {template.usage_count > 0 && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="w-4 h-4" />
                                                                        <span className="font-bold">{template.usage_count} usos</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex gap-2 pt-4 border-t border-white/50 dark:border-slate-700/50 transition-colors duration-300">
                                                            <button
                                                                onClick={() => duplicateTemplate(template)}
                                                                className="flex-1 px-4 py-3 text-sm font-bold group/btn bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg transition-all duration-300"
                                                            >
                                                                <span className="group-hover/btn:scale-110 transition-transform duration-300 flex items-center justify-center gap-2">
                                                                    <Copy className="w-4 h-4" />
                                                                    Duplicar
                                                                </span>
                                                            </button>
                                                            <button 
                                                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 hover:rotate-1 transition-all duration-300"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Vista de Lista */
                                    <div className="space-y-4">
                                        {filteredTemplates.map((template, index) => {
                                            const getAvatarColor = (category: string) => {
                                                const colors = {
                                                    'web_development': 'from-blue-500 to-blue-600',
                                                    'design': 'from-purple-500 to-purple-600',
                                                    'consulting': 'from-green-500 to-green-600',
                                                    'marketing': 'from-pink-500 to-pink-600',
                                                    'default': 'from-slate-500 to-slate-600'
                                                };
                                                return colors[category as keyof typeof colors] || colors.default;
                                            };

                                            const avatarColor = getAvatarColor(template.category);
                                            const phases = template.template_data?.phases?.length || 0;
                                            const basePrice = template.template_data?.pricing?.base_price || 0;

                                            return (
                                                <div
                                                    key={template.id}
                                                    className="group bg-white/50 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5 p-6 hover:shadow-2xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                                                    style={{
                                                        animationDelay: `${index * 50}ms`
                                                    }}
                                                >
                                                    {/* Hover Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                    
                                                    <div className="relative z-10 flex items-center justify-between">
                                                        <div className="flex items-center space-x-6 flex-1">
                                                            {/* Avatar del Template */}
                                                            <div className={`relative w-14 h-14 bg-gradient-to-br ${avatarColor} rounded-2xl flex items-center justify-center shadow-2xl shadow-black/15 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                                                {getCategoryIcon(template.category)}
                                                                {template.is_public && (
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white shadow-lg">
                                                                        <Star className="w-2 h-2 text-white absolute inset-0 m-auto" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Información Principal */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className={"font-black text-xl group-hover:text-purple-900 transition-colors duration-300 truncate text-slate-900 dark:text-white"} title={template.name}>
                                                                        {template.name || 'Sin nombre'}
                                                                    </h3>
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 shadow-lg flex items-center gap-1 ${getCategoryColor(template.category)}`}>
                                                                        {getCategoryIcon(template.category)}
                                                                        {template.category.replace('_', ' ').charAt(0).toUpperCase() + template.category.replace('_', ' ').slice(1)}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className={"flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400"}>
                                                                    {phases > 0 && (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1 bg-slate-100 rounded-lg">
                                                                                <Target className="w-4 h-4" />
                                                                            </div>
                                                                            <span className="font-semibold">{phases} fases</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {basePrice > 0 && (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1 bg-green-100 rounded-lg">
                                                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                                            </div>
                                                                            <span className="font-bold text-green-700">{formatCurrency(basePrice)}</span>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="p-1 bg-slate-100 rounded-lg">
                                                                            <Calendar className="w-4 h-4" />
                                                                        </div>
                                                                        <span className="font-semibold">{formatDate(template.created_at)}</span>
                                                                    </div>

                                                                    {template.usage_count > 0 && (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1 bg-blue-100 rounded-lg">
                                                                                <Users className="w-4 h-4 text-blue-600" />
                                                                            </div>
                                                                            <span className="font-bold text-blue-700">{template.usage_count} usos</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {template.description && (
                                                                    <p className={"mt-2 text-sm font-medium line-clamp-1 text-slate-600 dark:text-slate-400"} title={template.description}>
                                                                        {template.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Acciones */}
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => duplicateTemplate(template)}
                                                                className="px-6 py-3 text-sm bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-slate-700 font-bold hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 hover:text-purple-700 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                Duplicar
                                                            </button>
                                                            <button 
                                                                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300"
                                                                title="Ver detalles"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Espectacular de Nuevo Template */}
            {showForm && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowForm(false);
                        }
                    }}
                >
                    {/* Elementos decorativos flotantes */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/15 to-indigo-500/15 rounded-full animate-pulse blur-3xl"></div>
                        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full animate-pulse blur-3xl" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-indigo-500/15 to-blue-500/15 rounded-full animate-pulse blur-3xl" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute bottom-10 right-10 w-28 h-28 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full animate-pulse blur-3xl" style={{ animationDelay: '0.5s' }}></div>
                    </div>

                    <div className="relative w-full max-w-4xl flex-shrink-0">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/30 dark:border-slate-700/30 overflow-hidden max-h-[85vh] overflow-y-auto">
                            {/* Gradiente animado de fondo */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-indigo-500/5 opacity-80 pointer-events-none"></div>
                            
                            {/* Border animado brillante */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 blur-sm animate-pulse pointer-events-none"></div>
                            
                            <div className="relative z-10 p-8">
                                {/* Header Espectacular */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/40 dark:border-slate-700/40 transition-colors duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl shadow-purple-500/40 relative">
                                            <FileText className="w-8 h-8 text-white" />
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                                <Sparkles className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className={"text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent"}>
                                                Crear Nuevo Template
                                            </h2>
                                            <p className={"font-semibold text-lg mt-1 text-slate-600 dark:text-slate-400"}>
                                                Completa todos los datos del template
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="group p-4 bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl border-2 border-slate-200 dark:border-slate-600 hover:border-red-200 dark:hover:border-red-500 transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg"
                                    >
                                        <X className={"w-6 h-6 group-hover:text-red-500 transition-colors duration-300 text-slate-500 dark:text-slate-500"} />
                                    </button>
                                </div>

                                {/* Formulario Espectacular */}
                                <div className="space-y-8">
                                    {/* Sección de Información Básica */}
                                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 p-6 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                                <FileText className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className={"text-xl font-black text-slate-900 dark:text-white"}>Información Básica</h3>
                                        </div>
                                        
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="group md:col-span-2">
                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-purple-600 transition-colors duration-300">
                                                    Nombre del Template *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Ej: Landing Page Premium, App Móvil Completa..."
                                                        value={newTemplate.name}
                                                        onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                                                        className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-purple-500/10 transform focus:scale-[1.02]"
                                                        required
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                </div>
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-indigo-600 transition-colors duration-300">
                                                    Categoría *
                                                </label>
                                                <select
                                                    value={newTemplate.category}
                                                    onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-slate-900 font-semibold shadow-lg focus:shadow-2xl focus:shadow-indigo-500/10 transform focus:scale-[1.02]"
                                                    required
                                                >
                                                    <option value="web_development">💻 Desarrollo Web</option>
                                                    <option value="design">🎨 Diseño</option>
                                                    <option value="consulting">🎯 Consultoría</option>
                                                    <option value="marketing">📈 Marketing</option>
                                                </select>
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-pink-600 transition-colors duration-300">
                                                    Visibilidad
                                                </label>
                                                <select
                                                    value={newTemplate.is_public ? 'public' : 'private'}
                                                    onChange={(e) => setNewTemplate(prev => ({ ...prev, is_public: e.target.value === 'public' }))}
                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-pink-300 focus:border-pink-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 text-slate-900 font-semibold shadow-lg focus:shadow-2xl focus:shadow-pink-500/10 transform focus:scale-[1.02]"
                                                >
                                                    <option value="private">🔒 Privado (Solo yo)</option>
                                                    <option value="public">🌟 Público (Compartido)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <div className="group">
                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-blue-600 transition-colors duration-300">
                                                    Descripción del Template
                                                </label>
                                                <textarea
                                                    placeholder="Describe qué incluye este template, sus características y cuándo usarlo..."
                                                    value={newTemplate.description}
                                                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                                                    rows={4}
                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-blue-500/10 transform focus:scale-[1.02] resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección de Precios */}
                                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 p-6 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                                <DollarSign className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className={"text-xl font-black text-slate-900 dark:text-white"}>Información de Precios</h3>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="group">
                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-green-600 transition-colors duration-300">
                                                    Precio Base (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="2500.00"
                                                    value={newTemplate.pricing.base_price}
                                                    onChange={(e) => setNewTemplate(prev => ({
                                                        ...prev,
                                                        pricing: { ...prev.pricing, base_price: e.target.value }
                                                    }))}
                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-green-300 focus:border-green-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-green-500/10 transform focus:scale-[1.02]"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            <div className="group">
                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                                                    Tarifa por Hora (€)
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="75.00"
                                                    value={newTemplate.pricing.hourly_rate}
                                                    onChange={(e) => setNewTemplate(prev => ({
                                                        ...prev,
                                                        pricing: { ...prev.pricing, hourly_rate: e.target.value }
                                                    }))}
                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-orange-500/10 transform focus:scale-[1.02]"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de Acción Espectaculares */}
                                    <div className="flex gap-4 pt-8 border-t border-white/40">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="flex-1 px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-white/60 hover:border-slate-300 text-slate-700 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group text-lg"
                                        >
                                            <span className="group-hover:scale-110 transition-transform duration-300 inline-block">Cancelar</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={createTemplate}
                                            disabled={!newTemplate.name.trim()}
                                            className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-black rounded-2xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 hover:-translate-y-1 disabled:hover:scale-100 disabled:hover:translate-y-0 transition-all duration-500 relative overflow-hidden group text-lg"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                <FileText className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                                                <span className="group-hover:scale-110 transition-transform duration-300">
                                                    Crear Template
                                                </span>
                                                <Sparkles className="w-5 h-5 group-hover:scale-125 group-hover:rotate-45 transition-all duration-300" />
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}