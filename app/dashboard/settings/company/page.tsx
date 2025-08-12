import CompanyConfig from '@/components/CompanyConfig';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Configuración Fiscal | Taskelio CRM',
    description: 'Configurar datos fiscales y empresariales para facturación española',
};

export default async function CompanySettingsPage() {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <CompanyConfig />
            </div>
        </div>
    );
}
