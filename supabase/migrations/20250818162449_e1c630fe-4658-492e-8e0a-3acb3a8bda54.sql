-- Add clarity_of_thought_score column to feedback table for logic puzzles
ALTER TABLE public.feedback 
ADD COLUMN clarity_of_thought_score INTEGER;

-- Add check constraint for the new score field (0-5 range)
ALTER TABLE public.feedback 
ADD CONSTRAINT check_clarity_of_thought_score_range 
CHECK (clarity_of_thought_score IS NULL OR (clarity_of_thought_score >= 0 AND clarity_of_thought_score <= 5));

-- Update existing logic puzzles score constraints to be 0-5 instead of 0-7
ALTER TABLE public.feedback 
DROP CONSTRAINT IF EXISTS check_pattern_recognition_score_range;

ALTER TABLE public.feedback 
DROP CONSTRAINT IF EXISTS check_logical_deduction_score_range;

ALTER TABLE public.feedback 
DROP CONSTRAINT IF EXISTS check_mathematical_logic_score_range;

-- Add updated constraints for 0-5 range
ALTER TABLE public.feedback 
ADD CONSTRAINT check_pattern_recognition_score_range 
CHECK (pattern_recognition_score IS NULL OR (pattern_recognition_score >= 0 AND pattern_recognition_score <= 5));

ALTER TABLE public.feedback 
ADD CONSTRAINT check_logical_deduction_score_range 
CHECK (logical_deduction_score IS NULL OR (logical_deduction_score >= 0 AND logical_deduction_score <= 5));

ALTER TABLE public.feedback 
ADD CONSTRAINT check_mathematical_logic_score_range 
CHECK (mathematical_logic_score IS NULL OR (mathematical_logic_score >= 0 AND mathematical_logic_score <= 5));