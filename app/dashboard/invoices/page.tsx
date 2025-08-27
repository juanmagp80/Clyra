import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import InvoicesPageClient from './InvoicesPageClient';

export default async function InvoicesPage() {
    try {
        // Crear cliente SSR y obtener usuario autenticado
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user?.email) {
            redirect('/login');
        }

        return <InvoicesPageClient userEmail={user.email} />;
    } catch (error) {
        console.error('Error en InvoicesPage:', error);
        redirect('/login');
    }
}
