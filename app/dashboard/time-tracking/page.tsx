import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import TimeTrackingClient from './TimeTrackingClient';

export default async function TimeTrackingPage() {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <TimeTrackingClient userEmail={session.user.email} />;
}
