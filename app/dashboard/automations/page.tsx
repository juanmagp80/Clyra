import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import AutomationsPageClient from './AutomationsPageClient';

export default async function AutomationsPage() {
    try {
        console.log('🚀 Automations page loading...');
        
        console.log('🔄 Creating Supabase client...');
        const supabase = await createServerSupabaseClient();
        
        console.log('👤 Getting user...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        console.log('📋 User check:', {
            hasUser: !!user,
            hasEmail: !!user?.email,
            error: error?.message,
        });
        
        if (!user) {
            console.log('🚫 No user found - redirecting to login');
            redirect('/login');
        }

        console.log('✅ Valid user found - rendering automations page');
        return <AutomationsPageClient userEmail={user.email!} />;
    } catch (error) {
        console.error('❌ Error in automations page:', error);
        // Mostrar error en la página en lugar de redirigir
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                    <h1 className="text-2xl font-bold text-red-800 mb-4">Error de Configuración</h1>
                    <p className="text-red-600 mb-4">
                        Hubo un problema al cargar la página de automatizaciones.
                    </p>
                    <pre className="bg-red-100 p-4 rounded text-xs text-left overflow-auto">
                        {error instanceof Error ? error.message : String(error)}
                    </pre>
                    <a 
                        href="/dashboard" 
                        className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Ir al Dashboard
                    </a>
                </div>
            </div>
        );
    }
}
