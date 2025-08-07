import React from 'react';
import { X, Save, BookTemplate } from 'lucide-react';

interface TemplateFormProps {
  title: string;
  subtitle?: string;
  formData: any;
  setFormData: (data: any) => void;
  onCancel: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  categories: Array<{ id: string; name: string; icon: any; color: string }>;
  submitLabel: string;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  title,
  subtitle,
  formData,
  setFormData,
  onCancel,
  onSubmit,
  categories,
  submitLabel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-6"
          >
            {/* Nombre del template */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre del Template *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Ej: Desarrollo Web E-commerce"
              />
            </div>
            {/* Categoría */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                {categories
                  .filter((cat) => cat.id !== 'all')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                <option value="other">Otro</option>
              </select>
            </div>
            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe qué tipo de proyectos abarca este template, qué incluye, y cuándo usarlo..."
              />
            </div>
            {/* Fases (número) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nº de Fases</label>
              <input
                type="number"
                min="0"
                value={formData.template_data?.phases || ''}
                onChange={e => {
                  setFormData((prev: any) => ({
                    ...prev,
                    template_data: {
                      ...prev.template_data,
                      phases: e.target.value ? parseInt(e.target.value) : ''
                    }
                  }));
                }}
                className="w-full px-4 py-3 rounded-lg border border-slate-300"
                placeholder="Ej: 3"
              />
            </div>
            {/* Entregables (número) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nº de Entregables</label>
              <input
                type="number"
                min="0"
                value={formData.template_data?.deliverables || ''}
                onChange={e => {
                  setFormData((prev: any) => ({
                    ...prev,
                    template_data: {
                      ...prev.template_data,
                      deliverables: e.target.value ? parseInt(e.target.value) : ''
                    }
                  }));
                }}
                className="w-full px-4 py-3 rounded-lg border border-slate-300"
                placeholder="Ej: 2"
              />
            </div>
            {/* Precio base */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Precio base (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.template_data?.pricing?.base_price || ''}
                onChange={e => {
                  setFormData((prev: any) => ({
                    ...prev,
                    template_data: {
                      ...prev.template_data,
                      pricing: {
                        ...prev.template_data?.pricing,
                        base_price: e.target.value ? parseFloat(e.target.value) : ''
                      }
                    }
                  }));
                }}
                className="w-full px-4 py-3 rounded-lg border border-slate-300"
                placeholder="Ej: 1200"
              />
            </div>
            {/* Información adicional */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-start">
                <BookTemplate className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                    Sobre los Templates
                  </h4>
                  <p className="text-sm text-indigo-700">
                    Los templates te permiten crear proyectos con estructura predefinida. Podrás usar este template para generar proyectos similares de forma rápida, personalizando los detalles específicos de cada cliente.
                  </p>
                </div>
              </div>
            </div>
            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;
