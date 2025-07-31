'use client';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase';
import {
    Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// Tipo Project (ya lo tienes)
type Project = {
    id: string;
    name: string;
    description?: string;
    client_id: string;
    user_id: string;
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    budget?: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
    // Relación con cliente
    client?: {
        name: string;
        company?: string;
    };
};
// Interface para props
interface ProjectsPageClientProps {
    userEmail: string;
}

// Componente principal
export default function ProjectsPageClient({ userEmail }: ProjectsPageClientProps) {
    // Estados
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client_id: '',
        budget: '',
        start_date: '',
        end_date: '',
        status: 'active'
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createSupabaseClient();
    const router = useRouter();
    const fetchClients = async () => {
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: clientsData, error } = await supabase
                .from('clients')
                .select('id, name, company')
                .eq('user_id', user.id)
                .order('name');

            if (error) {
                console.error('Error fetching clients:', error);
            } else {
                setClients(clientsData || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Funciones CRUD
    const fetchProjects = async () => {
        try {
            setLoading(true);

            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: projectsData, error } = await supabase
                .from('projects')
                .select(`
                *,
                client:clients(name, company)
            `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching projects:', error);
            } else {
                setProjects(projectsData || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProject = async (projectData: any) => {
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase.from('projects').insert([
                {
                    ...formData,
                    user_id: user.id,
                },
            ]);

            if (error) {
                console.error('Error adding project:', error);
            } else {
                setFormData({
                    name: '',
                    description: '',
                    client_id: '',
                    budget: '',
                    start_date: '',
                    end_date: '',
                    status: 'active'
                });
                setShowForm(false);
                fetchProjects(); // Recargar la lista
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // useEffect para cargar datos
    useEffect(() => {
        fetchProjects();
        fetchClients(); // ← AÑADIR ESTA LÍNEA

    }, []);

    // Render
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            <div className="w-64 flex-shrink-0 bg-white shadow h-full">

                <Sidebar userEmail={userEmail} onLogout={async () => {
                    await supabase.auth.signOut();
                    router.push('/login');
                }} />
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
                        <p className="text-gray-600 mt-1">Gestiona tus proyectos y su progreso</p>
                    </div>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Proyecto
                    </Button>
                </div>

                {/* Formulario nuevo proyecto - MOVIDO AQUÍ */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Nuevo Proyecto</CardTitle>
                            <CardDescription>Crea un nuevo proyecto para tu cliente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium">Nombre del Proyecto</label>
                                    <Input
                                        placeholder="Ej: Desarrollo web corporativo"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Cliente</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    >
                                        <option value="">Selecciona un cliente</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.company ? `- ${client.company}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Presupuesto</label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={formData.budget}
                                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Estado</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="active">Activo</option>
                                        <option value="paused">Pausado</option>
                                        <option value="completed">Completado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium">Descripción</label>
                                    <textarea
                                        className="w-full p-2 border rounded-md"
                                        rows={3}
                                        placeholder="Describe el proyecto..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={addProject}>
                                    Crear Proyecto
                                </Button>
                                <Button variant="outline" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contenido */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Cargando proyectos...</div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No tienes proyectos aún
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Crea tu primer proyecto para empezar
                                </p>
                                <Button onClick={() => setShowForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Proyecto
                                </Button>
                            </div>
                        ) : (
                            projects.map((project) => (
                                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{project.name}</CardTitle>
                                        <CardDescription>
                                            {project.client?.name || 'Sin cliente asignado'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Estado:</span>
                                                <span className="capitalize font-medium">{project.status}</span>
                                            </div>
                                            {project.budget && (
                                                <div className="flex justify-between">
                                                    <span>Presupuesto:</span>
                                                    <span>${project.budget}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span>Creado:</span>
                                                <span>{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}