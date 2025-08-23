import { createSupabaseClient } from '@/src/lib/supabase-client';
import { redirect } from 'next/navigation';

export default async function TiempoPage() {
    const supabase = createSupabaseClient();
    
    if (!supabase) {
        redirect('/login');
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Página de Tiempo - {user.email}
                    </h1>
                    <p className="text-gray-600">
                        Esta es la página de tiempo tracking. Si ves esto, la ruta funciona correctamente.
                    </p>
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700">
                            ✅ La ruta /dashboard/tiempo está funcionando correctamente
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
