'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Non autenticato')
    }

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const birthDate = formData.get('birthDate') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const address = formData.get('address') as string
    const paypalEmail = formData.get('paypalEmail') as string
    const linkedinUrl = formData.get('linkedinUrl') as string || null
    const githubUrl = formData.get('githubUrl') as string || null
    const websiteUrl = formData.get('websiteUrl') as string || null
    const jobOffersConsent = formData.get('jobOffersConsent') === 'on'

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            phone_number: phoneNumber,
            address: address,
            linkedin_url: linkedinUrl,
            github_url: githubUrl,
            website_url: websiteUrl,
            paypal_email: paypalEmail,
            job_offers_consent: jobOffersConsent,
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error updating profile:', updateError)
        throw new Error('Errore durante l\'aggiornamento del profilo')
    }

    // Update Auth Metadata for consistency
    await supabase.auth.updateUser({
        data: {
            full_name: `${firstName} ${lastName}`
        }
    })

    revalidatePath('/dashboard/profile')
    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Non autenticato')
    }

    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
        throw new Error('Le password non coincidono')
    }

    if (newPassword.length < 6) {
        throw new Error('La password deve essere di almeno 6 caratteri')
    }

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (error) {
        console.error('Error updating password:', error)
        throw new Error('Errore durante l\'aggiornamento della password')
    }

    return { success: true }
}
