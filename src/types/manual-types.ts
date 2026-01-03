export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'reviewed';

export interface Task {
    id: string;
    created_at: string;
    project_id: string;
    assigned_to: string | null;
    status: TaskStatus;
    data: any; // JSONB content to label
    labels: any | null; // JSONB result
    projects?: {
        name: string;
        type: string;
    };
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    type: string;
    status: string;
    created_at: string;
}
