-- Add school and interview date fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN schools TEXT[], 
ADD COLUMN interview_date DATE;