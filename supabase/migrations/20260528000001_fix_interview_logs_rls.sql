-- SEC-04: Replace overly permissive interview_logs INSERT policy.
-- Old policy used WITH CHECK (true), allowing any authenticated user to insert
-- logs for any session. New policy restricts inserts to the session owner only.
DROP POLICY IF EXISTS "System can insert logs" ON public.interview_logs;

CREATE POLICY "Users can insert logs for own sessions"
ON public.interview_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interview_sessions
    WHERE interview_sessions.id = interview_logs.session_id
      AND interview_sessions.user_id = auth.uid()
  )
);
