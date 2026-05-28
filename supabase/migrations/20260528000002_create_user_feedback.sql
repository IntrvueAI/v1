-- SEC-05: Create user_feedback table for bug reports and user feedback.
-- The send-bug-report edge function inserts into this table; without it,
-- all bug report submissions silently fail with a DB error.
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  category   TEXT        NOT NULL,
  subject    TEXT        NOT NULL,
  message    JSONB       NOT NULL DEFAULT '{}',
  status     TEXT        NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own feedback"
ON public.user_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own feedback"
ON public.user_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_feedback_user_created
  ON public.user_feedback(user_id, created_at);
