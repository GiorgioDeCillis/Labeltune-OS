-- Add new fields for task timing and payment configuration
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS extra_time_after_max INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_task_time INTEGER DEFAULT 30, -- Default 30 min?
ADD COLUMN IF NOT EXISTS review_extra_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS absolute_expiration_duration INTEGER, -- Null means no absolute expiration
ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'hourly' CHECK (payment_mode IN ('hourly', 'task')),
ADD COLUMN IF NOT EXISTS pay_per_task TEXT; -- Keeping as text to match pay_rate style (e.g. '$0.05') or numeric? 
-- The current pay_rate is text e.g. '$15.00 / hr'. Let's keep pay_per_task flexible or numeric. 
-- Given the other is text, let's keep it text for consistency in UI handling, strictly speaking it should probably be numeric but let's stick to the pattern.
-- Actually, let's make it text to store formatted currency if needed, matching current design.

COMMENT ON COLUMN projects.extra_time_after_max IS 'Extra time allowed after max_task_time expires (minutes)';
COMMENT ON COLUMN projects.absolute_expiration_duration IS 'Task expires after this duration from start, regardless of activity (minutes)';
