import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import DashboardBonsai from './DashboardBonsai';

export default async function DashboardPage() {
    try {
        // Verificar configuración de Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_project_url_here')) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 text-slate-900 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-8 shadow-xl text-center">
                        <h2 className="text-2xl font-bold mb-4">Modo Demo</h2>
                        <p className="text-gray-700 mb-2">Supabase no está configurado.</p>
                        <p className="text-gray-500">Edita <code>.env.local</code> y reinicia el servidor.</p>
                    </div>
                </div>
            );
        }

        // Crear cliente SSR y obtener sesión
        const supabase = await createServerSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user?.email) {
            redirect('/login');
        }

        // Obtener tiempo total de tareas
        const { data: tasksData } = await supabase.from('tasks').select('total_time_seconds');
        const totalTime = Array.isArray(tasksData)
            ? tasksData.reduce((acc, t) => acc + (t.total_time_seconds || 0), 0)
            : 0;

        return (
            <DashboardBonsai userEmail={session.user.email ?? ''} totalTaskTime={totalTime} />
        );
    } catch (error) {
        redirect('/login');
    }
}
