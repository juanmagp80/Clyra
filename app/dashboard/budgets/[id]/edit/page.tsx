import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import { EditBudgetClient } from './EditBudgetClient';

interface EditBudgetPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
    const resolvedParams = await params;
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <EditBudgetClient budgetId={resolvedParams.id} userEmail={session.user.email} />;
}
