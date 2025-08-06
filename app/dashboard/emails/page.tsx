import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import EmailsPageClient from './EmailsPageClient';

export const metadata: Metadata = {
    title: 'Emails | Taskelia CRM',
    description: 'Centro de comunicaciones y email marketing',
};

export default async function EmailsPage() {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <EmailsPageClient userEmail={user.email!} />;
}
