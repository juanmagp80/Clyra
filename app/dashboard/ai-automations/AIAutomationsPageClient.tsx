'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { Button } from '@/components/ui/Button';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import {
    AlertTriangle,
    ArrowRight,
    BarChart,
    BarChart3,
    Bot,
    Brain,
    CheckCircle,
    ChevronRight,
    Clock,
    // Crystal,
    DollarSign,
    FileText,
    Lightbulb,
    Mail,
    MessageSquare,
    Pause,
    Play,
    Search,
    Settings,
    Shield,
    Star,
    Target,
    TrendingUp,
    Users,
    X,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface AIAutomation {
    id: string;
    name: string;
    description: string;
    category: 'client_management' | 'sales' | 'productivity' | 'insights';
    type: string;
    status: 'active' | 'inactive' | 'learning';
    confidence: number;
    successRate: number;
    executionCount: number;
    aiFeatures: string[];
    icon: any;
    color: string;
    isNew?: boolean;
    isPremium?: boolean;
}

interface AIAutomationsPageClientProps {
    userEmail: string;
}

export default function AIAutomationsPageClient({ userEmail }: AIAutomationsPageClientProps) {
    const router = useRouter();
    const { canUseFeatures } = useTrialStatus(userEmail);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [aiAutomations, setAIAutomations] = useState<AIAutomation[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para manejar la ejecución y modales
    const [executing, setExecuting] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentAutomation, setCurrentAutomation] = useState<AIAutomation | null>(null);
    const [modalData, setModalData] = useState<{ [key: string]: any }>({});
    const [userClients, setUserClients] = useState<any[]>([]);
    const [userProjects, setUserProjects] = useState<any[]>([]);
    const [userProposals, setUserProposals] = useState<any[]>([]);
    const [userBudgets, setUserBudgets] = useState<any[]>([]);
    const [executionResults, setExecutionResults] = useState<{ [key: string]: any }>({});
    const [recentInsights, setRecentInsights] = useState<any[]>([]);
    const [showingResults, setShowingResults] = useState(false);

    // Estado para verificar mensajes de clientes
    const [clientMessagesCount, setClientMessagesCount] = useState<{ [key: string]: number }>({});

    // Estado para modal de resultados detallados
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [currentResults, setCurrentResults] = useState<any>(null);

    // Estado para toasts
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        show: false,
        message: '',
        type: 'info'
    });

    // Función para mostrar toast
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    // Función para toggle del detector automático
    const toggleAutoDetector = async (automationId: string, currentStatus: string) => {
        if (!canUseFeatures) {
            showToast('⭐ Esta función requiere un plan PRO.', 'warning');
            return;
        }

        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        // Actualizar el estado local inmediatamente
        setAIAutomations(prev => prev.map(automation =>
            automation.id === automationId
                ? { ...automation, status: newStatus as 'active' | 'inactive' | 'learning' }
                : automation
        ));

        if (newStatus === 'active') {
            // Cuando se activa, ejecutar inmediatamente una detección con envío de emails
            await executeAutoDetectorWithEmails();
            showToast('🔍 Detector de Eventos Automático ACTIVADO. Se ejecutará cada hora y se han enviado emails para eventos recientes.', 'success');
        } else {
            showToast('⏸️ Detector de Eventos Automático DESACTIVADO. No se ejecutarán detecciones automáticas.', 'info');
        }
    };

    // Función para ejecutar el detector automático con envío real de emails
    const executeAutoDetectorWithEmails = async () => {
        try {
            // Obtener user ID del usuario autenticado
            const supabase = createSupabaseClient();
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error('Usuario no autenticado. Por favor inicia sesión.');
            }

            showToast('🤖 Ejecutando detector automático y enviando emails...', 'info');

            // Usar directamente el ID del usuario en lugar del email
            const response = await fetch('/api/ai/send-auto-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id, // Usar ID directamente en lugar de email
                    hours: 24,
                    sendEmails: true
                })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('❌ Error del servidor:', result);
                throw new Error(result.error || 'Error ejecutando detector automático');
            }

            // Mostrar resultado detallado
            const message = `🎉 Detector ejecutado exitosamente!\n\n` +
                `📊 Eventos procesados: ${result.processedEvents}\n` +
                `📧 Emails enviados: ${result.emailsSent}\n` +
                `👤 Usuario: ${result.userInfo?.name || result.userInfo?.email || user.email}`;

            showToast(message, 'success');

            // Actualizar insights recientes
            fetchRecentInsights();

        } catch (error) {
            console.error('❌ Error ejecutando detector automático:', error);
            showToast(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        }
    };

    // Función para validar si los datos del modal están completos
    const isModalDataValid = () => {
        if (!currentAutomation) return false;

        switch (currentAutomation.type) {
            case 'sentiment_analysis':
                return modalData.text?.trim();
            case 'communication_optimization':
                return modalData.originalMessage?.trim();
            case 'proposal_analysis':
                return modalData.proposalId; // Solo necesita que haya una propuesta seleccionada
            case 'content_generation':
                return modalData.topic?.trim() && modalData.contentType?.trim();
            case 'conversation_analysis':
                // Validar que hay cliente y que tiene mensajes
                return modalData.clientId && clientMessagesCount[modalData.clientId] > 0;
            case 'risk_detection':
                return modalData.projectId;
            case 'performance_analysis':
                return modalData.period;
            case 'pricing_optimization':
                return modalData.budgetId;
            // 🔄 NUEVOS WORKFLOWS
            case 'smart_email':
                return modalData.trigger?.trim() && modalData.context;
            case 'auto_detect':
                return true; // No requiere datos específicos
            case 'dynamic_form':
                return modalData.purpose?.trim() && modalData.context;
            case 'smart_meeting':
                return modalData.purpose?.trim() && modalData.participants?.length > 0;
            case 'calendar_link':
                return modalData.event_type?.trim() && modalData.duration;
            default:
                return false;
        }
    };

    // Función para renderizar el contenido específico de cada modal
    const renderModalContent = () => {
        if (!currentAutomation) return null;

        switch (currentAutomation.type) {
            case 'sentiment_analysis':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Texto de feedback del cliente *
                            </label>
                            <textarea
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Introduce el feedback del cliente que quieres analizar..."
                                value={modalData.text || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, text: e.target.value }))}
                            />
                        </div>
                        {userClients.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Asociar con cliente (opcional)
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.clientId || ''}
                                    onChange={(e) => setModalData(prev => ({ ...prev, clientId: e.target.value || null }))}
                                >
                                    <option value="">No asociar con cliente</option>
                                    {userClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                );

            case 'communication_optimization':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensaje original *
                            </label>
                            <textarea
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Introduce el mensaje que quieres optimizar..."
                                value={modalData.originalMessage || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, originalMessage: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contexto del mensaje
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: propuesta comercial, seguimiento de proyecto..."
                                value={modalData.context || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, context: e.target.value }))}
                            />
                        </div>
                        {userClients.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cliente objetivo (opcional)
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.clientId || ''}
                                    onChange={(e) => setModalData(prev => ({ ...prev, clientId: e.target.value || null }))}
                                >
                                    <option value="">Mensaje general</option>
                                    {userClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                );

            case 'proposal_analysis':
                return (
                    <div className="space-y-6">
                        {/* Paso 1: Seleccionar Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paso 1: Selecciona el cliente *
                            </label>
                            {userClients.length > 0 ? (
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.selectedClientId || ''}
                                    onChange={(e) => {
                                        const clientId = e.target.value;
                                        setModalData(prev => ({
                                            ...prev,
                                            selectedClientId: clientId,
                                            proposalId: '' // Reset propuesta cuando cambia cliente
                                        }));
                                    }}
                                >
                                    <option value="">Selecciona un cliente...</option>
                                    {userClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} {client.company ? `(${client.company})` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 text-sm">
                                        No tienes clientes registrados. Las propuestas se mostrarán por nombre del prospecto.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Paso 2: Seleccionar Propuesta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paso 2: Selecciona la propuesta a analizar *
                            </label>
                            {userProposals.length > 0 ? (
                                <div>
                                    {/* Filtrar propuestas por cliente seleccionado */}
                                    {(() => {
                                        const selectedClient = userClients.find(c => c.id === modalData.selectedClientId);
                                        const filteredProposals = modalData.selectedClientId && selectedClient
                                            ? userProposals.filter(p =>
                                                p.prospect_name?.toLowerCase().includes(selectedClient.name.toLowerCase()) ||
                                                p.prospect_email?.toLowerCase().includes(selectedClient.email?.toLowerCase() || '')
                                            )
                                            : userProposals;

                                        if (modalData.selectedClientId && filteredProposals.length === 0) {
                                            return (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                    <p className="text-orange-800 text-sm mb-2">
                                                        No se encontraron propuestas para este cliente.
                                                    </p>
                                                    <p className="text-orange-700 text-xs">
                                                        Tip: Puedes seleccionar "Todos los clientes" para ver todas las propuestas disponibles.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <select
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={modalData.proposalId || ''}
                                                onChange={(e) => setModalData(prev => ({ ...prev, proposalId: e.target.value }))}
                                            >
                                                <option value="">
                                                    {modalData.selectedClientId
                                                        ? 'Selecciona una propuesta de este cliente...'
                                                        : 'Selecciona cualquier propuesta...'
                                                    }
                                                </option>
                                                {filteredProposals.map((proposal) => (
                                                    <option key={proposal.id} value={proposal.id}>
                                                        📄 {proposal.title} • {proposal.prospect_name || 'Sin cliente'} •
                                                        {proposal.status} • {proposal.total_amount} {proposal.currency} •
                                                        {new Date(proposal.created_at).toLocaleDateString('es-ES')}
                                                    </option>
                                                ))}

                                                {/* Opción para ver todas las propuestas */}
                                                {modalData.selectedClientId && (
                                                    <optgroup label="— O selecciona de todas las propuestas —">
                                                        {userProposals.filter(p => !filteredProposals.includes(p)).map((proposal) => (
                                                            <option key={proposal.id} value={proposal.id}>
                                                                📄 {proposal.title} • {proposal.prospect_name || 'Sin cliente'} •
                                                                {proposal.status} • {proposal.total_amount} {proposal.currency}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">No tienes propuestas creadas aún</p>
                                    <p className="text-sm text-gray-500">
                                        Ve a la sección de Propuestas para crear tu primera propuesta y luego podrás analizarla aquí.
                                    </p>
                                    <Button
                                        onClick={() => router.push('/dashboard/proposals')}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Ir a Propuestas
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Información de la propuesta seleccionada */}
                        {modalData.proposalId && (() => {
                            const selectedProposal = userProposals.find(p => p.id === modalData.proposalId);
                            if (!selectedProposal) return null;

                            return (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-blue-900">Propuesta Seleccionada</h4>
                                            <p className="text-sm text-blue-700">{selectedProposal.title}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-blue-700">Cliente:</span>
                                            <span className="font-medium text-blue-900 ml-2">{selectedProposal.prospect_name || 'No especificado'}</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Valor:</span>
                                            <span className="font-medium text-blue-900 ml-2">{selectedProposal.total_amount} {selectedProposal.currency}</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Estado:</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${selectedProposal.status === 'sent' ? 'bg-orange-100 text-orange-800' :
                                                    selectedProposal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                        selectedProposal.status === 'viewed' ? 'bg-purple-100 text-purple-800' :
                                                            selectedProposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                                'bg-red-100 text-red-800'
                                                }`}>
                                                {selectedProposal.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-blue-700">Creada:</span>
                                            <span className="font-medium text-blue-900 ml-2">{new Date(selectedProposal.created_at).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                        {modalData.proposalId && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <Brain className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-900 text-lg">🤖 Análisis IA Completo</h4>
                                        <p className="text-green-700 text-sm">OpenAI analizará automáticamente toda tu propuesta</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-green-900">📊 Métricas y Puntuación:</h5>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• <strong>Puntuación general</strong> (1-10)</li>
                                            <li>• <strong>Probabilidad de éxito</strong> estimada</li>
                                            <li>• <strong>Nivel de competitividad</strong> del precio</li>
                                            <li>• <strong>Análisis vs mercado</strong></li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-green-900">💡 Recomendaciones IA:</h5>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• <strong>Fortalezas</strong> identificadas</li>
                                            <li>• <strong>Áreas de mejora</strong> específicas</li>
                                            <li>• <strong>Sugerencias concretas</strong> de optimización</li>
                                            <li>• <strong>Tips de conversión</strong> personalizados</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border border-green-100">
                                    <p className="text-sm text-green-800 flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        <strong>¡Sin escribir nada!</strong> La IA examinará automáticamente todos los campos de tu propuesta: servicios, precios, términos, timeline y más.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'conversation_analysis':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seleccionar Cliente *
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={modalData.clientId || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, clientId: e.target.value }))}
                            >
                                <option value="">Seleccionar cliente para analizar...</option>
                                {userClients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name} {client.company && `(${client.company})`}
                                        {client.messageCount !== undefined && ` - ${client.messageCount} mensajes`}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500 mt-2">
                                🤖 La IA analizará <strong>automáticamente</strong> toda la conversación con este cliente y proporcionará insights detallados.
                            </p>
                        </div>

                        {/* Advertencia si el cliente seleccionado no tiene mensajes */}
                        {modalData.clientId && clientMessagesCount[modalData.clientId] === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <h5 className="font-medium text-yellow-900">Sin mensajes disponibles</h5>
                                </div>
                                <p className="text-sm text-yellow-700 mb-3">
                                    Este cliente no tiene mensajes registrados en el sistema. Para poder analizar la conversación, necesitas:
                                </p>
                                <ul className="text-sm text-yellow-700 space-y-1 ml-4">
                                    <li>• Ir a la sección <strong>Clientes</strong></li>
                                    <li>• Agregar algunos mensajes de conversación</li>
                                    <li>• Volver aquí para ejecutar el análisis</li>
                                </ul>
                                <div className="mt-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setShowModal(false);
                                            router.push('/dashboard/clients');
                                        }}
                                        className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                                    >
                                        📝 Ir a Clientes
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Información del cliente seleccionado con mensajes */}
                        {modalData.clientId && clientMessagesCount[modalData.clientId] > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <h5 className="font-medium text-green-900">Cliente listo para análisis</h5>
                                </div>
                                <p className="text-sm text-green-700">
                                    <strong>{userClients.find(c => c.id === modalData.clientId)?.name}</strong> tiene{' '}
                                    <strong>{clientMessagesCount[modalData.clientId]} mensajes</strong> disponibles para analizar.
                                    La IA procesará toda la conversación histórica y generará insights detallados.
                                </p>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Brain className="h-6 w-6 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-blue-900">Análisis Automático con IA</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-blue-900">📊 Análisis de Comunicación:</h5>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Tono general de la conversación</li>
                                        <li>• Nivel de satisfacción del cliente</li>
                                        <li>• Frecuencia y calidad de interacciones</li>
                                        <li>• Puntos de tensión o conflicto</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-blue-900">💡 Recomendaciones IA:</h5>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Áreas de mejora específicas</li>
                                        <li>• Sugerencias de próximos pasos</li>
                                        <li>• Propuesta de mensaje optimizado</li>
                                        <li>• Estrategias de relación cliente</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <Zap className="h-4 w-4" />
                                    <strong>Sin escribir nada:</strong> Solo selecciona el cliente y la IA analizará automáticamente toda la conversación histórica.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'content_generation':
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de contenido *
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.contentType || ''}
                                    onChange={(e) => setModalData(prev => ({ ...prev, contentType: e.target.value }))}
                                >
                                    <option value="">Seleccionar tipo</option>
                                    <option value="email">Email</option>
                                    <option value="propuesta">Propuesta</option>
                                    <option value="post">Post</option>
                                    <option value="artículo">Artículo</option>
                                    <option value="presentación">Presentación</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tono
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.tone || 'professional'}
                                    onChange={(e) => setModalData(prev => ({ ...prev, tone: e.target.value }))}
                                >
                                    <option value="professional">Profesional</option>
                                    <option value="casual">Casual</option>
                                    <option value="friendly">Amigable</option>
                                    <option value="formal">Formal</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tema/tópico *
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="¿Sobre qué tema quieres generar contenido?"
                                value={modalData.topic || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, topic: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Audiencia objetivo
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: clientes potenciales, equipo interno..."
                                value={modalData.targetAudience || 'clientes'}
                                onChange={(e) => setModalData(prev => ({ ...prev, targetAudience: e.target.value }))}
                            />
                        </div>
                    </div>
                );

            case 'risk_detection':
                return (
                    <div className="space-y-6">
                        {/* Paso 1: Seleccionar Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paso 1: Selecciona el cliente *
                            </label>
                            {userClients.length > 0 ? (
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.selectedClientId || ''}
                                    onChange={(e) => {
                                        const clientId = e.target.value;
                                        setModalData(prev => ({ 
                                            ...prev, 
                                            selectedClientId: clientId,
                                            projectId: '' // Reset proyecto cuando cambia cliente
                                        }));
                                    }}
                                >
                                    <option value="">Selecciona un cliente...</option>
                                    {userClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} {client.company ? `(${client.company})` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 text-sm">
                                        No tienes clientes registrados. Los proyectos se mostrarán sin filtrar por cliente.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Paso 2: Seleccionar Proyecto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paso 2: Selecciona el proyecto a analizar *
                            </label>
                            {userProjects.length > 0 ? (
                                <div>
                                    {/* Filtrar proyectos por cliente seleccionado */}
                                    {(() => {
                                        const selectedClient = userClients.find(c => c.id === modalData.selectedClientId);
                                        const filteredProjects = modalData.selectedClientId && selectedClient
                                            ? userProjects.filter(p => p.client_id === modalData.selectedClientId)
                                            : userProjects;

                                        if (modalData.selectedClientId && filteredProjects.length === 0) {
                                            return (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                    <p className="text-orange-800 text-sm mb-2">
                                                        No se encontraron proyectos para este cliente.
                                                    </p>
                                                    <p className="text-orange-700 text-xs">
                                                        Tip: Puedes seleccionar "Todos los proyectos" para ver todos los proyectos disponibles.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <select
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={modalData.projectId || ''}
                                                onChange={(e) => setModalData(prev => ({ ...prev, projectId: e.target.value }))}
                                            >
                                                <option value="">
                                                    {modalData.selectedClientId 
                                                        ? 'Selecciona un proyecto de este cliente...' 
                                                        : 'Selecciona cualquier proyecto...'
                                                    }
                                                </option>
                                                {filteredProjects.map((project) => (
                                                    <option key={project.id} value={project.id}>
                                                        🏗️ {project.name} • 
                                                        {project.status} • 
                                                        {project.budget ? `${project.budget} ${project.currency || 'EUR'}` : 'Sin presupuesto'} •
                                                        {new Date(project.created_at).toLocaleDateString('es-ES')}
                                                    </option>
                                                ))}
                                                
                                                {/* Opción para ver todos los proyectos */}
                                                {modalData.selectedClientId && (
                                                    <optgroup label="— O selecciona de todos los proyectos —">
                                                        {userProjects.filter(p => !filteredProjects.includes(p)).map((project) => (
                                                            <option key={project.id} value={project.id}>
                                                                🏗️ {project.name} • {project.status} • 
                                                                {project.budget ? `${project.budget} ${project.currency || 'EUR'}` : 'Sin presupuesto'}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">No tienes proyectos creados aún</p>
                                    <p className="text-sm text-gray-500">
                                        Ve a la sección de Proyectos para crear tu primer proyecto y luego podrás analizarlo aquí.
                                    </p>
                                    <Button
                                        onClick={() => router.push('/dashboard/projects')}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Ir a Proyectos
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Información del proyecto seleccionado */}
                        {modalData.projectId && (() => {
                            const selectedProject = userProjects.find(p => p.id === modalData.projectId);
                            if (!selectedProject) return null;
                            
                            return (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-red-900">Proyecto Seleccionado para Análisis</h4>
                                            <p className="text-sm text-red-700">{selectedProject.name}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-red-700">Estado:</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                                selectedProject.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                selectedProject.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                selectedProject.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {selectedProject.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-red-700">Presupuesto:</span>
                                            <span className="font-medium text-red-900 ml-2">
                                                {selectedProject.budget ? `${selectedProject.budget} ${selectedProject.currency || 'EUR'}` : 'No especificado'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-red-700">Progreso:</span>
                                            <span className="font-medium text-red-900 ml-2">{selectedProject.progress || 0}%</span>
                                        </div>
                                        <div>
                                            <span className="text-red-700">Creado:</span>
                                            <span className="font-medium text-red-900 ml-2">{new Date(selectedProject.created_at).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {modalData.projectId && (
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-red-900 text-lg">⚠️ Análisis de Riesgos IA</h4>
                                        <p className="text-red-700 text-sm">OpenAI analizará automáticamente todos los aspectos del proyecto</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-red-900">🎯 Detección de Riesgos:</h5>
                                        <ul className="text-sm text-red-700 space-y-1">
                                            <li>• <strong>Nivel de riesgo general</strong> (1-10)</li>
                                            <li>• <strong>Riesgos identificados</strong> por categoría</li>
                                            <li>• <strong>Problemas críticos</strong> detectados</li>
                                            <li>• <strong>Probabilidad de éxito</strong> estimada</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-red-900">🛡️ Planes de Mitigación:</h5>
                                        <ul className="text-sm text-red-700 space-y-1">
                                            <li>• <strong>Acciones específicas</strong> para cada riesgo</li>
                                            <li>• <strong>Señales de alerta temprana</strong></li>
                                            <li>• <strong>Recomendaciones</strong> preventivas</li>
                                            <li>• <strong>Próximas acciones</strong> inmediatas</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border border-red-100">
                                    <p className="text-sm text-red-800 flex items-center gap-2">
                                        <Brain className="h-4 w-4" />
                                        <strong>¡Análisis automático completo!</strong> La IA examinará proyecto, tareas, timeline, presupuesto y más para detectar riesgos potenciales.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'pricing_optimization':
                return (
                    <div className="space-y-6">
                        {/* Paso 1: Seleccionar Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paso 1: Selecciona el cliente *
                            </label>
                            {userClients.length > 0 ? (
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.selectedClientId || ''}
                                    onChange={(e) => {
                                        const clientId = e.target.value;
                                        setModalData(prev => ({ 
                                            ...prev, 
                                            selectedClientId: clientId,
                                            budgetId: '' // Reset presupuesto cuando cambia cliente
                                        }));
                                    }}
                                >
                                    <option value="">Selecciona un cliente...</option>
                                    {userClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} {client.company ? `(${client.company})` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-800 text-sm">
                                        No tienes clientes registrados. Los presupuestos se mostrarán sin filtrar por cliente.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Paso 2: Seleccionar Presupuesto */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Paso 2: Selecciona el presupuesto a optimizar *
                            </label>
                            {userBudgets.length > 0 ? (
                                <div>
                                    {(() => {
                                        const selectedClient = userClients.find(c => c.id === modalData.selectedClientId);
                                        const filteredBudgets = modalData.selectedClientId && selectedClient
                                            ? userBudgets.filter(b => b.client?.id === modalData.selectedClientId)
                                            : userBudgets;

                                        if (modalData.selectedClientId && filteredBudgets.length === 0) {
                                            return (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                                    <p className="text-orange-800 text-sm mb-2">
                                                        No se encontraron presupuestos para este cliente.
                                                    </p>
                                                    <p className="text-orange-700 text-xs">
                                                        Tip: Puedes seleccionar "Todos los presupuestos" para ver todos los presupuestos disponibles.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <select
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={modalData.budgetId || ''}
                                                onChange={(e) => setModalData(prev => ({ ...prev, budgetId: e.target.value }))}
                                            >
                                                <option value="">
                                                    {modalData.selectedClientId 
                                                        ? 'Selecciona un presupuesto de este cliente...' 
                                                        : 'Selecciona cualquier presupuesto...'
                                                    }
                                                </option>
                                                {filteredBudgets.map((budget: any) => (
                                                    <option key={budget.id} value={budget.id}>
                                                        💰 {budget.title} • 
                                                        {budget.status} • 
                                                        €{budget.total_amount?.toLocaleString() || '0'} •
                                                        {new Date(budget.created_at).toLocaleDateString('es-ES')}
                                                    </option>
                                                ))}
                                                
                                                {/* Opción para ver todos los presupuestos */}
                                                {modalData.selectedClientId && (
                                                    <optgroup label="— O selecciona de todos los presupuestos —">
                                                        {userBudgets.filter(b => !filteredBudgets.includes(b)).map((budget: any) => (
                                                            <option key={budget.id} value={budget.id}>
                                                                💰 {budget.title} • {budget.status} • 
                                                                €{budget.total_amount?.toLocaleString() || '0'}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </select>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                    <DollarSign className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">No tienes presupuestos creados aún</p>
                                    <p className="text-sm text-gray-500">
                                        Ve a la sección de Presupuestos para crear tu primer presupuesto y luego podrás optimizarlo aquí.
                                    </p>
                                    <Button
                                        onClick={() => router.push('/dashboard/budgets')}
                                        className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Ir a Presupuestos
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Información del presupuesto seleccionado */}
                        {modalData.budgetId && (() => {
                            const selectedBudget = userBudgets.find(b => b.id === modalData.budgetId);
                            if (!selectedBudget) return null;
                            
                            return (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-green-900">Presupuesto Seleccionado para Optimización</h4>
                                            <p className="text-sm text-green-700">{selectedBudget.title}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-green-700">Estado:</span>
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                                selectedBudget.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                selectedBudget.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                                selectedBudget.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {selectedBudget.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Total:</span>
                                            <span className="font-medium text-green-900 ml-2">
                                                €{selectedBudget.total_amount?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Cliente:</span>
                                            <span className="font-medium text-green-900 ml-2">
                                                {selectedBudget.client?.name || 'No especificado'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Creado:</span>
                                            <span className="font-medium text-green-900 ml-2">{new Date(selectedBudget.created_at).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {modalData.budgetId && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-green-900 text-lg">💰 Optimización de Precios IA</h4>
                                        <p className="text-green-700 text-sm">OpenAI analizará el mercado y tu historial para optimizar precios</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-green-900">📊 Análisis de Mercado:</h5>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• <strong>Precios competitivos</strong> del sector</li>
                                            <li>• <strong>Posicionamiento</strong> vs competencia</li>
                                            <li>• <strong>Tendencias</strong> del mercado actual</li>
                                            <li>• <strong>Evaluación de valor</strong> percibido</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-green-900">💡 Recomendaciones:</h5>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>• <strong>Ajustes específicos</strong> por item</li>
                                            <li>• <strong>Estrategias de pricing</strong> personalizadas</li>
                                            <li>• <strong>Servicios adicionales</strong> sugeridos</li>
                                            <li>• <strong>Impacto financiero</strong> proyectado</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border border-green-100">
                                    <p className="text-sm text-green-800 flex items-center gap-2">
                                        <Brain className="h-4 w-4" />
                                        <strong>¡Optimización inteligente!</strong> La IA analizará cada item del presupuesto, comparará con datos de mercado y sugerirá mejoras específicas.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'performance_analysis':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Período de análisis *
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={modalData.period || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, period: e.target.value }))}
                            >
                                <option value="">Seleccionar período</option>
                                <option value="last_7_days">Últimos 7 días</option>
                                <option value="last_30_days">Últimos 30 días</option>
                                <option value="last_90_days">Últimos 90 días</option>
                            </select>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                                📊 Análisis incluido:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Productividad y tiempos de trabajo</li>
                                <li>• Progreso de proyectos y tareas</li>
                                <li>• Interacciones con clientes</li>
                                <li>• Ingresos y propuestas</li>
                                <li>• Insights y recomendaciones personalizadas</li>
                            </ul>
                        </div>
                    </div>
                );

            case 'pricing_optimization':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de proyecto *
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: desarrollo web, diseño logo, consultoría..."
                                value={modalData.projectType || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, projectType: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Alcance del proyecto *
                            </label>
                            <textarea
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe brevemente el alcance del proyecto..."
                                value={modalData.scope || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, scope: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Precio actual (€) *
                            </label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1500"
                                value={modalData.currentPrice || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, currentPrice: e.target.value }))}
                            />
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-green-900 mb-2">
                                💰 Análisis de precios incluye:
                            </h4>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>• Comparación con precios de mercado</li>
                                <li>• Análisis de rentabilidad</li>
                                <li>• Sugerencias de optimización</li>
                                <li>• Estrategias de posicionamiento</li>
                            </ul>
                        </div>
                    </div>
                );

            // 🔄 NUEVOS WORKFLOWS AUTOMÁTICOS
            case 'smart_email':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de evento/trigger *
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={modalData.trigger || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, trigger: e.target.value }))}
                            >
                                <option value="">Seleccionar evento</option>
                                <option value="contract_signed">Contrato firmado</option>
                                <option value="payment_received">Pago recibido</option>
                                <option value="project_completed">Proyecto completado</option>
                                <option value="meeting_scheduled">Reunión programada</option>
                                <option value="deadline_approaching">Fecha límite próxima</option>
                                <option value="invoice_sent">Factura enviada</option>
                                <option value="client_onboarding">Bienvenida cliente nuevo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contexto del evento *
                            </label>
                            <textarea
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: Cliente Juan Pérez firmó contrato de desarrollo web por €5000..."
                                value={modalData.context || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, context: e.target.value }))}
                            />
                        </div>
                        {userClients.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cliente relacionado (opcional)
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.clientId || ''}
                                    onChange={(e) => setModalData(prev => ({ ...prev, clientId: e.target.value || null }))}
                                >
                                    <option value="">No especificar cliente</option>
                                    {userClients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                );

            case 'auto_detect':
                // Importar el componente detector mejorado
                const DetectorMejoradoUI = React.lazy(() => import('@/components/detector-mejorado-ui-simple'));

                return (
                    <React.Suspense fallback={<div className="p-4 text-center">Cargando detector...</div>}>
                        <DetectorMejoradoUI
                            userId={userEmail}
                            userEmail={userEmail}
                        />
                    </React.Suspense>
                );

            case 'dynamic_form':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Propósito del formulario *
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={modalData.purpose || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, purpose: e.target.value }))}
                            >
                                <option value="">Seleccionar propósito</option>
                                <option value="client_intake">Captación de cliente nuevo</option>
                                <option value="project_brief">Brief de proyecto</option>
                                <option value="feedback_collection">Recolección de feedback</option>
                                <option value="change_request">Solicitud de cambios</option>
                                <option value="meeting_preparation">Preparación de reunión</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contexto específico *
                            </label>
                            <textarea
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: Formulario para proyecto de ecommerce, cliente tecnológico, presupuesto €10K..."
                                value={modalData.context || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, context: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Industria del cliente (opcional)
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: tecnología, retail, salud..."
                                value={modalData.industry || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, industry: e.target.value }))}
                            />
                        </div>
                    </div>
                );

            case 'smart_meeting':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Propósito de la reunión *
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={modalData.purpose || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, purpose: e.target.value }))}
                            >
                                <option value="">Seleccionar propósito</option>
                                <option value="project_kickoff">Inicio de proyecto</option>
                                <option value="client_check_in">Seguimiento con cliente</option>
                                <option value="project_review">Revisión de proyecto</option>
                                <option value="problem_solving">Resolución de problemas</option>
                                <option value="contract_discussion">Discusión de contrato</option>
                                <option value="feedback_session">Sesión de feedback</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Participantes *
                            </label>
                            <textarea
                                className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: Juan Pérez (CEO), María García (PM), Carlos López (Desarrollador)..."
                                value={modalData.participants || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, participants: e.target.value.split(',').filter(p => p.trim()) }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contexto del proyecto/tema *
                            </label>
                            <textarea
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: Desarrollo de app móvil, fase de diseño UX, problemas con la integración API..."
                                value={modalData.context || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, context: e.target.value }))}
                            />
                        </div>
                    </div>
                );

            case 'calendar_link':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de evento *
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={modalData.event_type || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, event_type: e.target.value }))}
                            >
                                <option value="">Seleccionar tipo</option>
                                <option value="consultation">Consulta inicial</option>
                                <option value="project_meeting">Reunión de proyecto</option>
                                <option value="review_session">Sesión de revisión</option>
                                <option value="discovery_call">Llamada de descubrimiento</option>
                                <option value="feedback_meeting">Reunión de feedback</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duración (minutos) *
                            </label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={modalData.duration || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                            >
                                <option value="">Seleccionar duración</option>
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">60 minutos</option>
                                <option value="90">90 minutos</option>
                                <option value="120">120 minutos</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contexto específico *
                            </label>
                            <textarea
                                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: Cliente interesado en rediseño web, presupuesto aprox €8K, timeline 3 meses..."
                                value={modalData.context || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, context: e.target.value }))}
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-gray-500">
                            Tipo de automatización no implementado: {currentAutomation.type}
                        </p>
                    </div>
                );
        }
    };

    // Función principal para iniciar automatizaciones IA
    const handleAutomationExecution = async (automation: AIAutomation) => {
        if (!canUseFeatures) {
            showToast('⭐ Esta función requiere un plan PRO. ¡Actualiza para acceder a automatizaciones IA reales!', 'warning');
            return;
        }

        // Caso especial: Detector de eventos automático
        if (automation.type === 'auto_detect') {
            // Para el detector automático solo mostramos información
            showToast('🔍 El Detector de Eventos Automático está configurado para ejecutarse cada hora. Usa los botones Activar/Desactivar para controlarlo.', 'info');
            return;
        }

        // Preparar datos necesarios para el modal
        const clients = await fetchUserClients();
        const projects = await fetchUserProjects();
        setUserClients(clients);
        setUserProjects(projects);

        // Mostrar modal específico según el tipo
        setCurrentAutomation(automation);
        setModalData({});
        setShowModal(true);
    };

    // Función para ejecutar la automatización con los datos del modal
    const executeAutomation = async () => {
        if (!currentAutomation) return;

        setExecuting(currentAutomation.id);
        setShowModal(false);

        try {
            console.log('🤖 Executing real AI automation:', currentAutomation.name);

            let requestData: any = {};
            let automationType = '';

            // Configurar según el tipo de automatización
            switch (currentAutomation.type) {
                case 'sentiment_analysis':
                    automationType = 'sentiment_analysis';
                    requestData = {
                        text: modalData.text,
                        clientId: modalData.clientId,
                        source: 'manual_analysis'
                    };
                    break;

                case 'communication_optimization':
                    automationType = 'communication_optimization';
                    requestData = {
                        originalMessage: modalData.originalMessage,
                        context: modalData.context,
                        clientId: modalData.clientId,
                        purpose: 'optimization'
                    };
                    break;

                case 'proposal_analysis':
                    // Para análisis de propuesta, usar endpoint específico directamente
                    console.log('📊 Executing proposal analysis...');

                    const proposalResponse = await fetch('/api/ai/analyze-proposal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            proposalId: modalData.proposalId
                        })
                    });

                    const proposalResult = await proposalResponse.json();

                    if (!proposalResponse.ok) {
                        throw new Error(proposalResult.error || 'Error analizando propuesta');
                    }

                    // Guardar resultado
                    if (proposalResult) {
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: proposalResult
                        }));
                    }

                    showToast(
                        `📊 Análisis completado para "${proposalResult.proposal.title}"! Puntuación: ${proposalResult.analysis.overall_score}/10`,
                        'success'
                    );

                    // Mostrar botón para ver detalles del resultado
                    setTimeout(() => {
                        showToast(
                            '📋 Análisis guardado. Haz clic en "Ver Resultados" en la tarjeta de la automatización para ver las recomendaciones completas.',
                            'info'
                        );
                    }, 3000);

                    fetchRecentInsights(); // Actualizar insights
                    setExecuting(null);
                    return; // Salir aquí para evitar el flujo normal

                case 'content_generation':
                    automationType = 'content_generation';
                    requestData = {
                        contentType: modalData.contentType,
                        topic: modalData.topic,
                        targetAudience: modalData.targetAudience,
                        tone: modalData.tone
                    };
                    break;

                case 'conversation_analysis':
                    // Para análisis de conversación, usar endpoint específico directamente
                    console.log('🧠 Executing conversation analysis...');

                    const convResponse = await fetch('/api/ai/optimize-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            clientId: modalData.clientId,
                            action: 'analyze'
                        })
                    });

                    const convResult = await convResponse.json();

                    if (!convResponse.ok) {
                        // Manejar caso específico de no hay mensajes
                        if (convResult.error === 'No hay mensajes en esta conversación') {
                            showToast(
                                '📭 No hay mensajes con este cliente aún.\n\n💡 Sugerencia: Agrega algunos mensajes en la sección de Clientes para poder analizar la conversación.',
                                'warning'
                            );
                            setExecuting(null);
                            return;
                        }

                        throw new Error(convResult.error || 'Error analizando conversación');
                    }

                    // Mostrar resultado específico para análisis de conversación
                    if (currentAutomation) {
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: convResult
                        }));
                    }

                    showToast(
                        `🧠 Análisis completado para ${convResult.client}! Se encontraron ${convResult.messagesCount} mensajes analizados.`,
                        'success'
                    );

                    // Mostrar botón para ver detalles del resultado
                    setTimeout(() => {
                        showToast(
                            '� Análisis guardado. Haz clic en "Ver Resultados" en la tarjeta de la automatización para ver las recomendaciones completas.',
                            'info'
                        );
                    }, 3000);

                    fetchRecentInsights(); // Actualizar insights
                    setExecuting(null);
                    return; // Salir aquí para evitar el flujo normal

                case 'risk_detection':
                    // Para detección de riesgos, usar endpoint específico directamente
                    console.log('⚠️ Executing project risk detection...');

                    const riskResponse = await fetch('/api/ai/analyze-project-risks', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            projectId: modalData.projectId
                        })
                    });

                    const riskResult = await riskResponse.json();

                    if (!riskResponse.ok) {
                        throw new Error(riskResult.error || 'Error analizando riesgos del proyecto');
                    }

                    // Guardar resultado
                    if (riskResult) {
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: riskResult
                        }));
                    }

                    const riskLevel = riskResult.analysis.overall_risk_score;
                    const riskColor = riskLevel >= 7 ? '🔴' : riskLevel >= 5 ? '🟡' : '🟢';
                    
                    showToast(
                        `⚠️ Análisis de riesgos completado para "${riskResult.project.name}"!\n${riskColor} Nivel de riesgo: ${riskLevel}/10\n🛡️ ${riskResult.analysis.identified_risks.length} riesgos identificados`,
                        'success'
                    );

                    // Mostrar botón para ver detalles del resultado
                    setTimeout(() => {
                        showToast(
                            '📋 Análisis guardado. Haz clic en "Ver Resultados" en la tarjeta de la automatización para ver el plan de mitigación completo.',
                            'info'
                        );
                    }, 3000);

                    fetchRecentInsights(); // Actualizar insights
                    setExecuting(null);
                    return; // Salir aquí para evitar el flujo normal
                    break;

                case 'pricing_optimization':
                    // Para optimización de precios, usar endpoint específico directamente
                    console.log('💰 Executing pricing optimization...');

                    const pricingResponse = await fetch('/api/ai/optimize-pricing', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            budgetId: modalData.budgetId
                        })
                    });

                    const pricingResult = await pricingResponse.json();

                    if (!pricingResponse.ok) {
                        throw new Error(pricingResult.error || 'Error optimizando precios del presupuesto');
                    }

                    // Guardar resultado
                    if (pricingResult) {
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: pricingResult
                        }));
                    }

                    const currentTotal = pricingResult.analysis.financial_impact?.current_total || pricingResult.budget.total_amount;
                    const optimizedTotal = pricingResult.analysis.financial_impact?.optimized_total || currentTotal;
                    const improvement = pricingResult.analysis.financial_impact?.percentage_improvement || 0;
                    const improvementIcon = improvement > 0 ? '📈' : improvement < 0 ? '📉' : '📊';
                    
                    showToast(
                        `💰 Optimización de precios completada para "${pricingResult.budget.title}"!\n${improvementIcon} Mejora potencial: ${improvement.toFixed(1)}%\n💵 Total optimizado: €${optimizedTotal.toLocaleString()}\n🎯 ${pricingResult.analysis.optimization_recommendations?.length || 0} recomendaciones`,
                        'success'
                    );

                    // Mostrar botón para ver detalles del resultado
                    setTimeout(() => {
                        showToast(
                            '📋 Análisis guardado. Haz clic en "Ver Resultados" para ver las estrategias de pricing y recomendaciones completas.',
                            'info'
                        );
                    }, 3000);

                    fetchRecentInsights(); // Actualizar insights
                    setExecuting(null);
                    return; // Salir aquí para evitar el flujo normal
                    break;

                case 'performance_analysis':
                    // Caso especial: análisis de rendimiento
                    console.log('📈 Executing performance analysis...');

                    // Verificar autenticación antes de llamar API
                    const supabaseAuth = createSupabaseClient();
                    const { data: { user: authUser }, error: authUserError } = await supabaseAuth.auth.getUser();

                    if (authUserError || !authUser) {
                        throw new Error('Usuario no autenticado. Por favor, recarga la página.');
                    }

                    console.log('🔐 Usuario autenticado:', authUser.email);

                    // Obtener token de sesión para incluir en headers
                    const { data: { session } } = await supabaseAuth.auth.getSession();
                    const headers: HeadersInit = {
                        'Content-Type': 'application/json',
                    };

                    // Agregar token de autorización si está disponible
                    if (session?.access_token) {
                        headers['Authorization'] = `Bearer ${session.access_token}`;
                    }

                    const performanceResponse = await fetch('/api/ai/analyze-performance', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            period: modalData.period || '30_days',
                            userId: authUser.id // Fallback para auth
                        })
                    });

                    const performanceResult = await performanceResponse.json();

                    console.log('📊 Performance analysis response:', {
                        ok: performanceResponse.ok,
                        status: performanceResponse.status,
                        result: performanceResult
                    });

                    if (!performanceResponse.ok) {
                        throw new Error(performanceResult.error || 'Error analizando rendimiento');
                    }

                    // Mostrar resultado específico para análisis de rendimiento
                    if (currentAutomation) {
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: performanceResult
                        }));
                    }

                    showToast(
                        `📈 ¡Análisis completado! Score de productividad: ${performanceResult.analysis.productivity_analysis.overall_score}/10`,
                        'success'
                    );

                    fetchRecentInsights(); // Actualizar insights
                    setExecuting(null);
                    return; // Salir aquí para evitar el flujo normal

                // 🔄 NUEVOS WORKFLOWS AUTOMÁTICOS
                case 'smart_email':
                    automationType = 'smart_email';
                    requestData = {
                        trigger: modalData.trigger,
                        context: modalData.context,
                        clientId: modalData.clientId
                    };
                    break;

                case 'dynamic_form':
                    automationType = 'dynamic_form';
                    requestData = {
                        purpose: modalData.purpose,
                        context: modalData.context,
                        industry: modalData.industry
                    };
                    break;

                case 'smart_meeting':
                    automationType = 'smart_meeting';
                    requestData = {
                        purpose: modalData.purpose,
                        participants: modalData.participants || [],
                        context: modalData.context
                    };
                    break;

                case 'calendar_link':
                    automationType = 'calendar_link';
                    requestData = {
                        event_type: modalData.event_type,
                        duration: modalData.duration,
                        context: modalData.context
                    };
                    break;

                case 'auto_detect':
                    // Caso especial: detección automática de eventos
                    console.log('🔍 Executing automatic event detection...');

                    // Obtener user ID para el detector automático
                    const supabaseForAuto = createSupabaseClient();
                    const { data: { user: autoUser }, error: autoUserError } = await supabaseForAuto.auth.getUser();

                    if (autoUserError || !autoUser) {
                        throw new Error('Usuario no autenticado');
                    }

                    const autoResponse = await fetch('/api/ai/workflows/auto', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            autoDetect: true,
                            userId: autoUser.email
                        })
                    });

                    const autoResult = await autoResponse.json();

                    if (!autoResponse.ok) {
                        throw new Error(autoResult.error || 'Error en detección automática');
                    }

                    // Mostrar resultado específico para detector automático
                    if (currentAutomation) {
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: autoResult
                        }));
                    }

                    showToast(
                        `🎉 ${autoResult.message}! Se detectaron ${autoResult.processedEvents} eventos y se generaron emails automáticamente.`,
                        'success'
                    );

                    fetchRecentInsights(); // Actualizar insights
                    setExecuting(null);
                    return; // Salir aquí para evitar el flujo normal

                case 'conversation_analysis':
                    // Para análisis de conversación, usar endpoint específico
                    console.log('🧠 Executing conversation analysis...');

                    const analyzeResponse = await fetch('/api/ai/optimize-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            clientId: modalData.clientId,
                            action: 'analyze'
                        })
                    });

                    const analyzeResult = await analyzeResponse.json();

                    if (!analyzeResponse.ok) {
                        throw new Error(analyzeResult.error || 'Error analizando conversación');
                    }

                    // Mostrar resultado específico para análisis de conversación
                    if (currentAutomation) {
                        setExecutionResults(prev => ({
                            ...prev,
                            [currentAutomation.id]: analyzeResult
                        }));
                    }

                    showToast(
                        `🧠 Análisis completado para ${analyzeResult.client}! Se encontraron ${analyzeResult.messagesCount} mensajes analizados.`,
                        'success'
                    );

                    fetchRecentInsights(); // Actualizar insights
                    setExecuting(null);
                    return; // Salir aquí para evitar el flujo normal

                default:
                    showToast('Tipo de automatización no implementado', 'error');
                    return;
            }

            // Obtener user ID real del usuario autenticado
            const supabase = createSupabaseClient();
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error('Usuario no autenticado');
            }

            // Ejecutar la automatización IA
            const response = await fetch('/api/ai/automations/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: automationType,
                    data: requestData,
                    userId: user.email // Enviar el email del usuario
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error ejecutando automatización');
            }

            // Guardar resultado y mostrar éxito
            setExecutionResults(prev => ({
                ...prev,
                [currentAutomation.id]: result
            }));

            // Actualizar contador de ejecuciones
            setAIAutomations(prev => prev.map(a =>
                a.id === currentAutomation.id
                    ? { ...a, executionCount: a.executionCount + 1 }
                    : a
            ));

            // Mostrar resultado
            showExecutionResult(result, currentAutomation);

        } catch (error) {
            console.error('❌ Error executing AI automation:', error);
            showToast(`❌ Error ejecutando automatización: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
        } finally {
            setExecuting(null);
        }
    };

    // Función para mostrar resultado de manera profesional
    const showExecutionResult = (result: any, automation: AIAutomation) => {
        let resultMessage = `✅ ${automation.name} ejecutada correctamente!\n\n`;

        // Manejar resultados específicos de performance analysis
        if (automation.type === 'performance_analysis' && result.analysis) {
            const analysis = result.analysis;
            const metrics = result.metrics;
            
            resultMessage += `📊 Score de Productividad: ${analysis.productivity_analysis?.overall_score || 'N/A'}/10\n`;
            resultMessage += `⏱️ Horas trabajadas: ${metrics?.totalWorkHours || 0}h\n`;
            resultMessage += `💰 % Facturable: ${metrics?.billablePercentage || 0}%\n`;
            resultMessage += `💵 €/hora: ${metrics?.revenuePerHour || 0}\n`;
            
            if (analysis.bottlenecks_identified?.length > 0) {
                resultMessage += `🚫 Bottlenecks: ${analysis.bottlenecks_identified.length}\n`;
            }
            
            if (analysis.opportunities?.length > 0) {
                resultMessage += `🚀 Oportunidades: ${analysis.opportunities.length}\n`;
            }
            
            if (analysis.actionable_recommendations?.length > 0) {
                resultMessage += `💡 Recomendaciones: ${analysis.actionable_recommendations.length}\n`;
            }

            resultMessage += `\n📈 Datos analizados: ${result.summary?.data_points?.calendar_events || 0} eventos, ${result.summary?.data_points?.tracking_sessions || 0} sesiones`;
            
            showToast(resultMessage, 'success');
            return;
        }

        // La nueva estructura del endpoint es: { success: true, data: { analysis, ... } }
        const data = result.data || {};

        if (data.analysis) {
            const analysis = data.analysis;
            if (analysis.sentiment) {
                resultMessage += `🎯 Sentimiento: ${analysis.sentiment.toUpperCase()}\n`;
                resultMessage += `📊 Confianza: ${Math.round(analysis.confidence * 100)}%\n`;
                if (analysis.recommendations?.length > 0) {
                    resultMessage += `💡 Recomendaciones: ${analysis.recommendations.slice(0, 2).join(', ')}\n`;
                }
            } else if (analysis.optimizedMessage) {
                resultMessage += `📝 Mensaje optimizado generado\n`;
                resultMessage += `📊 Mejoras detectadas: ${analysis.improvements?.length || 0}\n`;
            } else if (analysis.score) {
                resultMessage += `📊 Score: ${analysis.score}/100\n`;
                resultMessage += `💪 Fortalezas: ${analysis.strengths?.length || 0}\n`;
                resultMessage += `⚠️ Debilidades: ${analysis.weaknesses?.length || 0}\n`;
            } else if (analysis.overallScore) {
                resultMessage += `📊 Score general: ${analysis.overallScore}/100\n`;
            } else if (analysis.suggestedPrice) {
                resultMessage += `💰 Precio sugerido: €${analysis.suggestedPrice}\n`;
            } else if (analysis.overall_risk_score) {
                // Para análisis de riesgos de proyecto
                const riskLevel = analysis.overall_risk_score;
                const riskColor = riskLevel >= 7 ? '🔴' : riskLevel >= 5 ? '🟡' : '🟢';
                resultMessage += `${riskColor} Nivel de riesgo: ${riskLevel}/10\n`;
                resultMessage += `🛡️ Riesgos identificados: ${analysis.identified_risks?.length || 0}\n`;
                if (analysis.mitigation_plans?.length > 0) {
                    resultMessage += `📋 Planes de mitigación: ${analysis.mitigation_plans.length}\n`;
                }
            }
        }

        // Verificar si se creó una tarea automática
        if (data.automatic_task_created || (data.analysis && data.analysis.sentiment === 'negative' && data.analysis.urgency === 'high')) {
            resultMessage += `\n🔥 Se creó una tarea automática de alta prioridad`;
        }

        resultMessage += `\n📈 Insight guardado en tu dashboard`;

        showToast(resultMessage, 'success');
    };

    // Función para cargar insights recientes del usuario
    const fetchRecentInsights = async () => {
        try {
            const supabase = createSupabaseClient();
            const user = (await supabase.auth.getUser()).data.user;

            if (!user) return;

            const { data: insights, error } = await supabase
                .from('ai_insights')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching insights:', error);
                return;
            }

            setRecentInsights(insights || []);
        } catch (error) {
            console.error('Error in fetchRecentInsights:', error);
        }
    };

    // Función para obtener el icono según el tipo de insight
    const getInsightIcon = (insightType: string) => {
        switch (insightType) {
            case 'sentiment_analysis': return '🎭';
            case 'communication_optimization': return '💬';
            case 'proposal_analysis': return '📊';
            case 'content_generation': return '📝';
            case 'conversation_analysis': return '🧠';
            case 'risk_detection': return '⚠️';
            case 'performance_analysis': return '📈';
            case 'pricing_optimization': return '💰';
            default: return '🤖';
        }
    };

    // Función para formatear tiempo relativo
    const getTimeAgo = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'hace unos segundos';
        if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
        if (diffInMinutes < 1440) return `hace ${Math.floor(diffInMinutes / 60)} h`;
        return `hace ${Math.floor(diffInMinutes / 1440)} días`;
    };

    // Función para obtener clientes del usuario
    const fetchUserClients = async () => {
        const supabase = createSupabaseClient();
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data, error } = await supabase
            .from('clients')
            .select('id, name, company')
            .eq('user_id', user.id)
            .order('name');

        if (error) return [];

        // Para cada cliente, obtener el conteo de mensajes
        const clientsWithMessageCount = await Promise.all(
            (data || []).map(async (client: any) => {
                const { count } = await supabase
                    .from('client_messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('client_id', client.id);

                return {
                    ...client,
                    messageCount: count || 0
                };
            })
        );

        // Actualizar el estado de conteo de mensajes
        const messageCountMap: { [key: string]: number } = {};
        clientsWithMessageCount.forEach(client => {
            messageCountMap[client.id] = client.messageCount;
        });
        setClientMessagesCount(messageCountMap);

        return clientsWithMessageCount;
    };

    // Función auxiliar para obtener proyectos del usuario
    const fetchUserProjects = async () => {
        const supabase = createSupabaseClient();
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data, error } = await supabase
            .from('projects')
            .select('id, name, status')
            .eq('user_id', user.id)
            .order('name');

        return error ? [] : data || [];
    };

    // Automatizaciones IA reales conectadas con OpenAI
    const predefinedAutomations: AIAutomation[] = [
        {
            id: 'sentiment-analysis-real',
            name: '🧠 Análisis de Sentimiento Real',
            description: 'IA analiza feedback de clientes usando OpenAI GPT-4o-mini para detectar emociones, urgencia y crear alertas automáticas',
            category: 'client_management',
            type: 'sentiment_analysis',
            status: 'active',
            confidence: 94,
            successRate: 91,
            executionCount: 0,
            aiFeatures: ['OpenAI GPT-4o-mini', 'Análisis Emocional', 'Detección de Urgencia', 'Creación de Tareas Automáticas'],
            icon: Brain,
            color: 'blue',
            isNew: true
        },
        {
            id: 'conversation-analyzer',
            name: '🧠 Analizador de Conversaciones',
            description: 'IA analiza automáticamente toda la conversación con un cliente usando OpenAI. Solo selecciona el cliente y obtén insights completos.',
            category: 'client_management',
            type: 'conversation_analysis',
            status: 'active',
            confidence: 91,
            successRate: 88,
            executionCount: 0,
            aiFeatures: ['Análisis Automático de Conversaciones', 'Evaluación de Satisfacción', 'Detección de Tono', 'Recomendaciones Específicas'],
            icon: MessageSquare,
            color: 'indigo',
            isNew: true
        },
        {
            id: 'communication-optimizer',
            name: '📧 Optimizador de Comunicación',
            description: 'IA mejora automáticamente tus mensajes y emails usando OpenAI para maximizar efectividad y profesionalismo',
            category: 'client_management',
            type: 'communication_optimization',
            status: 'active',
            confidence: 89,
            successRate: 93,
            executionCount: 0,
            aiFeatures: ['Optimización de Tono', 'Mejora de Claridad', 'Personalización por Cliente', 'Sugerencias de Mejora'],
            icon: Mail,
            color: 'green',
            isNew: true
        },
        {
            id: 'proposal-analyzer',
            name: '📊 Analizador de Propuestas',
            description: 'Selecciona cliente → Elige propuesta → IA analiza automáticamente calidad, precios y sugiere mejoras específicas',
            category: 'sales',
            type: 'proposal_analysis',
            status: 'active',
            confidence: 88,
            successRate: 86,
            executionCount: 0,
            aiFeatures: ['Análisis de Propuestas Reales', 'Score de Calidad', 'Análisis de Competitividad', 'Sugerencias de Mejora Específicas'],
            icon: FileText,
            color: 'purple',
            isNew: true
        },
        {
            id: 'pricing-optimizer',
            name: '💰 Optimizador de Precios',
            description: 'Selecciona cliente → Elige presupuesto → IA analiza precios del mercado y sugiere optimizaciones estratégicas',
            category: 'sales',
            type: 'pricing_optimization',
            status: 'active',
            confidence: 85,
            successRate: 87,
            executionCount: 0,
            aiFeatures: ['Análisis de Mercado', 'Datos Históricos', 'Pricing Inteligente', 'Estrategias Personalizadas'],
            icon: DollarSign,
            color: 'green',
            isNew: true
        },
        {
            id: 'content-generator',
            name: '✍️ Generador de Contenido IA',
            description: 'IA crea contenido profesional personalizado: emails, propuestas, posts, artículos usando OpenAI',
            category: 'productivity',
            type: 'content_generation',
            status: 'active',
            confidence: 92,
            successRate: 89,
            executionCount: 0,
            aiFeatures: ['Múltiples Tipos de Contenido', 'Personalización por Audiencia', 'SEO Optimizado', 'Diferentes Tonos'],
            icon: Zap,
            color: 'yellow',
            isNew: true
        },
        {
            id: 'risk-detector',
            name: '⚠️ Detector de Riesgos de Proyecto',
            description: 'IA analiza tus proyectos con OpenAI para detectar riesgos potenciales y crear planes de mitigación automáticos',
            category: 'insights',
            type: 'risk_detection',
            status: 'active',
            confidence: 87,
            successRate: 84,
            executionCount: 0,
            aiFeatures: ['Análisis Predictivo', 'Detección Temprana', 'Planes de Mitigación', 'Tareas Automáticas'],
            icon: AlertTriangle,
            color: 'red',
            isNew: true
        },
        {
            id: 'performance-analyzer',
            name: '📈 Analizador de Rendimiento',
            description: 'IA evalúa tu rendimiento usando OpenAI para identificar patrones, bottlenecks y oportunidades de mejora',
            category: 'insights',
            type: 'performance_analysis',
            status: 'active',
            confidence: 90,
            successRate: 88,
            executionCount: 0,
            aiFeatures: ['Métricas Avanzadas', 'Identificación de Tendencias', 'Análisis de Productividad', 'Recomendaciones Personalizadas'],
            icon: BarChart,
            color: 'indigo',
            isNew: true
        },
        // 🔄 NUEVOS WORKFLOWS AUTOMÁTICOS
        {
            id: 'smart-email-workflow',
            name: '📧 Email Inteligente Automático',
            description: 'IA genera emails personalizados automáticamente basados en eventos: contratos firmados, pagos recibidos, reuniones programadas',
            category: 'productivity',
            type: 'smart_email',
            status: 'active',
            confidence: 93,
            successRate: 91,
            executionCount: 0,
            aiFeatures: ['Emails Contextuales', 'Personalización IA', 'Múltiples Triggers', 'Tono Adaptativo'],
            icon: Mail,
            color: 'blue',
            isNew: true
        },
        {
            id: 'auto-event-detector',
            name: '🔍 Detector de Eventos Automático',
            description: 'IA detecta automáticamente eventos en tu base de datos (contratos firmados, pagos, proyectos completados) y genera workflows',
            category: 'productivity',
            type: 'auto_detect',
            status: 'inactive',
            confidence: 95,
            successRate: 89,
            executionCount: 0,
            aiFeatures: ['Detección Automática', 'Eventos en Tiempo Real', 'Base de Datos', 'Workflows Automáticos'],
            icon: Search,
            color: 'emerald',
            isNew: true
        },
        {
            id: 'dynamic-form-generator',
            name: '📋 Generador de Formularios Dinámicos',
            description: 'IA crea formularios adaptativos según el contexto: captación de clientes, brief de proyectos, recolección de feedback',
            category: 'productivity',
            type: 'dynamic_form',
            status: 'active',
            confidence: 88,
            successRate: 85,
            executionCount: 0,
            aiFeatures: ['Formularios Adaptativos', 'Preguntas Contextuales', 'Validación Inteligente', 'Múltiples Propósitos'],
            icon: FileText,
            color: 'purple',
            isNew: true
        },
        {
            id: 'smart-meeting-scheduler',
            name: '🗓️ Programador de Reuniones Inteligente',
            description: 'IA programa reuniones automáticamente con agenda personalizada según el propósito y participantes',
            category: 'client_management',
            type: 'smart_meeting',
            status: 'active',
            confidence: 90,
            successRate: 87,
            executionCount: 0,
            aiFeatures: ['Agendas Personalizadas', 'Invitaciones IA', 'Preparación Automática', 'Múltiples Propósitos'],
            icon: Clock,
            color: 'indigo',
            isNew: true
        },
        {
            id: 'calendar-link-generator',
            name: '🔗 Enlace de Calendario Personalizado',
            description: 'IA configura enlaces de calendario con contexto específico: consultas, reuniones de proyecto, sesiones de feedback',
            category: 'client_management',
            type: 'calendar_link',
            status: 'active',
            confidence: 92,
            successRate: 94,
            executionCount: 0,
            aiFeatures: ['Configuración IA', 'Contexto Específico', 'Preparación Automática', 'Múltiples Tipos'],
            icon: Target,
            color: 'green',
            isNew: true
        }
    ];

    const categories = [
        { id: 'all', name: 'Todas', icon: Bot },
        { id: 'client_management', name: 'Gestión de Clientes', icon: Users },
        { id: 'sales', name: 'Ventas', icon: DollarSign },
        { id: 'productivity', name: 'Productividad', icon: Zap },
        { id: 'insights', name: 'Insights', icon: BarChart3 }
    ];

    useEffect(() => {
        setLoading(true);

        // Cargar datos del usuario
        const loadUserData = async () => {
            try {
                const supabase = createSupabaseClient();
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.error('Error obteniendo usuario:', userError);
                    return;
                }

                // Cargar clientes
                const { data: clients, error: clientsError } = await supabase
                    .from('clients')
                    .select('id, name, email, company')
                    .eq('user_id', user.id)
                    .order('name');

                if (!clientsError && clients) {
                    setUserClients(clients);

                    // Verificar cuántos mensajes tiene cada cliente
                    const messageCounts: { [key: string]: number } = {};
                    for (const client of clients) {
                        const { count } = await supabase
                            .from('client_messages')
                            .select('*', { count: 'exact', head: true })
                            .eq('client_id', client.id);
                        messageCounts[client.id] = count || 0;
                    }
                    setClientMessagesCount(messageCounts);
                }

                // Cargar proyectos
                const { data: projects, error: projectsError } = await supabase
                    .from('projects')
                    .select('id, name, client_id, status')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!projectsError && projects) {
                    setUserProjects(projects);
                }

                // Cargar propuestas
                const { data: proposals, error: proposalsError } = await supabase
                    .from('proposals')
                    .select('id, title, prospect_name, status, total_amount, currency, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!proposalsError && proposals) {
                    setUserProposals(proposals);
                }

                // Cargar presupuestos
                const { data: budgets, error: budgetsError } = await supabase
                    .from('budgets')
                    .select(`
                        id, 
                        title, 
                        status, 
                        total_amount, 
                        created_at,
                        client:clients(id, name, company)
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (!budgetsError && budgets) {
                    setUserBudgets(budgets);
                }

            } catch (error) {
                console.error('Error cargando datos del usuario:', error);
            }
        };

        loadUserData();

        setTimeout(() => {
            setAIAutomations(predefinedAutomations);
            setLoading(false);
            fetchRecentInsights(); // Cargar insights recientes
        }, 1000);
    }, []);

    const handleLogout = async () => {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    const filteredAutomations = selectedCategory === 'all'
        ? aiAutomations
        : aiAutomations.filter(automation => automation.category === selectedCategory);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <Play className="h-4 w-4 text-green-600" />;
            case 'inactive': return <Pause className="h-4 w-4 text-gray-400" />;
            case 'learning': return <Brain className="h-4 w-4 text-blue-600" />;
            default: return <Settings className="h-4 w-4" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Activa';
            case 'inactive': return 'Inactiva';
            case 'learning': return 'Aprendiendo';
            default: return 'Desconocido';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return 'text-green-600 bg-green-100';
        if (confidence >= 80) return 'text-blue-600 bg-blue-100';
        if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col overflow-hidden ml-56 min-h-screen">
                <TrialBanner userEmail={userEmail} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
                    <div className="w-full px-0 sm:px-0 py-8">

                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Brain className="h-8 w-8 mr-3 text-blue-600" />
                                        Automatizaciones IA
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        Automatizaciones IA conectadas con OpenAI GPT-4o-mini que funcionan con tus datos reales
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">OpenAI Activo</span>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/dashboard/automations')}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                        Ver Automatizaciones Tradicionales
                                    </Button>
                                </div>
                            </div>

                            {/* Estadísticas IA */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Bot className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IA Activas</p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                {aiAutomations.filter(a => a.status === 'active').length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <TrendingUp className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Éxito</p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                {Math.round(aiAutomations.reduce((acc, a) => acc + a.successRate, 0) / aiAutomations.length || 0)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Brain className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confianza IA</p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                {Math.round(aiAutomations.reduce((acc, a) => acc + a.confidence, 0) / aiAutomations.length || 0)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Zap className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ejecuciones</p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                {aiAutomations.reduce((acc, a) => acc + a.executionCount, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filtros por categoría */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {categories.map((category) => {
                                const Icon = category.icon;
                                const isSelected = selectedCategory === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isSelected
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {category.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Lista de Automatizaciones IA */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Cargando automatizaciones IA...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredAutomations.map((automation) => {
                                    const Icon = automation.icon;
                                    return (
                                        <div
                                            key={automation.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
                                            onClick={() => handleAutomationExecution(automation)}
                                        >
                                            {/* Loading overlay */}
                                            {executing === automation.id && (
                                                <div className="absolute inset-0 bg-blue-600/20 rounded-lg flex items-center justify-center z-10">
                                                    <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
                                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-blue-600 font-medium">Ejecutando IA...</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Success indicator */}
                                            {executionResults[automation.id] && (
                                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentResults(executionResults[automation.id]);
                                                            setShowResultsModal(true);
                                                        }}
                                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                                                    >
                                                        � Ver Resultados
                                                    </button>
                                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        ✅ Ejecutada
                                                    </div>
                                                </div>
                                            )}                                            <div className="p-6">{/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-3 bg-${automation.color}-100 rounded-lg`}>
                                                            <Icon className={`h-6 w-6 text-${automation.color}-600`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                                    {automation.name}
                                                                </h3>
                                                                {automation.isNew && (
                                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                                                        Nuevo
                                                                    </span>
                                                                )}
                                                                {automation.isPremium && (
                                                                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                                                        <Star className="h-3 w-3" />
                                                                        Premium
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {automation.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(automation.status)}
                                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                                    </div>
                                                </div>

                                                {/* Métricas */}
                                                <div className="grid grid-cols-3 gap-4 mb-4">
                                                    <div className="text-center">
                                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(automation.confidence)}`}>
                                                            {automation.confidence}% confianza
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">IA Confidence</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {automation.successRate}%
                                                        </div>
                                                        <p className="text-xs text-gray-500">Tasa de Éxito</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                            {automation.executionCount}
                                                        </div>
                                                        <p className="text-xs text-gray-500">Ejecuciones</p>
                                                    </div>
                                                </div>

                                                {/* Características IA */}
                                                <div className="mb-4">
                                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Capacidades IA:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {automation.aiFeatures.map((feature, index) => (
                                                            <span
                                                                key={index}
                                                                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                                                            >
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(automation.status)}
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {getStatusText(automation.status)}
                                                        </span>
                                                    </div>

                                                    {/* Botones específicos para detector automático */}
                                                    {automation.type === 'auto_detect' ? (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant={automation.status === 'active' ? 'destructive' : 'default'}
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleAutoDetector(automation.id, automation.status);
                                                                }}
                                                                disabled={!canUseFeatures && automation.isPremium}
                                                                className="min-w-[80px]"
                                                            >
                                                                {automation.status === 'active' ? 'Desactivar' : 'Activar'}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    executeAutoDetectorWithEmails();
                                                                }}
                                                                disabled={!canUseFeatures && automation.isPremium}
                                                                className="min-w-[100px]"
                                                            >
                                                                📧 Ejecutar Ahora
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        /* Botón normal para otras automatizaciones */
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                            disabled={executing === automation.id || (!canUseFeatures && automation.isPremium)}
                                                        >
                                                            {executing === automation.id ? 'Ejecutando...' : 'Ejecutar IA Real'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Resultados de Análisis Recientes */}
                        {Object.keys(executionResults).length > 0 && (
                            <div className="mt-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Brain className="h-6 w-6 mr-3 text-indigo-600" />
                                        Análisis Ejecutados Recientemente
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {Object.entries(executionResults).map(([automationId, result]) => {
                                        const automation = aiAutomations.find(a => a.id === automationId);
                                        if (!automation) return null;

                                        return (
                                            <div
                                                key={automationId}
                                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => {
                                                    setCurrentResults(result);
                                                    setShowResultsModal(true);
                                                }}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                                            {React.createElement(automation.icon, {
                                                                className: "h-5 w-5 text-indigo-600"
                                                            })}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                                {automation.name}
                                                            </h3>
                                                            {result.client && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Cliente: <strong>{result.client}</strong>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mb-2">
                                                            ✅ Completado
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Hace unos momentos
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Vista previa de resultados */}
                                                {result.analysis && (
                                                    <div className="space-y-3">
                                                        {result.analysis.overallTone && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">🎭 Tono:</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.analysis.overallTone === 'positive' ? 'bg-green-100 text-green-800' :
                                                                        result.analysis.overallTone === 'negative' ? 'bg-red-100 text-red-800' :
                                                                            'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {result.analysis.overallTone.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {result.analysis.satisfactionLevel && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">😊 Satisfacción:</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.analysis.satisfactionLevel === 'high' ? 'bg-green-100 text-green-800' :
                                                                        result.analysis.satisfactionLevel === 'low' ? 'bg-red-100 text-red-800' :
                                                                            'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {result.analysis.satisfactionLevel.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {result.messagesCount && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">📨 Mensajes analizados:</span>
                                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {result.messagesCount}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="mt-4 pt-3 border-t border-gray-200">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCurrentResults(result);
                                                                    setShowResultsModal(true);
                                                                }}
                                                            >
                                                                � Ver Resultados Completos
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Resultados Recientes */}
                        {recentInsights.length > 0 && (
                            <div className="mt-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <BarChart className="h-6 w-6 mr-3 text-green-600" />
                                        Resultados Recientes
                                    </h2>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowingResults(!showingResults)}
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    >
                                        {showingResults ? 'Ocultar' : 'Mostrar todos'}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {(showingResults ? recentInsights : recentInsights.slice(0, 4)).map((insight, index) => (
                                        <div
                                            key={insight.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="text-2xl">
                                                        {getInsightIcon(insight.insight_type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                            {insight.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {insight.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {getTimeAgo(insight.created_at)}
                                                    </div>
                                                    {insight.confidence_score && (
                                                        <div className="text-xs font-medium text-green-600 mt-1">
                                                            {Math.round(insight.confidence_score * 100)}% confianza
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Datos específicos según el tipo */}
                                            {insight.data_points && (
                                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    {insight.insight_type === 'sentiment_analysis' && insight.data_points.sentiment && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">Sentimiento:</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${insight.data_points.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                                                insight.data_points.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {insight.data_points.sentiment.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {insight.data_points.original_text && (
                                                        <div className="mt-2">
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                "{insight.data_points.original_text.substring(0, 100)}..."
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Recomendaciones */}
                                            {insight.recommendations && insight.recommendations.length > 0 && (
                                                <div className="mt-4">
                                                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        💡 Recomendaciones:
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {insight.recommendations.slice(0, 2).join(' • ')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {recentInsights.length > 4 && !showingResults && (
                                    <div className="text-center mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowingResults(true)}
                                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                        >
                                            Ver {recentInsights.length - 4} resultados más
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CTA para insights generados */}
                        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center">
                            <Brain className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">🤖 Automatizaciones IA Reales con OpenAI</h3>
                            <p className="text-blue-100 mb-6">
                                Estas automatizaciones están conectadas con OpenAI GPT-4o-mini y funcionan con tus datos reales
                            </p>
                            <div className="bg-white/20 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-100">
                                    🧠 Análisis de sentimiento real de feedback de clientes<br />
                                    📧 Optimización automática de comunicaciones<br />
                                    📊 Análisis inteligente de propuestas y precios<br />
                                    ⚠️ Detección predictiva de riesgos en proyectos<br />
                                    � Análisis de rendimiento con insights personalizados<br />
                                    � Generación de contenido profesional automático
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    variant="secondary"
                                    className="bg-white text-blue-600 hover:bg-gray-100"
                                    onClick={() => router.push('/dashboard/automations')}
                                >
                                    Ver Automatizaciones Tradicionales
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                                    onClick={() => window.open('https://openai.com/pricing', '_blank')}
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Ver Precios OpenAI
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal de Resultados Detallados */}
            {showResultsModal && currentResults && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Brain className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        🧠 Resultados del Análisis de IA
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Análisis completo de la conversación con el cliente
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowResultsModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Información del Cliente */}
                            {currentResults.client && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900 text-lg">{currentResults.client}</h4>
                                            {currentResults.messagesCount && (
                                                <p className="text-sm text-blue-700">
                                                    📨 {currentResults.messagesCount} mensajes analizados por IA
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Debug: Completamente deshabilitado */}
                            {false && process.env.NODE_ENV === 'development' && (
                                <>
                                    {/* Debug: Mostrar estructura de datos */}
                                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                                        <h5 className="font-medium text-gray-900 mb-2">🔧 Debug - Estructura de Datos:</h5>
                                        <pre className="text-xs text-gray-700 overflow-auto max-h-40 bg-white p-3 rounded border">
                                            {JSON.stringify(currentResults, null, 2)}
                                        </pre>
                                    </div>

                                    {/* Verificar si hay análisis estructurado */}
                                    {currentResults.analysis ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h5 className="font-medium text-green-900 mb-2">✅ Análisis Estructurado Detectado</h5>
                                            <p className="text-sm text-green-700">
                                                El análisis tiene la estructura correcta. Los campos disponibles son:
                                            </p>
                                            <ul className="text-xs text-green-600 mt-2 space-y-1">
                                                {Object.keys(currentResults.analysis || {}).map(key => (
                                                    <li key={key}>• {key}: {typeof currentResults.analysis[key]}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h5 className="font-medium text-yellow-900 mb-2">⚠️ Sin Análisis Estructurado</h5>
                                            <p className="text-sm text-yellow-700">
                                                No se encontró el campo `analysis` o está vacío. Mostrando resultado raw...
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Resultados específicos para Análisis de Rendimiento */}
                            {currentResults.analysis && currentResults.analysis.productivity_analysis && (
                                <div className="space-y-6">
                                    {/* Métricas Clave */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-blue-100 rounded-full">
                                                <TrendingUp className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-900 text-lg">📈 Resumen de Rendimiento</h4>
                                                <p className="text-sm text-blue-700">
                                                    Período: {currentResults.period?.replace('_', ' ')?.replace('days', 'días') || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {currentResults.analysis.productivity_analysis.overall_score || 'N/A'}/10
                                                </div>
                                                <div className="text-sm text-blue-700">Productividad</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {currentResults.metrics?.billablePercentage || 0}%
                                                </div>
                                                <div className="text-sm text-green-700">Facturable</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    €{currentResults.metrics?.revenuePerHour || 0}
                                                </div>
                                                <div className="text-sm text-purple-700">Por Hora</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {currentResults.metrics?.totalWorkHours || 0}h
                                                </div>
                                                <div className="text-sm text-orange-700">Trabajadas</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottlenecks y Oportunidades */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Bottlenecks */}
                                        {currentResults.analysis.bottlenecks_identified?.length > 0 && (
                                            <div className="bg-white border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-red-100 rounded-lg">
                                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <h5 className="font-semibold text-gray-900">🚫 Bottlenecks Detectados</h5>
                                                </div>
                                                <div className="space-y-3">
                                                    {currentResults.analysis.bottlenecks_identified.map((bottleneck: any, index: number) => (
                                                        <div key={index} className="bg-red-50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="text-sm font-medium text-red-900">{bottleneck.area}</div>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                                    bottleneck.impact === 'alto' ? 'bg-red-200 text-red-800' :
                                                                    bottleneck.impact === 'medio' ? 'bg-yellow-200 text-yellow-800' :
                                                                    'bg-green-200 text-green-800'
                                                                }`}>
                                                                    {bottleneck.impact}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-red-700 mb-2">{bottleneck.description}</p>
                                                            <p className="text-xs text-red-600 font-medium">💡 {bottleneck.solution}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Oportunidades */}
                                        {currentResults.analysis.opportunities?.length > 0 && (
                                            <div className="bg-white border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Zap className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <h5 className="font-semibold text-gray-900">🚀 Oportunidades</h5>
                                                </div>
                                                <div className="space-y-3">
                                                    {currentResults.analysis.opportunities.map((opportunity: any, index: number) => (
                                                        <div key={index} className="bg-green-50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="text-sm font-medium text-green-900">{opportunity.opportunity}</div>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                                    opportunity.priority === 'alta' ? 'bg-red-200 text-red-800' :
                                                                    opportunity.priority === 'media' ? 'bg-yellow-200 text-yellow-800' :
                                                                    'bg-green-200 text-green-800'
                                                                }`}>
                                                                    {opportunity.priority}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-green-700 mb-2">{opportunity.potential_impact}</p>
                                                            <p className="text-xs text-green-600 font-medium">🛠️ {opportunity.implementation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recomendaciones Accionables */}
                                    {currentResults.analysis.actionable_recommendations?.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-yellow-100 rounded-lg">
                                                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                                                </div>
                                                <h5 className="font-semibold text-gray-900">💡 Recomendaciones Accionables</h5>
                                            </div>
                                            <div className="grid gap-4">
                                                {currentResults.analysis.actionable_recommendations.map((rec: any, index: number) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h6 className="font-medium text-gray-900 mb-1">{rec.action}</h6>
                                                                <p className="text-sm text-gray-600 mb-2">{rec.expected_outcome}</p>
                                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                    <span>⏱️ {rec.timeframe}</span>
                                                                    <span className={`px-2 py-1 rounded-full ${
                                                                        rec.difficulty === 'fácil' ? 'bg-green-100 text-green-600' :
                                                                        rec.difficulty === 'medio' ? 'bg-yellow-100 text-yellow-600' :
                                                                        'bg-red-100 text-red-600'
                                                                    }`}>
                                                                        {rec.difficulty}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Predicciones Futuras */}
                                    {currentResults.analysis.next_period_predictions && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    {/* Icono eliminado por ausencia de componente Crystal */}
                                                </div>
                                                <h5 className="font-semibold text-purple-900">🔮 Predicciones Futuras</h5>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-purple-600">
                                                        {currentResults.analysis.next_period_predictions.productivity_forecast || 'N/A'}/10
                                                    </div>
                                                    <div className="text-sm text-purple-700">Productividad Proyectada</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-green-600">
                                                        €{currentResults.analysis.next_period_predictions.revenue_projection || 0}
                                                    </div>
                                                    <div className="text-sm text-green-700">Revenue Proyectado</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-medium text-indigo-600">
                                                        {currentResults.analysis.next_period_predictions.key_focus_areas?.length || 0}
                                                    </div>
                                                    <div className="text-sm text-indigo-700">Áreas de Enfoque</div>
                                                </div>
                                            </div>
                                            {currentResults.analysis.next_period_predictions.key_focus_areas?.length > 0 && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-purple-700 mb-2">🎯 Áreas clave para el próximo período:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentResults.analysis.next_period_predictions.key_focus_areas.map((area: string, index: number) => (
                                                            <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                                                {area}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Resultados específicos para Análisis de Propuestas */}
                            {currentResults.proposal && currentResults.analysis && (
                                <div className="space-y-6">
                                    {/* Información de la Propuesta */}
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-purple-100 rounded-full">
                                                <FileText className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-purple-900 text-lg">{currentResults.proposal.title}</h4>
                                                <p className="text-sm text-purple-700">
                                                    Cliente: {currentResults.proposal.client} • Estado: {currentResults.proposal.status} • Valor: {currentResults.proposal.value} {currentResults.proposal.currency}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Puntuación General y Competitividad */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Puntuación General */}
                                        <div className="bg-white border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Target className="h-5 w-5 text-green-600" />
                                                </div>
                                                <h5 className="font-semibold text-gray-900">Puntuación General</h5>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl font-bold text-green-600">
                                                    {currentResults.analysis.overall_score}/10
                                                </div>
                                                <div className="flex-1">
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                                            style={{ width: `${(currentResults.analysis.overall_score / 10) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Probabilidad de éxito: {Math.round(currentResults.analysis.success_probability * 100)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Competitividad */}
                                        <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <h5 className="font-semibold text-gray-900">Análisis de Precio</h5>
                                            </div>
                                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${currentResults.analysis.competitiveness === 'high' ? 'bg-green-100 text-green-800' :
                                                    currentResults.analysis.competitiveness === 'low' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {currentResults.analysis.competitiveness === 'high' ? '🏆 Alta Competitividad' :
                                                    currentResults.analysis.competitiveness === 'low' ? '⚠️ Baja Competitividad' :
                                                        '📊 Competitividad Media'}
                                            </div>
                                            {currentResults.analysis.pricing_analysis && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    {currentResults.analysis.pricing_analysis.recommendation}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Fortalezas y Debilidades */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Fortalezas */}
                                        {currentResults.analysis.strengths && currentResults.analysis.strengths.length > 0 && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <h5 className="font-semibold text-green-900">Fortalezas Identificadas</h5>
                                                </div>
                                                <ul className="space-y-2">
                                                    {currentResults.analysis.strengths.map((strength: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                                                            <span className="text-green-500 mt-1">✓</span>
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Debilidades */}
                                        {currentResults.analysis.weaknesses && currentResults.analysis.weaknesses.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-red-100 rounded-lg">
                                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <h5 className="font-semibold text-red-900">Áreas de Mejora</h5>
                                                </div>
                                                <ul className="space-y-2">
                                                    {currentResults.analysis.weaknesses.map((weakness: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                                                            <span className="text-red-500 mt-1">⚠</span>
                                                            {weakness}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Factores de Riesgo */}
                                    {currentResults.analysis.risk_factors && currentResults.analysis.risk_factors.length > 0 && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <h5 className="font-semibold text-orange-900">Factores de Riesgo</h5>
                                            </div>
                                            <ul className="space-y-2">
                                                {currentResults.analysis.risk_factors.map((risk: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                                                        <span className="text-orange-500 mt-1">⚠</span>
                                                        {risk}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Sugerencias de Mejora */}
                                    {currentResults.analysis.improvement_suggestions && currentResults.analysis.improvement_suggestions.length > 0 && (
                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-indigo-100 rounded-full">
                                                    <Brain className="h-7 w-7 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-indigo-900 text-xl">Sugerencias de Mejora IA</h4>
                                                    <p className="text-indigo-700 text-sm">Recomendaciones para optimizar tu propuesta</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {currentResults.analysis.improvement_suggestions.map((suggestion: string, index: number) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                                                                <span className="text-indigo-600 font-semibold text-sm">{index + 1}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-gray-800 font-medium leading-relaxed">{suggestion}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Próximas Acciones y Tips de Conversión */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Próximas Acciones */}
                                        {currentResults.analysis.next_actions && currentResults.analysis.next_actions.length > 0 && (
                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                                        <ArrowRight className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                    <h5 className="font-semibold text-emerald-900">Próximas Acciones</h5>
                                                </div>
                                                <ul className="space-y-3">
                                                    {currentResults.analysis.next_actions.map((action: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                                                                <span className="text-emerald-600 font-semibold text-xs">{index + 1}</span>
                                                            </div>
                                                            <p className="text-emerald-800 text-sm font-medium">{action}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Tips de Conversión */}
                                        {currentResults.analysis.conversion_tips && currentResults.analysis.conversion_tips.length > 0 && (
                                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                                                    </div>
                                                    <h5 className="font-semibold text-yellow-900">Tips de Conversión</h5>
                                                </div>
                                                <ul className="space-y-3">
                                                    {currentResults.analysis.conversion_tips.map((tip: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                                                                <span className="text-yellow-600 font-semibold text-xs">💡</span>
                                                            </div>
                                                            <p className="text-yellow-800 text-sm font-medium">{tip}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Resultados específicos para Optimización de Precios */}
                            {currentResults.budget && currentResults.analysis && (
                                <div className="space-y-6">
                                    {/* Información del Presupuesto */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-green-100 rounded-full">
                                                <DollarSign className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-green-900 text-lg">{currentResults.budget.title}</h4>
                                                <p className="text-sm text-green-700">
                                                    Cliente: {currentResults.budget.client?.name} • Total: €{currentResults.budget.total_amount?.toLocaleString()} • Items: {currentResults.budget.items?.length || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Análisis de Mercado y Puntuación */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Puntuación de Pricing */}
                                        <div className="bg-white border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Target className="h-5 w-5 text-green-600" />
                                                </div>
                                                <h5 className="font-semibold text-gray-900">Puntuación de Precios</h5>
                                            </div>
                                            <div className="text-3xl font-bold text-green-600 mb-2">
                                                {currentResults.analysis.pricing_assessment?.current_pricing_score || 7}/10
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                                <div 
                                                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
                                                    style={{ width: `${((currentResults.analysis.pricing_assessment?.current_pricing_score || 7) / 10) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div>Probabilidad de aceptación: {currentResults.analysis.risk_assessment?.client_acceptance_probability || 75}%</div>
                                            </div>
                                        </div>

                                        {/* Impacto Financiero */}
                                        <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <h5 className="font-semibold text-gray-900">Impacto Financiero</h5>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Total actual:</span>
                                                    <span className="font-medium">€{(currentResults.analysis.financial_impact?.current_total || currentResults.budget.total_amount || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Total optimizado:</span>
                                                    <span className="font-medium text-green-600">€{(currentResults.analysis.financial_impact?.optimized_total || currentResults.budget.total_amount || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="text-sm font-medium text-gray-700">Mejora potencial:</span>
                                                    <span className={`font-bold ${(currentResults.analysis.financial_impact?.percentage_improvement || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {(currentResults.analysis.financial_impact?.percentage_improvement || 0).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Análisis de Mercado */}
                                    {currentResults.analysis.market_analysis && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                                Análisis de Mercado
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 bg-blue-50 rounded-lg">
                                                    <h6 className="font-medium text-blue-900 mb-2">Estándares del Sector</h6>
                                                    <p className="text-sm text-blue-700">{currentResults.analysis.market_analysis.industry_standards || 'Análisis en proceso...'}</p>
                                                </div>
                                                <div className="p-4 bg-green-50 rounded-lg">
                                                    <h6 className="font-medium text-green-900 mb-2">Posición Competitiva</h6>
                                                    <p className="text-sm text-green-700">{currentResults.analysis.market_analysis.competitive_positioning || 'Evaluando competencia...'}</p>
                                                </div>
                                                <div className="p-4 bg-purple-50 rounded-lg">
                                                    <h6 className="font-medium text-purple-900 mb-2">Tendencias</h6>
                                                    <p className="text-sm text-purple-700">{currentResults.analysis.market_analysis.market_trends || 'Analizando tendencias...'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recomendaciones de Optimización */}
                                    {currentResults.analysis.optimization_recommendations && currentResults.analysis.optimization_recommendations.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Target className="h-5 w-5 text-green-600" />
                                                Recomendaciones de Optimización ({currentResults.analysis.optimization_recommendations.length})
                                            </h5>
                                            <div className="space-y-4">
                                                {currentResults.analysis.optimization_recommendations.map((recommendation: any, index: number) => (
                                                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-green-600">{index + 1}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h6 className="font-medium text-green-900 mb-1">{recommendation.item_name}</h6>
                                                            <div className="text-sm text-green-700 mb-2">
                                                                <span className="line-through">€{recommendation.current_price?.toLocaleString()}</span>
                                                                <span className="mx-2">→</span>
                                                                <span className="font-medium">€{recommendation.suggested_price?.toLocaleString()}</span>
                                                                <span className={`ml-2 ${recommendation.adjustment_percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    ({recommendation.adjustment_percentage > 0 ? '+' : ''}{recommendation.adjustment_percentage?.toFixed(1)}%)
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-green-800">{recommendation.reasoning}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Estrategias de Pricing */}
                                    {currentResults.analysis.pricing_strategies && currentResults.analysis.pricing_strategies.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <Brain className="h-5 w-5 text-purple-600" />
                                                Estrategias de Pricing Recomendadas
                                            </h5>
                                            <div className="space-y-4">
                                                {currentResults.analysis.pricing_strategies.map((strategy: any, index: number) => (
                                                    <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                        <h6 className="font-medium text-purple-900 mb-2">{strategy.strategy}</h6>
                                                        <p className="text-sm text-purple-700 mb-2">{strategy.description}</p>
                                                        <div className="text-xs text-purple-600">
                                                            <span className="font-medium">Impacto esperado:</span> {strategy.potential_impact}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Próximos Pasos */}
                                    {currentResults.analysis.next_steps && currentResults.analysis.next_steps.length > 0 && (
                                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6">
                                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                                Próximos Pasos Recomendados
                                            </h5>
                                            <div className="space-y-2">
                                                {currentResults.analysis.next_steps.map((step: string, index: number) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        </div>
                                                        <span className="text-sm text-gray-700">{step}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Resultados específicos para Análisis de Riesgos de Proyecto */}
                            {currentResults.project && currentResults.analysis && currentResults.analysis.overall_risk_score && (
                                <div className="space-y-6">
                                    {/* Información del Proyecto */}
                                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-red-100 rounded-full">
                                                <AlertTriangle className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-red-900 text-lg">{currentResults.project.name}</h4>
                                                <p className="text-sm text-red-700">
                                                    Estado: {currentResults.project.status} • Progreso: {currentResults.project.progress || 0}% • Presupuesto: {currentResults.project.budget ? `${currentResults.project.budget} ${currentResults.project.currency || 'EUR'}` : 'No especificado'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nivel de Riesgo General */}
                                    <div className="bg-white border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <Target className="h-5 w-5 text-red-600" />
                                            </div>
                                            <h5 className="font-semibold text-gray-900">Nivel de Riesgo General</h5>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`text-3xl font-bold ${
                                                currentResults.analysis.overall_risk_score >= 7 ? 'text-red-600' :
                                                currentResults.analysis.overall_risk_score >= 5 ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                                {currentResults.analysis.overall_risk_score}/10
                                            </div>
                                            <div className="flex-1">
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${
                                                            currentResults.analysis.overall_risk_score >= 7 ? 'bg-red-500' :
                                                            currentResults.analysis.overall_risk_score >= 5 ? 'bg-yellow-500' :
                                                            'bg-green-500'
                                                        }`}
                                                        style={{ width: `${(currentResults.analysis.overall_risk_score / 10) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {currentResults.analysis.overall_risk_score >= 7 ? '🔴 Riesgo Alto' :
                                                     currentResults.analysis.overall_risk_score >= 5 ? '🟡 Riesgo Moderado' :
                                                     '🟢 Riesgo Bajo'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Riesgos Identificados por Categoría */}
                                    {currentResults.analysis.identified_risks && currentResults.analysis.identified_risks.length > 0 && (
                                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-red-100 rounded-full">
                                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-red-900 text-xl">Riesgos Identificados</h4>
                                                    <p className="text-red-700 text-sm">{currentResults.analysis.identified_risks.length} riesgos detectados automáticamente</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentResults.analysis.identified_risks.map((risk: any, index: number) => {
                                                    // Verificar la estructura del riesgo
                                                    const riskCategory = risk.category || risk.type || risk.name || `Riesgo ${index + 1}`;
                                                    const riskDescription = risk.description || risk.details || risk.issue || 'Sin descripción disponible';
                                                    const riskSeverity = risk.severity || risk.level || 'medium';
                                                    const riskProbability = risk.probability || risk.severity_score || 0;
                                                    
                                                    return (
                                                        <div key={index} className="bg-white rounded-lg p-4 border border-red-100 shadow-sm">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                                                                    riskSeverity === 'high' || riskProbability >= 7 ? 'bg-red-100' :
                                                                    riskSeverity === 'medium' || riskProbability >= 4 ? 'bg-yellow-100' :
                                                                    'bg-green-100'
                                                                }`}>
                                                                    <span className={`font-semibold text-xs ${
                                                                        riskSeverity === 'high' || riskProbability >= 7 ? 'text-red-600' :
                                                                        riskSeverity === 'medium' || riskProbability >= 4 ? 'text-yellow-600' :
                                                                        'text-green-600'
                                                                    }`}>
                                                                        {riskSeverity === 'high' || riskProbability >= 7 ? '🔴' : 
                                                                         riskSeverity === 'medium' || riskProbability >= 4 ? '🟡' : '🟢'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h6 className="font-medium text-gray-900 mb-1 capitalize">{riskCategory}</h6>
                                                                    <p className="text-gray-700 text-sm leading-relaxed">{riskDescription}</p>
                                                                    {(riskProbability > 0) && (
                                                                        <p className="text-gray-500 text-xs mt-2">
                                                                            Severidad: {typeof riskProbability === 'number' ? `${riskProbability}/10` : riskProbability}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Planes de Mitigación */}
                                    {((currentResults.analysis.mitigation_plan && currentResults.analysis.mitigation_plan.length > 0) || 
                                      (currentResults.analysis.mitigation_plans && currentResults.analysis.mitigation_plans.length > 0)) && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-blue-100 rounded-full">
                                                    <Shield className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-blue-900 text-xl">Planes de Mitigación</h4>
                                                    <p className="text-blue-700 text-sm">Estrategias específicas para reducir riesgos</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {(currentResults.analysis.mitigation_plan || currentResults.analysis.mitigation_plans || []).map((plan: any, index: number) => {
                                                    const planRisk = plan.risk || plan.risk_category || plan.category || `Plan ${index + 1}`;
                                                    const planActions = plan.actions || plan.steps || plan.tasks || [];
                                                    const planResponsible = plan.responsible || plan.owner || 'No asignado';
                                                    const planTimeline = plan.timeline || plan.timeframe || '';
                                                    
                                                    return (
                                                        <div key={index} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                                                                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h6 className="font-medium text-gray-900 mb-2">{planRisk}</h6>
                                                                    <div className="space-y-2">
                                                                        {Array.isArray(planActions) && planActions.map((action: string, actionIndex: number) => (
                                                                            <div key={actionIndex} className="flex items-start gap-2">
                                                                                <span className="text-blue-500 text-xs mt-1">▶</span>
                                                                                <p className="text-gray-700 text-sm leading-relaxed">{action}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 mt-3 text-xs">
                                                                        {planResponsible && (
                                                                            <p className="text-blue-600 font-medium">👤 {planResponsible}</p>
                                                                        )}
                                                                        {planTimeline && (
                                                                            <p className="text-gray-500">⏱️ {planTimeline}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Señales de Alerta Temprana */}
                                    {currentResults.analysis.early_warning_signs && currentResults.analysis.early_warning_signs.length > 0 && (
                                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-yellow-100 rounded-full">
                                                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-yellow-900 text-xl">Señales de Alerta Temprana</h4>
                                                    <p className="text-yellow-700 text-sm">Indicadores clave para monitorear</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentResults.analysis.early_warning_signs.map((sign: string, index: number) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-yellow-100 shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-yellow-500 mt-1">⚠️</span>
                                                            <p className="text-gray-700 text-sm leading-relaxed">{sign}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Próximas Acciones Recomendadas */}
                                    {currentResults.analysis.next_actions && currentResults.analysis.next_actions.length > 0 && (
                                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-3 bg-emerald-100 rounded-full">
                                                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-emerald-900 text-xl">Próximas Acciones</h4>
                                                    <p className="text-emerald-700 text-sm">Pasos inmediatos recomendados por IA</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {currentResults.analysis.next_actions.map((action: string, index: number) => (
                                                    <div key={index} className="bg-white rounded-lg p-4 border border-emerald-100 shadow-sm">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                                                                <span className="text-emerald-600 font-semibold text-xs">✓</span>
                                                            </div>
                                                            <p className="text-gray-800 font-medium leading-relaxed">{action}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Resumen del Análisis - Solo para conversaciones */}
                            {currentResults?.analysis && Object.keys(currentResults.analysis).length > 0 && !currentResults.proposal && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tono General */}
                                    {currentResults.analysis.overallTone && (
                                        <div className="bg-white border-l-4 border-purple-500 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                                </div>
                                                <h5 className="font-semibold text-gray-900">Tono de Conversación</h5>
                                            </div>
                                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${currentResults.analysis.overallTone === 'positive' ? 'bg-green-100 text-green-800' :
                                                    currentResults.analysis.overallTone === 'negative' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {currentResults.analysis.overallTone === 'positive' ? '😊 Positivo' :
                                                    currentResults.analysis.overallTone === 'negative' ? '😟 Negativo' :
                                                        '😐 Neutral'}
                                            </div>
                                            {currentResults.analysis.confidence && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Confianza: {Math.round(currentResults.analysis.confidence * 100)}%
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Satisfacción del Cliente */}
                                    {currentResults.analysis.satisfactionLevel && (
                                        <div className="bg-white border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Star className="h-5 w-5 text-green-600" />
                                                </div>
                                                <h5 className="font-semibold text-gray-900">Satisfacción del Cliente</h5>
                                            </div>
                                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${currentResults.analysis.satisfactionLevel === 'high' ? 'bg-green-100 text-green-800' :
                                                    currentResults.analysis.satisfactionLevel === 'low' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {currentResults.analysis.satisfactionLevel === 'high' ? '⭐ Alta' :
                                                    currentResults.analysis.satisfactionLevel === 'low' ? '🔴 Baja' :
                                                        '🟡 Media'}
                                            </div>
                                            {currentResults.analysis.satisfactionScore && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Puntuación: {currentResults.analysis.satisfactionScore}/10
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Recomendaciones Principales - Destacadas */}
                            {currentResults.analysis?.recommendations && currentResults.analysis.recommendations.length > 0 && (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-100 rounded-full">
                                            <Brain className="h-7 w-7 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-900 text-xl">Recomendaciones de IA</h4>
                                            <p className="text-indigo-700 text-sm">Insights personalizados para mejorar tu comunicación</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {currentResults.analysis.recommendations.map((rec: string, index: number) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                                                        <span className="text-indigo-600 font-semibold text-sm">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-gray-800 font-medium leading-relaxed">{rec}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Próximo Mensaje Sugerido - Destacado */}
                            {currentResults.analysis?.nextMessage && (
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-emerald-100 rounded-full">
                                            <Mail className="h-7 w-7 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-900 text-xl">Mensaje Optimizado por IA</h4>
                                            <p className="text-emerald-700 text-sm">Listo para copiar y enviar</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-6 border border-emerald-100 shadow-sm mb-4">
                                        <div className="prose prose-sm max-w-none">
                                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                                                {currentResults.analysis.nextMessage}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => {
                                                navigator.clipboard.writeText(currentResults.analysis.nextMessage);
                                                showToast('📋 Mensaje copiado al portapapeles', 'success');
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            � Copiar Mensaje
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Puntos Fuertes y Áreas de Mejora */}
                            {(currentResults.analysis?.strengths?.length > 0 || currentResults.analysis?.improvementAreas?.length > 0) && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Puntos Fuertes */}
                                    {currentResults.analysis?.strengths && currentResults.analysis.strengths.length > 0 && (
                                        <div className="bg-white border border-green-200 rounded-lg p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                </div>
                                                <h5 className="font-semibold text-green-900">💪 Puntos Fuertes</h5>
                                            </div>
                                            <ul className="space-y-3">
                                                {currentResults.analysis.strengths.map((strength: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <span className="text-green-500 mt-1">✅</span>
                                                        <span className="text-gray-700 text-sm leading-relaxed">{strength}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Áreas de Mejora */}
                                    {currentResults.analysis?.improvementAreas && currentResults.analysis.improvementAreas.length > 0 && (
                                        <div className="bg-white border border-orange-200 rounded-lg p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Target className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <h5 className="font-semibold text-orange-900">🎯 Áreas de Mejora</h5>
                                            </div>
                                            <ul className="space-y-3">
                                                {currentResults.analysis.improvementAreas.map((area: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <span className="text-orange-500 mt-1">⚠️</span>
                                                        <span className="text-gray-700 text-sm leading-relaxed">{area}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Información Técnica - Compacta */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">Procesado con OpenAI GPT-4o-mini</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600">{new Date().toLocaleDateString('es-ES')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-3 p-6 border-t bg-gray-50">
                            <div className="text-sm text-gray-600">
                                💡 Resultados procesados con IA avanzada
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowResultsModal(false)}
                                >
                                    Cerrar
                                </Button>
                                {currentResults.analysis?.nextMessage && (
                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(currentResults.analysis.nextMessage);
                                            showToast('📋 Mensaje copiado listo para enviar', 'success');
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        📋 Copiar Mensaje
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Profesional para Entrada de Datos */}
            {showModal && currentAutomation && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    {React.createElement(currentAutomation.icon, {
                                        className: "h-6 w-6 text-blue-600"
                                    })}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {currentAutomation.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {currentAutomation.description}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            {renderModalContent()}
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={executeAutomation}
                                disabled={!isModalDataValid()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Ejecutar Automatización
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Component */}
            {toast.show && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className={`rounded-lg p-4 shadow-lg max-w-md ${toast.type === 'success' ? 'bg-green-500 text-white' :
                        toast.type === 'error' ? 'bg-red-500 text-white' :
                            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
                                'bg-blue-500 text-white'
                        }`}>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                                {toast.type === 'error' && <X className="h-5 w-5" />}
                                {toast.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                                {toast.type === 'info' && <MessageSquare className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium whitespace-pre-line">
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setToast(prev => ({ ...prev, show: false }))}
                                className="flex-shrink-0 hover:opacity-75"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
