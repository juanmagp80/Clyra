'use client';
import { Edit3, FileText, Mail, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

type EmailTemplate = {
    id: string;
    name: string;
    subject: string;
    content: string;
    category: 'client' | 'project' | 'invoice' | 'marketing';
    created_at: string;
};

interface EmailTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: EmailTemplate[];
    onUseTemplate: (template: EmailTemplate) => void;
}

export default function EmailTemplatesModal({ 
    isOpen, 
    onClose, 
    templates, 
    onUseTemplate 
}: EmailTemplatesModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        subject: '',
        content: '',
        category: 'client' as const
    });

    if (!isOpen) return null;

    const filteredTemplates = templates.filter(template => 
        selectedCategory === 'all' || template.category === selectedCategory
    );

    const categories = [
        { key: 'all', label: 'Todas', color: 'slate' },
        { key: 'client', label: 'Clientes', color: 'blue' },
        { key: 'project', label: 'Proyectos', color: 'green' },
        { key: 'invoice', label: 'Facturas', color: 'yellow' },
        { key: 'marketing', label: 'Marketing', color: 'purple' }
    ];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'client': return 'bg-blue-100 text-blue-800';
            case 'project': return 'bg-green-100 text-green-800';
            case 'invoice': return 'bg-yellow-100 text-yellow-800';
            case 'marketing': return 'bg-purple-100 text-purple-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const handleCreateTemplate = () => {
        // Aquí se implementaría la lógica para guardar la plantilla
        console.log('Creating template:', newTemplate);
        setShowCreateForm(false);
        setNewTemplate({ name: '', subject: '', content: '', category: 'client' });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border border-white/60 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                Plantillas de Email
                            </h3>
                            <p className="text-slate-600 mt-1">
                                Gestiona y utiliza plantillas predefinidas para agilizar tu comunicación
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Nueva Plantilla
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex h-[70vh]">
                    {/* Sidebar de Categorías */}
                    <div className="w-64 p-6 border-r border-white/30">
                        <h4 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                            Categorías
                        </h4>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <button
                                    key={category.key}
                                    onClick={() => setSelectedCategory(category.key)}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        selectedCategory === category.key
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'text-slate-700 hover:bg-white/60'
                                    }`}
                                >
                                    {category.label}
                                </button>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-8 p-4 bg-white/40 backdrop-blur-xl rounded-xl border border-white/60">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">
                                    {filteredTemplates.length}
                                </div>
                                <div className="text-sm text-slate-600 font-medium">
                                    {selectedCategory === 'all' ? 'Total plantillas' : 'En esta categoría'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Templates Grid */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {showCreateForm ? (
                            /* Create Form */
                            <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 p-6">
                                <h4 className="text-lg font-bold text-slate-900 mb-6">Nueva Plantilla</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                                Nombre de la Plantilla
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Bienvenida Cliente"
                                                value={newTemplate.name}
                                                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                                Categoría
                                            </label>
                                            <select
                                                value={newTemplate.category}
                                                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value as any})}
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                            >
                                                <option value="client">Clientes</option>
                                                <option value="project">Proyectos</option>
                                                <option value="invoice">Facturas</option>
                                                <option value="marketing">Marketing</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                            Asunto del Email
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Bienvenido a nuestros servicios"
                                            value={newTemplate.subject}
                                            onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                                            className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                            Contenido de la Plantilla
                                        </label>
                                        <textarea
                                            rows={8}
                                            placeholder="Escribe el contenido de tu plantilla aquí. Puedes usar variables como {{nombre_cliente}}, {{proyecto}}, etc."
                                            value={newTemplate.content}
                                            onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                                            className="w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-slate-400 resize-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleCreateTemplate}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                    >
                                        Crear Plantilla
                                    </button>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="px-6 py-3 bg-white/70 border border-white/60 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Templates Grid */
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-900">{template.name}</h5>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(template.category)}`}>
                                                        {template.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-sm text-slate-600 font-medium mb-1">Asunto:</div>
                                            <div className="text-sm text-slate-900 font-semibold mb-3">
                                                {template.subject}
                                            </div>
                                            <div className="text-sm text-slate-600 font-medium mb-1">Contenido:</div>
                                            <div className="text-sm text-slate-700 line-clamp-3">
                                                {template.content}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    onUseTemplate(template);
                                                    onClose();
                                                }}
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <Mail className="w-4 h-4" />
                                                Usar Plantilla
                                            </button>
                                            <button className="px-4 py-2 bg-white/70 border border-white/60 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200">
                                                Vista Previa
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredTemplates.length === 0 && !showCreateForm && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <FileText className="w-10 h-10 text-slate-400" />
                                </div>
                                <h4 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-3">
                                    No hay plantillas
                                </h4>
                                <p className="text-slate-600 max-w-sm mx-auto font-medium mb-6">
                                    {selectedCategory === 'all' 
                                        ? 'Aún no tienes plantillas creadas'
                                        : `No hay plantillas en la categoría "${categories.find(c => c.key === selectedCategory)?.label}"`
                                    }
                                </p>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    Crear Primera Plantilla
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
