import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientDetails from './ClientDetails';

interface PageProps {
    params: Promise<{
        id: string;
        clientId?: string; // Optional for compatibility
    }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Await the params before using them
    const { id } = await params;

    return (
        <ClientDetails
            client={id}
            userEmail={session.user.email || ''}
        />
    );
}