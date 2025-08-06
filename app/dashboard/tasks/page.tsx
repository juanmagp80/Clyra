import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import TasksPageClient from './TasksPageClient';

export default async function TasksPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }
    
    return <TasksPageClient userEmail={user.email!} />;
}
