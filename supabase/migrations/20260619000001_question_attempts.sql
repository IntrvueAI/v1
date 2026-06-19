-- Flat per-question attempt log — the dashboard's source of truth.
--
-- Every question a user attempts (across every interview) becomes one row here, written when the
-- interview finishes (generate-interview-feedback). This makes the planned dashboard trivial:
--   • "questions you got wrong"  → WHERE outcome IN ('incorrect','stuck') OR band = 'weak'
--   • daily stats / activity     → GROUP BY date(created_at)
--   • per-topic strengths        → GROUP BY topic
--   • login / activity streak    → distinct date(created_at) (also derivable from interview_sessions)
--   • last session overview      → latest session_reference (also in the feedback table)

CREATE TABLE IF NOT EXISTS public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_reference text,
  interview_type text,
  subject text,
  topic text,
  difficulty text,
  question_id text,
  question text,
  outcome text,                 -- correct_method | correct_no_method | incorrect | stuck | skipped
  band text,                    -- strong | developing | weak (from the question rubric)
  skipped boolean DEFAULT false,
  hints_used int DEFAULT 0,
  student_answer text,
  question_index int,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- Users can read their own attempts; inserts are done by the edge function (service role).
CREATE POLICY "Users read own question attempts"
  ON public.question_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS question_attempts_user_created_idx ON public.question_attempts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS question_attempts_user_outcome_idx ON public.question_attempts (user_id, outcome);
CREATE INDEX IF NOT EXISTS question_attempts_session_idx ON public.question_attempts (session_reference);
