import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import CalendarPageClient from './CalendarPageClient';

export default async function CalendarPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
        redirect('/login');
    }
    
    return <CalendarPageClient userEmail={user.email!} />;
}
