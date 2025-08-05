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
    client_id: string;
    project_id: string | null;
    invoice_number: string;
    title: string;
    description: string | null;
    amount: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    issue_date: string;
    due_date: string;
    paid_date: string | null;
    notes: string | null;
    client_name?: string;
    project_name?: string;
}

const InvoicesPageClient = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [userEmail, setUserEmail] = useState<string>('');
    const supabase = createSupabaseClient();
    const router = useRouter();

    const fetchInvoices = async () => {
        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('invoices')
                .select(`
          *,
          clients!inner(name),
          projects(name)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedInvoices: Invoice[] = (data || []).map(invoice => ({
                ...invoice,
                client_name: invoice.clients?.name,
                project_name: invoice.projects?.name
            }));

            setInvoices(formattedInvoices);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserAndInvoices = async () => {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email) {
                setUserEmail(user.email);
            }
            await fetchInvoices();
        };
        fetchUserAndInvoices();
    }, []);

    const handleLogout = async () => {
        if (!supabase) {
            console.error('Supabase client not available');
            return;
        }
        await supabase.auth.signOut();
        router.push('/login');
    };
    const deleteInvoice = async (invoiceId: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta factura?')) return;

        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', invoiceId);

            if (error) throw error;

            fetchInvoices(); // Recargar lista
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Error al eliminar la factura');
        }
    };
    const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            
            const updateData: any = { status: newStatus };

            // Si se marca como pagada, agregar fecha de pago
            if (newStatus === 'paid') {
                updateData.paid_date = new Date().toISOString();
            }

            const { error } = await supabase
                .from('invoices')
                .update(updateData)
                .eq('id', invoiceId);

            if (error) throw error;

            fetchInvoices(); // Recargar lista
        } catch (error) {
            console.error('Error updating invoice status:', error);
            alert('Error al actualizar el estado de la factura');
        }
    };
    const duplicateInvoice = async (invoice: Invoice) => {
        try {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Crear nuevo número de factura
            const newInvoiceNumber = `INV-${Date.now()}`;

            const { error } = await supabase
                .from('invoices')
                .insert([{
                    user_id: user.id,
                    client_id: invoice.client_id,
                    project_id: invoice.project_id,
                    invoice_number: newInvoiceNumber,
                    title: `${invoice.title} (Copia)`,
                    description: invoice.description,
                    amount: invoice.amount,
                    tax_rate: invoice.tax_rate,
                    tax_amount: invoice.tax_amount,
                    total_amount: invoice.total_amount,
                    status: 'draft',
                    issue_date: new Date().toISOString().split('T')[0],
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días desde hoy
                    notes: invoice.notes
                }]);

            if (error) throw error;

            fetchInvoices(); // Recargar lista
            alert('Factura duplicada exitosamente');
        } catch (error) {
            console.error('Error duplicating invoice:', error);
            alert('Error al duplicar la factura');
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
            case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return <FileText className="w-4 h-4" />;
            case 'sent': return <Send className="w-4 h-4" />;
            case 'paid': return <CheckCircle className="w-4 h-4" />;
            case 'overdue': return <AlertCircle className="w-4 h-4" />;
            case 'cancelled': return <Clock className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const totalStats = {
        total: invoices.length,
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent').length,
        paid: invoices.filter(i => i.status === 'paid').length,
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
            {/* Subtle mesh background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5"></div>

            <div className="flex h-screen relative z-10">
                <SideBar userEmail={userEmail} onLogout={handleLogout} />

                <main className="flex-1 ml-56 overflow-auto">
                    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        Facturas
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Gestiona tus facturas y pagos profesionalmente
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/invoices/new')}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nueva Factura
                                </button>
                            </div>

                            {/* Stats Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8">
                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors duration-200">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Pagadas</p>
                                        <p className="text-2xl font-bold text-gray-900">{totalStats.paid}</p>
                                        <p className="text-xs text-green-600">${totalStats.paidAmount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center group-hover:bg-yellow-100 transition-colors duration-200">
                                            <Clock className="w-5 h-5 text-yellow-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Pendientes</p>
                                        <p className="text-2xl font-bold text-gray-900">{totalStats.sent}</p>
                                        <p className="text-xs text-yellow-600">${(totalStats.totalAmount - totalStats.paidAmount).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-200">
                                            <FileText className="w-5 h-5 text-gray-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Borradores</p>
                                        <p className="text-2xl font-bold text-gray-900">{totalStats.draft}</p>
                                        <p className="text-xs text-gray-600">En edición</p>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{totalStats.total}</p>
                                        <p className="text-xs text-blue-600">Facturas</p>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-200">
                                            <DollarSign className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Ingresos</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${totalStats.totalAmount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-purple-600">Total facturado</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Actions & Search */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Facturas ({filteredInvoices.length})
                                </h2>
                                <p className="text-gray-600">
                                    Crea y gestiona facturas profesionales
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar facturas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">Todas</option>
                                    <option value="paid">Pagadas</option>
                                    <option value="sent">Enviadas</option>
                                    <option value="draft">Borradores</option>
                                    <option value="overdue">Vencidas</option>
                                </select>
                            </div>
                        </div>
                        {/* Invoices List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <h3 className="text-lg font-semibold text-gray-900">Cargando facturas</h3>
                                        <p className="text-sm text-gray-500">Obteniendo información...</p>
                                    </div>
                                </div>
                            ) : filteredInvoices.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {searchTerm || statusFilter !== 'all' ? 'No se encontraron facturas' : 'No hay facturas'}
                                    </h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">
                                        {searchTerm || statusFilter !== 'all'
                                            ? 'No hay facturas que coincidan con los filtros aplicados'
                                            : 'Crea tu primera factura para empezar a facturar'
                                        }
                                    </p>
                                    {!searchTerm && statusFilter === 'all' && (
                                        <button
                                            onClick={() => router.push('/dashboard/invoices/new')}
                                            className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 mx-auto"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Crear Primera Factura
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <div key={invoice.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                                {/* Invoice Info */}
                                                <div className="lg:col-span-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                                {invoice.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {invoice.client_name}
                                                            </p>
                                                            {invoice.project_name && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Proyecto: {invoice.project_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dates */}
                                                <div className="lg:col-span-3">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500">Emitida</p>
                                                            <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString('es-ES')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">Vence</p>
                                                            <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString('es-ES')}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="lg:col-span-2 text-center lg:text-left">
                                                    <p className="text-sm text-gray-500">Total</p>
                                                    <p className="text-xl font-bold text-gray-900">
                                                        ${invoice.total_amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        +${invoice.tax_amount.toLocaleString()} IVA
                                                    </p>
                                                </div>

                                                {/* Status */}
                                                <div className="lg:col-span-1 flex justify-center lg:justify-start">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                                                        {getStatusIcon(invoice.status)}
                                                        {invoice.status === 'draft' ? 'Borrador' :
                                                            invoice.status === 'sent' ? 'Enviada' :
                                                                invoice.status === 'paid' ? 'Pagada' :
                                                                    invoice.status === 'overdue' ? 'Vencida' :
                                                                        'Cancelada'}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="lg:col-span-2 flex items-center gap-2 justify-center lg:justify-end">
                                                    {invoice.status === 'draft' && (
                                                        <button
                                                            onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                                                            className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                            Enviar
                                                        </button>
                                                    )}
                                                    {invoice.status !== 'paid' && (
                                                        <button
                                                            onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                                                            className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Pagada
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                                                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
export default InvoicesPageClient;