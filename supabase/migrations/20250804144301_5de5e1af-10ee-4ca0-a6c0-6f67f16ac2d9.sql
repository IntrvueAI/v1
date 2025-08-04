-- Fix database function security by adding immutable search_path
-- This prevents privilege escalation attacks through search_path manipulation

-- Update the existing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update the existing handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$;

-- Update the existing validate_feedback_scores function
CREATE OR REPLACE FUNCTION public.validate_feedback_scores()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Ensure scores is a valid JSON object
  IF NEW.scores IS NOT NULL AND NOT (NEW.scores ? 'dummy' OR jsonb_typeof(NEW.scores) = 'object') THEN
    RAISE EXCEPTION 'scores must be a valid JSON object';
  END IF;
  
  -- Validate score values are within reasonable range (0-20 to accommodate different systems)
  IF NEW.scores IS NOT NULL THEN
    DECLARE
      key TEXT;
      value INTEGER;
    BEGIN
      FOR key, value IN SELECT * FROM jsonb_each_text(NEW.scores)
      LOOP
        IF value::INTEGER < 0 OR value::INTEGER > 20 THEN
          RAISE EXCEPTION 'Score values must be between 0 and 20, got % for %', value, key;
        END IF;
      END LOOP;
    END;
  END IF;
  
  RETURN NEW;
END;
$function$;