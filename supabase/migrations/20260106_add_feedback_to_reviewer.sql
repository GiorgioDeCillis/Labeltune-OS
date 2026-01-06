-- Migration to add feedback to reviewer
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS reviewer_feedback TEXT;
