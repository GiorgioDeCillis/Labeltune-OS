import { getUsers } from './actions';
import UsersClient from '@/components/dashboard/UsersClient';

export default async function UsersPage() {
    try {
        const users = await getUsers();

        return (
            <div className="space-y-8">
                <UsersClient initialUsers={users} />
            </div>
        );
    } catch (error: any) {
        console.error('Error in UsersPage:', error);
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    <h2 className="text-xl font-bold">Error loading users</h2>
                    <p className="text-sm">{error.message || 'An unexpected error occurred'}</p>
                </div>
                <p className="text-white/60 text-sm italic">
                    Note: This page requires the SUPABASE_SERVICE_ROLE_KEY environment variable to be correctly configured.
                </p>
            </div>
        );
    }
}
