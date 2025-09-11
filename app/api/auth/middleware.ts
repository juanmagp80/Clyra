import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function authMiddleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });

    // Refresh session if needed
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.expires_at) {
      const timeNow = Math.floor(Date.now() / 1000);
      if (session.expires_at <= timeNow) {
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();

        if (refreshError || !refreshedSession) {
          return new NextResponse('Unauthorized', { status: 401 });
        }
      }
    }

    return res;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
