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
        pay_rate?: string;
        template_schema?: any;
    };
    reviewed_by?: string | null;
    review_rating?: number | null;
    is_archived: boolean;
    annotator_time_spent?: number;
    reviewer_time_spent?: number;
    annotator_earnings?: number;
    reviewer_earnings?: number;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    type: string;
    status: string;
    created_at: string;
    template_schema?: any; // JSON
    pay_rate?: string;
    max_task_time?: number;
    total_tasks?: number;
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
    content: string; // Markdown or Quiz Description
    video_url?: string;
    order: number;
    type: 'text' | 'video' | 'quiz';
    quiz_data?: {
        questions: QuizQuestion[];
        passing_score: number; // Percentage, e.g. 80
    };
    created_at?: string;
}

export interface QuizQuestion {
    id: string;
    text: string;
    type: 'multiple_choice' | 'open_text';
    options?: string[]; // For multiple_choice
    correct_answer?: string | string[]; // Index or value
    grading_criteria?: string; // For open_text AI grading
}

export interface UserCourseProgress {
    id: string;
    user_id: string;
    course_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completed_lessons: string[];
    updated_at: string;
}
