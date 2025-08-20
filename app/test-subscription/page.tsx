'use client';

import { useState } from 'react';
import { useTrialStatus } from '@/src/lib/useTrialStatus';

export default function TestSubscriptionPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { trialInfo, loading: trialLoading, checkTrialStatus } = useTrialStatus();

  const handleTestSubscription = async () => {
    if (!email) {
      alert('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-manual-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        // Esperar un momento y actualizar el estado del trial
        setTimeout(async () => {
          await checkTrialStatus();
          alert('¡Suscripción de prueba creada! Los botones deberían estar activados ahora.');
          // Redirigir al dashboard
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al crear suscripción de prueba' });
    } finally {
      setLoading(false);
    }
  };

  const handleDebugSubscription = async () => {
    if (!email) {
      alert('Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/debug-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      });

      const data = await response.json();
      setResult(data);
      
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: 'Error al debugear suscripción' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    await checkTrialStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 Prueba de Suscripción
        </h1>
        
        {/* Estado actual */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Estado Actual</h2>
          {trialLoading ? (
            <p>Cargando...</p>
          ) : trialInfo ? (
            <div className="space-y-2">
              <p><strong>Estado:</strong> {trialInfo.status}</p>
              <p><strong>Plan:</strong> {trialInfo.plan}</p>
              <p><strong>Días restantes:</strong> {trialInfo.daysRemaining}</p>
              <p><strong>Puede usar funciones:</strong> {trialInfo.canUseFeatures ? '✅ Sí' : '❌ No'}</p>
              <p><strong>Expirado:</strong> {trialInfo.isExpired ? '⚠️ Sí' : '✅ No'}</p>
            </div>
          ) : (
            <p>No se pudo cargar información del trial</p>
          )}
          
          <button
            onClick={handleRefreshStatus}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔄 Actualizar Estado
          </button>
        </div>

        {/* Crear suscripción de prueba */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Crear Suscripción de Prueba</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Tu Email (el mismo con el que te registraste)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="tu-email@ejemplo.com"
              />
            </div>
            
            <button
              onClick={handleTestSubscription}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '⏳ Creando...' : '🚀 Activar Suscripción de Prueba'}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-center mt-8">
          <a
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            ← Volver al Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
