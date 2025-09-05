import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AITestPage from './AITestPage';

export default async function AITestPageRoute() {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AITestPage userEmail={session.user.email!} />
        </div>
    );
}
