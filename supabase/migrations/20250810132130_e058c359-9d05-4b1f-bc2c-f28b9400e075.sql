-- Create admin users table to store admin email addresses
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create audit log table for admin actions
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  target_user_email TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users au
    JOIN auth.users u ON u.email = au.email
    WHERE u.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to get admin email for current user
CREATE OR REPLACE FUNCTION public.get_current_admin_email()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT u.email
    FROM auth.users u
    JOIN public.admin_users au ON au.email = u.email
    WHERE u.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies for admin_users table
CREATE POLICY "Only admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

-- RLS Policies for audit log
CREATE POLICY "Only admins can view audit log" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can insert audit log" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

-- RLS Policies to allow admins to view all user data
CREATE POLICY "Admins can view all credits" 
ON public.credits_balance 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can update all credits" 
ON public.credits_balance 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can view all feedback" 
ON public.feedback 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (public.is_current_user_admin());

-- Insert initial admin users (you can modify these emails)
INSERT INTO public.admin_users (email, created_by) VALUES 
('admin@intrvue.ai', null);