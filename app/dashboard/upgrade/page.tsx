import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import UpgradePageClient from './UpgradePageClient';

export const metadata: Metadata = {
    title: 'Actualizar Plan | Taskelio CRM',
    description: 'Elige el plan perfecto para tu negocio',
};

export default async function UpgradePage() {
    const supabase = await createServerSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return <UpgradePageClient userEmail={user.email!} />;
}
