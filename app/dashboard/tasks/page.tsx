import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import TasksPageClient from './TasksPageClient';

export default async function TasksPage() {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <TasksPageClient userEmail={session.user.email} />;
}
