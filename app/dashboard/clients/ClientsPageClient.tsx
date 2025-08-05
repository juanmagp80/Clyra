'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import {
    Building,
    Calendar,
    Edit,
    Eye,
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

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push('/login');
    };

    const fetchClients = async () => {
        if (!supabase) return;
        
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching clients:', error);
            } else {
                setClients(data as Client[]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addClient = async () => {
        if (!formData.name.trim() || !supabase) return;

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase.from('clients').insert([
                {
                    ...formData,
                    user_id: user.id,
                },
            ]);

            if (error) {
                console.error('Error adding client:', error);
            } else {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    address: '',
                    tag: ''
                });
                setShowForm(false);
                fetchClients();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
            {/* Subtle mesh background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iNSIgY3k9IjUiIHI9IjEiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5"></div>

            <div className="flex h-screen relative z-10">
                <Sidebar userEmail={userEmail} onLogout={handleLogout} />

                <main className="flex-1 ml-56 overflow-auto">
                    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                        Gestión de Clientes
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Organiza tu cartera de clientes y visualiza su valor
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowForm(!showForm)}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nuevo Cliente
                                </Button>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                                        <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
                                        <div className="flex items-center text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-gray-600">Cartera activa</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors duration-200">
                                            <Building className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Con Empresa</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {clients.filter(client => client.company).length}
                                        </p>
                                        <div className="flex items-center text-sm">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <span className="text-gray-600">Corporativos</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                                    <div className="absolute top-4 right-4">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors duration-200">
                                            <Mail className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-600">Con Email</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {clients.filter(client => client.email).length}
                                        </p>
                                        <div className="flex items-center text-sm">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                            <span className="text-gray-600">Contactables</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Actions & Search */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Clientes ({filteredClients.length})
                                </h2>
                                <p className="text-gray-600">
                                    Gestiona toda la información de tus clientes en un solo lugar
                                </p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Buscar clientes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                    {/* Formulario de nuevo cliente */}
                    {showForm && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Añadir Nuevo Cliente</h3>
                                <p className="text-sm text-gray-500 mt-1">Completa la información del cliente</p>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Nombre *</label>
                                        <Input
                                            placeholder="Nombre completo"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="email@ejemplo.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Teléfono</label>
                                        <Input
                                            placeholder="+34 600 000 000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Empresa</label>
                                        <Input
                                            placeholder="Nombre de la empresa"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Dirección</label>
                                        <Input
                                            placeholder="Calle, número, ciudad..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Etiqueta</label>
                                        <Input
                                            placeholder="VIP, Nuevo, etc."
                                            value={formData.tag}
                                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={addClient}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                                    >
                                        Añadir Cliente
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="border-gray-200 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Clients Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                                <div className="space-y-2 text-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Cargando clientes</h3>
                                    <p className="text-sm text-gray-500">Obteniendo información...</p>
                                </div>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {searchTerm ? 'No se encontraron clientes' : 'No tienes clientes todavía'}
                                </h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    {searchTerm ? 
                                        `No hay clientes que coincidan con "${searchTerm}"` : 
                                        'Comienza agregando tu primer cliente para organizar tu cartera'
                                    }
                                </p>
                                {searchTerm && (
                                    <Button 
                                        onClick={() => setSearchTerm('')} 
                                        variant="outline" 
                                        className="mt-4 border-gray-200 hover:bg-gray-50"
                                    >
                                        Limpiar búsqueda
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredClients.map((client) => (
                                <div
                                    key={client.id}
                                    className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{client.name}</h3>
                                                {client.company && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Building className="w-4 h-4" />
                                                        <span>{client.company}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {client.tag && (
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                {client.tag}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {client.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                        {client.address && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span className="truncate">{client.address}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(client.created_at).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
                                        <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                className="w-full text-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                            >
                                                Ver Detalles
                                            </Button>
                                        </Link>
                                        <Button 
                                            size="sm" 
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
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