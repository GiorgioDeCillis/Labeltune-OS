-- Add unique constraint on user_course_progress for (user_id, course_id)
-- This is required for the upsert operation to work correctly

ALTER TABLE public.user_course_progress 
DROP CONSTRAINT IF EXISTS user_course_progress_user_course_unique;

ALTER TABLE public.user_course_progress 
ADD CONSTRAINT user_course_progress_user_course_unique UNIQUE (user_id, course_id);
