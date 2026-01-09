
import { getUserDetails } from './actions';
import UserProfileClient from './UserProfileClient';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userDetails = await getUserDetails(id);

        return (
            <UserProfileClient
                initialData={userDetails}
                userId={id}
            />
        );
    } catch (error: any) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    <h2 className="text-xl font-bold">Error loading user profile</h2>
                    <p className="text-sm">{error.message || 'User not found or unauthorized'}</p>
                </div>
            </div>
        );
    }
}
