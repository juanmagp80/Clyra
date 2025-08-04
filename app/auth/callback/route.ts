import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')

    // ✅ Manejar errores del callback
    if (error) {
        console.error('Auth callback error:', error, errorDescription)

        if (error === 'access_denied' && errorDescription?.includes('expired')) {
            // Redirigir al login con mensaje de error
            return NextResponse.redirect(
                new URL('/login?error=link_expired', request.url)
            )
        }

        return NextResponse.redirect(
            new URL('/login?error=auth_error', request.url)
        )
    }

    if (code) {
        const supabase = await createServerSupabaseClient();

        try {
            // ✅ Intercambiar código por sesión
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) {
                console.error('Error exchanging code:', exchangeError)
                return NextResponse.redirect(
                    new URL('/login?error=session_error', request.url)
                )
            }

            // ✅ Obtener usuario para crear empresa si es necesario
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                return NextResponse.redirect(
                    new URL('/login?error=user_error', request.url)
                )
            }

            // ✅ Crear empresa si no existe
            if (user.user_metadata) {
                const { data: existingCompany } = await supabase
                    .from('companies')
                    .select('id')
                    .eq('user_id', user.id)
                    .single()

                if (!existingCompany) {
                    const { error: companyError } = await supabase
                        .from('companies')
                        .insert({
                            user_id: user.id,
                            name: user.user_metadata.company_name || 'Mi Empresa',
                            email: user.user_metadata.company_email || user.email,
                            phone: user.user_metadata.company_phone || '',
                            website: user.user_metadata.company_website || '',
                            address: user.user_metadata.company_address || ''
                        })

                    if (companyError) {
                        console.error('Error creating company:', companyError)
                        // No fallar por esto, continuar al dashboard
                    }
                }
            }

            // ✅ Redirigir al dashboard con éxito
            return NextResponse.redirect(
                new URL('/dashboard?welcome=true', request.url)
            )

        } catch (error) {
            console.error('Callback processing error:', error)
            return NextResponse.redirect(
                new URL('/login?error=processing_error', request.url)
            )
        }
    }


    return NextResponse.redirect(new URL('/login', request.url))
}