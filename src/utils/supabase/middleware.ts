import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthPath = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname === '/'

    const isOnboardingPath = request.nextUrl.pathname.startsWith('/onboarding')

    if (!user && !isAuthPath) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && !isOnboardingPath && !isAuthPath) {
        // Check onboarding status
        const isOnboarded = user.app_metadata?.is_onboarded || user.user_metadata?.is_onboarded

        if (!isOnboarded) {
            // Check profiles table as a fallback or if metadata is not synced yet
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_onboarded, role')
                .eq('id', user.id)
                .single()

            if (profile && !profile.is_onboarded && profile.role !== 'admin' && profile.role !== 'PM') {
                const url = request.nextUrl.clone()
                url.pathname = '/onboarding'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
