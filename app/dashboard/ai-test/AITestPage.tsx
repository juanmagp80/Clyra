'use client';

import { Button } from '@/components/ui/Button';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { executeAutomationAction, type ActionPayload } from '@/src/lib/automation-actions';
import { Brain, MessageSquare, DollarSign, TrendingUp, Mail, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface AITestPageProps {
    userEmail: string;
}

export default function AITestPage({ userEmail }: AITestPageProps) {
    const [results, setResults] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const supabase = createSupabaseClient();

    const runSentimentAnalysis = async () => {
        setLoading({ ...loading, sentiment: true });
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const testText = "Estoy muy decepcionado con el progreso del proyecto. Las fechas se han retrasado y la calidad no es la esperada. Necesito una solución urgente.";
            
            const payload: ActionPayload = {
                client: {
                    id: 'test-client',
                    name: 'Cliente Prueba',
                    email: 'cliente@test.com'
                },
                automation: {
                    id: 'test-sentiment',
                    name: 'Test Sentimiento'
                },
                user: user,
                supabase: supabase,
                executionId: 'test-' + Date.now()
            };

            const result = await executeAutomationAction({
                type: 'analyze_sentiment',
                parameters: {
                    text: testText,
                    client_context: 'Cliente Prueba - Proyecto Web'
                }
            }, payload);

            setResults({ ...results, sentiment: result });
        } catch (error) {
            setResults({ ...results, sentiment: { success: false, message: 'Error: ' + (error as Error).message } });
        } finally {
            setLoading({ ...loading, sentiment: false });
        }
    };

    const runProposalGeneration = async () => {
        setLoading({ ...loading, proposal: true });
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const payload: ActionPayload = {
                client: {
                    id: 'test-client',
                    name: 'TechCorp SA',
                    email: 'contacto@techcorp.com',
                    company: 'TechCorp SA'
                },
                automation: {
                    id: 'test-proposal',
                    name: 'Test Propuesta'
                },
                user: user,
                supabase: supabase,
                executionId: 'test-' + Date.now()
            };

            const result = await executeAutomationAction({
                type: 'generate_ai_proposal',
                parameters: {
                    project_description: 'Desarrollo de aplicación web e-commerce con carrito de compras, pasarela de pago y panel administrativo',
                    budget_range: '5000-8000 EUR',
                    timeline: '3 meses',
                    services: 'Desarrollo Frontend, Backend, Base de datos, Hosting'
                }
            }, payload);

            setResults({ ...results, proposal: result });
        } catch (error) {
            setResults({ ...results, proposal: { success: false, message: 'Error: ' + (error as Error).message } });
        } finally {
            setLoading({ ...loading, proposal: false });
        }
    };

    const runPricingOptimization = async () => {
        setLoading({ ...loading, pricing: true });
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const payload: ActionPayload = {
                client: {
                    id: 'test-client',
                    name: 'Startup Innovadora',
                    email: 'ceo@startup.com'
                },
                automation: {
                    id: 'test-pricing',
                    name: 'Test Pricing'
                },
                user: user,
                supabase: supabase,
                executionId: 'test-' + Date.now()
            };

            const result = await executeAutomationAction({
                type: 'optimize_pricing',
                parameters: {
                    project_type: 'Aplicación móvil React Native',
                    client_budget: '10000 EUR',
                    complexity: 'Alta - integración con APIs externas, geolocalización, pagos',
                    timeline: '4 meses'
                }
            }, payload);

            setResults({ ...results, pricing: result });
        } catch (error) {
            setResults({ ...results, pricing: { success: false, message: 'Error: ' + (error as Error).message } });
        } finally {
            setLoading({ ...loading, pricing: false });
        }
    };

    const runTaskPrioritization = async () => {
        setLoading({ ...loading, tasks: true });
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const payload: ActionPayload = {
                client: {
                    id: 'test-client',
                    name: 'Cliente Múltiple',
                    email: 'proyectos@cliente.com'
                },
                automation: {
                    id: 'test-tasks',
                    name: 'Test Tasks'
                },
                user: user,
                supabase: supabase,
                executionId: 'test-' + Date.now()
            };

            const testTasks = [
                'Diseñar mockups página principal - Deadline: mañana',
                'Revisar código del backend - Deadline: esta semana',
                'Llamada con cliente VIP - Deadline: hoy',
                'Documentar API - Deadline: próximo mes',
                'Fix bug crítico en producción - Deadline: urgente'
            ];

            const result = await executeAutomationAction({
                type: 'prioritize_tasks_ai',
                parameters: {
                    tasks: testTasks,
                    current_workload: 'Alto',
                    user_preferences: 'Priorizar clientes VIP y bugs críticos'
                }
            }, payload);

            setResults({ ...results, tasks: result });
        } catch (error) {
            setResults({ ...results, tasks: { success: false, message: 'Error: ' + (error as Error).message } });
        } finally {
            setLoading({ ...loading, tasks: false });
        }
    };

    const runEmailGeneration = async () => {
        setLoading({ ...loading, email: true });
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const payload: ActionPayload = {
                client: {
                    id: 'test-client',
                    name: 'María González',
                    email: 'maria@empresa.com',
                    company: 'Empresa Innovadora SL'
                },
                automation: {
                    id: 'test-email',
                    name: 'Test Email'
                },
                user: user,
                supabase: supabase,
                executionId: 'test-' + Date.now()
            };

            const result = await executeAutomationAction({
                type: 'send_email',
                parameters: {
                    use_ai_generation: true,
                    email_type: 'project_update',
                    client_context: 'Proyecto de rediseño web - 60% completado',
                    tone: 'professional',
                    subject: 'Actualización del proyecto - Semana 3',
                    template: 'Generar con IA'
                }
            }, payload);

            setResults({ ...results, email: result });
        } catch (error) {
            setResults({ ...results, email: { success: false, message: 'Error: ' + (error as Error).message } });
        } finally {
            setLoading({ ...loading, email: false });
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Prueba las Automatizaciones IA Reales</h1>
                <p className="text-gray-600">
                    Estas automatizaciones están completamente implementadas y usan OpenAI GPT-4o-mini
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Análisis de Sentimiento */}
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center mb-4">
                        <Brain className="h-8 w-8 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold">Análisis de Sentimiento</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Analiza texto de cliente para detectar sentimientos negativos
                    </p>
                    <Button 
                        onClick={runSentimentAnalysis}
                        disabled={loading.sentiment}
                        className="w-full mb-4"
                    >
                        {loading.sentiment ? '🔄 Analizando...' : <><Play className="w-4 h-4 mr-2" /> Probar</>}
                    </Button>
                    {results.sentiment && (
                        <div className={`p-3 rounded text-sm ${results.sentiment.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {results.sentiment.success ? <CheckCircle className="w-4 h-4 mr-2 inline" /> : <AlertCircle className="w-4 h-4 mr-2 inline" />}
                            {results.sentiment.message}
                            {results.sentiment.data && (
                                <div className="mt-2 text-xs">
                                    Sentimiento: {results.sentiment.data.sentiment}<br/>
                                    Confianza: {Math.round(results.sentiment.data.confidence * 100)}%
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Generación de Propuestas */}
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center mb-4">
                        <MessageSquare className="h-8 w-8 text-purple-600 mr-3" />
                        <h3 className="text-lg font-semibold">Propuestas IA</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Genera propuestas profesionales automáticamente
                    </p>
                    <Button 
                        onClick={runProposalGeneration}
                        disabled={loading.proposal}
                        className="w-full mb-4"
                    >
                        {loading.proposal ? '🔄 Generando...' : <><Play className="w-4 h-4 mr-2" /> Probar</>}
                    </Button>
                    {results.proposal && (
                        <div className={`p-3 rounded text-sm ${results.proposal.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {results.proposal.success ? <CheckCircle className="w-4 h-4 mr-2 inline" /> : <AlertCircle className="w-4 h-4 mr-2 inline" />}
                            {results.proposal.message}
                        </div>
                    )}
                </div>

                {/* Optimización de Precios */}
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center mb-4">
                        <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                        <h3 className="text-lg font-semibold">Precios Inteligentes</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Optimiza precios basado en datos del proyecto
                    </p>
                    <Button 
                        onClick={runPricingOptimization}
                        disabled={loading.pricing}
                        className="w-full mb-4"
                    >
                        {loading.pricing ? '🔄 Calculando...' : <><Play className="w-4 h-4 mr-2" /> Probar</>}
                    </Button>
                    {results.pricing && (
                        <div className={`p-3 rounded text-sm ${results.pricing.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {results.pricing.success ? <CheckCircle className="w-4 h-4 mr-2 inline" /> : <AlertCircle className="w-4 h-4 mr-2 inline" />}
                            {results.pricing.message}
                        </div>
                    )}
                </div>

                {/* Priorización de Tareas */}
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center mb-4">
                        <TrendingUp className="h-8 w-8 text-indigo-600 mr-3" />
                        <h3 className="text-lg font-semibold">Tareas Inteligentes</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Prioriza tareas automáticamente con IA
                    </p>
                    <Button 
                        onClick={runTaskPrioritization}
                        disabled={loading.tasks}
                        className="w-full mb-4"
                    >
                        {loading.tasks ? '🔄 Priorizando...' : <><Play className="w-4 h-4 mr-2" /> Probar</>}
                    </Button>
                    {results.tasks && (
                        <div className={`p-3 rounded text-sm ${results.tasks.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {results.tasks.success ? <CheckCircle className="w-4 h-4 mr-2 inline" /> : <AlertCircle className="w-4 h-4 mr-2 inline" />}
                            {results.tasks.message}
                        </div>
                    )}
                </div>

                {/* Generación de Emails */}
                <div className="bg-white rounded-lg shadow-md p-6 border">
                    <div className="flex items-center mb-4">
                        <Mail className="h-8 w-8 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold">Emails IA</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Genera emails personalizados con contexto
                    </p>
                    <Button 
                        onClick={runEmailGeneration}
                        disabled={loading.email}
                        className="w-full mb-4"
                    >
                        {loading.email ? '🔄 Escribiendo...' : <><Play className="w-4 h-4 mr-2" /> Probar</>}
                    </Button>
                    {results.email && (
                        <div className={`p-3 rounded text-sm ${results.email.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {results.email.success ? <CheckCircle className="w-4 h-4 mr-2 inline" /> : <AlertCircle className="w-4 h-4 mr-2 inline" />}
                            {results.email.message}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">✅ Todas Funcionan Realmente</h3>
                <p className="text-blue-800 text-sm">
                    Estas automatizaciones están completamente implementadas con OpenAI GPT-4o-mini. 
                    No son mockups - generan contenido real, analizan datos reales y toman acciones reales.
                </p>
            </div>
        </div>
    );
}
