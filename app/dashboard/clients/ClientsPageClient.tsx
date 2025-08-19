'use client';

import Sidebar from '@/components/Sidebar';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { SPANISH_PROVINCES, getCitiesByProvince, getProvinceNames } from '@/src/data/spanish-locations';
import {
    Building,
    Calendar,
    Edit3,
    Grid3X3,
    List,
    Mail,
    MapPin,
    Phone,
    Plus,
    RotateCcw,
    Save,
    Search,
    Sparkles,
    Tag,
    Trash2,
    User,
    UserPlus,
    Users,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Client = {
    id: string;
    name: string;
    email: string;
    tag: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    province?: string;
    nif?: string; // NIF/CIF
    created_at: string;
};

interface ClientsPageClientProps {
    userEmail: string;
}

export default function ClientsPageClient({ userEmail }: ClientsPageClientProps) {
    const supabase = createSupabaseClient();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Referencia para el input de búsqueda
    const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);

    // Formulario para nuevo cliente
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        province: '',
        nif: '', // Campo obligatorio para CIF/NIF
        tag: ''
    });

    // Estado para las ciudades disponibles basadas en la provincia seleccionada
    const [availableCities, setAvailableCities] = useState<string[]>([]);

    // Estados para edición
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        province: '',
        nif: '', // Campo obligatorio para CIF/NIF
        tag: ''
    });

    // Estado para cambiar la vista (cards o lista)
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

    // Estado para las ciudades disponibles en edición basadas en la provincia seleccionada
    const [editAvailableCities, setEditAvailableCities] = useState<string[]>([]);

    useEffect(() => {
        fetchClients();
    }, []);

    // Atajo de teclado para búsqueda avanzada (como en proyectos)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + K para focus en búsqueda
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                searchInputRef?.focus();
            }
            // Escape para limpiar búsqueda
            if (event.key === 'Escape') {
                setSearchTerm('');
                searchInputRef?.blur();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [searchInputRef]);

    // Función para manejar el cambio de provincia en el formulario de creación
    const handleProvinceChange = (provinceName: string) => {
        setFormData({ ...formData, province: provinceName, city: '' });
        const cities = getCitiesByProvince(provinceName);
        setAvailableCities(cities);
    };

    // Función para manejar el cambio de provincia en el formulario de edición
    const handleEditProvinceChange = (provinceName: string) => {
        setEditFormData({ ...editFormData, province: provinceName, city: '' });
        const cities = getCitiesByProvince(provinceName);
        setEditAvailableCities(cities);
    };

    // Manejar tecla Escape para cerrar modal
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowForm(false);
                setShowEditForm(false);
            }
        };

        if (showForm || showEditForm) {
            document.addEventListener('keydown', handleEscape);
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showForm, showEditForm]);

    const fetchClients = async () => {
        try {
            if (!supabase) return;
            
            // Obtener el usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('No hay usuario autenticado');
                return;
            }
            
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching clients:', error);
                return;
            }

            setClients(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addClient = async () => {
        try {
            // Validar campos obligatorios
            if (!formData.name.trim() || !formData.nif.trim() || !formData.city.trim() || !formData.province.trim() || !supabase) {
                alert('Por favor, complete todos los campos obligatorios: Nombre, NIF/CIF, Ciudad y Provincia');
                return;
            }

            setLoading(true);
            
            // Obtener el usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('No hay usuario autenticado');
                return;
            }

            const { data, error } = await supabase
                .from('clients')
                .insert([{
                    user_id: user.id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    address: formData.address,
                    city: formData.city,
                    province: formData.province,
                    nif: formData.nif,
                    tag: formData.tag
                }])
                .select();

            if (error) {
                console.error('Error adding client:', error);
                return;
            }

            if (data) {
                setClients(prev => [data[0], ...prev]);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    address: '',
                    city: '',
                    province: '',
                    nif: '',
                    tag: ''
                });
                setAvailableCities([]);
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addClient();
    };

    const updateClient = async () => {
        try {
            console.log('🔄 Iniciando actualización del cliente...');
            console.log('Cliente a editar:', editingClient);
            console.log('Datos del formulario:', editFormData);
            
            if (!editingClient || !editFormData.name.trim() || !editFormData.nif.trim() || !editFormData.city.trim() || !editFormData.province.trim() || !supabase) {
                console.error('❌ Faltan datos necesarios para la actualización');
                alert('Por favor, complete todos los campos obligatorios: Nombre, NIF/CIF, Ciudad y Provincia');
                return;
            }

            setLoading(true);
            
            // Obtener el usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('❌ No hay usuario autenticado');
                return;
            }
            
            console.log('👤 Usuario autenticado:', user.id);
            
            const { data, error } = await supabase
                .from('clients')
                .update({
                    name: editFormData.name,
                    email: editFormData.email,
                    phone: editFormData.phone,
                    company: editFormData.company,
                    address: editFormData.address,
                    city: editFormData.city,
                    province: editFormData.province,
                    nif: editFormData.nif,
                    tag: editFormData.tag
                })
                .eq('id', editingClient.id)
                .eq('user_id', user.id) // Agregar filtro de seguridad
                .select();

            console.log('📡 Respuesta de Supabase:', { data, error });

            if (error) {
                console.error('❌ Error updating client:', error);
                alert('Error actualizando cliente: ' + error.message);
                return;
            }

            if (data && data.length > 0) {
                console.log('✅ Cliente actualizado exitosamente:', data[0]);
                setClients(prev => prev.map(client => client.id === data[0].id ? data[0] : client));
                setEditFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    address: '',
                    city: '',
                    province: '',
                    nif: '',
                    tag: ''
                });
                setEditAvailableCities([]);
                setShowEditForm(false);
                setEditingClient(null);
                alert('Cliente actualizado exitosamente');
            } else {
                console.error('⚠️ No se devolvieron datos después de la actualización');
                alert('No se pudo actualizar el cliente');
            }
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Error actualizando cliente');
        } finally {
            setLoading(false);
        }
    };

    const deleteClient = async (clientId: string) => {
        try {
            if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
                return;
            }

            if (!supabase) return;
            
            setLoading(true);
            
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) {
                console.error('Error deleting client:', error);
                alert('Error eliminando cliente: ' + error.message);
                return;
            }

            setClients(prev => prev.filter(client => client.id !== clientId));
            alert('Cliente eliminado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error eliminando cliente');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (client: Client) => {
        console.log('🔄 Iniciando edición del cliente:', client);
        setEditingClient(client);
        setEditFormData({
            name: client.name,
            email: client.email,
            phone: client.phone || '',
            company: client.company || '',
            address: client.address || '',
            city: client.city || '',
            province: client.province || '',
            nif: client.nif || '',
            tag: client.tag
        });
        
        // Configurar las ciudades disponibles si hay una provincia seleccionada
        if (client.province) {
            const cities = getCitiesByProvince(client.province);
            setEditAvailableCities(cities);
        } else {
            setEditAvailableCities([]);
        }
        
        setShowEditForm(true);
        console.log('✅ Formulario de edición preparado');
    };

    const cancelEdit = () => {
        setEditingClient(null);
        setShowEditForm(false);
        setEditFormData({
            name: '',
            email: '',
            phone: '',
            company: '',
            address: '',
            city: '',
            province: '',
            nif: '',
            tag: ''
        });
        setEditAvailableCities([]);
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

    // Función de búsqueda inteligente mejorada
    const filteredClients = clients.filter(client => {
        if (!searchTerm.trim()) return true;
        
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Búsqueda en todos los campos disponibles
        const searchableFields = [
            client.name,
            client.email, 
            client.company,
            client.phone,
            client.address,
            client.city,
            client.province,
            client.nif,
            client.tag
        ].filter(Boolean); // Eliminar campos vacíos/null/undefined
        
        // Buscar coincidencias exactas o parciales en cualquier campo
        return searchableFields.some(field => 
            field?.toLowerCase().includes(searchLower)
        ) ||
        // Búsqueda por palabras separadas
        searchLower.split(' ').every(word => 
            searchableFields.some(field => 
                field?.toLowerCase().includes(word)
            )
        );
    });

    return (
        <div className={"min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/40 to-indigo-50/60 dark:from-slate-900 dark:to-slate-800"}>
            {/* Elementos decorativos de fondo mejorados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/4 via-purple-500/4 to-indigo-500/4 dark:from-blue-400/3 dark:via-purple-400/3 dark:to-indigo-400/3 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/4 via-pink-500/4 to-indigo-500/4 dark:from-purple-400/3 dark:via-pink-400/3 dark:to-indigo-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/4 via-blue-500/4 to-purple-500/4 dark:from-indigo-400/3 dark:via-blue-400/3 dark:to-purple-400/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            {/* Main Content */}
            <div className="flex-1 ml-56 overflow-hidden relative">
                <div className="h-full overflow-y-auto">
                    <div className={"min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"}>
                        <div className="container mx-auto px-6 py-8">
                            {/* Header Premium con Animaciones */}
                            <div className="mb-8 animate-slideInDown">
                                <div className={"group p-8 hover:scale-[1.01] transition-all duration-500 relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"}>
                                    {/* Animated Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                                    <Users className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-2">
                                                        Gestión de Clientes
                                                    </h1>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-green-700 dark:text-green-400 font-semibold text-sm">Sistema Activo</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className={"text-lg font-medium max-w-2xl leading-relaxed text-slate-500 dark:text-slate-500"}>
                                                Organiza tu cartera de clientes y visualiza su valor desde un panel centralizado con herramientas avanzadas
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowForm(!showForm)}
                                            className="group/btn relative px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-110 hover:rotate-1 transform transition-all duration-300 flex items-center gap-3 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                            <Plus className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-300 relative z-10" />
                                            <span className="relative z-10">Nuevo Cliente</span>
                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Premium con Efectos 3D */}
                            <div className="mb-8 animate-slideInUp">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className={"group p-6 hover:scale-105 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm"}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    <p className={"text-sm font-bold text-slate-600 dark:text-slate-400"}>Total Clientes</p>
                                                </div>
                                                <p className="text-4xl font-black bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                                                    {clients.length}
                                                </p>
                                                <div className="flex items-center text-sm">
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-green-700 dark:text-green-400 font-bold">Cartera activa</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                                <Users className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group bg-white/30 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-xl shadow-green-500/5 p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 delay-100 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <p className="text-sm font-bold text-slate-700">Con Empresa</p>
                                                </div>
                                                <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                                                    {clients.filter(client => client.company).length}
                                                </p>
                                                <div className="flex items-center text-sm">
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-green-700 font-bold">Corporativos</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl shadow-green-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                                <Building className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group bg-white/30 backdrop-blur-2xl rounded-2xl border border-white/50 shadow-xl shadow-purple-500/5 p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500 delay-200 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="flex items-center justify-between relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                                    <p className="text-sm font-bold text-slate-700">Con Email</p>
                                                </div>
                                                <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                                                    {clients.filter(client => client.email).length}
                                                </p>
                                                <div className="flex items-center text-sm">
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                                        <span className="text-purple-700 font-bold">Contactables</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                                <Mail className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Búsqueda y Filtros Ultra Premium */}
                            <div className="bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl shadow-slate-500/10 p-8">
                                <div className="flex flex-col space-y-6">
                                    {/* Header con título y estadísticas */}
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                        <div>
                                            <h2 className="text-3xl font-black bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
                                                🎯 Directorio de Clientes ({filteredClients.length})
                                            </h2>
                                            <p className="text-slate-600 font-semibold flex items-center gap-2">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse block"></span>
                                                Gestiona toda la información de tus clientes en un solo lugar
                                            </p>
                                        </div>
                                        
                                        {/* Botones de Vista */}
                                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/80">
                                            <button
                                                onClick={() => setViewMode('cards')}
                                                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                                                    viewMode === 'cards'
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                <Grid3X3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                Tarjetas
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                                                    viewMode === 'list'
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                                                }`}
                                            >
                                                <List className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                Lista
                                            </button>
                                        </div>
                                    </div>

                                    {/* Barra de Búsqueda Ultra Premium - Más Grande */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                                        {/* Cuadro de Búsqueda Premium Ultra Avanzado - MÁS GRANDE */}
                                        <div className="lg:col-span-3 relative group/search">
                                            {/* Fondo Decorativo con Gradientes Animados */}
                                            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-focus-within/search:opacity-30 group-hover/search:opacity-20 blur-lg transition-all duration-700"></div>
                                            
                                            {/* Contenedor Principal MÁS GRANDE */}
                                            <div className="relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-3xl shadow-2xl shadow-slate-500/10 group-focus-within/search:shadow-indigo-500/25 group-focus-within/search:border-indigo-300 group-focus-within/search:scale-[1.02] group-hover/search:shadow-xl transition-all duration-700">
                                                
                                                {/* Icono de Búsqueda con Animaciones MEJORADO */}
                                                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
                                                    <div className="relative">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-2 group-focus-within/search:scale-125 group-focus-within/search:rotate-12 group-hover/search:scale-110 transition-all duration-700 shadow-2xl shadow-indigo-500/40">
                                                            <Search className="w-full h-full text-white" />
                                                        </div>
                                                        {/* Efecto de ondas al hacer focus */}
                                                        <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl opacity-0 group-focus-within/search:opacity-100 group-focus-within/search:animate-ping"></div>
                                                    </div>
                                                </div>

                                                {/* Campo de Input Premium MÁS GRANDE */}
                                                <input
                                                    ref={(el) => setSearchInputRef(el)}
                                                    type="text"
                                                    placeholder="🔍 Buscar clientes por nombre, email, empresa, teléfono o NIF... (Ctrl+K)"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full h-16 pl-16 pr-16 text-lg font-semibold text-slate-900 placeholder-slate-500 bg-transparent border-0 rounded-3xl focus:outline-none focus:ring-0 transition-all duration-500"
                                                    autoComplete="off"
                                                    spellCheck="false"
                                                />

                                                {/* Botón de Limpiar MEJORADO */}
                                                {searchTerm && (
                                                    <button 
                                                        onClick={() => setSearchTerm('')}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl shadow-2xl hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
                                                        title="Limpiar búsqueda (ESC)"
                                                    >
                                                        <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
                                                    </button>
                                                )}

                                                {/* Atajos de teclado visibles */}
                                                <div className="absolute right-4 bottom-1 text-xs text-slate-400 font-medium opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-300">
                                                    ESC para limpiar
                                                </div>
                                            </div>

                                            {/* Sugerencias flotantes mejoradas */}
                                            {searchTerm && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-2xl shadow-slate-500/20 p-4 z-50 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Buscando en:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold">👤 Nombres</span>
                                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold">📧 Emails</span>
                                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-xl text-xs font-semibold">🏢 Empresas</span>
                                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-xl text-xs font-semibold">📞 Teléfonos</span>
                                                        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-xl text-xs font-semibold">🆔 NIFs</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botón Nuevo Cliente Premium */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="group px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-black rounded-3xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 hover:-translate-y-2 transition-all duration-500 flex items-center gap-4 text-lg relative overflow-hidden"
                                        >
                                            {/* Efecto de brillo en hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            
                                            <div className="relative z-10 flex items-center gap-4">
                                                <div className="p-2 bg-white/20 rounded-2xl group-hover:scale-125 group-hover:rotate-180 transition-all duration-500">
                                                    <Plus className="w-6 h-6" />
                                                </div>
                                                <span>Crear Nuevo Cliente</span>
                                                <UserPlus className="w-5 h-5 group-hover:rotate-45 group-hover:scale-125 transition-all duration-500" />
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Espectacular de Nuevo Cliente */}
                            {showForm && (
                                <div 
                                    className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-start justify-center pt-8 pb-8 px-4 animate-fadeIn overflow-y-auto"
                                    onClick={(e) => {
                                        // Cerrar modal si se hace clic en el backdrop
                                        if (e.target === e.currentTarget) {
                                            setShowForm(false);
                                        }
                                    }}
                                >
                                    {/* Elementos decorativos flotantes */}
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-full animate-pulse blur-3xl"></div>
                                        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-indigo-500/15 to-pink-500/15 rounded-full animate-pulse blur-3xl" style={{ animationDelay: '1s' }}></div>
                                        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-500/15 to-blue-500/15 rounded-full animate-pulse blur-3xl" style={{ animationDelay: '2s' }}></div>
                                        <div className="absolute bottom-10 right-10 w-28 h-28 bg-gradient-to-br from-pink-500/15 to-indigo-500/15 rounded-full animate-pulse blur-3xl" style={{ animationDelay: '0.5s' }}></div>
                                    </div>

                                    <div className="relative w-full max-w-4xl flex-shrink-0">
                                        <div className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-black/30 border border-white/60 relative overflow-hidden animate-slideInUp">
                                            {/* Gradiente animado de fondo */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-80 pointer-events-none"></div>
                                            
                                            {/* Border animado brillante */}
                                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 blur-sm animate-pulse pointer-events-none"></div>
                                            
                                            <div className="relative z-10 p-8">
                                                {/* Header Espectacular */}
                                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/40">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl shadow-blue-500/40 relative">
                                                            <UserPlus className="w-8 h-8 text-white" />
                                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                                                                <Sparkles className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                                                                Crear Nuevo Cliente
                                                            </h2>
                                                            <p className="text-slate-600 font-semibold text-lg mt-1">
                                                                Completa todos los datos del cliente
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowForm(false)}
                                                        className="group p-4 bg-slate-100 hover:bg-red-50 rounded-2xl border-2 border-slate-200 hover:border-red-200 transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg"
                                                    >
                                                        <X className="w-6 h-6 text-slate-500 group-hover:text-red-500 transition-colors duration-300" />
                                                    </button>
                                                </div>

                                                {/* Formulario Espectacular */}
                                                <form onSubmit={handleSubmit} className="space-y-8">
                                                    {/* Sección de Información Personal */}
                                                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 p-6 shadow-xl">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                                                <User className="w-5 h-5 text-white" />
                                                            </div>
                                                            <h3 className="text-xl font-black text-slate-900">Información Personal</h3>
                                                        </div>
                                                        
                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-blue-600 transition-colors duration-300">
                                                                    Nombre Completo *
                                                                </label>
                                                                <div className="relative">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ej: Juan Pérez García"
                                                                        value={formData.name}
                                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                        className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-blue-500/10 transform focus:scale-[1.02]"
                                                                        required
                                                                    />
                                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                                                </div>
                                                            </div>

                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-purple-600 transition-colors duration-300">
                                                                    NIF/CIF *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="12345678A o B12345678"
                                                                    value={formData.nif}
                                                                    onChange={(e) => setFormData({ ...formData, nif: e.target.value.toUpperCase() })}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-purple-500/10 transform focus:scale-[1.02]"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sección de Contacto */}
                                                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 p-6 shadow-xl">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                                                                <Phone className="w-5 h-5 text-white" />
                                                            </div>
                                                            <h3 className="text-xl font-black text-slate-900">Información de Contacto</h3>
                                                        </div>

                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-green-600 transition-colors duration-300">
                                                                    Correo Electrónico
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    placeholder="email@ejemplo.com"
                                                                    value={formData.email}
                                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-green-300 focus:border-green-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-green-500/10 transform focus:scale-[1.02]"
                                                                />
                                                            </div>

                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-indigo-600 transition-colors duration-300">
                                                                    Teléfono
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="+34 600 000 000"
                                                                    value={formData.phone}
                                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-indigo-300 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-indigo-500/10 transform focus:scale-[1.02]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Sección de Empresa y Ubicación */}
                                                    <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 p-6 shadow-xl">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                                                                <Building className="w-5 h-5 text-white" />
                                                            </div>
                                                            <h3 className="text-xl font-black text-slate-900">Empresa y Ubicación</h3>
                                                        </div>

                                                        <div className="grid gap-6 md:grid-cols-2">
                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-orange-600 transition-colors duration-300">
                                                                    Empresa
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Nombre de la empresa"
                                                                    value={formData.company}
                                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-orange-300 focus:border-orange-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-orange-500/10 transform focus:scale-[1.02]"
                                                                />
                                                            </div>

                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-pink-600 transition-colors duration-300">
                                                                    Etiqueta
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="VIP, Nuevo, etc."
                                                                    value={formData.tag}
                                                                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-pink-300 focus:border-pink-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-pink-500/10 transform focus:scale-[1.02]"
                                                                />
                                                            </div>

                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-purple-600 transition-colors duration-300">
                                                                    Dirección
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Calle, número..."
                                                                    value={formData.address}
                                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-purple-300 focus:border-purple-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-slate-900 font-semibold placeholder-slate-400 shadow-lg focus:shadow-2xl focus:shadow-purple-500/10 transform focus:scale-[1.02]"
                                                                />
                                                            </div>

                                                            <div className="group md:col-span-2">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-cyan-600 transition-colors duration-300">
                                                                    Provincia *
                                                                </label>
                                                                <select
                                                                    value={formData.province}
                                                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-cyan-300 focus:border-cyan-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 text-slate-900 font-semibold shadow-lg focus:shadow-2xl focus:shadow-cyan-500/10 transform focus:scale-[1.02]"
                                                                    required
                                                                >
                                                                    <option value="">Selecciona una provincia</option>
                                                                    {getProvinceNames().map((province) => (
                                                                        <option key={province} value={province}>
                                                                            {province}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div className="group">
                                                                <label className="block text-sm font-black text-slate-700 mb-3 group-focus-within:text-teal-600 transition-colors duration-300">
                                                                    Ciudad *
                                                                </label>
                                                                <select
                                                                    value={formData.city}
                                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                                    className="w-full px-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-teal-300 focus:border-teal-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 text-slate-900 font-semibold shadow-lg focus:shadow-2xl focus:shadow-teal-500/10 transform focus:scale-[1.02]"
                                                                    required
                                                                    disabled={!formData.province}
                                                                >
                                                                    <option value="">
                                                                        {formData.province ? 'Selecciona una ciudad' : 'Primero selecciona una provincia'}
                                                                    </option>
                                                                    {availableCities.map((city) => (
                                                                        <option key={city} value={city}>
                                                                            {city}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Botones de Acción Espectaculares */}
                                                    <div className="flex gap-4 pt-8 border-t border-white/40">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowForm(false)}
                                                            className="flex-1 px-8 py-4 bg-white/80 backdrop-blur-xl border-2 border-white/60 hover:border-slate-300 text-slate-700 font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group text-lg"
                                                        >
                                                            <span className="group-hover:scale-110 transition-transform duration-300 inline-block">Cancelar</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={addClient}
                                                            disabled={loading}
                                                            className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-black rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 hover:-translate-y-1 disabled:hover:scale-100 disabled:hover:translate-y-0 transition-all duration-500 relative overflow-hidden group text-lg"
                                                        >
                                                            {loading && (
                                                                <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                                                            )}
                                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                                {loading ? (
                                                                    <>
                                                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                                        Creando Cliente...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Save className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                                                                        <span className="group-hover:scale-110 transition-transform duration-300">
                                                                            Crear Cliente
                                                                        </span>
                                                                        <Sparkles className="w-5 h-5 group-hover:scale-125 group-hover:rotate-45 transition-all duration-300" />
                                                                    </>
                                                                )}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Formulario Premium de edición de cliente */}
                            {showEditForm && editingClient && (
                                <div className="mb-8">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-indigo-500/5">
                                        <div className="p-6 border-b border-white/30">
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                                Editar Cliente
                                            </h3>
                                            <p className="text-slate-600 font-medium mt-1">Actualiza la información del cliente</p>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre completo"
                                                        value={editFormData.name}
                                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                                                    <input
                                                        type="email"
                                                        placeholder="email@ejemplo.com"
                                                        value={editFormData.email}
                                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Teléfono</label>
                                                    <input
                                                        type="text"
                                                        placeholder="+34 600 000 000"
                                                        value={editFormData.phone}
                                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Empresa</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre de la empresa"
                                                        value={editFormData.company}
                                                        onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Dirección</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Calle, número..."
                                                        value={editFormData.address}
                                                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Provincia *</label>
                                                    <select
                                                        value={editFormData.province}
                                                        onChange={(e) => handleEditProvinceChange(e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                                        required
                                                    >
                                                        <option value="">Selecciona una provincia</option>
                                                        {getProvinceNames().map((province) => (
                                                            <option key={province} value={province}>
                                                                {province}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Ciudad *</label>
                                                    <select
                                                        value={editFormData.city}
                                                        onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                                        required
                                                        disabled={!editFormData.province}
                                                    >
                                                        <option value="">
                                                            {editFormData.province ? 'Selecciona una ciudad' : 'Primero selecciona una provincia'}
                                                        </option>
                                                        {editAvailableCities.map((city) => (
                                                            <option key={city} value={city}>
                                                                {city}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">NIF/CIF *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="12345678A o B12345678"
                                                        value={editFormData.nif}
                                                        onChange={(e) => setEditFormData({ ...editFormData, nif: e.target.value.toUpperCase() })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Etiqueta</label>
                                                    <input
                                                        type="text"
                                                        placeholder="VIP, Nuevo, etc."
                                                        value={editFormData.tag}
                                                        onChange={(e) => setEditFormData({ ...editFormData, tag: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 mt-8 pt-6 border-t border-white/30">
                                                <button
                                                    onClick={updateClient}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    Actualizar Cliente
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lista Premium de Clientes */}
                            <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5">
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-6">
                                        Directorio de Clientes
                                    </h2>
                                    <div className={viewMode === 'cards' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                                        {loading ? (
                                            <div className="col-span-full flex flex-col items-center justify-center py-16 space-y-4">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
                                                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                                                </div>
                                                <div className="space-y-2 text-center">
                                                    <h3 className="text-lg font-bold text-slate-900">Cargando clientes</h3>
                                                    <p className="text-sm text-slate-600 font-medium">Obteniendo información...</p>
                                                </div>
                                            </div>
                                        ) : filteredClients.length === 0 ? (
                                            <div className="col-span-full text-center py-24 relative">
                                                {/* Elementos decorativos flotantes */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-64 h-64 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                                                </div>
                                                
                                                <div className="relative z-10">
                                                    <div className="mb-8 relative">
                                                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-500/20 relative overflow-hidden group">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                            {searchTerm ? (
                                                                <Search className="w-12 h-12 text-slate-500 relative z-10 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                                                            ) : (
                                                                <Users className="w-12 h-12 text-slate-500 relative z-10 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                                                            )}
                                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                                                <span className="text-white text-xs font-bold">0</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <h3 className="text-2xl font-black text-slate-700 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                                                                {searchTerm ? '🔍 Sin resultados para tu búsqueda' : '👥 Aún no tienes clientes'}
                                                            </h3>
                                                            
                                                            <div className="text-slate-600 font-medium max-w-2xl mx-auto">
                                                                {searchTerm ? (
                                                                    <div className="space-y-4">
                                                                        <p className="text-lg">
                                                                            No encontramos clientes que coincidan con <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">"{searchTerm}"</span>
                                                                        </p>
                                                                        
                                                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-2xl text-left space-y-3">
                                                                            <h4 className="font-bold text-blue-800 flex items-center gap-2">
                                                                                <Sparkles className="w-5 h-5" />
                                                                                Consejos para mejorar tu búsqueda:
                                                                            </h4>
                                                                            <ul className="space-y-2 text-sm text-blue-700">
                                                                                <li className="flex items-start gap-2">
                                                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                                    <span>Prueba con <strong>términos más generales</strong> o palabras clave diferentes</span>
                                                                                </li>
                                                                                <li className="flex items-start gap-2">
                                                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                                    <span>Busca por <strong>nombre, email, empresa, teléfono o NIF</strong></span>
                                                                                </li>
                                                                                <li className="flex items-start gap-2">
                                                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                                    <span>Verifica la <strong>ortografía</strong> de los términos de búsqueda</span>
                                                                                </li>
                                                                                <li className="flex items-start gap-2">
                                                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                                    <span>Usa <strong>Ctrl/Cmd + K</strong> para enfocar rápidamente la búsqueda</span>
                                                                                </li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-lg">
                                                                        Comienza agregando tu primer cliente y construye tu base de datos profesional
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Botones de Acción */}
                                                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                                            {searchTerm ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => setSearchTerm('')}
                                                                        className="group px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                                                                    >
                                                                        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                                                        Limpiar búsqueda
                                                                    </button>
                                                                    
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowForm(true);
                                                                            setSearchTerm('');
                                                                        }}
                                                                        className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                                                                    >
                                                                        <UserPlus className="w-5 h-5 group-hover:scale-125 transition-transform duration-300" />
                                                                        Crear cliente nuevo
                                                                        <Sparkles className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setShowForm(true)}
                                                                    className="group px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 hover:-translate-y-2 transition-all duration-300 flex items-center gap-4 text-lg"
                                                                >
                                                                    <UserPlus className="w-6 h-6 group-hover:scale-125 transition-transform duration-300" />
                                                                    Crear tu primer cliente
                                                                    <Sparkles className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            filteredClients.map((client, index) => {
                                                // Generar color del avatar basado en el nombre
                                                const getAvatarColor = (name: string) => {
                                                    const colors = [
                                                        'from-red-500 to-red-600',
                                                        'from-blue-500 to-blue-600', 
                                                        'from-green-500 to-green-600',
                                                        'from-purple-500 to-purple-600',
                                                        'from-pink-500 to-pink-600',
                                                        'from-indigo-500 to-indigo-600',
                                                        'from-yellow-500 to-yellow-600',
                                                        'from-teal-500 to-teal-600'
                                                    ];
                                                    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                                                    return colors[hash % colors.length];
                                                };

                                                const avatarColor = getAvatarColor(client.name || 'Cliente');

                                                // Vista de Lista
                                                if (viewMode === 'list') {
                                                    return (
                                                        <div
                                                            key={client.id}
                                                            className="group bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-lg shadow-slate-500/5 p-4 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden"
                                                        >
                                                            {/* Hover Gradient Overlay */}
                                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                            
                                                            <div className="relative z-10 flex items-center justify-between">
                                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                    {/* Avatar */}
                                                                    <div className={`relative w-12 h-12 bg-gradient-to-br ${avatarColor} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                                                        <span className="text-white font-black text-lg">
                                                                            {client.name?.charAt(0).toUpperCase() || 'C'}
                                                                        </span>
                                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                                                    </div>

                                                                    {/* Información Principal */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h3 className="font-black text-slate-900 text-lg truncate">
                                                                                {client.name || 'Sin nombre'}
                                                                            </h3>
                                                                            {client.tag && (
                                                                                <div className="max-w-[100px] flex-shrink-0">
                                                                                    <span className="block px-2 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200 truncate" title={client.tag}>
                                                                                        {client.tag}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                                                            {client.email && (
                                                                                <div className="flex items-center gap-1 min-w-0">
                                                                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                                                                    <span className="truncate">{client.email}</span>
                                                                                </div>
                                                                            )}
                                                                            {client.company && (
                                                                                <div className="flex items-center gap-1 min-w-0">
                                                                                    <Building className="w-4 h-4 flex-shrink-0" />
                                                                                    <span className="truncate">{client.company}</span>
                                                                                </div>
                                                                            )}
                                                                            {client.phone && (
                                                                                <div className="flex items-center gap-1">
                                                                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                                                                    <span>{client.phone}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Botones de Acción */}
                                                                <div className="flex gap-2 flex-shrink-0">
                                                                    <Link href={`/dashboard/clients/${client.id}`}>
                                                                        <button className="px-3 py-2 text-sm bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200">
                                                                            Ver
                                                                        </button>
                                                                    </Link>
                                                                    <button 
                                                                        onClick={() => startEdit(client)}
                                                                        className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                                                        title="Editar cliente"
                                                                    >
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => deleteClient(client.id)}
                                                                        className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                                                        title="Eliminar cliente"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Vista de Cards (por defecto)
                                                return (
                                                    <div
                                                        key={client.id}
                                                        className="group bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-xl shadow-slate-500/5 p-6 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                                                        style={{
                                                            animationDelay: `${index * 100}ms`
                                                        }}
                                                    >
                                                        {/* Hover Gradient Overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                        
                                                        {/* Animated Border */}
                                                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500"></div>
                                                        
                                                        <div className="relative z-10">
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex items-center space-x-4">
                                                                    <div className={`relative w-16 h-16 bg-gradient-to-br ${avatarColor} rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                                                        <span className="text-white font-black text-xl">
                                                                            {client.name?.charAt(0).toUpperCase() || 'C'}
                                                                        </span>
                                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-900 transition-colors duration-300">
                                                                                {client.name || 'Sin nombre'}
                                                                            </h3>
                                                                        </div>
                                                                        {client.company && (
                                                                            <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-slate-700">
                                                                                <div className="p-1 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors duration-300">
                                                                                    <Building className="w-4 h-4 group-hover:text-indigo-600" />
                                                                                </div>
                                                                                <span className="font-semibold">{client.company}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {client.tag && (
                                                                    <div className="relative max-w-[120px] flex-shrink-0">
                                                                        <span className="block px-3 py-2 text-xs font-black rounded-2xl bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 text-blue-800 border-2 border-blue-200/60 shadow-lg group-hover:scale-110 group-hover:rotate-1 transition-all duration-300 truncate leading-tight" title={client.tag}>
                                                                            {client.tag}
                                                                        </span>
                                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="space-y-3 mb-6">
                                                                {client.email && (
                                                                    <div className="group/item flex items-center gap-3 text-sm text-slate-600 p-2 rounded-xl hover:bg-white/50 transition-all duration-300">
                                                                        <div className="p-2 bg-slate-100 rounded-xl group-hover/item:bg-blue-100 group-hover/item:scale-110 transition-all duration-300">
                                                                            <Mail className="w-4 h-4 group-hover/item:text-blue-600" />
                                                                        </div>
                                                                        <span className="truncate font-semibold group-hover/item:text-blue-700">{client.email}</span>
                                                                    </div>
                                                                )}
                                                                {client.phone && (
                                                                    <div className="group/item flex items-center gap-3 text-sm text-slate-600 p-2 rounded-xl hover:bg-white/50 transition-all duration-300">
                                                                        <div className="p-2 bg-slate-100 rounded-xl group-hover/item:bg-green-100 group-hover/item:scale-110 transition-all duration-300">
                                                                            <Phone className="w-4 h-4 group-hover/item:text-green-600" />
                                                                        </div>
                                                                        <span className="font-semibold group-hover/item:text-green-700">{client.phone}</span>
                                                                    </div>
                                                                )}
                                                                {client.address && (
                                                                    <div className="group/item flex items-center gap-3 text-sm text-slate-600 p-2 rounded-xl hover:bg-white/50 transition-all duration-300">
                                                                        <div className="p-2 bg-slate-100 rounded-xl group-hover/item:bg-purple-100 group-hover/item:scale-110 transition-all duration-300">
                                                                            <MapPin className="w-4 h-4 group-hover/item:text-purple-600" />
                                                                        </div>
                                                                        <span className="truncate font-semibold group-hover/item:text-purple-700">{client.address}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-3 text-sm text-slate-500 p-2 rounded-xl">
                                                                    <div className="p-2 bg-slate-100 rounded-xl">
                                                                        <Calendar className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="font-semibold">Creado: {new Date(client.created_at).toLocaleDateString('es-ES')}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 pt-4 border-t border-white/50">
                                                                <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                                                                    <button className="w-full px-4 py-3 text-sm bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-slate-700 font-bold hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 hover:text-blue-700 hover:scale-105 transition-all duration-300 group/btn">
                                                                        <span className="group-hover/btn:scale-110 transition-transform duration-300 inline-block">Ver Detalles</span>
                                                                    </button>
                                                                </Link>
                                                                <button 
                                                                    onClick={() => startEdit(client)}
                                                                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 hover:rotate-1 transition-all duration-300"
                                                                    title="Editar cliente"
                                                                >
                                                                    <Edit3 className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => deleteClient(client.id)}
                                                                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 hover:scale-110 hover:rotate-1 transition-all duration-300"
                                                                    title="Eliminar cliente"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
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
