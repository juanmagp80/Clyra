import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ProjectDetailsBonsai from './ProjectDetailsBonsai';

// Configuración correcta para Next.js 15+
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // await params
    const { id } = await params;

    return (
        <ProjectDetailsBonsai
            projectId={id}
            userEmail={session.user.email || ''}
        />
    );
}