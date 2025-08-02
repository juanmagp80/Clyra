import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProjectDetails from './ProjectDetails';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // Await the params before using them
    const { id } = await params;

    return (
        <ProjectDetails
            projectId={id}
            userEmail={session.user.email || ''}
        />
    );
}