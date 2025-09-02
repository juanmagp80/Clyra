import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import { BudgetsPageClient } from './BudgetsPageClient';

export default async function BudgetsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  return <BudgetsPageClient userEmail={session.user.email} />;
}
