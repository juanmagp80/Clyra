"use client";

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import dinámico del componente para evitar problemas de SSR
const TimeTrackingPageBonsai = dynamic(() => import('./TimeTrackingPageBonsai'), {
    loading: () => <div>Cargando...</div>
});

export default function TiempoPage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createSupabaseClient();
            if (!supabase) {
                redirect('/login');
                return;
            }
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                redirect('/login');
                return;
            }
            setUser(data.user);
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando usuario...</p>
                </div>
            </div>
        );
    }

    return <TimeTrackingPageBonsai userEmail={user?.email} />;
}
