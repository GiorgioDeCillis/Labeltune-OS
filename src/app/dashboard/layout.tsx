import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ClientProviders } from '@/components/ClientProviders';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch detailed profile to get role if not in metadata
    // Ideally, we sync this to metadata on login, but let's be safe
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, avatar_url, full_name')
        .eq('id', user.id)
        .single();

    const userRole = profile?.role || user.user_metadata?.role || 'annotator';
    const avatarUrl = profile?.avatar_url || null;

    return (
        <ClientProviders>
            <div className="flex h-screen overflow-hidden relative">
                {/* Sidebar handles its own visibility on mobile */}
                <Sidebar userRole={userRole} />

                <div className="flex-1 md:ml-64 flex flex-col h-screen transition-all duration-300 w-full overflow-hidden">
                    <Navbar user={user} userRole={userRole} initialAvatar={avatarUrl} fullName={profile?.full_name} />
                    <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[100vw] overflow-x-hidden relative">
                        {children}
                    </main>
                </div>
            </div>
        </ClientProviders>
    );
}
