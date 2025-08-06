'use client';

import Sidebar from '@/components/Sidebar';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Building,
    Calendar,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    Users
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

    // Formulario para nuevo cliente
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        tag: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            if (!supabase) return;
            
            const { data, error } = await supabase
                .from('clients')
                .select('*')
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
            if (!formData.name.trim() || !supabase) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .insert([{
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    company: formData.company,
                    address: formData.address,
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
                    tag: ''
                });
                setShowForm(false);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
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

    // Filtrar clientes
    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Sidebar */}
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

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
                                                Gestión de Clientes
                                            </h1>
                                            <p className="text-slate-600 text-lg font-medium">
                                                Organiza tu cartera de clientes y visualiza su valor desde un panel centralizado
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowForm(!showForm)}
                                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-200 flex items-center gap-3"
                                        >
                                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                                            Nuevo Cliente
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Premium */}
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-blue-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Total Clientes</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                                    {clients.length}
                                                </p>
                                                <div className="flex items-center mt-2 text-sm">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <span className="text-slate-600 font-medium">Cartera activa</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                                <Users className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-green-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Con Empresa</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                                                    {clients.filter(client => client.company).length}
                                                </p>
                                                <div className="flex items-center mt-2 text-sm">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <span className="text-slate-600 font-medium">Corporativos</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                                <Building className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-purple-500/5 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600 mb-1">Con Email</p>
                                                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                                                    {clients.filter(client => client.email).length}
                                                </p>
                                                <div className="flex items-center mt-2 text-sm">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                                    <span className="text-slate-600 font-medium">Contactables</span>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                                                <Mail className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search Premium */}
                            <div className="mb-8">
                                <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-slate-500/5 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
                                                Clientes ({filteredClients.length})
                                            </h2>
                                            <p className="text-slate-600 font-medium">
                                                Gestiona toda la información de tus clientes en un solo lugar
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:flex-none">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar clientes..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 w-full sm:w-64 px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulario Premium de nuevo cliente */}
                            {showForm && (
                                <div className="mb-8">
                                    <div className="bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-xl shadow-indigo-500/5">
                                        <div className="p-6 border-b border-white/30">
                                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                                Añadir Nuevo Cliente
                                            </h3>
                                            <p className="text-slate-600 font-medium mt-1">Completa la información del cliente</p>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre completo"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                                                    <input
                                                        type="email"
                                                        placeholder="email@ejemplo.com"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Teléfono</label>
                                                    <input
                                                        type="text"
                                                        placeholder="+34 600 000 000"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Empresa</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre de la empresa"
                                                        value={formData.company}
                                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Dirección</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Calle, número, ciudad..."
                                                        value={formData.address}
                                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Etiqueta</label>
                                                    <input
                                                        type="text"
                                                        placeholder="VIP, Nuevo, etc."
                                                        value={formData.tag}
                                                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-3 mt-8 pt-6 border-t border-white/30">
                                                <button
                                                    onClick={addClient}
                                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    Añadir Cliente
                                                </button>
                                                <button
                                                    onClick={() => setShowForm(false)}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                            <div className="col-span-full text-center py-16">
                                                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                    <Users className="w-10 h-10 text-slate-400" />
                                                </div>
                                                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3">
                                                    {searchTerm ? 'No se encontraron clientes' : 'No tienes clientes todavía'}
                                                </h3>
                                                <p className="text-slate-600 max-w-sm mx-auto font-medium mb-6">
                                                    {searchTerm ? 
                                                        `No hay clientes que coincidan con "${searchTerm}"` : 
                                                        'Comienza agregando tu primer cliente para organizar tu cartera'
                                                    }
                                                </p>
                                                {searchTerm && (
                                                    <button 
                                                        onClick={() => setSearchTerm('')} 
                                                        className="px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200"
                                                    >
                                                        Limpiar búsqueda
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            filteredClients.map((client) => (
                                                <div
                                                    key={client.id}
                                                    className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/70 shadow-xl shadow-slate-500/5 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                                                <span className="text-white font-bold text-lg">
                                                                    {client.name?.charAt(0).toUpperCase() || 'C'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-900">{client.name || 'Sin nombre'}</h3>
                                                                {client.company && (
                                                                    <div className="flex items-center gap-1 text-sm text-slate-600">
                                                                        <Building className="w-4 h-4" />
                                                                        <span className="font-medium">{client.company}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {client.tag && (
                                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/60">
                                                                {client.tag}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        {client.email && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <div className="p-1 bg-slate-100 rounded-lg">
                                                                    <Mail className="w-4 h-4" />
                                                                </div>
                                                                <span className="truncate font-medium">{client.email}</span>
                                                            </div>
                                                        )}
                                                        {client.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <div className="p-1 bg-slate-100 rounded-lg">
                                                                    <Phone className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-medium">{client.phone}</span>
                                                            </div>
                                                        )}
                                                        {client.address && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <div className="p-1 bg-slate-100 rounded-lg">
                                                                    <MapPin className="w-4 h-4" />
                                                                </div>
                                                                <span className="truncate font-medium">{client.address}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                                            <div className="p-1 bg-slate-100 rounded-lg">
                                                                <Calendar className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-medium">Creado: {new Date(client.created_at).toLocaleDateString('es-ES')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 pt-4 border-t border-white/50 mt-4">
                                                        <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                                                            <button className="w-full px-4 py-2 text-sm bg-white/70 backdrop-blur-xl border border-white/60 rounded-xl text-slate-700 font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200">
                                                                Ver Detalles
                                                            </button>
                                                        </Link>
                                                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
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
