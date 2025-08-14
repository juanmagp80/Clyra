export default function TestPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-green-800 mb-4">✅ Test Page</h1>
                <p className="text-green-600 mb-4">Si ves esta página, el routing de Next.js funciona correctamente.</p>
                <a href="/dashboard" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Ir al Dashboard
                </a>
            </div>
        </div>
    );
}
