import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientsPageClient from './ClientsPageClient';

export default async function ClientsPage() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <ClientsPageClient userEmail={session.user.email} />;
}
