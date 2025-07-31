import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TimeTrackingClient from './TimeTrackingClient';

export default async function TimeTrackingPage() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <TimeTrackingClient userEmail={session.user.email} />;
}
