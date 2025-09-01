'use client';

import React, { useState, useEffect } from 'react';
import { showToast } from '@/utils/toast';

interface MeetingReminderStatus {
  success: boolean;
  message: string;
  remindersSent?: number;
  timestamp: string;
  service: string;
  status?: string;
  nextCheck?: string;
  description?: string;
}

export default function MeetingReminderAdmin() {
  const [status, setStatus] = useState<MeetingReminderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastExecution, setLastExecution] = useState<string | null>(null);

  // Verificar estado al cargar
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meeting-reminder', {
        method: 'GET'
      });
      
      const data = await response.json();
      setStatus(data);
      
    } catch (error) {
      console.error('Error verificando estado:', error);
      setStatus({
        success: false,
        message: 'Error conectando con el servicio',
        timestamp: new Date().toISOString(),
        service: 'Meeting Reminder Monitoring'
      });
    } finally {
      setLoading(false);
    }
  };

  const runManualCheck = async () => {
    try {
      setLoading(true);
      setLastExecution('Ejecutando...');
      
      const response = await fetch('/api/meeting-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setStatus(data);
      setLastExecution(new Date().toLocaleString('es-ES'));
      
      if (data.success) {
        showToast.error(`✅ Monitoreo completado exitosamente!\n\nRecordatorios enviados: ${data.remindersSent || 0}\nMensaje: ${data.message}`);
      } else {
        showToast.error(`❌ Error en el monitoreo:\n${data.error || data.message}`);
      }
      
    } catch (error) {
      console.error('Error ejecutando monitoreo:', error);
      setLastExecution('Error en la ejecución');
      showToast.error('❌ Error ejecutando el monitoreo de reuniones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📅 Administración de Recordatorios de Reunión
          </h1>
          <p className="text-gray-600">
            Sistema automático que envía recordatorios por email a los clientes 1 hora antes de las reuniones programadas.
          </p>
        </div>

        {/* Estado del Sistema */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            🔍 Estado del Sistema
          </h2>
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Verificando estado...</span>
            </div>
          )}
          
          {!loading && status && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${status.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center mb-2">
                  <span className={`text-2xl mr-2 ${status.success ? 'text-green-600' : 'text-red-600'}`}>
                    {status.success ? '✅' : '❌'}
                  </span>
                  <span className={`font-semibold ${status.success ? 'text-green-800' : 'text-red-800'}`}>
                    {status.success ? 'Sistema Operativo' : 'Sistema con Errores'}
                  </span>
                </div>
                <p className={`${status.success ? 'text-green-700' : 'text-red-700'}`}>
                  {status.message}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Información del Servicio</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Servicio:</strong> {status.service}
                  </p>
                  {status.description && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Descripción:</strong> {status.description}
                    </p>
                  )}
                  {status.nextCheck && (
                    <p className="text-sm text-gray-600">
                      <strong>Frecuencia:</strong> {status.nextCheck}
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Última Verificación</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Timestamp:</strong> {new Date(status.timestamp).toLocaleString('es-ES')}
                  </p>
                  {status.remindersSent !== undefined && (
                    <p className="text-sm text-gray-600">
                      <strong>Recordatorios enviados:</strong> {status.remindersSent}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles Manuales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            🎮 Controles Manuales
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={runManualCheck}
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {loading ? '🔄 Ejecutando...' : '🚀 Ejecutar Monitoreo Ahora'}
              </button>
              
              <button
                onClick={checkStatus}
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold border transition-colors ${
                  loading 
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {loading ? '🔄 Verificando...' : '🔍 Verificar Estado'}
              </button>
            </div>
            
            {lastExecution && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Última ejecución manual:</strong> {lastExecution}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información sobre el Funcionamiento */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            📋 Cómo Funciona el Sistema
          </h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">🔍 Detección Automática</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Analiza reuniones programadas cada hora</li>
                  <li>Detecta reuniones en las próximas 1-2 horas</li>
                  <li>Verifica que no se haya enviado recordatorio previamente</li>
                  <li>Solo procesa reuniones con estado "programada"</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📧 Envío de Recordatorios</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Email profesional con detalles completos</li>
                  <li>Botón de confirmación de asistencia</li>
                  <li>Información de contacto del responsable</li>
                  <li>Diseño optimizado para dispositivos móviles</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">⚙️ Configuración Requerida</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Tabla "meetings" en la base de datos</li>
                  <li>Automatización activa en el sistema</li>
                  <li>Clientes con emails válidos</li>
                  <li>Cron job o ejecución manual periódica</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📊 Variables Disponibles</h3>
                <ul className="space-y-1 list-disc list-inside">
                  <li>{'{{meeting_title}}'} - Título de la reunión</li>
                  <li>{'{{meeting_date}}'} - Fecha de la reunión</li>
                  <li>{'{{meeting_time}}'} - Hora de la reunión</li>
                  <li>{'{{meeting_location}}'} - Ubicación</li>
                  <li>{'{{client_name}}'}, {'{{user_name}}'}, etc.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
