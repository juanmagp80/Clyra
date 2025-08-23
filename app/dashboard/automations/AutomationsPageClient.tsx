'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProtectedButton } from '@/components/ProtectedComponents';
import { executeAutomationAction, type ActionPayload } from '@/src/lib/automation-actions';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    MessageSquare,
    Phone,
    Play,
    Plus,
    Search,
    Settings,
    TrendingUp,
    Users,
    X,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TrialBanner from '../../../components/TrialBanner';
import { useTrialStatus } from '../../../src/lib/useTrialStatus';
import { useAccessControl } from '../../../src/lib/useAccessControl';

interface Automation {
    id: string;
    name: string;
    description: string;
    trigger_type: string;
    actions: any[];
    is_active: boolean;
    last_executed: string | null;
    execution_count: number;
    created_at: string;
    user_id: string;
}

interface AutomationsPageClientProps {
    userEmail: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
                {children}
            </div>
        </div>
    );
};

export default function AutomationsPageClient({ userEmail }: AutomationsPageClientProps) {
    // Hook de trial status
    const { trialInfo, loading: trialLoading, hasReachedLimit, canUseFeatures } = useTrialStatus(userEmail);
    
    // Hook de control de acceso
    const { checkAccess } = useAccessControl();
    
    const [modalOpen, setModalOpen] = useState(false);
    const [modalAutomation, setModalAutomation] = useState<Automation | null>(null);
    const [entityOptions, setEntityOptions] = useState<any[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<string>('');
    const [entityLoading, setEntityLoading] = useState(false);
    const [executionLogs, setExecutionLogs] = useState<string[]>([]);
    const [executing, setExecuting] = useState(false);
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>([]);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createSupabaseClient();

    // Verificar si Supabase está disponible
    useEffect(() => {
        if (!supabase) {
            console.log('⚠️ Supabase client not available - showing error state');
            setConnectionError('No se pudo conectar con la base de datos. Verifica la configuración.');
            setLoading(false);
            return;
        }
        console.log('✅ Supabase client initialized');
        setConnectionError(null);
    }, [supabase]);

    const handleLogout = async () => {
        try {
            if (!supabase) return;
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Función para manejar ejecución de automaciones
    const handleAutomationClick = (automation: Automation) => {
        if (!canUseFeatures) {
            alert('Tu periodo de prueba ha expirado. Actualiza tu plan para continuar usando automaciones.');
            return;
        }
        
        setModalAutomation(automation);
        setModalOpen(true);
    };

    const loadAutomations = async () => {
        try {
            console.log('📋 Loading automations...');
            setLoading(true);

            if (!supabase) {
                console.log('⚠️ No Supabase client available');
                setAutomations([]);
                setFilteredAutomations([]);
                return;
            }

            console.log('👤 Getting user...');
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                console.error('❌ Error getting user:', userError);
                return;
            }
            
            if (!user) {
                console.log('⚠️ No user found');
                return;
            }

            console.log('📊 Loading automations for user:', user.id);
            const { data, error } = await supabase
                .from('automations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error loading automations:', error);
                return;
            }

            console.log('✅ Loaded automations:', data?.length || 0);
            setAutomations(data || []);
            setFilteredAutomations(data || []);

        } catch (error) {
            console.error('❌ Error in loadAutomations:', error);
            // En caso de error, mostrar datos vacíos en lugar de fallar
            setAutomations([]);
            setFilteredAutomations([]);
        } finally {
            setLoading(false);
        }
    };

    const filterAutomations = () => {
        let filtered = automations;

        if (searchQuery) {
            filtered = filtered.filter(automation =>
                automation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                automation.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                automation.trigger_type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredAutomations(filtered);
    };

    const handleExecuteAutomation = async (automation: Automation) => {
        console.log('🚀 Preparando ejecución de automatización:', automation.name);

        if (!supabase) {
            alert('Error: Cliente Supabase no disponible');
            return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const user_id = userData?.user?.id || '';

        if (!user_id) {
            alert('Error: Usuario no autenticado');
            return;
        }

        // Abrir modal y resetear estado
        setModalAutomation(automation);
        setModalOpen(true);
        setEntityOptions([]);
        setSelectedEntity('');
        setExecutionLogs([]);
        setEntityLoading(true);
        setExecuting(false);

        // Cargar clientes con información adicional
        console.log('🔍 Cargando clientes disponibles...');

        try {
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('id, name, email, company, phone, created_at')
                .eq('user_id', user_id)
                .order('name');

            if (clientsError) {
                console.error('❌ Error cargando clientes:', clientsError);
                setExecutionLogs(['❌ Error cargando clientes: ' + clientsError.message]);
            } else {
                // Obtener información adicional para cada cliente
                const clientsWithInfo = await Promise.all(
                    (clientsData || []).map(async (client: any) => {
                        const { count: projectCount } = await supabase
                            .from('projects')
                            .select('*', { count: 'exact', head: true })
                            .eq('client_id', client.id)
                            .eq('user_id', user_id);

                        const { count: invoiceCount } = await supabase
                            .from('invoices')
                            .select('*', { count: 'exact', head: true })
                            .eq('client_id', client.id)
                            .eq('user_id', user_id);

                        return {
                            ...client,
                            projectCount: projectCount || 0,
                            invoiceCount: invoiceCount || 0,
                            displayInfo: [
                                client.company || '',
                                client.email || '',
                                `${projectCount || 0} proyectos`,
                                `${invoiceCount || 0} facturas`
                            ].filter(Boolean).join(' • ')
                        };
                    })
                );

                setEntityOptions(clientsWithInfo);
                setExecutionLogs([
                    '🔍 Cargando clientes disponibles...',
                    `✅ ${clientsWithInfo.length} clientes encontrados`,
                    `📋 Automatización: ${automation.name}`,
                    '👤 Selecciona un cliente para aplicar la automatización'
                ]);
            }
        } catch (error) {
            console.error('❌ Error:', error);
            setExecutionLogs(['❌ Error: ' + error]);
        }

        setEntityLoading(false);
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalAutomation || !selectedEntity || !supabase) return;

        // Mostrar el alert ANTES de cualquier lógica asíncrona
        const selected = entityOptions.find(opt => String(opt.id) === selectedEntity);
        if (selected && selected.email) {
            alert(`Se va a enviar el correo al cliente:\n${selected.name}\nEmail: ${selected.email}`);
            console.log('Ejecutando automatización para cliente:', selected);
        } else if (selected) {
            alert('No se ha seleccionado email de cliente.');
        }

        setExecuting(true);
        setExecutionLogs(prev => [...prev, '', '🚀 Iniciando ejecución de automatización...']);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setExecutionLogs(prev => [...prev, '❌ Usuario no autenticado.']);
                setExecuting(false);
                return;
            }

            if (!selected) {
                setExecutionLogs(prev => [...prev, '❌ No se encontró la entidad seleccionada']);
                setExecuting(false);
                return;
            }

            setExecutionLogs(prev => [...prev, `📊 Entidad seleccionada: ${selected.name || selected.invoice_number || selected.title}`]);

            // 🔍 DEBUG: Verificar estructura de la automatización
            console.log('🔍 DEBUG: Automatización completa:', modalAutomation);
            console.log('🔍 DEBUG: Actions raw:', modalAutomation.actions);
            console.log('🔍 DEBUG: Actions type:', typeof modalAutomation.actions);
            console.log('🔍 DEBUG: Actions length:', modalAutomation.actions?.length);
            
            // Parsear las acciones si están como string
            let actions = modalAutomation.actions;
            if (typeof actions === 'string') {
                console.log('🔄 DEBUG: Parseando actions string...');
                try {
                    actions = JSON.parse(actions);
                    console.log('✅ DEBUG: Actions parseadas:', actions);
                    console.log('✅ DEBUG: Actions parseadas length:', actions.length);
                } catch (parseError) {
                    console.error('❌ DEBUG: Error parseando actions:', parseError);
                    setExecutionLogs(prev => [...prev, '❌ Error: Las acciones de la automatización están mal formateadas']);
                    setExecuting(false);
                    return;
                }
            }

            // 🔍 DEBUG ADICIONAL: Verificar si las acciones están realmente vacías
            if (!actions || actions.length === 0) {
                console.error('❌ DEBUG: No hay acciones definidas para esta automatización');
                setExecutionLogs(prev => [...prev, '❌ Error: Esta automatización no tiene acciones configuradas']);
                setExecuting(false);
                return;
            } else {
                console.log('✅ DEBUG: Automatización tiene', actions.length, 'acciones configuradas');
            }

            const executionId = crypto.randomUUID();

            const payload: ActionPayload = {
                client: {
                    id: selected.id,
                    name: selected.name,
                    email: selected.email,
                    company: selected.company,
                    phone: selected.phone,
                    ...selected
                },
                automation: {
                    ...modalAutomation,
                    actions: actions // Usar las acciones parseadas
                },
                user: user,
                supabase: supabase,
                executionId: executionId
            };

            setExecutionLogs(prev => [...prev, '⚙️ Ejecutando acciones de automatización...']);

            // Convertir actions a array si es un objeto único
            const actionsArray = Array.isArray(actions) ? actions : [actions];
            console.log('🔄 DEBUG: Actions como array:', actionsArray);

            // Ejecutar cada acción de la automatización
            for (const action of actionsArray) {
                setExecutionLogs(prev => [...prev, `🔄 Ejecutando acción: ${action.name || action.type}`]);
                console.log('🔄 DEBUG: Ejecutando acción:', action);
                console.log('🔄 DEBUG: Payload completo:', payload);

                try {
                    console.log('🚀 DEBUG: Llamando executeAutomationAction...');
                    const result = await executeAutomationAction(action, payload);
                    console.log('📊 DEBUG: Resultado de executeAutomationAction:', result);
                    
                    if (result.success) {
                        setExecutionLogs(prev => [
                            ...prev,
                            `✅ Acción completada: ${action.name || action.type}`,
                            result.message ? `🟢 Detalle: ${result.message}` : ''
                        ]);
                    } else {
                        setExecutionLogs(prev => [
                            ...prev,
                            `❌ Error en acción ${action.name || action.type}:`,
                            result.message ? `🔴 Detalle: ${result.message}` : '',
                            result.error ? `🔴 Error: ${result.error}` : ''
                        ]);
                    }
                } catch (actionError) {
                    console.error('❌ ERROR CRÍTICO en acción:', actionError);
                    setExecutionLogs(prev => [...prev, `❌ Error en acción ${action.name || action.type}: ${actionError}`]);
                }
            }

            // Actualizar contador de ejecución
            const { error: updateError } = await supabase
                .from('automations')
                .update({
                    execution_count: modalAutomation.execution_count + 1,
                    last_executed: new Date().toISOString()
                })
                .eq('id', modalAutomation.id);

            if (updateError) {
                console.error('Error updating execution count:', updateError);
            }

            setExecutionLogs(prev => [...prev, '', '🎉 ¡Automatización ejecutada correctamente!']);

            // Actualizar la lista local de automatizaciones
            setAutomations(prev => prev.map(auto =>
                auto.id === modalAutomation.id
                    ? {
                        ...auto,
                        execution_count: auto.execution_count + 1,
                        last_executed: new Date().toISOString()
                    }
                    : auto
            ));

        } catch (error) {
            console.error('❌ Error ejecutando automatización:', error);
            setExecutionLogs(prev => [...prev, `❌ Error: ${error}`]);
        } finally {
            setExecuting(false);
        }
    };

    const toggleAutomation = async (automationId: string, isActive: boolean) => {
        try {
            if (!supabase) return;

            const { error } = await supabase
                .from('automations')
                .update({ is_active: !isActive })
                .eq('id', automationId);

            if (error) {
                console.error('Error toggling automation:', error);
                return;
            }

            // Actualizar estado local
            setAutomations(prev => prev.map(auto =>
                auto.id === automationId
                    ? { ...auto, is_active: !isActive }
                    : auto
            ));

        } catch (error) {
            console.error('Error toggling automation:', error);
        }
    };

    useEffect(() => {
        loadAutomations();
    }, []);

    useEffect(() => {
        filterAutomations();
    }, [searchQuery, automations]);

    const getAutomationIcon = (triggerType: string) => {
        const iconMap: { [key: string]: any } = {
            'client_onboarding': Users,
            'client_communication': MessageSquare,
            'client_feedback': TrendingUp,
            'sales_followup': Phone,
            'invoice_followup': FileText,
            'project_milestone': CheckCircle,
            'project_delivery': Calendar,
            'time_tracking': Clock,
            'budget_exceeded': AlertCircle,
            'task_assigned': Settings,
            'meeting_reminder': Calendar
        };

        return iconMap[triggerType] || Zap;
    };

    const getAutomationColor = (triggerType: string) => {
        const colorMap: { [key: string]: string } = {
            'client_onboarding': 'text-blue-600',
            'client_communication': 'text-green-600',
            'client_feedback': 'text-purple-600',
            'sales_followup': 'text-orange-600',
            'invoice_followup': 'text-red-600',
            'project_milestone': 'text-emerald-600',
            'project_delivery': 'text-indigo-600',
            'time_tracking': 'text-amber-600',
            'budget_exceeded': 'text-pink-600',
            'task_assigned': 'text-cyan-600',
            'meeting_reminder': 'text-violet-600'
        };

        return colorMap[triggerType] || 'text-slate-600';
    };

    if (connectionError) {
        return (
            <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                <div className="flex-1 ml-56 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-bold text-red-800 mb-4">Error de Conexión</h2>
                                <p className="text-red-600 mb-4">{connectionError}</p>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                <div className="flex-1 ml-56 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600">Cargando automatizaciones...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={"min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/60 dark:from-slate-900 dark:to-slate-800"}>
            {/* Trial Banner */}
            <TrialBanner userEmail={userEmail} />
            
            {/* Elementos decorativos de fondo mejorados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/4 via-purple-500/4 to-indigo-500/4 dark:from-blue-400/3 dark:via-purple-400/3 dark:to-indigo-400/3 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/4 via-pink-500/4 to-indigo-500/4 dark:from-purple-400/3 dark:via-pink-400/3 dark:to-indigo-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/4 via-blue-500/4 to-purple-500/4 dark:from-indigo-400/3 dark:via-blue-400/3 dark:to-purple-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 ml-56 overflow-hidden relative">
                <div className="h-full overflow-y-auto">
                    <div className={"min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"}>
                        <div className="container mx-auto px-6 py-8">
                            {/* Header Premium con Animaciones */}
                            <div className="mb-8 animate-slideInDown">
                                <div className={"group p-8 hover:scale-[1.01] transition-all duration-500 relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-400/5 dark:via-indigo-400/5 dark:to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 dark:shadow-blue-400/20 transform group-hover:rotate-6 transition-transform duration-500">
                                                    <Zap className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                                        Automatizaciones
                                                    </h1>
                                                    <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                                                        Automatiza tareas y flujos de trabajo
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => router.push('/dashboard/automations/create')}
                                                    disabled={!canUseFeatures}
                                                    className={`group/btn relative px-8 py-4 rounded-2xl font-bold shadow-2xl transform transition-all duration-300 flex items-center gap-3 overflow-hidden ${
                                                        !canUseFeatures
                                                            ? 'bg-gray-400 cursor-not-allowed opacity-50'
                                                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-110 hover:rotate-1'
                                                    }`}
                                                >
                                                    {!canUseFeatures ? (
                                                        <>
                                                            <div className="absolute inset-0 bg-gray-400"></div>
                                                            <X className="w-5 h-5 relative z-10 text-white" />
                                                            <span className="relative z-10 text-white">Trial Expirado</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                                            <Plus className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-300 relative z-10" />
                                                            <span className="relative z-10">Crear Automatización</span>
                                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="mb-8">
                                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 max-w-md">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                                <Input
                                                    type="text"
                                                    placeholder="Buscar automatizaciones..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white/80 border-slate-200/60 focus:border-blue-400 focus:ring-blue-400/20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Automatizaciones Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAutomations.map((automation) => {
                                    const IconComponent = getAutomationIcon(automation.trigger_type);
                                    const iconColor = getAutomationColor(automation.trigger_type);

                                    return (
                                        <Card
                                            key={automation.id}
                                            className="group bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                        >
                                            <CardHeader>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                            <IconComponent className={`w-6 h-6 ${iconColor}`} />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                                                                {automation.name}
                                                            </CardTitle>
                                                            <p className="text-sm text-slate-600 capitalize">
                                                                {automation.trigger_type.replace('_', ' ')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${automation.is_active
                                                                ? 'bg-green-500 shadow-lg shadow-green-500/50'
                                                                : 'bg-slate-300'
                                                            }`}></div>
                                                        <button
                                                            onClick={() => toggleAutomation(automation.id, automation.is_active)}
                                                            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                                                        >
                                                            {automation.is_active ? 'Activa' : 'Inactiva'}
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                                    {automation.description}
                                                </p>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-600">Acciones:</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {automation.actions?.length || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-600">Ejecuciones:</span>
                                                        <span className="font-semibold text-slate-900">
                                                            {automation.execution_count || 0}
                                                        </span>
                                                    </div>
                                                    {automation.last_executed && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-slate-600">Última ejecución:</span>
                                                            <span className="font-semibold text-slate-900">
                                                                {new Date(automation.last_executed).toLocaleDateString('es-ES')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardHeader>

                                            <CardContent className="pt-0">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => handleAutomationClick(automation)}
                                                        disabled={!automation.is_active || !canUseFeatures}
                                                        className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 ${
                                                            !canUseFeatures ? 'cursor-not-allowed' : ''
                                                        }`}
                                                        size="sm"
                                                    >
                                                        {!canUseFeatures ? (
                                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                                        ) : (
                                                            <Play className="w-4 h-4 mr-2" />
                                                        )}
                                                        {!canUseFeatures ? 'Trial Expirado' : 'Ejecutar'}
                                                    </Button>

                                                    <Button
                                                        onClick={() => router.push(`/dashboard/automations/${automation.id}/edit`)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-200 hover:bg-slate-50"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Empty State */}
                            {filteredAutomations.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Zap className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        No se encontraron automatizaciones
                                    </h3>
                                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                        {searchQuery
                                            ? 'Intenta ajustar los filtros de búsqueda'
                                            : 'Comienza creando tu primera automatización para optimizar tu flujo de trabajo'
                                        }
                                    </p>
                                    <Button
                                        onClick={() => router.push('/dashboard/automations/create')}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Crear Primera Automatización
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para ejecutar automatización */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">
                                Ejecutar Automatización
                            </h3>
                            <p className="text-slate-600 mt-1">
                                {modalAutomation?.name}
                            </p>
                        </div>
                        <button
                            onClick={() => setModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleModalSubmit}>
                        <div className="space-y-6">
                            {/* Selección de cliente */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    <Users className="h-4 w-4 inline mr-2" />
                                    Selecciona un cliente para aplicar la automatización
                                </label>

                                {entityLoading ? (
                                    <div className="text-center py-8">
                                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-slate-600 text-sm">Cargando clientes...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {entityOptions.length > 0 ? (
                                            entityOptions.map((entity) => (
                                                <div
                                                    key={entity.id}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedEntity === String(entity.id)
                                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    onClick={() => setSelectedEntity(String(entity.id))}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="selectedEntity"
                                                        value={entity.id}
                                                        checked={selectedEntity === String(entity.id)}
                                                        onChange={(e) => setSelectedEntity(e.target.value)}
                                                        className="sr-only"
                                                    />
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">
                                                                {entity.name}
                                                            </h4>
                                                            {entity.displayInfo && (
                                                                <p className="text-sm text-slate-600 mt-1">
                                                                    {entity.displayInfo}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {selectedEntity === String(entity.id) && (
                                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-slate-500">
                                                    No se encontraron clientes disponibles
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Logs de ejecución */}
                            {executionLogs.length > 0 && (
                                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                                    <h4 className="text-slate-300 font-semibold mb-3 flex items-center">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Estado de Ejecución
                                    </h4>
                                    <div className="space-y-1 max-h-64 overflow-y-auto">
                                        {executionLogs.map((log, index) => (
                                            <div
                                                key={index}
                                                className={`text-slate-300 ${log.includes('❌') ? 'text-red-400' :
                                                        log.includes('✅') ? 'text-green-400' :
                                                            log.includes('🚀') ? 'text-blue-400' :
                                                                log.includes('🔍') ? 'text-yellow-400' :
                                                                    'text-slate-300'
                                                    }`}
                                            >
                                                {log}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedEntity || entityLoading || executing}
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {executing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Ejecutando...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            Ejecutar Automatización
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
