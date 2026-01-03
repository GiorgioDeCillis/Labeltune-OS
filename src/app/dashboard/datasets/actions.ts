'use server';

import { createClient } from '@/utils/supabase/server';

export async function searchTasks(query: string, projectId?: string) {
    const supabase = await createClient();

    let dbQuery = supabase
        .from('tasks')
        .select(`
            *,
            projects (
                name,
                type
            )
        `)
        .order('created_at', { ascending: false });

    if (projectId) {
        dbQuery = dbQuery.eq('project_id', projectId);
    }

    // Basic support for searching by status if the query matches a status
    if (query && ['pending', 'in_progress', 'completed', 'reviewed'].includes(query.toLowerCase())) {
        dbQuery = dbQuery.eq('status', query.toLowerCase());
    }

    // Note: Full text search on JSONB 'data' column would require a postgres function or specific index
    // For now, we return the results and can filter more on client or implement a simple metadata match if needed.

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Error searching tasks:', error);
        return [];
    }

    // Client-side like fuzzy filtering on the returned data for the query string if provided
    // This is not efficient for huge datasets but works for this prototype.
    if (query) {
        const lowerQuery = query.toLowerCase();
        return data.filter((task: any) => {
            const dataString = JSON.stringify(task.data).toLowerCase();
            const labelsString = JSON.stringify(task.labels).toLowerCase();
            return dataString.includes(lowerQuery) || labelsString.includes(lowerQuery);
        });
    }

    return data;
}
