'use client';

import { createSupabaseClient } from '@/src/lib/supabase-client';
import { useTrialStatus } from '@/src/lib/useTrialStatus';
import { useEffect, useState } from 'react';

interface DebugTrialProps {
    userEmail: string;
}

export default function DebugTrial({ userEmail }: DebugTrialProps) {
    const { trialInfo, loading, error } = useTrialStatus(userEmail);
    const [rawData, setRawData] = useState<any>(null);
    const supabase = createSupabaseClient();

    useEffect(() => {
        const fetchRawData = async () => {
            if (!supabase) return;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Obtener datos raw del perfil
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Obtener datos raw del uso
                const { data: usage, error: usageError } = await supabase
                    .from('user_usage')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                setRawData({
                    user,
                    profile,
                    profileError,
                    usage,
                    usageError
                });
            } catch (err) {
                console.error('Error fetching raw data:', err);
            }
        };

        fetchRawData();
    }, [supabase]);

    return (
        <div className="fixed top-4 right-4 w-96 max-h-96 overflow-y-auto bg-black/90 text-white p-4 rounded-lg text-xs z-50">
            <h3 className="font-bold text-yellow-400 mb-2">🐛 Debug Trial Info</h3>

            <div className="space-y-2">
                <div>
                    <strong className="text-green-400">Loading:</strong> {loading ? 'true' : 'false'}
                </div>

                {error && (
                    <div>
                        <strong className="text-red-400">Error:</strong> {error}
                    </div>
                )}

                <div>
                    <strong className="text-blue-400">Trial Info:</strong>
                    <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(trialInfo, null, 2)}
                    </pre>
                </div>

                {rawData && (
                    <div>
                        <strong className="text-purple-400">Raw Data:</strong>
                        <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify({
                                userId: rawData.user?.id,
                                userEmail: rawData.user?.email,
                                profile: rawData.profile,
                                profileError: rawData.profileError?.message,
                                usage: rawData.usage,
                                usageError: rawData.usageError?.message,
                                subscription: rawData.subscription,
                                subError: rawData.subError?.message
                            }, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
