import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import InvoicesPageClient from './InvoicesPageClient';

export const metadata: Metadata = {
    title: 'Facturas | Taskelio CRM',
    description: 'Gestiona tus facturas y pagos',
};

export default async function InvoicesPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }
    
    return <InvoicesPageClient userEmail={user.email!} />;
}