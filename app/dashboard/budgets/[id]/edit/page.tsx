import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import { EditBudgetClient } from './EditBudgetClient';

interface EditBudgetPageProps {
    params: {
        id: string;
    };
}

export default async function EditBudgetPage({ params }: EditBudgetPageProps) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) {
        redirect('/login');
    }

    return <EditBudgetClient budgetId={params.id} userEmail={session.user.email} />;
}
