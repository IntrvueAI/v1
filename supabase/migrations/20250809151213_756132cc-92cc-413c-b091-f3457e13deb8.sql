-- Update delete_user to also remove user feedback
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete dependent data first
  DELETE FROM public.feedback WHERE user_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
  
  -- Finally delete the user from auth
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;