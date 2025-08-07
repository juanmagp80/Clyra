import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ProposalsPageClient from './ProposalsPageClient';

export default async function ProposalsPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }

    return <ProposalsPageClient userEmail={user.email!} />;
}
