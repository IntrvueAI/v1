-- Add logic puzzles score columns to feedback table
ALTER TABLE public.feedback 
ADD COLUMN pattern_recognition_score integer,
ADD COLUMN logical_deduction_score integer,
ADD COLUMN mathematical_logic_score integer;

-- Add check constraints to ensure scores are within valid range (0-7 for logic puzzles)
ALTER TABLE public.feedback 
ADD CONSTRAINT check_pattern_recognition_score 
CHECK (pattern_recognition_score IS NULL OR (pattern_recognition_score >= 0 AND pattern_recognition_score <= 20));

ALTER TABLE public.feedback 
ADD CONSTRAINT check_logical_deduction_score 
CHECK (logical_deduction_score IS NULL OR (logical_deduction_score >= 0 AND logical_deduction_score <= 20));

ALTER TABLE public.feedback 
ADD CONSTRAINT check_mathematical_logic_score 
CHECK (mathematical_logic_score IS NULL OR (mathematical_logic_score >= 0 AND mathematical_logic_score <= 20));