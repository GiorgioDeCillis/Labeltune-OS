-- Migration to add task monitoring and performance fields
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS review_rating FLOAT,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS annotator_time_spent BIGINT DEFAULT 0, -- in seconds
ADD COLUMN IF NOT EXISTS reviewer_time_spent BIGINT DEFAULT 0, -- in seconds
ADD COLUMN IF NOT EXISTS annotator_earnings NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviewer_earnings NUMERIC(10, 2) DEFAULT 0;

-- Optional: Add index for faster monitoring lookups
CREATE INDEX IF NOT EXISTS idx_tasks_project_id_archived ON public.tasks(project_id, is_archived);
