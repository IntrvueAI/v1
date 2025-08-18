-- Fix database functions missing search_path configuration for security

-- Update send_custom_auth_email function to include search_path
CREATE OR REPLACE FUNCTION public.send_custom_auth_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- This trigger will be used when we set up auth email webhooks
  -- For now, we'll rely on Supabase's built-in email system
  -- but we're preparing the structure for custom emails
  RETURN NEW;
END;
$function$;

-- Update update_orders_updated_at function to include search_path
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;