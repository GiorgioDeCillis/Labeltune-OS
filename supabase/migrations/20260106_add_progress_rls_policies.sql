-- Add RLS policies for user_course_progress table
-- This enables users to read and write their own progress records

-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_course_progress;
CREATE POLICY "Users can view their own progress"
ON public.user_course_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_course_progress;
CREATE POLICY "Users can insert their own progress"
ON public.user_course_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_course_progress;
CREATE POLICY "Users can update their own progress"
ON public.user_course_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins and PMs can view all progress (for monitoring)
DROP POLICY IF EXISTS "Admins can view all progress" ON public.user_course_progress;
CREATE POLICY "Admins can view all progress"
ON public.user_course_progress
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'pm')
  )
);
