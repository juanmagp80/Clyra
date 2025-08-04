import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import CreateInvoicePage from './CreateInvoicePage';

export default async function NewInvoice() {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    return <CreateInvoicePage userEmail={session.user.email || ''} />;
}