export default function DebugRouting() {
    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-8">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-blue-800 mb-6">🔍 Debug de Routing</h1>
                
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-green-700 font-semibold">✅ Esta página funciona</p>
                        <p className="text-sm text-green-600">URL: /debug-routing</p>
                    </div>
                    
                    <div className="space-y-2">
                        <a 
                            href="/dashboard" 
                            className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Ir a /dashboard
                        </a>
                        
                        <a 
                            href="/test" 
                            className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                            Ir a /test
                        </a>
                        
                        <a 
                            href="/login" 
                            className="block w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                        >
                            Ir a /login
                        </a>
                    </div>
                </div>
                
                <div className="mt-6 text-xs text-gray-500">
                    Si ves errores 404, hay problemas de routing
                </div>
            </div>
        </div>
    );
}
