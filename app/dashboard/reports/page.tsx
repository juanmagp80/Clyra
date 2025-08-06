import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import ReportsPageClient from './ReportsPageClient';

export default async function ReportsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <ReportsPageClient userEmail={session.user.email} />;
}
