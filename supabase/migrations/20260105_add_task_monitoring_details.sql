-- Migration to add detailed task monitoring fields
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS annotator_labels JSONB,
ADD COLUMN IF NOT EXISTS reviewer_rating FLOAT,
ADD COLUMN IF NOT EXISTS review_feedback TEXT;

-- Update existing records: if annotator_labels is null and task is completed/approved, 
-- we can't recover the original work easily, but let's initialize it with current labels if they exist.
UPDATE public.tasks 
SET annotator_labels = labels 
WHERE annotator_labels IS NULL AND status IN ('completed', 'approved');
