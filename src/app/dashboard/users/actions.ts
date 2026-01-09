'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getUsers() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is admin or pm
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!currentUserProfile || !['admin', 'pm'].includes(currentUserProfile.role)) {
        throw new Error('Unauthorized');
    }

    const adminSupabase = await createAdminClient();

    // Fetch all auth users
    const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers();

    if (usersError) {
        throw usersError;
    }

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await adminSupabase
        .from('profiles')
        .select('*');

    if (profilesError) {
        throw profilesError;
    }

    // Merge data
    const combinedUsers = users.map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id);

        let status = 'Active';
        if (!profile) {
            status = 'Incomplete Registration';
        } else if (!profile.full_name && !profile.first_name) {
            status = 'Pending';
        }

        return {
            id: authUser.id,
            email: authUser.email,
            full_name: profile?.full_name || profile?.first_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'N/A',
            avatar_url: profile?.avatar_url,
            role: profile?.role || 'user',
            status,
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at,
            app_metadata: authUser.app_metadata,
            user_metadata: authUser.user_metadata
        };
    });

    // Sort by created_at desc
    return combinedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
