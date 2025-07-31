import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProjectsPageClient from './ProjectsPageClient';

export default async function ProjectsPage() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <ProjectsPageClient userEmail={session.user.email} />;
}