import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import NotificationsPageClient from './NotificationsPageClient';

export default async function NotificationsPage() {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user?.email) {
            redirect('/login');
        }

        return <NotificationsPageClient userEmail={session.user.email} />;
    } catch (error) {
        console.error('Error in notifications page:', error);
        redirect('/login');
    }
}
