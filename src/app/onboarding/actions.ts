'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitOnboarding(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const birthDate = formData.get('birthDate') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const nationality = formData.get('nationality') as string // Expected 2-letter code, e.g., 'IT'
    const primaryLanguage = formData.get('primaryLanguage') as string // Expected 2-letter code, e.g., 'it'
    const address = formData.get('address') as string
    const paypalEmail = formData.get('paypalEmail') as string
    const linkedinUrl = formData.get('linkedinUrl') as string || null
    const githubUrl = formData.get('githubUrl') as string || null
    const websiteUrl = formData.get('websiteUrl') as string || null
    const jobOffersConsent = formData.get('jobOffersConsent') === 'on'
    const cvFile = formData.get('cv') as File

    let cvUrl = null

    // 1. Handle CV Upload
    if (cvFile && cvFile.size > 0) {
        const fileExt = cvFile.name.split('.').pop()
        const fileName = `${user.id}/cv-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('cvs')
            .upload(fileName, cvFile)

        if (uploadError) {
            console.error('Error uploading CV:', uploadError)
            throw new Error('Failed to upload CV')
        }

        const { data: { publicUrl } } = supabase.storage
            .from('cvs')
            .getPublicUrl(fileName)

        cvUrl = publicUrl
    } else {
        throw new Error('CV is required')
    }

    // 2. Generate Locale Tag (e.g., it_IT, us_US)
    const localeTag = `${primaryLanguage.toLowerCase()}_${nationality.toUpperCase()}`

    // 3. Update Profile (using upsert to handle cases where trigger might have failed)
    const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email,
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
            phone_number: phoneNumber,
            nationality: nationality,
            address: address,
            cv_url: cvUrl,
            linkedin_url: linkedinUrl,
            github_url: githubUrl,
            website_url: websiteUrl,
            paypal_email: paypalEmail,
            job_offers_consent: jobOffersConsent,
            primary_language: primaryLanguage,
            locale_tag: localeTag,
            is_onboarded: true,
            role: 'Annotator'
        })

    if (updateError) {
        console.error('Error updating profile:', updateError)
        throw new Error('Failed to update profile')
    }

    // 4. Update Auth Metadata for middleware optimization
    await supabase.auth.updateUser({
        data: {
            is_onboarded: true,
            role: 'Annotator'
        }
    })

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
