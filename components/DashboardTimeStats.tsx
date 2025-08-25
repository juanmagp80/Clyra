"use client";
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, ArrowRight, BarChart2, Table, Clock } from 'lucide-react';

const VIEWS = [
  'tareas', // Tabla por tarea
  'proyectos', // Gráfica por proyecto
  'periodo', // Total por periodo
];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function DashboardTimeStats() {
  const [view, setView] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClientComponentClient();
    async function fetchData() {
      setLoading(true);
      const { data: tasksData } = await supabase.from('tasks').select('*');
      const { data: projectsData } = await supabase.from('projects').select('*');
      setTasks(tasksData || []);
      setProjects(projectsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Tabla por tarea
  const renderTasksTable = () => (
    <div>
      <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Table className="w-5 h-5" /> Tiempo por tarea</h3>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 text-left">Tarea</th>
            <th className="p-2 text-left">Proyecto</th>
            <th className="p-2 text-left">Tiempo</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border-b">
              <td className="p-2">{task.title}</td>
              <td className="p-2">{projects.find(p => p.id === task.project_id)?.name || '-'}</td>
              <td className="p-2">{formatTime(task.total_time_seconds || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Gráfica por proyecto (barras)
  const renderProjectsChart = () => {
    const projectTimes = projects.map(project => {
      const total = tasks.filter(t => t.project_id === project.id).reduce((sum, t) => sum + (t.total_time_seconds || 0), 0);
      return { name: project.name, total };
    });
    const max = Math.max(...projectTimes.map(p => p.total), 1);
    return (
      <div>
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><BarChart2 className="w-5 h-5" /> Tiempo por proyecto</h3>
        <div className="space-y-2">
          {projectTimes.map(p => (
            <div key={p.name} className="flex items-center gap-2">
              <div className="w-32 text-slate-700">{p.name}</div>
              <div className="flex-1 h-4 bg-blue-100 rounded">
                <div className="h-4 bg-blue-600 rounded" style={{width: `${(p.total / max) * 100}%`}}></div>
              </div>
              <div className="w-16 text-right text-slate-600">{formatTime(p.total)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Total por periodo (mes actual)
  const renderPeriodTotal = () => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const total = tasks.filter(t => {
      const d = new Date(t.created_at);
      return d.getMonth() === month && d.getFullYear() === year;
    }).reduce((sum, t) => sum + (t.total_time_seconds || 0), 0);
    return (
      <div>
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Clock className="w-5 h-5" /> Tiempo total este mes</h3>
        <div className="text-3xl font-bold text-blue-700 mb-2">{formatTime(total)}</div>
        <div className="text-slate-500">Incluye todas las tareas registradas este mes.</div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 rounded-full hover:bg-slate-100"
          onClick={() => setView((view - 1 + VIEWS.length) % VIEWS.length)}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-bold text-xl text-blue-900">Estadísticas de tiempo</div>
        <button
          className="p-2 rounded-full hover:bg-slate-100"
          onClick={() => setView((view + 1) % VIEWS.length)}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      {loading ? (
        <div className="text-center text-slate-500">Cargando estadísticas...</div>
      ) : (
        <div>
          {view === 0 && renderTasksTable()}
          {view === 1 && renderProjectsChart()}
          {view === 2 && renderPeriodTotal()}
        </div>
      )}
    </div>
  );
}
