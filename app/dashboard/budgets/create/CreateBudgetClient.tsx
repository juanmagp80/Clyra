'use client';

import Sidebar from '@/components/Sidebar';
import TrialBanner from '@/components/TrialBanner';
import { Button } from '@/components/ui/Button';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { showToast } from '@/utils/toast';
import {
    ArrowLeft,
    Calculator,
    Plus,
    Save,
    Send,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BudgetItem {
    id: string;
    title: string;
    description: string;
    quantity: number;
    unit_price?: number;
    type: 'hours' | 'fixed' | 'milestone';
}

interface Client {
    id: string;
    name: string;
    email: string;
}

interface CreateBudgetClientProps {
    userEmail: string;
}

export function CreateBudgetClient({ userEmail }: CreateBudgetClientProps) {
    const router = useRouter();
    const { canUseFeatures } = useTrialStatus(userEmail);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoadingClients] = useState(true);
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
        {
            id: '1',
            title: '',
            description: '',
            quantity: 1,
            unit_price: undefined as unknown as number,
            type: 'hours'
        }
    ]);
    const [taxRate, setTaxRate] = useState(21);
    const [saving, setSaving] = useState(false);

    // Cargar clientes desde la base de datos
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoadingClients(true);
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: clientsData, error } = await supabase
                .from('clients')
                .select('id, name, email')
                .eq('user_id', user.id)
                .order('name');

            if (error) {
                console.error('Error loading clients:', error);
                showToast.error('Error al cargar clientes');
                return;
            }

            setClients(clientsData || []);
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al cargar clientes');
        } finally {
            setLoadingClients(false);
        }
    };

    const handleLogout = async () => {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    const addBudgetItem = () => {
        const newItem: BudgetItem = {
            id: Date.now().toString(),
            title: '',
            description: '',
            quantity: 1,
            unit_price: undefined as unknown as number,
            type: 'hours'
        };
        setBudgetItems([...budgetItems, newItem]);
    };

    const removeBudgetItem = (id: string) => {
        if (budgetItems.length > 1) {
            setBudgetItems(budgetItems.filter(item => item.id !== id));
        }
    };

    const updateBudgetItem = (id: string, field: keyof BudgetItem, value: any) => {
        setBudgetItems(budgetItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateSubtotal = () => {
        return budgetItems.reduce((total, item) => total + (item.quantity * (item.unit_price || 0)), 0);
    };

    const calculateTax = () => {
        return (calculateSubtotal() * taxRate) / 100;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    const handleSave = async () => {
        if (!title.trim() || !selectedClient) {
            showToast.error('Por favor completa el título y selecciona un cliente');
            return;
        }

        if (budgetItems.some(item => !item.title.trim() || !item.unit_price)) {
            showToast.error('Por favor completa todos los items del presupuesto');
            return;
        }

        try {
            setSaving(true);
            const supabase = createSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast.error('Usuario no autenticado');
                return;
            }

            // Crear el presupuesto
            const { data: budget, error: budgetError } = await supabase
                .from('budgets')
                .insert({
                    user_id: user.id,
                    client_id: selectedClient,
                    title: title.trim(),
                    description: description.trim(),
                    status: 'draft',
                    total_amount: calculateTotal(),
                    tax_rate: taxRate
                })
                .select()
                .single();

            if (budgetError && Object.keys(budgetError).length > 0) {
                console.error('Error creating budget:', budgetError);
                showToast.error('Error al crear presupuesto');
                return;
            }

            // Crear los items del presupuesto
            const itemsToInsert = budgetItems.map(item => ({
                budget_id: budget.id,
                title: item.title.trim(),
                description: item.description.trim(),
                quantity: item.quantity,
                unit_price: item.unit_price,
                type: item.type
            }));

            const { error: itemsError } = await supabase
                .from('budget_items')
                .insert(itemsToInsert);

            if (itemsError && Object.keys(itemsError).length > 0) {
                console.error('Error creating budget items:', itemsError);
                showToast.error('Error al crear items del presupuesto');
                return;
            }

            showToast.success('Presupuesto creado exitosamente');
            router.push('/dashboard/budgets');
        } catch (error) {
            console.error('Error:', error);
            showToast.error('Error al crear presupuesto');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TrialBanner userEmail={userEmail} />
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 ml-56">
                <div className="w-full">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    className="p-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-semibold text-gray-900">
                                        Nuevo Presupuesto
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Crea un presupuesto profesional para tu cliente
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/dashboard/budgets')}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving || !canUseFeatures}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Guardando...' : 'Guardar Borrador'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="p-6 space-y-6">
                        {/* Información básica */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Información del Presupuesto
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Título del Presupuesto *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ej: Desarrollo web tienda online"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cliente *
                                    </label>
                                    {loadingClients ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : clients.length === 0 ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                                            No hay clientes disponibles.{' '}
                                            <button
                                                onClick={() => router.push('/dashboard/clients')}
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Crear cliente
                                            </button>
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedClient}
                                            onChange={(e) => setSelectedClient(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Seleccionar cliente</option>
                                            {clients.map((client) => (
                                                <option key={client.id} value={client.id}>
                                                    {client.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Describe brevemente el alcance del proyecto..."
                                />
                            </div>
                        </div>

                        {/* Items del presupuesto */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Items del Presupuesto
                                </h2>
                                <Button
                                    onClick={addBudgetItem}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Item
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {budgetItems.map((item, index) => (
                                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-medium text-gray-700">
                                                Item {index + 1}
                                            </h3>
                                            {budgetItems.length > 1 && (
                                                <Button
                                                    onClick={() => removeBudgetItem(item.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Título *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.title}
                                                    onChange={(e) => updateBudgetItem(item.id, 'title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Ej: Desarrollo frontend"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Tipo
                                                </label>
                                                <select
                                                    value={item.type}
                                                    onChange={(e) => updateBudgetItem(item.id, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="hours">Por horas</option>
                                                    <option value="fixed">Precio fijo</option>
                                                    <option value="milestone">Hito</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cantidad
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => updateBudgetItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Precio Unitario (€) *
                                                </label>
                                                <input
                                                    type="number"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateBudgetItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Total
                                                </label>
                                                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium">
                                                    €{(item.quantity * (item.unit_price || 0)).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={item.description}
                                                onChange={(e) => updateBudgetItem(item.id, 'description', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Describe este item..."
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resumen y totales */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Resumen del Presupuesto
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        IVA (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">Subtotal</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        €{calculateSubtotal().toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-600">IVA ({taxRate}%)</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        €{calculateTax().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-xl font-bold text-gray-900">Total</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        €{calculateTotal().toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
