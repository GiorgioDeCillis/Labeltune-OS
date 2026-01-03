'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type-casting here for convenience
    // In production consider Zod or similar library for validation
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=Invalid login credentials')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: formData.get('role') as string,
        name: formData.get('name') as string,
    }

    const { error, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                role: data.role,
                full_name: data.name,
            }
        }
    })

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    if (authData.user) {
        // Create a profile record manually if trigger fails or isn't set up
        // But ideally we rely on Supabase triggers. 
        // For now, let's insert into profiles table directly to be safe
        const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            role: data.role,
            full_name: data.name,
        })

        if (profileError) {
            console.error('Error creating profile:', profileError);
        }
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}
