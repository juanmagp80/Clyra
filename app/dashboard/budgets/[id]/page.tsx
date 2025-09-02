import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import { BudgetDetailClient } from './BudgetDetailClient';

interface BudgetDetailPageProps {
    params: {
        id: string;
    };
}

export default async function BudgetDetailPage({ params }: BudgetDetailPageProps) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <BudgetDetailClient budgetId={params.id} userEmail={session.user.email} />;
}
