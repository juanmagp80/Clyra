import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ProjectsPageBonsai from './ProjectsPageBonsai';

export default async function ProjectsPage() {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <ProjectsPageBonsai userEmail={session.user.email} />;
}