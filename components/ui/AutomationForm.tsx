import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';



interface AutomationFormProps {
  onSubmit: (data: { name: string; description: string; trigger_type: string; is_public: boolean }) => void;
  loading?: boolean;
}
export default function AutomationForm({ onSubmit, loading }: AutomationFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('client_onboarding');
  const [isPublic, setIsPublic] = useState(false);

  return (
    <form
      className="space-y-6"
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ name, description, trigger_type: triggerType, is_public: isPublic });
      }}
    >
      <div>
        <label className="inline-flex items-center mt-2">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-pink-600 transition duration-150 ease-in-out"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
          />
          <span className="ml-2 text-slate-700 font-medium">Automatización pública (visible para todos los usuarios)</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Seguimiento de facturas"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe la automatización"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de disparador</label>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={triggerType}
          onChange={e => setTriggerType(e.target.value)}
        >
          <option value="client_onboarding">Onboarding Cliente</option>
          <option value="project_milestone">Hito de Proyecto</option>
          <option value="invoice_followup">Seguimiento Facturas</option>
          <option value="time_tracking">Control de Tiempo</option>
          <option value="client_communication">Comunicación Cliente</option>
        </select>
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
        disabled={loading}
      >
        {loading ? 'Creando...' : 'Crear Automatización'}
      </Button>
    </form>
  );
}
