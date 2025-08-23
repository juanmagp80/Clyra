import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ClientDetailsBonsai from './ClientDetailsBonsai';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Await the params before using them
    const { id } = await params;

    // Fetch the client data
    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();

    if (error || !client) {
        redirect('/dashboard/clients');
    }

    return (
        <ClientDetailsBonsai
            client={client}
            userEmail={session.user.email || ''}
        />
    );
}