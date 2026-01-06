import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HistoryClient from '@/components/dashboard/HistoryClient';

export default async function HistoryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <div className="space-y-8">
            <HistoryClient user={user} profile={profile} />
        </div>
    );
}
