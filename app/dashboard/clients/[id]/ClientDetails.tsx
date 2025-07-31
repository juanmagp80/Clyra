'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase';
import {
    ArrowLeft,
    Building,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    Mail,
    MapPin,
    Phone,
    Plus,
    Tag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Note {
    id: string;
    content: string;
    created_at: string;
}

interface Task {
    id: string;
    title: string;
    is_done: boolean;
    created_at: string;
}

export default function ClientDetails({ client, userEmail }: { client: any; userEmail: string }) {
    const supabase = createSupabaseClient();
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };
    const fetchClientProjects = async () => {
        try {
            setLoadingProjects(true);
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: projectsData, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .eq('client_id', client.id) // id del cliente
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching client projects:', error);
            } else {
                setProjects(projectsData || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingProjects(false);
        }
    };
    const fetchNotes = async () => {
        const { data } = await supabase
            .from('notes')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        setNotes(data || []);
    };

    const fetchTasks = async () => {
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false });

        setTasks(data || []);
    };

    const addNote = async () => {
        if (!newNote.trim()) return;

        const user = (await supabase.auth.getUser()).data.user;
        await supabase.from('notes').insert({
            content: newNote,
            client_id: client.id,
            user_id: user?.id,
        });
        setNewNote('');
        fetchNotes();
    };

    const addTask = async () => {
        if (!newTask.trim()) return;

        const user = (await supabase.auth.getUser()).data.user;
        await supabase.from('tasks').insert({
            title: newTask,
            client_id: client.id,
            user_id: user?.id,
        });
        setNewTask('');
        fetchTasks();
    };

    const toggleTask = async (taskId: string, isDone: boolean) => {
        await supabase.from('tasks').update({ is_done: !isDone }).eq('id', taskId);
        fetchTasks();
    };

    useEffect(() => {
        fetchNotes();
        fetchTasks();
        fetchClientProjects();
    }, []);

    return (
        <div className="flex h-screen bg-background">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <main className="flex-1 ml-64 overflow-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/clients">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                            <p className="text-muted-foreground">
                                Información y gestión del cliente
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Información del cliente */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{client.email || 'Sin email'}</span>
                                    </div>
                                    {client.phone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{client.phone}</span>
                                        </div>
                                    )}
                                    {client.company && (
                                        <div className="flex items-center gap-3">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{client.company}</span>
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{client.address}</span>
                                        </div>
                                    )}
                                    {client.tag && (
                                        <div className="flex items-center gap-3">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                {client.tag}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            Cliente desde {new Date(client.created_at).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Notas
                                </CardTitle>
                                <CardDescription>
                                    Información importante sobre el cliente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        placeholder="Escribe una nota..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <Button onClick={addNote} size="sm" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Guardar nota
                                    </Button>
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {notes.map((note) => (
                                        <div key={note.id} className="p-3 bg-muted rounded-md">
                                            <p className="text-sm">{note.content}</p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(note.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tareas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Tareas
                                </CardTitle>
                                <CardDescription>
                                    Seguimiento de pendientes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Nueva tarea..."
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                    />
                                    <Button onClick={addTask} size="sm" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir tarea
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-3 bg-muted rounded-md"
                                        >
                                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={task.is_done}
                                                    onChange={() => toggleTask(task.id, task.is_done)}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className={`text-sm ${task.is_done ? 'line-through text-muted-foreground' : ''}`}>
                                                    {task.title}
                                                </span>
                                            </label>
                                            {task.is_done ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Proyectos del Cliente */}
                        <Card className="md:col-span-3">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        <CardTitle>Proyectos</CardTitle>
                                    </div>
                                    <Link href="/dashboard/projects">
                                        <Button size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nuevo Proyecto
                                        </Button>
                                    </Link>
                                </div>
                                <CardDescription>
                                    Proyectos asociados a este cliente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingProjects ? (
                                    <div className="text-center py-8">
                                        <div className="text-sm text-muted-foreground">Cargando proyectos...</div>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-sm text-muted-foreground">
                                            No hay proyectos para este cliente
                                        </div>
                                        <Link href="/dashboard/projects">
                                            <Button variant="outline" size="sm" className="mt-2">
                                                Crear primer proyecto
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {projects.map((project) => (
                                            <Card key={project.id} className="hover:shadow-md transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base">{project.name}</CardTitle>
                                                    <CardDescription className="text-sm">
                                                        {project.description || 'Sin descripción'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Estado:</span>
                                                            <span className="capitalize font-medium">{project.status}</span>
                                                        </div>
                                                        {project.budget && (
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Presupuesto:</span>
                                                                <span>${project.budget}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Creado:</span>
                                                            <span>{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}