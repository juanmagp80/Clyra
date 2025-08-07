import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import AutomationsPageClient from './AutomationsPageClient';

export default async function AutomationsPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }

    return <AutomationsPageClient userEmail={user.email!} />;
}
