import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANTE: Refresh session antes de verificar
  const { data: { session }, error } = await supabase.auth.getSession();

  console.log('🔄 Middleware - Session check:', {
    path: req.nextUrl.pathname,
    hasSession: !!session,
    sessionExpiry: session?.expires_at,
    currentTime: Math.floor(Date.now() / 1000),
    error: error?.message
  });

  // Refresh session if expired
  if (session?.expires_at) {
    const timeNow = Math.floor(Date.now() / 1000);
    if (session.expires_at <= timeNow) {
      console.log('🔄 Refreshing expired session...');
      await supabase.auth.refreshSession();
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
