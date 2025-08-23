import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import TemplatesPageBonsai from './TemplatesPageBonsai';

export default async function TemplatesPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }

    return <TemplatesPageBonsai userEmail={user.email || ''} />;
}
