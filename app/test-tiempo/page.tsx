export default function TestTiempoPage() {
    return (
        <div className="min-h-screen bg-blue-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-blue-900 mb-4">
                    🧪 Página de Test Tiempo
                </h1>
                <p className="text-gray-600 mb-4">
                    Esta es una página de prueba para verificar que el routing funciona correctamente.
                </p>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">
                        ✅ Si ves esta página en la URL <code>/test-tiempo</code>, entonces el routing funciona correctamente.
                    </p>
                </div>
                <div className="mt-6">
                    <a 
                        href="/dashboard/tiempo" 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Ir a /dashboard/tiempo
                    </a>
                </div>
            </div>
        </div>
    );
}
