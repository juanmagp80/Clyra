import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ClientCommunicationsClient from './ClientCommunicationsClient';
import ClientCommunicationsSimple from './ClientCommunicationsSimple';

export default async function ClientCommunicationsPage() {
    // ✅ Verificar si Supabase está configurado
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Si Supabase no está configurado, usar versión simplificada
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_project_url_here')) {
        console.log('🚧 Client Communications in demo mode - Supabase not configured');
        return <ClientCommunicationsSimple />;
    }
    
    try {
        const supabase = await createServerSupabaseClient();
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            redirect('/login');
        }
        
        // Verificar si las tablas de comunicación existen
        const { error: tablesError } = await supabase
            .from('client_tokens')
            .select('id')
            .limit(1);
        
        if (tablesError && tablesError.message.includes('relation "client_tokens" does not exist')) {
            console.log('📋 Client communication tables not found - showing simple version');
            return <ClientCommunicationsSimple />;
        }
        
        return <ClientCommunicationsClient userEmail={user.email!} />;
    } catch (error) {
        console.error('❌ Error in client communications page:', error);
        return <ClientCommunicationsSimple />;
    }
}
