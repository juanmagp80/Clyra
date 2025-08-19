import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import TemplatesPageClient from './TemplatesPageClient';

export default async function TemplatesPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }

    return <TemplatesPageClient userEmail={user.email || ''} />;
}
