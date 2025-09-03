import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ContractsPageClient from './ContractsPageClient';

export default async function ContractsPage() {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <ContractsPageClient userEmail={user.email || ''} />;
}
