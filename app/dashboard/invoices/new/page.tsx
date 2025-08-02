import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreateInvoicePage from './CreateInvoicePage';

export default async function NewInvoice() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    return <CreateInvoicePage userEmail={session.user.email || ''} />;
}