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
    Send,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    FileText,
    TrendingUp,
    Users,
    Calendar,
    Download,
    Copy,
    Edit3,
    Trash2,
    BarChart3,
    Target,
    Zap,
    Presentation,
    Mail,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Proposal {
    id: string;
    client_id: string | null;
    prospect_name: string | null;
    prospect_email: string | null;
    title: string;
    description: string;
    services: any;
    pricing: any;
    terms: any;
    timeline: any;
    status: string;
    valid_until: string | null;
    sent_at: string | null;
    viewed_at: string | null;
    responded_at: string | null;
    total_amount: number;
    currency: string;
    template_used: string | null;
    notes: string | null;
    created_at: string;
}

interface ProposalsPageClientProps {
    userEmail: string;
}

export default function ProposalsPageClient({ userEmail }: ProposalsPageClientProps) {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        sent: 0,
        accepted: 0,
        pending: 0,
        total_value: 0,
        won_value: 0,
        conversion_rate: 0,
        avg_response_time: 0
    });
    
    const router = useRouter();
    const supabase = createSupabaseClient();

    const statusFilters = [
        { id: 'all', name: 'Todas', icon: FileText, color: 'text-slate-600' },
        { id: 'draft', name: 'Borradores', icon: Edit3, color: 'text-blue-600' },
        { id: 'sent', name: 'Enviadas', icon: Send, color: 'text-orange-600' },
        { id: 'viewed', name: 'Vistas', icon: Eye, color: 'text-purple-600' },
        { id: 'accepted', name: 'Aceptadas', icon: CheckCircle, color: 'text-green-600' },
        { id: 'rejected', name: 'Rechazadas', icon: XCircle, color: 'text-red-600' }
    ];

    const proposalTemplates = [
        {
            id: 'web_development',
            name: 'Desarrollo Web',
            description: 'Propuesta completa para proyectos de desarrollo web',
            icon: Presentation,
            color: 'bg-blue-500',
            estimatedValue: '€3,500',
            conversionRate: '68%'
        },
        {
            id: 'design',
            name: 'Diseño de Marca',
            description: 'Propuesta para proyectos de identidad visual',
            icon: Target,
            color: 'bg-purple-500',
            estimatedValue: '€1,200',
            conversionRate: '72%'
        },
        {
            id: 'consulting',
            name: 'Consultoría Digital',
            description: 'Propuesta para servicios de consultoría',
            icon: BarChart3,
            color: 'bg-green-500',
            estimatedValue: '€2,800',
            conversionRate: '65%'
        },
        {
            id: 'marketing',
            name: 'Marketing Digital',
            description: 'Propuesta para campañas de marketing',
            icon: TrendingUp,
            color: 'bg-indigo-500',
            estimatedValue: '€2,200',
            conversionRate: '58%'
        },
        {
            id: 'maintenance',
            name: 'Mantenimiento Web',
            description: 'Propuesta para servicios de mantenimiento',
            icon: Clock,
            color: 'bg-orange-500',
            estimatedValue: '€450/mes',
            conversionRate: '85%'
        },
        {
            id: 'ecommerce',
            name: 'E-commerce',
            description: 'Propuesta para tiendas online',
            icon: DollarSign,
            color: 'bg-emerald-500',
            estimatedValue: '€5,500',
            conversionRate: '62%'
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

    const loadProposals = async () => {
        try {
            setLoading(true);
            
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar propuestas del usuario
            const { data, error } = await supabase
                .from('proposals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading proposals:', error);
                return;
            }

            setProposals(data || []);
            setFilteredProposals(data || []);
            
            // Calcular estadísticas
            const total = data?.length || 0;
            const sent = data?.filter(p => ['sent', 'viewed', 'accepted', 'rejected'].includes(p.status)).length || 0;
            const accepted = data?.filter(p => p.status === 'accepted').length || 0;
            const pending = data?.filter(p => ['sent', 'viewed'].includes(p.status)).length || 0;
            const total_value = data?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
            const won_value = data?.filter(p => p.status === 'accepted').reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
            const conversion_rate = sent > 0 ? Math.round((accepted / sent) * 100) : 0;
            
            // Calcular tiempo promedio de respuesta (simulado)
            const avg_response_time = Math.round(Math.random() * 48 + 24); // 24-72 horas
            
            setStats({ 
                total, 
                sent, 
                accepted, 
                pending, 
                total_value, 
                won_value, 
                conversion_rate,
                avg_response_time
            });
            
        } catch (error) {
            console.error('Error loading proposals:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProposals = () => {
        let filtered = proposals;

        // Filtrar por búsqueda
        if (searchQuery) {
            filtered = filtered.filter(proposal =>
                proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proposal.prospect_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proposal.prospect_email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por estado
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(proposal => proposal.status === selectedStatus);
        }

        setFilteredProposals(filtered);
    };

    const duplicateProposal = async (proposal: Proposal) => {
        try {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const newProposal = {
                user_id: user.id,
                title: `${proposal.title} (Copia)`,
                description: proposal.description,
                services: proposal.services,
                pricing: proposal.pricing,
                terms: proposal.terms,
                timeline: proposal.timeline,
                total_amount: proposal.total_amount,
                currency: proposal.currency,
                status: 'draft'
            };

            const { error } = await supabase
                .from('proposals')
                .insert([newProposal]);

            if (error) {
                console.error('Error duplicating proposal:', error);
                return;
            }

            await loadProposals();
            
        } catch (error) {
            console.error('Error duplicating proposal:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-blue-100 text-blue-700';
            case 'sent': return 'bg-orange-100 text-orange-700';
            case 'viewed': return 'bg-purple-100 text-purple-700';
            case 'accepted': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'expired': return 'bg-slate-100 text-slate-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return Edit3;
            case 'sent': return Send;
            case 'viewed': return Eye;
            case 'accepted': return CheckCircle;
            case 'rejected': return XCircle;
            case 'expired': return Clock;
            default: return FileText;
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
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    useEffect(() => {
        loadProposals();
    }, []);

    useEffect(() => {
        filterProposals();
    }, [searchQuery, selectedStatus, proposals]);

    if (loading) {
        return (
            <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />
                <div className="flex-1 ml-56 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600">Cargando propuestas...</p>
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
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                                    <Presentation className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                                                        Propuestas Comerciales
                                                    </h1>
                                                    <p className="text-slate-600 font-medium">
                                                        Convierte leads en clientes con propuestas profesionales automatizadas
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => {/* Crear nueva propuesta */}}
                                                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transform transition-all duration-200"
                                            >
                                                <Plus className="w-5 h-5 mr-2" />
                                                Nueva Propuesta
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Dashboard */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Total Propuestas</p>
                                                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Tasa Conversión</p>
                                                <p className="text-3xl font-bold text-green-600">{stats.conversion_rate}%</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                                                <TrendingUp className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                                                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.total_value)}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                                <DollarSign className="w-6 h-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Valor Ganado</p>
                                                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.won_value)}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-purple-600" />
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
                                                    placeholder="Buscar propuestas..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 bg-white/80 border-slate-200/60 focus:border-emerald-400 focus:ring-emerald-400/20"
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
                                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
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

                            {/* Proposal Templates */}
                            {filteredProposals.length === 0 && proposals.length === 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Templates de Propuestas</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {proposalTemplates.map((template) => {
                                            const IconComponent = template.icon;
                                            
                                            return (
                                                <Card key={template.id} className="group bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                                                    <CardHeader>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-12 h-12 ${template.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                                    <IconComponent className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div>
                                                                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                                                                        {template.name}
                                                                    </CardTitle>
                                                                    <p className="text-sm text-slate-600">
                                                                        {template.conversionRate} conversión
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-emerald-600">{template.estimatedValue}</p>
                                                                <p className="text-xs text-slate-500">Valor promedio</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <p className="text-sm text-slate-600 mb-4">
                                                            {template.description}
                                                        </p>
                                                    </CardHeader>
                                                    
                                                    <CardContent className="pt-0">
                                                        <Button
                                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200"
                                                            size="sm"
                                                        >
                                                            <Zap className="w-4 h-4 mr-2" />
                                                            Usar Template
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Existing Proposals */}
                            {filteredProposals.length > 0 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-slate-900">Tus Propuestas</h2>
                                    
                                    {filteredProposals.map((proposal) => {
                                        const StatusIcon = getStatusIcon(proposal.status);
                                        
                                        return (
                                            <Card key={proposal.id} className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center shadow-lg">
                                                                <StatusIcon className="w-6 h-6 text-emerald-600" />
                                                            </div>
                                                            
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="text-lg font-bold text-slate-900">{proposal.title}</h3>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(proposal.status)}`}>
                                                                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                                                    <span>Cliente: {proposal.prospect_name || 'Sin asignar'}</span>
                                                                    <span>Valor: {formatCurrency(proposal.total_amount)}</span>
                                                                    <span>Creado: {formatDate(proposal.created_at)}</span>
                                                                </div>
                                                                
                                                                {proposal.description && (
                                                                    <p className="text-sm text-slate-600 line-clamp-1">{proposal.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                onClick={() => {/* Ver propuesta */}}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-200 hover:bg-slate-50"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            
                                                            <Button
                                                                onClick={() => duplicateProposal(proposal)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-200 hover:bg-slate-50"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </Button>
                                                            
                                                            <Button
                                                                onClick={() => {/* Editar propuesta */}}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-200 hover:bg-slate-50"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Button>
                                                            
                                                            {proposal.status === 'draft' && (
                                                                <Button
                                                                    onClick={() => {/* Enviar propuesta */}}
                                                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
                                                                    size="sm"
                                                                >
                                                                    <Send className="w-4 h-4 mr-2" />
                                                                    Enviar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Empty State */}
                            {filteredProposals.length === 0 && proposals.length > 0 && (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Presentation className="w-12 h-12 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        No se encontraron propuestas
                                    </h3>
                                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                        Intenta ajustar los filtros de búsqueda o crear una nueva propuesta
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
