'use client';

import { useState } from 'react';

export default function CreateTestDataPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const createTestData = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/create-test-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
            } else {
                setError(data.error || 'Error desconocido');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🧪 Crear Datos de Prueba
                    </h1>
                    <p className="text-lg text-gray-600">
                        Genera clientes, proyectos y facturas para probar las automatizaciones
                    </p>
                </div>

                {/* Botón principal */}
                <div className="text-center mb-8">
                    <button
                        onClick={createTestData}
                        disabled={loading}
                        className="inline-flex items-center px-8 py-4 text-lg font-medium text-white 
                                 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg 
                                 hover:from-blue-700 hover:to-indigo-700 focus:outline-none 
                                 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 
                                 disabled:cursor-not-allowed transition-all duration-200 
                                 transform hover:scale-105"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" 
                                            stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" 
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creando datos...
                            </>
                        ) : (
                            <>
                                🚀 Crear Datos de Prueba
                            </>
                        )}
                    </button>
                </div>

                {/* Instrucciones */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 ¿Qué hace este botón?</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">👥</span>
                                <div>
                                    <p className="font-medium text-gray-900">Clientes</p>
                                    <p className="text-sm text-gray-600">5 clientes con datos realistas</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">📋</span>
                                <div>
                                    <p className="font-medium text-gray-900">Proyectos</p>
                                    <p className="text-sm text-gray-600">4 proyectos asignados a los clientes</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">💰</span>
                                <div>
                                    <p className="font-medium text-gray-900">Facturas</p>
                                    <p className="text-sm text-gray-600">4 facturas (pendientes, pagadas, vencidas)</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <p className="font-medium text-gray-900">Tareas</p>
                                    <p className="text-sm text-gray-600">Algunas tareas adicionales (si existe la tabla)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resultado exitoso */}
                {result && result.success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center mb-4">
                            <span className="text-3xl mr-3">🎉</span>
                            <h3 className="text-xl font-semibold text-green-900">
                                ¡Datos creados exitosamente!
                            </h3>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {result.data.clients_created}
                                </div>
                                <div className="text-sm text-gray-600">Clientes</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {result.data.projects_created}
                                </div>
                                <div className="text-sm text-gray-600">Proyectos</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {result.data.invoices_created}
                                </div>
                                <div className="text-sm text-gray-600">Facturas</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {result.data.total_entities}
                                </div>
                                <div className="text-sm text-gray-600">Total</div>
                            </div>
                        </div>

                        <div className="bg-green-100 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">🎯 Próximos pasos:</h4>
                            <ul className="space-y-1 text-green-800">
                                {result.next_steps.map((step: string, index: number) => (
                                    <li key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {result.errors && result.errors.length > 0 && (
                            <div className="mt-4 bg-yellow-100 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Advertencias:</h4>
                                <ul className="space-y-1 text-yellow-800 text-sm">
                                    {result.errors.map((error: any, index: number) => (
                                        <li key={index}>
                                            <strong>{error.table}:</strong> {error.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Botón para ir a automatizaciones */}
                        <div className="mt-6 text-center">
                            <a
                                href="/dashboard/automations"
                                className="inline-flex items-center px-6 py-3 text-base font-medium 
                                         text-white bg-gradient-to-r from-green-600 to-emerald-600 
                                         rounded-lg shadow-md hover:from-green-700 hover:to-emerald-700 
                                         focus:outline-none focus:ring-4 focus:ring-green-300 
                                         transition-all duration-200 transform hover:scale-105"
                            >
                                🤖 Probar Automatizaciones
                                <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                </svg>
                            </a>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">❌</span>
                            <h3 className="text-lg font-semibold text-red-900">Error</h3>
                        </div>
                        <p className="text-red-800">{error}</p>
                        <div className="mt-4 text-sm text-red-600">
                            <p>💡 <strong>Sugerencias:</strong></p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Asegúrate de estar autenticado en la aplicación</li>
                                <li>Verifica que las tablas existan en tu base de datos</li>
                                <li>Revisa la consola del navegador para más detalles</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Footer info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>💡 Tip: Puedes ejecutar este proceso varias veces. Los datos duplicados se manejarán automáticamente.</p>
                </div>
            </div>
        </div>
    );
}
