import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import AIAutomationsPageClient from './AIAutomationsPageClient';

export default async function AIAutomationsPage() {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <AIAutomationsPageClient userEmail={user.email || ''} />;
}
