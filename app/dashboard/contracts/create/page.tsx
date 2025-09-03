import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import CreateContractClient from './CreateContractClient';

export default async function CreateContractPage() {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <CreateContractClient />;
}
