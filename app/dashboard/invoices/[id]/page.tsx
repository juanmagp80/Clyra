import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import InvoiceDetails from './InvoiceDetails';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Await the params before using them
    const { id } = await params;

    return (
        <InvoiceDetails
            invoiceId={id}
            userEmail={session.user.email || ''}
        />
    );
}