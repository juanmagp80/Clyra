'use client';

import { useState } from 'react';

export default function BudgetMonitoringAdmin() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runMonitoring = async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/budget-monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      setResult(data);
      
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            📊 Monitoreo de Presupuestos
          </h1>
          <p className="text-gray-600">
            Sistema automático de detección y alerta de presupuestos excedidos (≥80%)
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Panel de Control</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={runMonitoring}
              disabled={isRunning}
              className={`px-6 py-3 rounded-lg font-medium ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              {isRunning ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Ejecutando...
                </>
              ) : (
                '🔍 Ejecutar Monitoreo Manual'
              )}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>Funcionamiento:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Analiza todos los proyectos activos con presupuesto definido</li>
              <li>Calcula el gasto actual basado en horas trabajadas</li>
              <li>Envía alerta automática si el gasto supera el 80% del presupuesto</li>
              <li>Evita spam enviando máximo 1 alerta por proyecto cada 24 horas</li>
            </ul>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Resultado de Ejecución</h2>
            
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-2">
                <span className={`text-2xl mr-2 ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.success ? '✅' : '❌'}
                </span>
                <span className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? 'Monitoreo completado' : 'Error en monitoreo'}
                </span>
              </div>
              
              <p className={`text-sm ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.message}
              </p>
              
              {result.alertsSent !== undefined && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Alertas enviadas:</strong> {result.alertsSent}
                </p>
              )}
              
              {result.timestamp && (
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Ejecutado:</strong> {new Date(result.timestamp).toLocaleString('es-ES')}
                </p>
              )}
              
              {result.error && (
                <div className="mt-3 p-3 bg-red-100 rounded text-xs text-red-800">
                  <strong>Error técnico:</strong> {result.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">ℹ️ Información Técnica</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Variables del Email</h3>
              <ul className="space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">{'{{project_name}}'}</code> - Nombre del proyecto</li>
                <li><code className="bg-gray-100 px-1 rounded">{'{{budget_total}}'}</code> - Presupuesto total</li>
                <li><code className="bg-gray-100 px-1 rounded">{'{{budget_spent}}'}</code> - Cantidad gastada</li>
                <li><code className="bg-gray-100 px-1 rounded">{'{{budget_percentage}}'}</code> - Porcentaje utilizado</li>
                <li><code className="bg-gray-100 px-1 rounded">{'{{budget_remaining}}'}</code> - Presupuesto restante</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Configuración</h3>
              <ul className="space-y-1">
                <li><strong>Umbral de alerta:</strong> 80% del presupuesto</li>
                <li><strong>Frecuencia máxima:</strong> 1 alerta cada 24 horas</li>
                <li><strong>Estado automatización:</strong> Activa</li>
                <li><strong>Trigger:</strong> budget_exceeded</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
