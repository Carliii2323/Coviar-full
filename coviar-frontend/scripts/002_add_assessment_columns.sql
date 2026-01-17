-- Add missing columns to assessments table
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS total_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sustainability_level TEXT;
