'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Plus,
    Search,
    Filter,
    Play,
    Pause,
    Settings,
    Zap,
    Mail,
    Calendar,
    FileText,
    DollarSign,
    Clock,
    Users,
    CheckCircle,
    AlertCircle,
    Activity,
    BarChart3,
    Edit3,
    Trash2,
    Copy,
    RotateCcw,
    Bot,
    Workflow,
    Timer,
    Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Automation {
    id: string;
    name: string;
    description: string;
    trigger_type: string;
    trigger_config: any;
    actions: any[];
    is_active: boolean;
    last_executed: string | null;
    execution_count: number;
    success_rate: number;
    created_at: string;
}

interface AutomationsPageClientProps {
    userEmail: string;
}

export default function AutomationsPageClient({ userEmail }: AutomationsPageClientProps) {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        executions_today: 0,
        time_saved_hours: 0
    });
    
    const router = useRouter();
    const supabase = createSupabaseClient();

    const statusFilters = [
        { id: 'all', name: 'Todas', icon: Workflow, color: 'text-slate-600' },
        { id: 'active', name: 'Activas', icon: Play, color: 'text-green-600' },
        { id: 'inactive', name: 'Pausadas', icon: Pause, color: 'text-orange-600' },
        { id: 'error', name: 'Con Errores', icon: AlertCircle, color: 'text-red-600' }
    ];

    const automationTypes = [
        {
            id: 'client_onboarding',
            name: 'Onboarding Cliente',
            description: 'Serie de emails y tareas automáticas al ganar un nuevo cliente',
            icon: Users,
            color: 'bg-blue-500',
            estimatedTime: '2 horas'
        },
        {
            id: 'project_milestone',
            name: 'Hito de Proyecto',
            description: 'Notificaciones y facturas automáticas al completar hitos',
            icon: Target,
            color: 'bg-green-500',
            estimatedTime: '1 hora'
        },
        {
            id: 'invoice_followup',
            name: 'Seguimiento Facturas',
            description: 'Recordatorios automáticos para facturas vencidas',
            icon: DollarSign,
            color: 'bg-yellow-500',
            estimatedTime: '30 min'
        },
        {
            id: 'time_tracking',
            name: 'Control de Tiempo',
            description: 'Recordatorios para registrar tiempo y pausas automáticas',
            icon: Clock,
            color: 'bg-purple-500',
            estimatedTime: '15 min'
        },
        {
            id: 'client_communication',
            name: 'Comunicación Cliente',
            description: 'Updates automáticos de progreso y solicitud de feedback',
            icon: Mail,
            color: 'bg-indigo-500',
            estimatedTime: '45 min'
        },
        {
            id: 'project_delivery',
            name: 'Entrega de Proyecto',
            description: 'Lista de verificación y documentación automática',
            icon: CheckCircle,
            color: 'bg-emerald-500',
            estimatedTime: '1.5 horas'
        }
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

    const loadAutomations = async () => {
        try {
            setLoading(true);
            
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar automaciones del usuario
            const { data, error } = await supabase
                .from('automations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading automations:', error);
                return;
            }

            setAutomations(data || []);
            setFilteredAutomations(data || []);
            
            // Calcular estadísticas
            const total = data?.length || 0;
            const active = data?.filter(a => a.is_active).length || 0;
            const executions_today = data?.reduce((sum, a) => sum + (a.execution_count || 0), 0) || 0;
            const time_saved_hours = Math.round((executions_today * 0.5) * 10) / 10; // Estimación
            
            setStats({ total, active, executions_today, time_saved_hours });
            
        } catch (error) {
            console.error('Error loading automations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAutomations = () => {
        let filtered = automations;

        // Filtrar por búsqueda
        if (searchQuery) {
            filtered = filtered.filter(automation =>
                automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                automation.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por estado
        if (selectedStatus !== 'all') {
            if (selectedStatus === 'active') {
                filtered = filtered.filter(automation => automation.is_active);
            } else if (selectedStatus === 'inactive') {
                filtered = filtered.filter(automation => !automation.is_active);
            } else if (selectedStatus === 'error') {
                filtered = filtered.filter(automation => automation.success_rate < 0.8);
            }
        }

        setFilteredAutomations(filtered);
    };

    const toggleAutomation = async (automationId: string, currentStatus: boolean) => {
        try {
            if (!supabase) return;

            const { error } = await supabase
                .from('automations')
                .update({ is_active: !currentStatus })
                .eq('id', automationId);

            if (error) {
                console.error('Error toggling automation:', error);
                return;
            }

            await loadAutomations();
            
        } catch (error) {
            console.error('Error toggling automation:', error);
        }
    };

    const duplicateAutomation = async (automation: Automation) => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newAutomation = {
                user_id: user.id,
                name: `${automation.name} (Copia)`,
                description: automation.description,
                trigger_type: automation.trigger_type,
                trigger_config: automation.trigger_config,
                actions: automation.actions,
                is_active: false
            };

            const { error } = await supabase
                .from('automations')
                .insert([newAutomation]);

            if (error) {
                console.error('Error duplicating automation:', error);
                return;
            }

            await loadAutomations();
            
        } catch (error) {
            console.error('Error duplicating automation:', error);
        }
    };

    useEffect(() => {
        loadAutomations();
    }, []);

    useEffect(() => {
        filterAutomations();
    }, [searchQuery, selectedStatus, automations]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                                <p className="text-slate-600">Cargando automaciones...</p>
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
                            
                            {/* Header Premium */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-indigo-500/10 p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                                                    <Bot className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                                        Automaciones
                                                    </h1>
                                                    <p className="text-slate-600 font-medium">
                                                        Automatiza tareas repetitivas y ahorra horas cada semana
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => {/* Crear nueva automación */}}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transform transition-all duration-200"
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                Nueva Automación
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Dashboard */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Total Automaciones</p>
                                                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                                <Workflow className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Activas</p>
                                                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                                                <Play className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Ejecuciones Hoy</p>
                                                <p className="text-3xl font-bold text-purple-600">{stats.executions_today}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                                                <Activity className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Tiempo Ahorrado</p>
                                                <p className="text-3xl font-bold text-orange-600">{stats.time_saved_hours}h</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                                                <Timer className="w-6 h-6 text-orange-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                                                    placeholder="Buscar automaciones..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white/80 border-slate-200/60 focus:border-purple-400 focus:ring-purple-400/20"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Filters */}
                                        <div className="flex items-center gap-2 overflow-x-auto">
                                            {statusFilters.map((filter) => {
                                                const IconComponent = filter.icon;
                                                const isActive = selectedStatus === filter.id;
                                                
                                                return (
                                                    <button
                                                        key={filter.id}
                                                        onClick={() => setSelectedStatus(filter.id)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                                                            isActive
                                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                                                                : 'bg-white/80 text-slate-700 hover:bg-white hover:shadow-md'
                                                        }`}
                                                    >
                                                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : filter.color}`} />
                                                        {filter.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Automation Templates */}
                            {filteredAutomations.length === 0 && automations.length === 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Templates de Automación</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {automationTypes.map((type) => {
                                            const IconComponent = type.icon;
                                            
                                            return (
                                                <Card key={type.id} className="group bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                                    <IconComponent className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div>
                                                                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                                                                        {type.name}
                                                                    </CardTitle>
                                                                    <p className="text-sm text-slate-600">
                                                                        Ahorra {type.estimatedTime} semanales
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-sm text-slate-600 mb-4">
                                                            {type.description}
                                                        </p>
                                                    </CardHeader>
                                                    
                                                    <CardContent className="pt-0">
                                                        <Button
                                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                                            size="sm"
                                                        >
                                                            <Zap className="w-4 h-4 mr-2" />
                                                            Crear Automación
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Existing Automations */}
                            {filteredAutomations.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-slate-900">Tus Automaciones</h2>
                                    
                                    {filteredAutomations.map((automation) => (
                                        <Card key={automation.id} className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className={`w-12 h-12 ${automation.is_active ? 'bg-green-500' : 'bg-slate-400'} rounded-xl flex items-center justify-center shadow-lg`}>
                                                            <Bot className="w-6 h-6 text-white" />
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="text-lg font-bold text-slate-900">{automation.name}</h3>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                    automation.is_active 
                                                                        ? 'bg-green-100 text-green-700' 
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                    {automation.is_active ? 'Activa' : 'Pausada'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 mb-2">{automation.description}</p>
                                                            
                                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                                <span>Ejecutada {automation.execution_count} veces</span>
                                                                <span>Éxito: {(automation.success_rate * 100).toFixed(0)}%</span>
                                                                {automation.last_executed && (
                                                                    <span>Última: {formatDate(automation.last_executed)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            onClick={() => toggleAutomation(automation.id, automation.is_active)}
                                                            variant="outline"
                                                            size="sm"
                                                            className={`border-slate-200 ${
                                                                automation.is_active 
                                                                    ? 'hover:bg-orange-50 text-orange-600' 
                                                                    : 'hover:bg-green-50 text-green-600'
                                                            }`}
                                                        >
                                                            {automation.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </Button>
                                                        
                                                        <Button
                                                            onClick={() => duplicateAutomation(automation)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-slate-200 hover:bg-slate-50"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        
                                                        <Button
                                                            onClick={() => {/* Editar automación */}}
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-slate-200 hover:bg-slate-50"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {filteredAutomations.length === 0 && automations.length > 0 && (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Bot className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        No se encontraron automaciones
                                    </h3>
                                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                        Intenta ajustar los filtros de búsqueda o crear una nueva automación
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
