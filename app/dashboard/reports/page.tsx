import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import ReportsPageClientSimple from './ReportsPageClientSimple';

export default async function ReportsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <ReportsPageClientSimple userEmail={session.user.email} />;
}
