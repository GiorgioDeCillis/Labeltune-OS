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
    template_schema?: any; // JSON
}

export interface Course {
    id: string;
    project_id: string;
    title: string;
    description: string | null;
    duration: string | null;
    created_at: string;
}

export interface Lesson {
    id: string;
    course_id: string;
    title: string;
    content: string | null;
    order: number;
}

export interface UserCourseProgress {
    id: string;
    user_id: string;
    course_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completed_lessons: string[];
    updated_at: string;
}
