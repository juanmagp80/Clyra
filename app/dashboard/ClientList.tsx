'use client';
import { createSupabaseClient } from '@/src/lib/supabase-client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Client = {
    id: string;
    name: string;
    email: string;
    tag: string;
    phone?: string;
    company?: string;
    address?: string;
};

export default function ClientsList() {
    const [clients, setClients] = useState<Client[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tag, setTag] = useState('');
    const supabase = createSupabaseClient();

    const fetchClients = async () => {
        if (!supabase) return;
        
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setClients(data as Client[]);
    };

    const addClient = async () => {
        if (!name || !supabase) return;

        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { error } = await supabase.from('clients').insert([
            {
                name,
                email,
                tag,
                user_id: user.id,
            },
        ]);

        if (error) console.error(error);
        else {
            setName('');
            setEmail('');
            setTag('');
            fetchClients();
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div className="bg-white p-6 rounded shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Tus clientes</h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <input className="border p-2 rounded" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="border p-2 rounded" placeholder="Etiqueta" value={tag} onChange={e => setTag(e.target.value)} />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={addClient}>
                    Añadir
                </button>
            </div>

            <ul className="divide-y divide-gray-200">
                {clients.map(client => (
                    <Link href={`/dashboard/clients/${client.id}`} key={client.id}>
                        <li className="py-3 hover:bg-gray-100 px-3 rounded cursor-pointer">
                            <div className="font-medium text-lg">{client.name}</div>
                            <div className="text-sm text-gray-500">{client.email || 'Sin email'} — {client.tag || 'Sin etiqueta'}</div>
                        </li>
                    </Link>
                ))}
            </ul>
        </div>
    );
}

