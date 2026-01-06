-- Add completed_lessons column to user_course_progress table
-- This column stores an array of completed lesson IDs

ALTER TABLE public.user_course_progress 
ADD COLUMN IF NOT EXISTS completed_lessons TEXT[] DEFAULT '{}';

-- Also add updated_at column if it doesn't exist
ALTER TABLE public.user_course_progress 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add status column if it doesn't exist
ALTER TABLE public.user_course_progress 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started';
