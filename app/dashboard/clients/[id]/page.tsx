import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientDetails from './ClientDetails';

type Props = {
    params: {
        id: string;
    };
};

export default async function ClientPage({ params }: Props) {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session || !session.user?.email) redirect('/login');

    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !client) redirect('/dashboard/clients');

    return <ClientDetails client={client} userEmail={session.user.email} />;
}
