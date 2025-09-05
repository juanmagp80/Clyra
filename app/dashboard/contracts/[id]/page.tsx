import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import ContractDetailClient from './ContractDetailClient';

interface ContractDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
    const resolvedParams = await params;
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <ContractDetailClient contractId={resolvedParams.id} userEmail={user.email || ''} />;
}
