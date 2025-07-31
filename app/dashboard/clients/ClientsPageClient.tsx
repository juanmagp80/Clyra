'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase';
import {
    Calendar,
    Edit,
    Eye,
    Mail,
    Phone,
    Plus,
    Search
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
        <div className="flex h-screen bg-background">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <main className="flex-1 ml-64 overflow-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                            <p className="text-muted-foreground">
                                Gestiona tu cartera de clientes
                            </p>
                        </div>
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Cliente
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar clientes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Formulario de nuevo cliente */}
                    {showForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Añadir Nuevo Cliente</CardTitle>
                                <CardDescription>
                                    Completa la información del cliente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium">Nombre *</label>
                                        <Input
                                            placeholder="Nombre completo"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="email@ejemplo.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Teléfono</label>
                                        <Input
                                            placeholder="+34 600 000 000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Empresa</label>
                                        <Input
                                            placeholder="Nombre de la empresa"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Etiqueta</label>
                                        <Input
                                            placeholder="VIP, Nuevo, etc."
                                            value={formData.tag}
                                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                        />
                                    </div>

                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button onClick={addClient}>
                                        Añadir Cliente
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowForm(false)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista de clientes */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground">Cargando clientes...</p>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'No se encontraron clientes' : 'No tienes clientes todavía'}
                                </p>
                            </div>
                        ) : (
                            filteredClients.map((client) => (
                                <Card key={client.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{client.name}</CardTitle>
                                                {client.company && (
                                                    <CardDescription>{client.company}</CardDescription>
                                                )}
                                            </div>
                                            {client.tag && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                    {client.tag}
                                                </span>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {client.email && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4 mr-2" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4 mr-2" />
                                                {client.phone}
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(client.created_at).toLocaleDateString('es-ES')}
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Link href={`/dashboard/clients/${client.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Ver
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline">
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
