-- Add overall improvement feedback column to feedback table
ALTER TABLE public.feedback 
ADD COLUMN overall_improvement_feedback TEXT;