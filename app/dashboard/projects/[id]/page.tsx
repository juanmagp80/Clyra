import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProjectDetails from './ProjectDetails';

// Configuración correcta para Next.js 15+
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // await params
    const { id } = await params;

    return (
        <ProjectDetails
            projectId={id}
            userEmail={session.user.email || ''}
        />
    );
}