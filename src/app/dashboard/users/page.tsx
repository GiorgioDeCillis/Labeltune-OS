import { getUsers } from './actions';
import UsersClient from '@/components/dashboard/UsersClient';

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-8">
            <UsersClient initialUsers={users} />
        </div>
    );
}
