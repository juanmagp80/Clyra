import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ContractDetailClient from './ContractDetailClient';

interface ContractDetailPageProps {
    params: {
        id: string;
    };
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <ContractDetailClient contractId={params.id} />;
}
