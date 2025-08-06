'use client'
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileText,
    MoreHorizontal,
    Plus,
    Search,
    Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SideBar from '../../../components/Sidebar';

interface ClientsPageClientProps {
    userEmail: string;
}

interface Invoice {
    id: string;
    invoice_number?: string;
    client_name?: string;
    client_email?: string;
    amount: number;
    total_amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    due_date: string;
    created_at: string;
    description?: string;
}

export default function InvoicesPageClient({ userEmail }: ClientsPageClientProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const router = useRouter();
    const supabase = createSupabaseClient();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            if (!supabase) return;
            
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching invoices:', error);
                return;
            }

            setInvoices(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateInvoiceStatus = async (id: string, status: string) => {
        try {
            if (!supabase) return;
            
            const { error } = await supabase
                .from('invoices')
                .update({ status })
                .eq('id', id);

            if (error) {
                console.error('Error updating invoice:', error);
                return;
            }

            setInvoices(prevInvoices =>
                prevInvoices.map(invoice =>
                    invoice.id === id ? { ...invoice, status: status as any } : invoice
                )
            );
        } catch (error) {
            console.error('Error:', error);
        }
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

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = (invoice.client_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (invoice.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-4 h-4" />;
            case 'sent': return <Send className="w-4 h-4" />;
            case 'draft': return <FileText className="w-4 h-4" />;
            case 'overdue': return <AlertCircle className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const stats = {
        total: invoices.length,
        paid: invoices.filter(i => i.status === 'paid').length,
        pending: invoices.filter(i => i.status === 'sent').length,
        draft: invoices.filter(i => i.status === 'draft').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalAmount: invoices.reduce((sum, i) => sum + i.total_amount, 0),
        paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0)
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Cargando facturas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Sidebar */}
            <SideBar userEmail={userEmail} onLogout={handleLogout} />
            
            {/* Main Content */}
            <div className="flex-1 ml-56 overflow-hidden">
                <div className="h-full overflow-y-auto">
                    <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/90 to-indigo-100/80 backdrop-blur-3xl">
                        <div className="container mx-auto px-6 py-8">
                            {/* Header Premium */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-indigo-500/10 p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
                                                Gestión de Facturas
                                            </h1>
                                            <p className="text-slate-600 text-lg font-medium">
                                                Controla y gestiona todas tus facturas desde un solo lugar
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.push('/dashboard/invoices/new')}
                                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-200 flex items-center gap-3"
                                        >
                                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                                            Nueva Factura
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Premium */}
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-blue-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Total Facturas</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                                    {stats.total}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                                <FileText className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-green-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Pagadas</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                                    {stats.paid}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-amber-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Pendientes</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                                                    {stats.pending}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                                                <Clock className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Borradores</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
                                                    {stats.draft}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg">
                                                <Edit className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-emerald-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Total Ingresos</p>
                                                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                                                    {formatCurrency(stats.paidAmount)}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                                                <DollarSign className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5 p-6">
                                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                                        <div className="relative flex-1 sm:flex-none">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Buscar facturas..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-full sm:w-64 px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                                        >
                                            <option value="all">Todas</option>
                                            <option value="paid">Pagadas</option>
                                            <option value="sent">Enviadas</option>
                                            <option value="draft">Borradores</option>
                                            <option value="overdue">Vencidas</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Invoices List */}
                            <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-6">
                                        Lista de Facturas ({filteredInvoices.length})
                                    </h2>
                                    {filteredInvoices.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 text-lg">No se encontraron facturas</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredInvoices.map((invoice) => (
                                                <div
                                                    key={invoice.id}
                                                    className="bg-white/60 backdrop-blur-xl border border-white/70 rounded-xl p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                                                >
                                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="font-semibold text-slate-900">
                                                                    {invoice.invoice_number || 'Sin número'}
                                                                </h3>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)} flex items-center gap-1`}>
                                                                    {getStatusIcon(invoice.status)}
                                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600 mb-1">
                                                                <strong>Cliente:</strong> {invoice.client_name || 'Sin cliente'}
                                                            </p>
                                                            <p className="text-slate-500 text-sm">
                                                                <strong>Email:</strong> {invoice.client_email || 'Sin email'}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                                                <span>Creada: {formatDate(invoice.created_at)}</span>
                                                                <span>Vence: {formatDate(invoice.due_date)}</span>
                                                                <span className="font-semibold text-slate-700">
                                                                    {formatCurrency(invoice.total_amount)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {invoice.status !== 'paid' && (
                                                                <button
                                                                    onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                                                                    className="px-4 py-2 text-sm bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl hover:bg-green-50 hover:border-green-200 text-slate-700 hover:text-green-700 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Marcar Pagada
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                                                                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                Ver Detalle
                                                            </button>
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
                </div>
            </div>
        </div>
    );
}
