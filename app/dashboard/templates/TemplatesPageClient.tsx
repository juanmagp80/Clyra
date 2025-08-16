'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, FileText } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  template_data: any;
  created_at: string;
}

export default function TemplatesPageClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setTemplates([]);
    } catch (error) {
      console.error('Error cargando templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-slate-600">Cargando templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Templates de Proyecto</h1>
          <p className="text-slate-600 mt-1">
            Gestiona plantillas reutilizables para acelerar el desarrollo de proyectos
          </p>
        </div>
        
        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Template
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Buscar templates..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay templates</h3>
        <p className="text-slate-600 mb-6">
          Comienza creando tu primer template de proyecto
        </p>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Crear primer template
        </button>
      </div>
    </div>
  );
}
