import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import { ChevronDown, Clock, Folder, BarChart3 } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    totalTime: number;
    tasks: Task[];
}

interface Task {
    id: string;
    title: string;
    total_time_seconds: number;
}

export default function TasksTimeBreakdown() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createSupabaseClient();
        async function fetchData() {
            setLoading(true);
            
            try {
                // Obtener proyectos
                const { data: projectsData } = await supabase.from('projects').select('id, name');
                
                // Obtener tareas con tiempo
                const { data: tasksData } = await supabase.from('tasks').select('id, title, project_id, total_time_seconds');
                
                // Procesar datos
                const projectsMap = new Map<string, Project>();
                
                // Inicializar proyectos
                (projectsData || []).forEach((project: any) => {
                    projectsMap.set(project.id, {
                        id: project.id,
                        name: project.name,
                        totalTime: 0,
                        tasks: []
                    });
                });
                
                // Agregar tareas y calcular tiempo total por proyecto
                (tasksData || []).forEach((task: any) => {
                    const project = projectsMap.get(task.project_id);
                    if (project) {
                        project.tasks.push({
                            id: task.id,
                            title: task.title,
                            total_time_seconds: task.total_time_seconds || 0
                        });
                        project.totalTime += task.total_time_seconds || 0;
                    }
                });
                
                const projectsArray = Array.from(projectsMap.values());
                setProjects(projectsArray);
                
                // Seleccionar automáticamente el primer proyecto que tenga tiempo
                const projectWithTime = projectsArray.find(p => p.totalTime > 0);
                if (projectWithTime) {
                    setSelectedProjectId(projectWithTime.id);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    function formatTime(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const totalProjectsTime = projects.reduce((sum, project) => sum + project.totalTime, 0);

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Tiempo por Proyecto</h3>
                </div>
                <p className="text-gray-500 text-sm">🔄 Cargando tiempos...</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Tiempo por Proyecto</h3>
                </div>
                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    Total: {formatTime(totalProjectsTime)}
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No hay proyectos con tiempo registrado</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Selector de proyecto */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar proyecto:
                        </label>
                        <div className="relative">
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                            >
                                <option value="">-- Selecciona un proyecto --</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name} ({formatTime(project.totalTime)})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Detalles del proyecto seleccionado */}
                    {selectedProject ? (
                        <div className="border border-gray-200 rounded-lg bg-gray-50">
                            {/* Info del proyecto */}
                            <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Folder className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium text-gray-900">{selectedProject.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                            {selectedProject.tasks.length} tarea{selectedProject.tasks.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
                                            {formatTime(selectedProject.totalTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de tareas */}
                            {selectedProject.tasks.length > 0 ? (
                                <div className="p-3 space-y-2">
                                    {selectedProject.tasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border border-gray-100">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                                                <span className="text-sm text-gray-700 truncate">{task.title}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 ml-2">
                                                {formatTime(task.total_time_seconds)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-gray-500">Este proyecto no tiene tareas registradas</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500">Selecciona un proyecto para ver sus tareas</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
