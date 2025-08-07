// COMPONENTE: Dashboard de Productividad con IA para Freelancers
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Brain,
    TrendingUp,
    Clock,
    Target,
    Zap,
    AlertTriangle,
    CheckCircle,
    Calendar,
    DollarSign,
    Users,
    Briefcase,
    Activity,
    Star,
    BarChart3,
    Lightbulb
} from 'lucide-react';

interface ProductivityMetrics {
    focus_score: number; // 0-100
    efficiency_rating: number; // 0-5
    workload_balance: number; // 0-100
    client_satisfaction: number; // 0-5
    revenue_trend: 'up' | 'down' | 'stable';
    burnout_risk: 'low' | 'medium' | 'high';
    peak_hours: string[];
    productivity_insights: string[];
    recommendations: AIRecommendation[];
}

interface AIRecommendation {
    id: string;
    type: 'time_management' | 'pricing' | 'client_acquisition' | 'skill_development' | 'work_life_balance';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    action: string;
    impact: string;
    estimated_time: string;
}

interface TimeBlockSuggestion {
    start_time: string;
    end_time: string;
    activity: string;
    reason: string;
    estimated_productivity: number;
}

export default function FreelancerProductivityDashboard({ userEmail }: { userEmail: string }) {
    const [metrics, setMetrics] = useState<ProductivityMetrics | null>(null);
    const [timeBlocks, setTimeBlocks] = useState<TimeBlockSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const supabase = createSupabaseClient();

    const loadProductivityMetrics = async () => {
        try {
            setLoading(true);
            
            // Simulación de métricas con IA - En producción vendría de análisis real
            const mockMetrics: ProductivityMetrics = {
                focus_score: 78,
                efficiency_rating: 4.2,
                workload_balance: 65,
                client_satisfaction: 4.7,
                revenue_trend: 'up',
                burnout_risk: 'medium',
                peak_hours: ['09:00-11:00', '14:00-16:00'],
                productivity_insights: [
                    'Tus mejores horas de productividad son entre 9-11 AM',
                    'Completas tareas 23% más rápido los martes y miércoles',
                    'Proyectos de diseño toman 15% menos tiempo que desarrollo'
                ],
                recommendations: [
                    {
                        id: '1',
                        type: 'time_management',
                        priority: 'high',
                        title: 'Optimizar horario de trabajo',
                        description: 'Basado en tu patrón de productividad, deberías programar tareas complejas entre 9-11 AM',
                        action: 'Reorganizar calendario para usar horas pico',
                        impact: 'Hasta 30% más productividad',
                        estimated_time: '15 min configuración'
                    },
                    {
                        id: '2',
                        type: 'pricing',
                        priority: 'medium',
                        title: 'Ajustar tarifas de diseño',
                        description: 'Tus proyectos de diseño se completan más rápido que el promedio. Podrías aumentar tarifas.',
                        action: 'Incrementar tarifa de diseño en 20%',
                        impact: 'Aumento de ingresos estimado: €800/mes',
                        estimated_time: '5 min actualizar precios'
                    },
                    {
                        id: '3',
                        type: 'work_life_balance',
                        priority: 'high',
                        title: 'Riesgo de burnout detectado',
                        description: 'Has trabajado más de 55 horas esta semana. Es importante mantener equilibrio.',
                        action: 'Programar descansos y límites de horario',
                        impact: 'Mejor salud y productividad sostenible',
                        estimated_time: 'Implementación gradual'
                    },
                    {
                        id: '4',
                        type: 'client_acquisition',
                        priority: 'medium',
                        title: 'Oportunidad de expansion',
                        description: 'Tu tasa de satisfacción es alta (4.7/5). Momento ideal para pedir referencias.',
                        action: 'Contactar 3 clientes satisfechos para referencias',
                        impact: '2-3 leads nuevos esperados',
                        estimated_time: '1 hora total'
                    }
                ]
            };

            setMetrics(mockMetrics);
            
            // Generar bloques de tiempo sugeridos
            const timeBlockSuggestions: TimeBlockSuggestion[] = [
                {
                    start_time: '09:00',
                    end_time: '11:00',
                    activity: 'Desarrollo/Programación',
                    reason: 'Máxima concentración detectada en este horario',
                    estimated_productivity: 95
                },
                {
                    start_time: '11:00',
                    end_time: '11:30',
                    activity: 'Pausa activa',
                    reason: 'Descanso para mantener energía',
                    estimated_productivity: 0
                },
                {
                    start_time: '11:30',
                    end_time: '12:30',
                    activity: 'Emails y administración',
                    reason: 'Tareas administrativas en energía media',
                    estimated_productivity: 70
                },
                {
                    start_time: '14:00',
                    end_time: '16:00',
                    activity: 'Reuniones con clientes',
                    reason: 'Segundo pico de energía ideal para comunicación',
                    estimated_productivity: 85
                },
                {
                    start_time: '16:00',
                    end_time: '17:00',
                    activity: 'Tareas creativas/Diseño',
                    reason: 'Creatividad alta en horas vespertinas',
                    estimated_productivity: 80
                }
            ];
            
            setTimeBlocks(timeBlockSuggestions);
            
        } catch (error) {
            console.error('Error loading productivity metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAIInsights = async () => {
        setAiLoading(true);
        // Simular análisis con IA
        setTimeout(() => {
            setAiLoading(false);
            // Aquí se actualizarían las métricas con nuevos insights
        }, 2000);
    };

    useEffect(() => {
        loadProductivityMetrics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Analizando tu productividad...</p>
                </div>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'high': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
            case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <Activity className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header con acción rápida */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Dashboard de Productividad</h2>
                    <p className="text-slate-600">Análisis inteligente de tu rendimiento freelance</p>
                </div>
                <Button
                    onClick={generateAIInsights}
                    disabled={aiLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                >
                    <Brain className="w-4 h-4 mr-2" />
                    {aiLoading ? 'Analizando...' : 'Actualizar IA'}
                </Button>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Score de Enfoque</p>
                                <p className={`text-3xl font-bold ${getScoreColor(metrics?.focus_score || 0)}`}>
                                    {metrics?.focus_score}%
                                </p>
                            </div>
                            <Target className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Eficiencia</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {metrics?.efficiency_rating}/5
                                </p>
                            </div>
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Balance Carga</p>
                                <p className={`text-3xl font-bold ${getScoreColor(metrics?.workload_balance || 0)}`}>
                                    {metrics?.workload_balance}%
                                </p>
                            </div>
                            <Activity className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600">Riesgo Burnout</p>
                                <p className={`text-lg font-bold px-2 py-1 rounded-lg ${getRiskColor(metrics?.burnout_risk || 'low')}`}>
                                    {metrics?.burnout_risk?.toUpperCase()}
                                </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights y Recomendaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recomendaciones de IA */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            Recomendaciones Inteligentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {metrics?.recommendations.map((rec) => (
                                <div key={rec.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getPriorityIcon(rec.priority)}
                                            <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            rec.priority === 'high' ? 'bg-red-100 text-red-600' :
                                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                                    <div className="text-xs text-slate-500">
                                        <p><strong>Acción:</strong> {rec.action}</p>
                                        <p><strong>Impacto:</strong> {rec.impact}</p>
                                        <p><strong>Tiempo:</strong> {rec.estimated_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Horario Optimizado */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Horario Optimizado Hoy
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {timeBlocks.map((block, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="text-sm font-mono text-slate-600 min-w-[100px]">
                                        {block.start_time} - {block.end_time}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{block.activity}</p>
                                        <p className="text-xs text-slate-500">{block.reason}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-3 h-3 rounded-full ${
                                            block.estimated_productivity >= 80 ? 'bg-green-500' :
                                            block.estimated_productivity >= 60 ? 'bg-yellow-500' :
                                            block.estimated_productivity > 0 ? 'bg-red-500' : 'bg-gray-300'
                                        }`} />
                                        <span className="text-xs text-slate-600">
                                            {block.estimated_productivity > 0 ? `${block.estimated_productivity}%` : 'Descanso'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Insights de Productividad */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Insights de Productividad
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {metrics?.productivity_insights.map((insight, index) => (
                            <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Star className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-900">{insight}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
