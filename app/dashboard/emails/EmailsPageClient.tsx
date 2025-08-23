'use client';
import Sidebar from '@/components/Sidebar';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    AlertTriangle,
    Archive,
    Clock,
    Edit3,
    FileText,
    Filter,
    Forward,
    Inbox,
    Mail,
    MailOpen,
    Reply,
    Search,
    Send,
    Star,
    User,
    X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TrialBanner from '../../../components/TrialBanner';
import { useTrialStatus } from '../../../src/lib/useTrialStatus';
import EmailTemplatesModal from './EmailTemplatesModal';

// Tipos para el sistema de emails
type EmailTemplate = {
    id: string;
    name: string;
    subject: string;
    content: string;
    category: 'client' | 'project' | 'invoice' | 'marketing';
    created_at: string;
};

type EmailThread = {
    id: string;
    subject: string;
    from_email: string;
    from_name: string;
    to_email: string;
    to_name: string;
    content: string;
    is_read: boolean;
    is_important: boolean;
    is_archived: boolean;
    client_id?: string;
    project_id?: string;
    thread_id: string;
    created_at: string;
    client?: {
        name: string;
        company?: string;
    };
    project?: {
        name: string;
    };
};

type EmailCompose = {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    content: string;
    template_id?: string;
    client_id?: string;
    project_id?: string;
};

interface EmailsPageClientProps {
    userEmail: string;
}

export default function EmailsPageClient({ userEmail }: EmailsPageClientProps) {
    // Hook de trial status
    const { trialInfo, loading: trialLoading, hasReachedLimit, canUseFeatures } = useTrialStatus(userEmail);

    // Extiende el tipo de limits para incluir 'emails' opcional
    type TrialLimits = {
        maxClients: number;
        maxProjects: number;
        maxStorageGB: number;
        emails?: number;
    };

    const [emails, setEmails] = useState<EmailThread[]>([]);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedEmail, setSelectedEmail] = useState<EmailThread | null>(null);
    const [showComposer, setShowComposer] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    const [composeData, setComposeData] = useState<EmailCompose>({
        to: '',
        subject: '',
        content: '',
    });

    const supabase = createSupabaseClient();
    const router = useRouter();

    // Datos simulados para demo
    const demoEmails: EmailThread[] = [
        {
            id: '1',
            subject: 'Propuesta de Proyecto Web - Empresa ABC',
            from_email: 'contacto@empresaabc.com',
            from_name: 'María García',
            to_email: userEmail,
            to_name: 'Tu Nombre',
            content: 'Hola, estamos interesados en desarrollar una nueva web corporativa...',
            is_read: false,
            is_important: true,
            is_archived: false,
            client_id: '1',
            thread_id: 'thread_1',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            client: { name: 'María García', company: 'Empresa ABC' }
        },
        {
            id: '2',
            subject: 'Seguimiento del Proyecto Dashboard',
            from_email: 'jefe@startup.com',
            from_name: 'Carlos Ruiz',
            to_email: userEmail,
            to_name: 'Tu Nombre',
            content: 'Quería hacer seguimiento del estado del dashboard que estamos desarrollando...',
            is_read: true,
            is_important: false,
            is_archived: false,
            project_id: '1',
            thread_id: 'thread_2',
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            project: { name: 'Dashboard CRM' }
        },
        {
            id: '3',
            subject: 'Factura #001 - Pago Realizado',
            from_email: 'contabilidad@cliente.com',
            from_name: 'Ana López',
            to_email: userEmail,
            to_name: 'Tu Nombre',
            content: 'Te confirmamos que hemos realizado el pago de la factura #001...',
            is_read: true,
            is_important: false,
            is_archived: false,
            client_id: '2',
            thread_id: 'thread_3',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            client: { name: 'Ana López', company: 'Cliente Premium' }
        }
    ];

    const demoTemplates: EmailTemplate[] = [
        {
            id: '1',
            name: 'Bienvenida Nuevo Cliente',
            subject: 'Bienvenido a nuestros servicios',
            content: 'Estimado cliente,\n\nNos complace darte la bienvenida...',
            category: 'client',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Actualización de Proyecto',
            subject: 'Actualización del proyecto {{project_name}}',
            content: 'Hola,\n\nTe escribo para informarte sobre el progreso del proyecto...',
            category: 'project',
            created_at: new Date().toISOString()
        },
        {
            id: '3',
            name: 'Envío de Factura',
            subject: 'Nueva factura #{{invoice_number}}',
            content: 'Estimado cliente,\n\nAdjuntamos la factura correspondiente a los servicios...',
            category: 'invoice',
            created_at: new Date().toISOString()
        }
    ];

    useEffect(() => {
        // Simulamos carga de datos
        const loadData = async () => {
            setLoading(true);

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));

            setEmails(demoEmails);
            setTemplates(demoTemplates);

            // También podríamos cargar clientes y proyectos reales de Supabase
            if (supabase) {
                try {
                    const { data: clientsData } = await supabase
                        .from('clients')
                        .select('id, name, company')
                        .limit(10);

                    const { data: projectsData } = await supabase
                        .from('projects')
                        .select('id, name')
                        .limit(10);

                    setClients(clientsData || []);
                    setProjects(projectsData || []);
                } catch (error) {
                    console.error('Error loading data:', error);
                }
            }

            setLoading(false);
        };

        loadData();
    }, []);

    const handleLogout = async () => {
        try {
            if (!supabase) return;
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Función para manejar nuevo email
    const handleNewEmailClick = () => {
        if (!canUseFeatures) {
            alert('Tu periodo de prueba ha expirado. Actualiza tu plan para continuar enviando emails.');
            return;
        }

        if (hasReachedLimit('emails')) {
            // Usa el límite de emails si existe en trialInfo.limits, si no, usa 100 por defecto
            const emailLimit = (trialInfo && trialInfo.limits && typeof (trialInfo.limits as TrialLimits).emails === 'number')
                ? (trialInfo.limits as TrialLimits).emails
                : 100;
            alert(`Has alcanzado el límite de ${emailLimit} emails mensuales en el plan de prueba. Actualiza tu plan para enviar más emails.`);
            return;
        }

        setShowComposer(true);
    };

    const filteredEmails = emails.filter(email => {
        const matchesSearch =
            email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.from_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.content.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        switch (filterType) {
            case 'unread':
                matchesFilter = !email.is_read;
                break;
            case 'important':
                matchesFilter = email.is_important;
                break;
            case 'archived':
                matchesFilter = email.is_archived;
                break;
            case 'clients':
                matchesFilter = !!email.client_id;
                break;
            case 'projects':
                matchesFilter = !!email.project_id;
                break;
        }

        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: emails.length,
        unread: emails.filter(e => !e.is_read).length,
        important: emails.filter(e => e.is_important).length,
        today: emails.filter(e => {
            const today = new Date();
            const emailDate = new Date(e.created_at);
            return emailDate.toDateString() === today.toDateString();
        }).length
    };

    const markAsRead = (emailId: string) => {
        setEmails(prev => prev.map(email =>
            email.id === emailId ? { ...email, is_read: true } : email
        ));
    };

    const toggleImportant = (emailId: string) => {
        setEmails(prev => prev.map(email =>
            email.id === emailId ? { ...email, is_important: !email.is_important } : email
        ));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Hace unos minutos';
        if (diffInHours < 24) return `Hace ${diffInHours}h`;
        if (diffInHours < 48) return 'Ayer';
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const handleUseTemplate = (template: EmailTemplate) => {
        setComposeData({
            ...composeData,
            subject: template.subject,
            content: template.content,
            template_id: template.id
        });
        setShowComposer(true);
    };

    const getFilterIcon = (filter: string) => {
        switch (filter) {
            case 'unread': return <MailOpen className="w-4 h-4" />;
            case 'important': return <Star className="w-4 h-4" />;
            case 'archived': return <Archive className="w-4 h-4" />;
            case 'clients': return <User className="w-4 h-4" />;
            case 'projects': return <FileText className="w-4 h-4" />;
            default: return <Inbox className="w-4 h-4" />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 ml-56 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/90 to-indigo-100/80 backdrop-blur-3xl">
                        <div className="container mx-auto px-6 py-8">
                            {/* Trial Banner */}
                            <div className="mb-8">
                                <TrialBanner userEmail={userEmail} />
                            </div>

                            {/* Header Premium */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-indigo-500/10 p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
                                                Centro de Comunicaciones
                                            </h1>
                                            <p className="text-slate-600 text-lg font-medium">
                                                Gestiona todas tus comunicaciones profesionales desde un solo lugar
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setShowTemplates(true)}
                                                className="px-6 py-3 bg-white/60 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Templates
                                            </button>
                                            <button
                                                onClick={handleNewEmailClick}
                                                disabled={!canUseFeatures || hasReachedLimit('emails')}
                                                className={`group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-200 flex items-center gap-3 ${(!canUseFeatures || hasReachedLimit('emails'))
                                                        ? 'opacity-50 cursor-not-allowed !bg-gray-400 hover:!bg-gray-400 !shadow-gray-400/25 hover:!shadow-gray-400/25 hover:!scale-100'
                                                        : ''
                                                    }`}
                                            >
                                                {(!canUseFeatures || hasReachedLimit('emails')) ? (
                                                    <AlertTriangle className="w-5 h-5" />
                                                ) : (
                                                    <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                                                )}
                                                {(!canUseFeatures || hasReachedLimit('emails')) ? 'Límite Alcanzado' : 'Nuevo Email'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Premium */}
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-blue-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Total Emails</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                                    {stats.total}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                                <Mail className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-orange-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">No Leídos</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                                                    {stats.unread}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                                                <MailOpen className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-yellow-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Importantes</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                                                    {stats.important}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                                                <Star className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-green-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Hoy</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                                    {stats.today}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Sidebar de Filtros */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5 p-6">
                                        <h3 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-4">
                                            Filtros
                                        </h3>
                                        <div className="space-y-2">
                                            {[
                                                { key: 'all', label: 'Todos', icon: <Inbox className="w-4 h-4" /> },
                                                { key: 'unread', label: 'No leídos', icon: <MailOpen className="w-4 h-4" /> },
                                                { key: 'important', label: 'Importantes', icon: <Star className="w-4 h-4" /> },
                                                { key: 'clients', label: 'Clientes', icon: <User className="w-4 h-4" /> },
                                                { key: 'projects', label: 'Proyectos', icon: <FileText className="w-4 h-4" /> },
                                                { key: 'archived', label: 'Archivados', icon: <Archive className="w-4 h-4" /> },
                                            ].map((filter) => (
                                                <button
                                                    key={filter.key}
                                                    onClick={() => setFilterType(filter.key)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${filterType === filter.key
                                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                                            : 'text-slate-700 hover:bg-white/60'
                                                        }`}
                                                >
                                                    {filter.icon}
                                                    <span className="font-medium">{filter.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de Emails */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5">
                                        {/* Search Header */}
                                        <div className="p-6 border-b border-white/30">
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar emails..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="pl-10 w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <button className="px-4 py-3 bg-white/60 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 hover:bg-slate-50 transition-all duration-200">
                                                    <Filter className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Email List */}
                                        <div className="p-6">
                                            {loading ? (
                                                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                                                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                                                    </div>
                                                    <div className="space-y-2 text-center">
                                                        <h3 className="text-lg font-bold text-slate-900">Cargando emails</h3>
                                                        <p className="text-sm text-slate-600 font-medium">Sincronizando bandeja de entrada...</p>
                                                    </div>
                                                </div>
                                            ) : filteredEmails.length === 0 ? (
                                                <div className="text-center py-16">
                                                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                        <Mail className="w-10 h-10 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3">
                                                        No hay emails
                                                    </h3>
                                                    <p className="text-slate-600 max-w-sm mx-auto font-medium">
                                                        {searchTerm ? `No se encontraron emails con "${searchTerm}"` : 'Tu bandeja está vacía'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {filteredEmails.map((email) => (
                                                        <div
                                                            key={email.id}
                                                            onClick={() => {
                                                                setSelectedEmail(email);
                                                                markAsRead(email.id);
                                                            }}
                                                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${email.is_read
                                                                    ? 'bg-white/60 border-white/70'
                                                                    : 'bg-white/80 border-blue-200/70 shadow-md'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        {!email.is_read && (
                                                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                        )}
                                                                        <h4 className={`font-semibold text-slate-900 truncate ${!email.is_read ? 'font-bold' : ''}`}>
                                                                            {email.from_name}
                                                                        </h4>
                                                                        {email.client && (
                                                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                                Cliente
                                                                            </span>
                                                                        )}
                                                                        {email.project && (
                                                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                                                Proyecto
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className={`text-slate-900 mb-2 truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                                                                        {email.subject}
                                                                    </p>
                                                                    <p className="text-slate-600 text-sm truncate">
                                                                        {email.content}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 ml-4">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleImportant(email.id);
                                                                        }}
                                                                        className={`p-1 rounded transition-colors duration-200 ${email.is_important ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'
                                                                            }`}
                                                                    >
                                                                        <Star className="w-4 h-4" fill={email.is_important ? 'currentColor' : 'none'} />
                                                                    </button>
                                                                    <span className="text-xs text-slate-500 font-medium">
                                                                        {formatDate(email.created_at)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal de Email Seleccionado */}
                            {selectedEmail && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                        <div className="p-6 border-b border-white/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{selectedEmail.subject}</h3>
                                                    <p className="text-slate-600 mt-1">
                                                        De: {selectedEmail.from_name} &lt;{selectedEmail.from_email}&gt;
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedEmail(null)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6 max-h-96 overflow-y-auto">
                                            <div className="prose max-w-none">
                                                <p className="text-slate-700 whitespace-pre-wrap">{selectedEmail.content}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-white/30 flex gap-3">
                                            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                                                <Reply className="w-4 h-4" />
                                                Responder
                                            </button>
                                            <button className="px-4 py-2 bg-white/70 border border-white/60 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-2">
                                                <Forward className="w-4 h-4" />
                                                Reenviar
                                            </button>
                                            <button className="px-4 py-2 bg-white/70 border border-white/60 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-2">
                                                <Archive className="w-4 h-4" />
                                                Archivar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal Composer */}
                            {showComposer && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                                        <div className="p-6 border-b border-white/30">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-slate-900">Nuevo Email</h3>
                                                <button
                                                    onClick={() => setShowComposer(false)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Para:</label>
                                                <input
                                                    type="email"
                                                    placeholder="destinatario@email.com"
                                                    value={composeData.to}
                                                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Asunto:</label>
                                                <input
                                                    type="text"
                                                    placeholder="Asunto del email"
                                                    value={composeData.subject}
                                                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 mb-2 block">Contenido:</label>
                                                <textarea
                                                    rows={10}
                                                    placeholder="Escribe tu mensaje aquí..."
                                                    value={composeData.content}
                                                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400 resize-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 border-t border-white/30 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    // Aquí iría la lógica de envío
                                                    console.log('Enviando email:', composeData);
                                                    setShowComposer(false);
                                                    setComposeData({ to: '', subject: '', content: '' });
                                                }}
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                            >
                                                <Send className="w-4 h-4" />
                                                Enviar
                                            </button>
                                            <button
                                                onClick={() => setShowComposer(false)}
                                                className="px-6 py-3 bg-white/70 border border-white/60 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal de Plantillas */}
                            <EmailTemplatesModal
                                isOpen={showTemplates}
                                onClose={() => setShowTemplates(false)}
                                templates={templates}
                                onUseTemplate={handleUseTemplate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
