import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import CalendarPageClient from './CalendarPageClient';

export default async function CalendarPage() {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <CalendarPageClient userEmail={session.user.email} />;
}
