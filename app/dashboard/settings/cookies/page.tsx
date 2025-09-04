import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import CookiePreferencesClient from './CookiePreferencesClient';

export const metadata: Metadata = {
  title: 'Preferencias de Cookies | Taskelio',
  description: 'Gestiona tus preferencias de cookies y privacidad',
};

export default async function CookiePreferencesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <CookiePreferencesClient userEmail={user.email || ''} />;
}
