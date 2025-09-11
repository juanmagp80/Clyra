import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import { BudgetsPageClient } from './BudgetsPageClient';

export default async function BudgetsPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log('No session found');
    redirect('/login');
  }

  if (!session.user) {
    console.log('No user found in session');
    redirect('/login');
  }

  const userEmail = session.user.email;
  console.log('User email type:', typeof userEmail);
  console.log('User email value:', userEmail);

  if (typeof userEmail !== 'string') {
    console.error('Invalid email format:', userEmail);
    redirect('/login');
  }

  return <BudgetsPageClient userEmail={userEmail} />;
}
