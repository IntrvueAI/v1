-- User-shared interview feedback: after an interview a student can leave a comment (and optionally
-- share their transcript) for the intrvue team. Surfaced in the admin dashboard's Feedback tab.
CREATE TABLE IF NOT EXISTS public.interview_feedback_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  session_reference text,
  interview_type text,
  rating int,                                   -- optional 1–5
  comment text,
  share_transcript boolean NOT NULL DEFAULT false,
  transcript text,                              -- only populated when the user opts to share it
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.interview_feedback_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own shares"
  ON public.interview_feedback_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own shares"
  ON public.interview_feedback_shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all shares"
  ON public.interview_feedback_shares FOR SELECT USING (public.is_current_user_admin());

CREATE INDEX IF NOT EXISTS ifs_created_idx ON public.interview_feedback_shares (created_at DESC);

-- Let admins read all sessions + generated feedback (for the admin "Interviews" view).
CREATE POLICY "Admins view all interview sessions"
  ON public.interview_sessions FOR SELECT USING (public.is_current_user_admin());
CREATE POLICY "Admins view all feedback"
  ON public.feedback FOR SELECT USING (public.is_current_user_admin());
