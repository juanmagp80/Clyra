import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import { CreateBudgetClient } from './CreateBudgetClient';

export default async function CreateBudgetPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  return <CreateBudgetClient userEmail={session.user.email} />;
}
