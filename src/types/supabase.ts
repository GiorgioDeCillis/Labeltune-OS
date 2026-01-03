export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            projects: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    description: string | null
                    type: string
                    status: string
                    organization_id: string
                    guidelines: string | null
                    template_schema: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    description?: string | null
                    type: string
                    status?: string
                    organization_id: string
                    guidelines?: string | null
                    template_schema?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    description?: string | null
                    type?: string
                    status?: string
                    organization_id?: string
                    guidelines?: string | null
                    template_schema?: Json | null
                }
            }
            tasks: {
                Row: {
                    id: string
                    created_at: string
                    project_id: string
                    assigned_to: string | null
                    status: string
                    data: Json
                    labels: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    project_id: string
                    assigned_to?: string | null
                    status?: string
                    data: Json
                    labels?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    project_id?: string
                    assigned_to?: string | null
                    status?: string
                    data?: Json
                    labels?: Json | null
                }
            }
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    role: string
                    organization_id: string | null
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    organization_id?: string | null
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string
                    organization_id?: string | null
                }
            }
            organizations: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                }
            }
            courses: {
                Row: {
                    id: string
                    project_id: string
                    title: string
                    description: string | null
                    duration: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    title: string
                    description?: string | null
                    duration?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    title?: string
                    description?: string | null
                    duration?: string | null
                    created_at?: string
                }
            }
            lessons: {
                Row: {
                    id: string
                    course_id: string
                    title: string
                    content: string | null;
                    order: number;
                    video_url: string | null;
                }
                Insert: {
                    id?: string
                    course_id: string
                    title: string
                    content?: string | null;
                    order?: number;
                    video_url?: string | null;
                }
                Update: {
                    id?: string
                    course_id?: string
                    title?: string
                    content?: string | null;
                    order?: number;
                    video_url?: string | null;
                }
            }
            user_course_progress: {
                Row: {
                    id: string
                    user_id: string
                    course_id: string
                    status: string
                    completed_lessons: string[]
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    course_id: string
                    status?: string
                    completed_lessons?: string[]
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    course_id?: string
                    status?: string
                    completed_lessons?: string[]
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
