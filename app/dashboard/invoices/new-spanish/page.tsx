import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CreateSpanishInvoice from './CreateSpanishInvoice-SIMPLE';

export default async function CreateSpanishInvoicePage() {
    console.log('🏗️ CreateSpanishInvoicePage loading...');

    const supabase = createServerComponentClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();

    console.log('👤 Session in page:', session?.user?.email || 'No session');

    if (!session?.user?.email) {
        console.log('❌ No session, redirecting to login');
        redirect('/login');
    }

    console.log('✅ Session found, rendering component');
    return <CreateSpanishInvoice userEmail={session.user.email} />;
}
