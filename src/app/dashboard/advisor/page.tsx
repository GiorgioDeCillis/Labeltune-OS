import { createClient } from '@/utils/supabase/server';
import AdvisorClient from './AdvisorClient';

export const metadata = {
    title: 'AI Advisor | Labeltune',
    description: 'Chat with your labeling instructions using AI.',
};

export default async function AdvisorPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return <div className="p-8 text-center text-red-400">Please log in to access the Advisor.</div>;
    }

    const { data: instructions } = await supabase
        .from('instructions')
        .select('id, name, content, is_uploaded, description')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-7xl mx-auto h-full pb-8">
            <AdvisorClient instructions={instructions || []} />
        </div>
    );
}
