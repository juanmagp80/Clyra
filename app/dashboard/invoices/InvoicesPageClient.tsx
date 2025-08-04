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
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email) {
                setUserEmail(user.email);
            }
            await fetchInvoices();
        };
        fetchUserAndInvoices();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };
    const deleteInvoice = async (invoiceId: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta factura?')) return;

        try {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <SideBar userEmail={userEmail} onLogout={handleLogout} />
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Facturas
                            </h1>
                            <p className="text-slate-600 mt-1 font-medium">
                                Gestiona tus facturas y controla tus pagos
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                Exportar
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/invoices/new')}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/25 flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Nueva Factura
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Total Facturas</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{totalStats.total}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Pagadas</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">{totalStats.paid}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Total Amount</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">${totalStats.totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">Cobrado</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">${totalStats.paidAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar facturas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="draft">Borrador</option>
                                <option value="sent">Enviada</option>
                                <option value="paid">Pagada</option>
                                <option value="overdue">Vencida</option>
                                <option value="cancelled">Cancelada</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Factura</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cliente</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Proyecto</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Monto</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Estado</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Vencimiento</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">{invoice.invoice_number}</p>
                                                <p className="text-sm text-slate-600">{invoice.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">{invoice.client_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-700">{invoice.project_name || 'Sin proyecto'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">${invoice.total_amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                                                {getStatusIcon(invoice.status)}
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate-700">{new Date(invoice.due_date).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {/* Ver factura */}
                                                <button
                                                    onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Ver factura"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Editar factura */}
                                                <button
                                                    onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Editar factura"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                {/* Marcar como pagada (solo si no está pagada) */}
                                                {invoice.status !== 'paid' && (
                                                    <button
                                                        onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Marcar como pagada"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* Descargar PDF */}
                                                <button
                                                    onClick={() => {
                                                        // TODO: Implementar descarga de PDF
                                                        alert('Funcionalidad de PDF en desarrollo');
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Descargar PDF"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>

                                                {/* Menú de más opciones */}
                                                <div className="relative group">
                                                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>

                                                    {/* Dropdown menu */}
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => duplicateInvoice(invoice)}
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                            >
                                                                Duplicar factura
                                                            </button>
                                                            <button
                                                                onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                                disabled={invoice.status === 'sent'}
                                                            >
                                                                Marcar como enviada
                                                            </button>
                                                            <button
                                                                onClick={() => updateInvoiceStatus(invoice.id, 'cancelled')}
                                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                            >
                                                                Cancelar factura
                                                            </button>
                                                            <div className="border-t border-slate-200 my-1"></div>
                                                            <button
                                                                onClick={() => deleteInvoice(invoice.id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                Eliminar factura
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state */}
                    {filteredInvoices.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {searchTerm || statusFilter !== 'all' ? 'No se encontraron facturas' : 'No hay facturas'}
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Intenta ajustar los filtros de búsqueda'
                                    : 'Crea tu primera factura para empezar a facturar'
                                }
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <button
                                    onClick={() => router.push('/dashboard/invoices/new')}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/25 flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Crear Primera Factura
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default InvoicesPageClient;