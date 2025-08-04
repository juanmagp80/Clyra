'use client';

import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { createSupabaseClient } from '@/src/lib/supabase-client';
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
                .eq('client_id', client.id)
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
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <Sidebar userEmail={userEmail} onLogout={handleLogout} />

            <main className="flex-1 ml-64 overflow-auto">
                {/* Header con nuevo estilo */}
                <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/clients">
                                <Button variant="outline" size="icon" className="rounded-lg border-slate-200 hover:bg-slate-50">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                    {client.name}
                                </h1>
                                <p className="text-slate-600 mt-1 font-medium">
                                    Información y gestión del cliente
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Información del cliente */}
                        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-t-2xl">
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                        <FileText className="h-4 w-4 text-white" />
                                    </div>
                                    Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Mail className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-900">{client.email || 'Sin email'}</span>
                                    </div>
                                    {client.phone && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <Phone className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm font-medium text-slate-900">{client.phone}</span>
                                        </div>
                                    )}
                                    {client.company && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <Building className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm font-medium text-slate-900">{client.company}</span>
                                        </div>
                                    )}
                                    {client.address && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <MapPin className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm font-medium text-slate-900">{client.address}</span>
                                        </div>
                                    )}
                                    {client.tag && (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <Tag className="h-4 w-4 text-slate-500" />
                                            <span className="text-xs bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full font-semibold border border-blue-200">
                                                {client.tag}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Calendar className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-900">
                                            Cliente desde {new Date(client.created_at).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notas */}
                        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-slate-50 rounded-t-2xl">
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                        <FileText className="h-4 w-4 text-white" />
                                    </div>
                                    Notas
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Información importante sobre el cliente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-3">
                                    <textarea
                                        className="w-full min-h-[100px] px-4 py-3 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-transparent transition-all"
                                        placeholder="Escribe una nota..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />
                                    <Button
                                        onClick={addNote}
                                        size="sm"
                                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Guardar nota
                                    </Button>
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {notes.map((note) => (
                                        <div key={note.id} className="p-4 bg-gradient-to-r from-emerald-50 to-slate-50 rounded-xl border border-emerald-100">
                                            <p className="text-sm text-slate-900 font-medium">{note.content}</p>
                                            <p className="text-xs text-slate-500 mt-2">
                                                {new Date(note.created_at).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tareas */}
                        <Card className="rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50 rounded-t-2xl">
                                <CardTitle className="flex items-center gap-2 text-slate-900">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    Tareas
                                </CardTitle>
                                <CardDescription className="text-slate-600">
                                    Seguimiento de pendientes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-6">
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Nueva tarea..."
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                        className="rounded-xl border-slate-200 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <Button
                                        onClick={addTask}
                                        size="sm"
                                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir tarea
                                    </Button>
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-slate-50 rounded-xl border border-purple-100"
                                        >
                                            <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={task.is_done}
                                                    onChange={() => toggleTask(task.id, task.is_done)}
                                                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className={`text-sm font-medium ${task.is_done ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                                    {task.title}
                                                </span>
                                            </label>
                                            {task.is_done ? (
                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-amber-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Proyectos del Cliente */}
                        <Card className="md:col-span-3 rounded-2xl shadow-sm border-slate-100 hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-slate-50 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                                            <Building className="h-4 w-4 text-white" />
                                        </div>
                                        <CardTitle className="text-slate-900">Proyectos</CardTitle>
                                    </div>
                                    <Link href="/dashboard/projects">
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nuevo Proyecto
                                        </Button>
                                    </Link>
                                </div>
                                <CardDescription className="text-slate-600">
                                    Proyectos asociados a este cliente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                {loadingProjects ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <div className="text-sm text-slate-600 font-medium">Cargando proyectos...</div>
                                    </div>
                                ) : projects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay proyectos</h3>
                                        <div className="text-sm text-slate-600 mb-6">
                                            No hay proyectos para este cliente
                                        </div>
                                        <Link href="/dashboard/projects">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600"
                                            >
                                                Crear primer proyecto
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {projects.map((project) => (
                                            <Card
                                                key={project.id}
                                                className="rounded-xl shadow-sm border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1"
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                            {project.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <CardTitle className="text-base text-slate-900">{project.name}</CardTitle>
                                                            <CardDescription className="text-sm text-slate-600">
                                                                {project.description || 'Sin descripción'}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0 space-y-3">
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                                            <span className="text-slate-600">Estado:</span>
                                                            <span className="capitalize font-semibold text-slate-900">{project.status}</span>
                                                        </div>
                                                        {project.budget && (
                                                            <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                                                <span className="text-slate-600">Presupuesto:</span>
                                                                <span className="font-semibold text-slate-900">${project.budget.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                                                            <span className="text-slate-600">Creado:</span>
                                                            <span className="font-semibold text-slate-900">{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
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