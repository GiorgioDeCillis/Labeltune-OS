-- Add privacy_consent column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN DEFAULT FALSE;
