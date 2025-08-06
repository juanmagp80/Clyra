'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  User,
  Briefcase,
  AlertCircle,
  Plus,
  Filter,
  Search,
  BarChart3,
  Target,
  Timer,
  TrendingUp,
  Star,
  Flag,
  PlayCircle,
  PauseCircle,
  Eye,
  Sparkles,
  Brain
} from 'lucide-react';
import { demoTasks, demoTaskStats, demoClients, demoProjects } from '../demo-data';

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  completed_at: string | null;
  project_id?: string;
  client_id?: string;
  estimated_hours: number;
  actual_hours: number;
  is_billable: boolean;
  tags: string[];
  user_id: string;
  created_at: string;
}

interface ExtendedTask extends Task {
  clients?: {
    name: string;
    company?: string;
  };
  projects?: {
    title: string;
    description?: string;
  };
}

export default function DemoTasksPage() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ExtendedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [activeTracking, setActiveTracking] = useState<string | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para nueva tarea
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    due_date: '',
    project_id: '',
    client_id: '',
    estimated_hours: 2,
    is_billable: true,
    tags: ''
  });

  // Cargar datos demo al inicializar
  useEffect(() => {
    const enrichedTasks = demoTasks.map(task => ({
      ...task,
      status: task.status as TaskStatus, // Explicit type casting
      priority: task.priority as TaskPriority, // Explicit type casting
      clients: task.client_id ? demoClients.find(c => c.id === task.client_id) : undefined,
      projects: task.project_id ? demoProjects.find(p => p.id === task.project_id) : undefined
    }));
    setTasks(enrichedTasks);
    setFilteredTasks(enrichedTasks);

    // Detectar si hay alguna tarea en progreso
    const taskInProgress = enrichedTasks.find(task => task.status === 'in_progress');
    if (taskInProgress) {
      setActiveTracking(taskInProgress.id);
    }
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = tasks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter, searchTerm]);

  // Funciones de utilidad
  const getPriorityColor = (priority: TaskPriority): string => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500'
    };
    return colors[priority];
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    const icons = {
      low: Flag,
      medium: AlertCircle,
      high: Star
    };
    return icons[priority];
  };

  const getStatusColor = (status: TaskStatus): string => {
    const colors = {
      pending: 'text-slate-600',
      in_progress: 'text-blue-600',
      completed: 'text-green-600'
    };
    return colors[status];
  };

  const isOverdue = (task: ExtendedTask): boolean => {
    return task.status !== 'completed' && new Date(task.due_date) < new Date();
  };

  // Funciones de tareas
  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        return {
          ...task,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        };
      }
      return task;
    }));
  };

  const toggleTaskTracking = (taskId: string) => {
    if (activeTracking === taskId) {
      setActiveTracking(null);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'pending' as const } : task
      ));
    } else {
      // Parar cualquier otro tracking activo
      if (activeTracking) {
        setTasks(tasks.map(task => 
          task.id === activeTracking ? { ...task, status: 'pending' as const } : task
        ));
      }
      setActiveTracking(taskId);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'in_progress' as const } : task
      ));
    }
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;

    const newTaskData: ExtendedTask = {
      id: `demo-task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: 'pending',
      priority: newTask.priority,
      due_date: newTask.due_date,
      completed_at: null,
      project_id: newTask.project_id || undefined,
      client_id: newTask.client_id || undefined,
      estimated_hours: newTask.estimated_hours,
      actual_hours: 0,
      is_billable: newTask.is_billable,
      tags: newTask.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      clients: newTask.client_id ? demoClients.find(c => c.id === newTask.client_id) : undefined,
      projects: newTask.project_id ? demoProjects.find(p => p.id === newTask.project_id) : undefined
    };

    setTasks([newTaskData, ...tasks]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      project_id: '',
      client_id: '',
      estimated_hours: 2,
      is_billable: true,
      tags: ''
    });
    setShowNewTaskForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-slate-900 relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-grid-slate-900/[0.02] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10">
        <div className="p-4">
          {/* Demo Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl p-4 mb-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">✅ Modo Demo - Gestión de Tareas</h2>
                  <p className="text-emerald-100 text-sm">Organiza y prioriza tu trabajo eficientemente</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-xs">Tareas activas</div>
                <div className="text-lg font-bold">{tasks.filter(t => t.status !== 'completed').length}</div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/60 rounded-xl p-4 shadow-xl shadow-slate-900/5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                    Gestión de Tareas
                  </h1>
                  <p className="text-slate-600 text-sm">Organiza y prioriza tu trabajo</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowNewTaskForm(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 h-9 px-4 text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              </div>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completadas</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">Todas las prioridades</option>
                <option value="high">Alta prioridad</option>
                <option value="medium">Prioridad media</option>
                <option value="low">Baja prioridad</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-700">{demoTaskStats.totalTasks}</p>
                    <p className="text-xs text-slate-600 font-medium">Total tareas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-700">{demoTaskStats.completedTasks}</p>
                    <p className="text-xs text-slate-600 font-medium">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-700">{demoTaskStats.inProgressTasks}</p>
                    <p className="text-xs text-slate-600 font-medium">En progreso</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-700">{demoTaskStats.overdueTasks}</p>
                    <p className="text-xs text-slate-600 font-medium">Vencidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-purple-700">{demoTaskStats.completionRate}%</p>
                    <p className="text-xs text-slate-600 font-medium">Tasa completado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Tareas */}
          <Card className="bg-white/95 backdrop-blur-2xl border-slate-200/60 shadow-xl shadow-slate-900/5">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Mis Tareas ({filteredTasks.length})
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Gestiona tus tareas y proyectos de manera eficiente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No hay tareas que coincidan con los filtros</p>
                  <p className="text-slate-400 text-sm">Ajusta los filtros o crea una nueva tarea</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const PriorityIcon = getPriorityIcon(task.priority);
                    const dueDate = new Date(task.due_date);
                    const isTaskOverdue = isOverdue(task);
                    
                    return (
                      <div
                        key={task.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 group backdrop-blur-sm cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-green-50/50 border-green-200/60 opacity-75'
                            : isTaskOverdue
                            ? 'bg-red-50/50 border-red-200/60'
                            : 'border-slate-200/60 bg-white/80 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5'
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        {/* Checkbox y Prioridad */}
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-slate-300 hover:border-green-500'
                            }`}
                          >
                            {task.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          </button>
                          
                          <div className={`w-3 h-3 ${getPriorityColor(task.priority)} rounded-full`}></div>
                        </div>
                        
                        {/* Contenido Principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className={`font-bold text-lg mb-1 ${
                                task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}>
                                {task.title}
                              </h3>
                              
                              <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                                <span className={`font-medium ${getStatusColor(task.status)}`}>
                                  {task.status === 'pending' ? '⏳ Pendiente' : 
                                   task.status === 'in_progress' ? '🔄 En progreso' : 
                                   '✅ Completada'}
                                </span>
                                
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {dueDate.toLocaleDateString('es-ES')}
                                  {isTaskOverdue && <span className="text-red-600 font-medium">⚠️ Vencida</span>}
                                </span>
                                
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  {task.estimated_hours}h estimadas
                                </span>
                                
                                {task.is_billable && (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                    💰 Facturable
                                  </span>
                                )}
                              </div>

                              {task.description && (
                                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{task.description}</p>
                              )}

                              {/* Cliente y Proyecto */}
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                {task.clients && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {task.clients.name}
                                  </span>
                                )}
                                
                                {task.projects && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {task.projects.title}
                                  </span>
                                )}
                              </div>

                              {/* Tags */}
                              {task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {task.status !== 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTaskTracking(task.id)}
                              className={`h-9 w-9 p-0 rounded-lg transition-all duration-200 ${
                                activeTracking === task.id
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                  : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                              title={activeTracking === task.id ? 'Parar trabajo' : 'Iniciar trabajo'}
                            >
                              {activeTracking === task.id ? (
                                <PauseCircle className="w-4 h-4" />
                              ) : (
                                <PlayCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                            className="h-9 w-9 p-0 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Detalles de Tarea */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header del Modal */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${getPriorityColor(selectedTask.priority)} rounded-lg flex items-center justify-center`}>
                    {(() => {
                      const PriorityIcon = getPriorityIcon(selectedTask.priority);
                      return <PriorityIcon className="w-4 h-4 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedTask.title}</h2>
                    <p className="text-sm text-slate-600 capitalize">
                      {selectedTask.priority} prioridad • {selectedTask.status}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-600 hover:bg-slate-50"
                >
                  ✕
                </Button>
              </div>

              {/* Contenido de la Tarea */}
              <div className="space-y-4">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Fecha límite</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6">
                      📅 {new Date(selectedTask.due_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {isOverdue(selectedTask) && (
                        <span className="text-red-600 font-medium ml-2">⚠️ Vencida</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Tiempo</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6">
                      <div>⏱️ Estimado: {selectedTask.estimated_hours} horas</div>
                      <div>📊 Real: {selectedTask.actual_hours} horas</div>
                      {selectedTask.is_billable && (
                        <div className="text-emerald-600 font-medium">💰 Facturable</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {selectedTask.description && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Descripción</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6 p-3 bg-slate-50 rounded-lg">
                      {selectedTask.description}
                    </div>
                  </div>
                )}

                {/* Cliente y Proyecto */}
                {(selectedTask.clients || selectedTask.projects) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Información del proyecto</span>
                    </div>
                    <div className="text-sm text-slate-600 pl-6 space-y-2">
                      {selectedTask.clients && (
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          <span>Cliente: {selectedTask.clients.name}</span>
                          {selectedTask.clients.company && (
                            <span className="text-slate-500">({selectedTask.clients.company})</span>
                          )}
                        </div>
                      )}
                      {selectedTask.projects && (
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3" />
                          <span>Proyecto: {selectedTask.projects.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedTask.tags.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Etiquetas</span>
                    </div>
                    <div className="pl-6">
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones de tracking */}
                {selectedTask.status !== 'completed' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Timer className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">Seguimiento de tiempo</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTaskTracking(selectedTask.id)}
                        className={activeTracking === selectedTask.id ? 
                          "bg-red-50 text-red-600 hover:bg-red-100" : 
                          "bg-green-50 text-green-600 hover:bg-green-100"
                        }
                      >
                        {activeTracking === selectedTask.id ? (
                          <>
                            <PauseCircle className="w-3 h-3 mr-1" />
                            Parar trabajo
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3 h-3 mr-1" />
                            Iniciar trabajo
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTaskStatus(selectedTask.id)}
                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Marcar completada
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nueva tarea */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Crear Nueva Tarea</h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowNewTaskForm(false)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Título de la tarea"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Descripción detallada"
                    className="w-full p-2 border border-slate-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as TaskPriority})}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="low">🟢 Baja</option>
                      <option value="medium">🟡 Media</option>
                      <option value="high">🔴 Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha límite</label>
                    <Input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                    <select
                      value={newTask.client_id}
                      onChange={(e) => setNewTask({...newTask, client_id: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Sin cliente</option>
                      {demoClients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.company && `(${client.company})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
                    <select
                      value={newTask.project_id}
                      onChange={(e) => setNewTask({...newTask, project_id: e.target.value})}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Sin proyecto</option>
                      {demoProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horas estimadas</label>
                    <Input
                      type="number"
                      value={newTask.estimated_hours}
                      onChange={(e) => setNewTask({...newTask, estimated_hours: Number(e.target.value)})}
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={newTask.is_billable}
                      onChange={(e) => setNewTask({...newTask, is_billable: e.target.checked})}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">Facturable</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Etiquetas</label>
                  <Input
                    value={newTask.tags}
                    onChange={(e) => setNewTask({...newTask, tags: e.target.value})}
                    placeholder="desarrollo, frontend, urgente (separadas por comas)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={createTask}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                  >
                    Crear Tarea
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowNewTaskForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
