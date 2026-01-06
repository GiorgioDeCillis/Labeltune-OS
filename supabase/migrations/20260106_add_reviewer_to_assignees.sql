-- Add is_reviewer column to project_assignees table
-- This allows PM/Admin to designate specific annotators as reviewers for a project

ALTER TABLE project_assignees
ADD COLUMN IF NOT EXISTS is_reviewer BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN project_assignees.is_reviewer IS 'If true, this annotator can review other annotators tasks for this project';
