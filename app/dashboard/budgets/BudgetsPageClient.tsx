'use client';

import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { Button } from '@/components/ui/Button';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { showToast } from '@/utils/toast';
import {
    Calculator,
    Copy,
    DollarSign,
    Edit3,
    Eye,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Send,
    Trash2,
    TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// Hook para detectar posición del dropdown
const useDropdownPosition = (isOpen: boolean) => {
    const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const spaceBelow = windowHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Si hay menos de 200px abajo y más de 200px arriba, mostrar hacia arriba
            if (spaceBelow < 200 && spaceAbove > 200) {
                setPosition('top');
            } else {
                setPosition('bottom');
            }
        }
    }, [isOpen]);

    return { position, dropdownRef };
};

// Componente del dropdown menu
const BudgetDropdownMenu = ({ 
    budget, 
    isOpen, 
    onToggle, 
    onEdit, 
    onDuplicate, 
    onSend, 
    onDelete 
}: {
    budget: Budget;
    isOpen: boolean;
    onToggle: () => void;
    onEdit: (id: string) => void;
    onDuplicate: (budget: Budget) => void;
    onSend: (id: string) => void;
    onDelete: (id: string) => void;
}) => {
    const { position, dropdownRef } = useDropdownPosition(isOpen);

    const dropdownClasses = position === 'top' 
        ? "absolute right-0 bottom-full mb-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[99999] max-h-60 overflow-y-auto"
        : "absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[99999] max-h-60 overflow-y-auto";

    // Log para debug
    console.log('BudgetDropdownMenu - Budget status:', budget.status, 'Should show send:', budget.status === 'draft');

    return (
        <div className="relative z-[99999]" data-dropdown ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
            >
                <MoreHorizontal className="w-4 h-4" />
            </Button>
            {isOpen && (
                <div className={dropdownClasses}>
                    <div className="py-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(budget.id);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(budget);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                        </button>
                        {budget.status === 'draft' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Enviando presupuesto:', budget.id, 'Estado:', budget.status);
                                    onSend(budget.id);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Enviar
                            </button>
                        )}
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(budget.id);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

interface Budget {
    id: string;
    client_id: string;
    client_name: string;
    title: string;
    description: string;
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
    total_amount: number;
    created_at: string;
    expires_at: string;
    approved_at?: string;
}

interface BudgetsPageClientProps {
    userEmail: string;
}

export function BudgetsPageClient({ userEmail }: BudgetsPageClientProps) {
    const router = useRouter();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    
    // Estados para el modal de eliminación
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        budgetId: string | null;
        budgetTitle: string;
        isDeleting: boolean;
    }>({
        isOpen: false,
        budgetId: null,
        budgetTitle: '',
        isDeleting: false
    });
    
    // Estados para métricas
    const [metrics, setMetrics] = useState({
        totalBudgets: 0,
        approvedBudgets: 0,
        totalValue: 0,
        conversionRate: 0
    });

    const { canUseFeatures } = useTrialStatus(userEmail);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Verificar si el clic fue fuera de cualquier dropdown
            const target = event.target as HTMLElement;
            if (!target.closest('[data-dropdown]')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        loadBudgets();
    }, [userEmail]);

    const loadBudgets = async () => {
        try {
            setLoading(true);
            const supabase = createSupabaseClient();
            
            // Obtener el user_id
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Cargar presupuestos desde la base de datos
            const { data: budgetsData, error } = await supabase
                .from('budgets')
                .select(`
                    *,
                    clients!inner(name)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading budgets:', error);
                return;
            }

            // Transformar los datos para que coincidan con la interfaz Budget
            const transformedBudgets = (budgetsData || []).map((budget: any) => ({
                ...budget,
                client_name: budget.clients.name
            }));

            setBudgets(transformedBudgets);

            // Calcular métricas
            const totalBudgets = transformedBudgets.length;
            const approvedBudgets = transformedBudgets.filter((b: any) => b.status === 'approved').length;
            const totalValue = transformedBudgets.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
            const conversionRate = totalBudgets > 0 ? (approvedBudgets / totalBudgets) * 100 : 0;

            setMetrics({
                totalBudgets,
                approvedBudgets,
                totalValue,
                conversionRate
            });

        } catch (error) {
            console.error('Error loading budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'draft': return 'Borrador';
            case 'sent': return '📧 Enviado';
            case 'approved': return '✅ Aprobado';
            case 'rejected': return '❌ Rechazado';
            case 'expired': return '⏰ Expirado';
            default: return status;
        }
    };

    const handleDropdownToggle = (budgetId: string) => {
        setOpenDropdown(openDropdown === budgetId ? null : budgetId);
    };

    const handleEdit = (budgetId: string) => {
        setOpenDropdown(null);
        router.push(`/dashboard/budgets/${budgetId}/edit`);
    };

    const handleDuplicate = async (budget: Budget) => {
        setOpenDropdown(null);
        
        try {
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast.error('Usuario no autenticado');
                return;
            }

            // Cargar el presupuesto original con sus items
            const { data: originalBudget, error: fetchError } = await supabase
                .from('budgets')
                .select(`
                    *,
                    budget_items(*)
                `)
                .eq('id', budget.id)
                .eq('user_id', user.id)
                .single();

            if (fetchError) {
                console.error('Error loading budget to duplicate:', fetchError);
                showToast.error('Error al cargar el presupuesto');
                return;
            }

            // Crear el nuevo presupuesto (copia)
            const { data: newBudget, error: budgetError } = await supabase
                .from('budgets')
                .insert({
                    user_id: user.id,
                    client_id: originalBudget.client_id,
                    title: `${originalBudget.title} (Copia)`,
                    description: originalBudget.description,
                    status: 'draft', // Siempre empieza como borrador
                    tax_rate: originalBudget.tax_rate,
                    notes: originalBudget.notes,
                    terms_conditions: originalBudget.terms_conditions
                })
                .select()
                .single();

            if (budgetError) {
                console.error('Error duplicating budget:', budgetError);
                showToast.error('Error al duplicar el presupuesto');
                return;
            }

            // Duplicar los items si existen
            if (originalBudget.budget_items && originalBudget.budget_items.length > 0) {
                const itemsToInsert = originalBudget.budget_items.map((item: any) => ({
                    budget_id: newBudget.id,
                    title: item.title,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    type: item.type,
                    sort_order: item.sort_order
                }));

                const { error: itemsError } = await supabase
                    .from('budget_items')
                    .insert(itemsToInsert);

                if (itemsError) {
                    console.error('Error duplicating budget items:', itemsError);
                    showToast.error('Error al duplicar los items del presupuesto');
                    return;
                }
            }

            showToast.success('Presupuesto duplicado correctamente');
            
            // Recargar la lista para mostrar el nuevo presupuesto
            await loadBudgets();
            
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al duplicar el presupuesto');
        }
    };

    const handleDelete = (budgetId: string) => {
        setOpenDropdown(null);
        const budget = budgets.find(b => b.id === budgetId);
        if (budget) {
            setDeleteModal({
                isOpen: true,
                budgetId,
                budgetTitle: budget.title,
                isDeleting: false
            });
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.budgetId) return;

        try {
            setDeleteModal(prev => ({ ...prev, isDeleting: true }));
            
            const supabase = createSupabaseClient();
            const { error } = await supabase
                .from('budgets')
                .delete()
                .eq('id', deleteModal.budgetId);

            if (error) {
                console.error('Error deleting budget:', error);
                showToast.error('Error al eliminar el presupuesto');
                return;
            }

            // Actualizar la lista
            setBudgets(budgets.filter(b => b.id !== deleteModal.budgetId));
            showToast.success('Presupuesto eliminado correctamente');
            
            // Cerrar modal
            setDeleteModal({
                isOpen: false,
                budgetId: null,
                budgetTitle: '',
                isDeleting: false
            });
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al eliminar el presupuesto');
        } finally {
            setDeleteModal(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const closeDeleteModal = () => {
        if (deleteModal.isDeleting) return; // No cerrar si está eliminando
        setDeleteModal({
            isOpen: false,
            budgetId: null,
            budgetTitle: '',
            isDeleting: false
        });
    };

    const handleSend = async (budgetId: string) => {
        setOpenDropdown(null);
        
        try {
            console.log('🚀 Enviando presupuesto por email:', budgetId);
            
            // Llamar a la API para enviar el email
            const response = await fetch('/api/budgets/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ budgetId }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Error response from API:', result);
                showToast.error(result.error || 'Error al enviar el presupuesto');
                return;
            }

            // Actualizar la lista local
            setBudgets(budgets.map(budget => 
                budget.id === budgetId 
                    ? { ...budget, status: 'sent' as const, sent_at: new Date().toISOString() }
                    : budget
            ));

            showToast.success('✅ Presupuesto enviado por email correctamente');
            console.log('📧 Email enviado exitosamente:', result.emailId);
            
        } catch (error) {
            console.error('Error sending budget email:', error);
            showToast.error('Error al enviar el presupuesto por email');
        }
    };

    // Filtrar presupuestos
    const filteredBudgets = budgets.filter(budget => {
        const matchesSearch = budget.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            budget.client_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleLogout = async () => {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TrialBanner userEmail={userEmail} />
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 ml-56">
                <div className="w-full">
                    {/* Header Bonsai Style */}
                    <div className="bg-white border-b border-gray-200 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">Presupuestos</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Gestiona y crea presupuestos para tus clientes
                                </p>
                            </div>
                            <Button 
                                onClick={() => router.push('/dashboard/budgets/create')}
                                disabled={!canUseFeatures}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Presupuesto
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Métricas */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Presupuestos</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalBudgets}</p>
                                    </div>
                                    <Calculator className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprobados</p>
                                        <p className="text-2xl font-bold text-green-600">{metrics.approvedBudgets}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">€{metrics.totalValue.toLocaleString()}</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa Conversión</p>
                                        <p className="text-2xl font-bold text-blue-600">{metrics.conversionRate}%</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar presupuestos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="draft">Borrador</option>
                                    <option value="sent">Enviado</option>
                                    <option value="approved">Aprobado</option>
                                    <option value="rejected">Rechazado</option>
                                    <option value="expired">Expirado</option>
                                </select>
                            </div>
                        </div>

                        {/* Lista de presupuestos */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando presupuestos...</p>
                                </div>
                            ) : filteredBudgets.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No hay presupuestos
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Comienza creando tu primer presupuesto para un cliente.
                                    </p>
                                    <Button 
                                        onClick={() => router.push('/dashboard/budgets/create')}
                                        disabled={!canUseFeatures}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear Presupuesto
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto overflow-y-visible">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Presupuesto
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Cliente
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Estado
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Valor
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredBudgets.map((budget) => (
                                                <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 relative">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {budget.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                                {budget.description}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {budget.client_name}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(budget.status)}`}>
                                                            {getStatusText(budget.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            €{budget.total_amount.toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {new Date(budget.created_at).toLocaleDateString('es-ES')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right relative z-[99999]">
                                                        <div className="flex items-center justify-end gap-2 relative z-[99999]">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.push(`/dashboard/budgets/${budget.id}`)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <BudgetDropdownMenu
                                                                budget={budget}
                                                                isOpen={openDropdown === budget.id}
                                                                onToggle={() => handleDropdownToggle(budget.id)}
                                                                onEdit={handleEdit}
                                                                onDuplicate={handleDuplicate}
                                                                onSend={handleSend}
                                                                onDelete={handleDelete}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                budgetTitle={deleteModal.budgetTitle}
                isDeleting={deleteModal.isDeleting}
            />
        </div>
    );
}
