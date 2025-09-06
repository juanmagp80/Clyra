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
    DollarSign,
    FileText,
    Mail,
    MessageSquare,
    Pause,
    Play,
    Search,
    Settings,
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
    const [executionResults, setExecutionResults] = useState<{ [key: string]: any }>({});
    const [recentInsights, setRecentInsights] = useState<any[]>([]);
    const [showingResults, setShowingResults] = useState(false);

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
                return modalData.proposalText?.trim();
            case 'content_generation':
                return modalData.topic?.trim() && modalData.contentType?.trim();
            case 'risk_detection':
                return modalData.projectId;
            case 'performance_analysis':
                return modalData.period;
            case 'pricing_optimization':
                return modalData.projectType?.trim() && modalData.scope?.trim() && modalData.currentPrice;
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
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Texto de la propuesta *
                            </label>
                            <textarea
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Introduce el texto completo de tu propuesta..."
                                value={modalData.proposalText || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, proposalText: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de proyecto
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ej: desarrollo web, diseño, consultoría..."
                                value={modalData.projectType || ''}
                                onChange={(e) => setModalData(prev => ({ ...prev, projectType: e.target.value }))}
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
                                    <option value="">Propuesta general</option>
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
                    <div className="space-y-4">
                        {userProjects.length > 0 ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proyecto a analizar *
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={modalData.projectId || ''}
                                    onChange={(e) => setModalData(prev => ({ ...prev, projectId: e.target.value }))}
                                >
                                    <option value="">Seleccionar proyecto</option>
                                    {userProjects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No hay proyectos disponibles
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Necesitas tener al menos un proyecto para usar esta automatización.
                                </p>
                                <Button
                                    onClick={() => router.push('/dashboard/projects')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Crear Proyecto
                                </Button>
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
                    automationType = 'proposal_analysis';
                    requestData = {
                        proposalText: modalData.proposalText,
                        clientId: modalData.clientId,
                        projectType: modalData.projectType
                    };
                    break;

                case 'content_generation':
                    automationType = 'content_generation';
                    requestData = {
                        contentType: modalData.contentType,
                        topic: modalData.topic,
                        targetAudience: modalData.targetAudience,
                        tone: modalData.tone
                    };
                    break;

                case 'risk_detection':
                    automationType = 'risk_detection';
                    requestData = {
                        projectId: modalData.projectId
                    };
                    break;

                case 'performance_analysis':
                    automationType = 'performance_analysis';
                    requestData = {
                        period: modalData.period
                    };
                    break;

                case 'pricing_optimization':
                    automationType = 'pricing_optimization';
                    requestData = {
                        projectType: modalData.projectType,
                        scope: modalData.scope,
                        currentPrice: parseFloat(modalData.currentPrice)
                    };
                    break;

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
                    setExecutionResults(prev => ({
                        ...prev,
                        [currentAutomation.id]: autoResult
                    }));

                    showToast(
                        `🎉 ${autoResult.message}! Se detectaron ${autoResult.processedEvents} eventos y se generaron emails automáticamente.`,
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

        return error ? [] : data || [];
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
            icon: MessageSquare,
            color: 'green',
            isNew: true
        },
        {
            id: 'proposal-analyzer',
            name: '📊 Analizador de Propuestas',
            description: 'IA evalúa tus propuestas comerciales con OpenAI, identifica fortalezas/debilidades y sugiere mejoras',
            category: 'sales',
            type: 'proposal_analysis',
            status: 'active',
            confidence: 88,
            successRate: 86,
            executionCount: 0,
            aiFeatures: ['Score de Calidad', 'Análisis de Competitividad', 'Identificación de Gaps', 'Sugerencias de Mejora'],
            icon: FileText,
            color: 'purple',
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
        {
            id: 'pricing-optimizer',
            name: '💰 Optimizador de Precios',
            description: 'IA analiza datos del mercado y tu historial con OpenAI para sugerir precios óptimos y estrategias de pricing',
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
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col overflow-hidden ml-56">
                <TrialBanner userEmail={userEmail} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4 sm:px-6 py-8">

                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <Brain className="h-8 w-8 mr-3 text-blue-600" />
                                        Automatizaciones IA Reales
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
                                                <div className="absolute top-3 right-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    ✅ Ejecutada
                                                </div>
                                            )}

                                            <div className="p-6">{/* Header */}
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
