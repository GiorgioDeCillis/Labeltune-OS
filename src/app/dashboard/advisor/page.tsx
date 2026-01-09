import { createClient } from '@/utils/supabase/server';
import AdvisorClient from './AdvisorClient';
import { getUnifiedInstructions } from '../knowledge/actions';

export const metadata = {
    title: 'AI Advisor | Labeltune',
    description: 'Chat with your labeling instructions and knowledge base using AI.',
};

export default async function AdvisorPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return <div className="p-8 text-center text-red-400">Please log in to access the Advisor.</div>;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, role')
        .eq('id', user.id)
        .single();

    let instructions = (await getUnifiedInstructions()).filter(i => i.type !== 'course');

    // If annotator, only show instructions for assigned projects or uploaded by themselves
    if (profile?.role === 'annotator') {
        const { data: assignments } = await supabase
            .from('project_assignees')
            .select('project_id')
            .eq('user_id', user.id);

        const assignedProjectIds = (assignments || []).map(a => a.project_id);
        instructions = instructions.filter(i =>
            (i.project_id && assignedProjectIds.includes(i.project_id)) ||
            (i.user_id === user.id)
        );
    }

    return (
        <div className="max-w-7xl mx-auto h-full pb-8">
            <AdvisorClient
                instructions={instructions}
                user={user}
                userProfile={profile}
            />
        </div>
    );
}
