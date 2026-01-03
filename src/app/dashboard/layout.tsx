import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

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
        .select('role')
        .eq('id', user.id)
        .single();

    const userRole = user.user_metadata?.role || profile?.role || 'annotator';

    return (
        <div className="flex min-h-screen">
            <Sidebar userRole={userRole} />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <Navbar user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
