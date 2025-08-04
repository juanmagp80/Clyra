import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🛡️ Middleware executing for:', request.nextUrl.pathname);
  
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    // Verificar si hay una sesión de usuario
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('👤 User in middleware:', user ? 'Authenticated' : 'Not authenticated');
    console.log('📍 Current path:', request.nextUrl.pathname);

    // Si el usuario no está autenticado y trata de acceder a rutas protegidas
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('🚫 Blocking access to dashboard - user not authenticated');
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Si el usuario está autenticado y trata de acceder a login/register
    if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
      console.log('🔄 Redirecting authenticated user to dashboard');
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    console.log('✅ Middleware allowing request to proceed');
    return supabaseResponse;
  } catch (error) {
    console.log('❌ Middleware error:', error);
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de request excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     * - archivos en la carpeta public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
