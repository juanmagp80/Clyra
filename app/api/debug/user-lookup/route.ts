import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/src/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userEmail } = body;

        console.log('🔍 DEBUG ENDPOINT - Testing user lookup for:', userEmail);

        const supabase = createSupabaseAdmin();
        
        // 1. Probar función SQL
        console.log('1️⃣ Testing SQL function...');
        const { data: sqlResult, error: sqlError } = await supabase
            .rpc('get_user_id_by_email', { user_email: userEmail });

        console.log('SQL Function result:', { sqlResult, sqlError });

        // 2. Probar búsqueda directa en profiles
        console.log('2️⃣ Testing direct profiles lookup...');
        const { data: profileResult, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('email', userEmail)
            .limit(1);

        console.log('Profiles result:', { profileResult, profileError });

        // 3. Listar todos los usuarios para debug
        console.log('3️⃣ Listing all users...');
        const { data: allProfiles, error: allError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .limit(10);

        console.log('All profiles:', { allProfiles, allError });

        return NextResponse.json({
            success: true,
            requestedEmail: userEmail,
            sqlFunction: {
                result: sqlResult,
                error: sqlError?.message
            },
            directLookup: {
                result: profileResult,
                error: profileError?.message
            },
            allUsers: allProfiles?.map(p => ({ email: p.email, id: p.id.substring(0, 8) + '...' }))
        });

    } catch (error) {
        console.error('❌ Debug endpoint error:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}
