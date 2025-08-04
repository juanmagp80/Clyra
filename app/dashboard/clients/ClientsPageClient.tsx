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
        tag: ''
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const fetchClients = async () => {
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
        if (!formData.name.trim()) return;

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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <main className="flex-1 ml-64 overflow-auto">
                {/* Header con nuevo estilo */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    Clientes
                                </h1>
                                <p className="text-slate-600 mt-1 font-medium">
                                    Gestiona tu cartera de clientes
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/25"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Cliente
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Search con nuevo estilo */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar clientes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Formulario de nuevo cliente con nuevo estilo */}
                    {showForm && (
                        <Card className="rounded-2xl shadow-sm border-slate-100">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-2xl">
                                <CardTitle className="text-slate-900">Añadir Nuevo Cliente</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Completa la información del cliente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Nombre *</label>
                                        <Input
                                            placeholder="Nombre completo"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="email@ejemplo.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Teléfono</label>
                                        <Input
                                            placeholder="+34 600 000 000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Empresa</label>
                                        <Input
                                            placeholder="Nombre de la empresa"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Etiqueta</label>
                                        <Input
                                            placeholder="VIP, Nuevo, etc."
                                            value={formData.tag}
                                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                            className="rounded-xl border-slate-200"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={addClient}
                                        className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
                                    >
                                        Añadir Cliente
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-2 border-slate-200 rounded-xl hover:bg-slate-50"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista de clientes con nuevo estilo */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <div className="col-span-full text-center py-12">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600 font-medium">Cargando clientes...</p>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    {searchTerm ? 'No se encontraron clientes' : 'No tienes clientes todavía'}
                                </h3>
                                <p className="text-slate-600">
                                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer cliente'}
                                </p>
                            </div>
                        ) : (
                            filteredClients.map((client) => (
                                <Card
                                    key={client.id}
                                    className="rounded-2xl shadow-sm border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg text-slate-900">{client.name}</CardTitle>
                                                    {client.company && (
                                                        <CardDescription className="text-slate-600 flex items-center gap-1">
                                                            <Building className="w-3 h-3" />
                                                            {client.company}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                            </div>
                                            {client.tag && (
                                                <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200">
                                                    {client.tag}
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {client.email && (
                                            <div className="flex items-center text-sm text-slate-600">
                                                <Mail className="h-4 w-4 mr-3 text-slate-400" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center text-sm text-slate-600">
                                                <Phone className="h-4 w-4 mr-3 text-slate-400" />
                                                {client.phone}
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm text-slate-600">
                                            <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                                            {new Date(client.created_at).toLocaleDateString('es-ES')}
                                        </div>

                                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                                            <Link href={`/dashboard/clients/${client.id}`} className="flex-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Ver
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Editar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}