-- Phase 1: Database Foundation - Add fields to support multiple interview types

-- Add fields to feedback table
ALTER TABLE public.feedback 
ADD COLUMN interview_type TEXT DEFAULT '11-plus',
ADD COLUMN interview_category TEXT DEFAULT 'academic',
ADD COLUMN scoring_system TEXT DEFAULT '0-5';

-- Add fields to profiles table  
ALTER TABLE public.profiles
ADD COLUMN preferred_interview_type TEXT DEFAULT '11-plus';

-- Add comments for documentation
COMMENT ON COLUMN public.feedback.interview_type IS 'Type of interview conducted (e.g., 11-plus, ielts)';
COMMENT ON COLUMN public.feedback.interview_category IS 'Category of interview (academic, language, professional)';
COMMENT ON COLUMN public.feedback.scoring_system IS 'Scoring range used (e.g., 0-5, 0-9)';
COMMENT ON COLUMN public.profiles.preferred_interview_type IS 'User preferred interview type for quick access';