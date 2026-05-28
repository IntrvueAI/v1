# intrvue.ai — MVP → Production Refactor Tasks

> Audit date: 2026-05-25  
> Status key: `[ ]` todo · `[~]` in progress · `[x]` done

---

## P0 — BLOCKERS (fix before any real users)

### SEC-01 · Flip site shutdown flag
- `src/App.tsx:20` — `IS_SITE_DOWN = true` blocks all non-admin users
- `src/App.tsx:23` — single hardcoded admin bypass email
- **Fix:** Replace with `import.meta.env.VITE_SITE_DOWN === 'true'` and read allowed emails from env or DB
- [ ] Move to env var `VITE_SITE_DOWN`
- [ ] Remove hardcoded bypass email from source

---

### SEC-02 · Rate limiting on `get-anam-session-token`
**Risk:** Any authenticated user can hammer this endpoint and exhaust the Anam.ai quota for everyone.

Current state: JWT check only, zero request throttling.

- [ ] Add server-side rate limiting in `supabase/functions/get-anam-session-token/index.ts`
  - Strategy: query `interview_sessions` — reject if user has an `active` session already
  - OR: use a `token_requests` counter in the `profiles` table with a rolling 1-hour window
  - Hard limit: 5 token requests per user per hour
- [ ] Log every token request to `interview_logs` with `log_type: 'token_request'`

---

### SEC-03 · Rate limiting on `generate-interview-feedback`
**Risk:** Each call costs $0.03–$0.18 in OpenAI API charges (3–6 chained calls per request). No credit check happens before the expensive work starts.

- [ ] Move credit check to FIRST step in `supabase/functions/generate-interview-feedback/index.ts` (before any OpenAI call)
  - Current order: validate → call OpenAI → save to DB → deduct credit
  - Required order: validate → **check credits > 0** → call OpenAI → save to DB → deduct credit
- [ ] Add per-user rate limit: max 3 feedback generations per 10 minutes (server-side, stored in DB)
- [ ] Add minimum transcript length check: reject below 100 characters (currently 10)
- [ ] Add a `feedback_requests` row to `profiles` or a separate `rate_limits` table

---

### SEC-04 · Fix overly permissive `interview_logs` RLS
**File:** `supabase/migrations/20250818081941_*.sql`

Current INSERT policy: `WITH CHECK (true)` — any authenticated user can insert logs for any session.

- [ ] Write new migration to replace policy:
  ```sql
  CREATE POLICY "Users can insert logs for own sessions" ON interview_logs
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM interview_sessions
        WHERE interview_sessions.id = interview_logs.session_id
          AND interview_sessions.user_id = auth.uid()
      )
    );
  ```

---

### SEC-05 · Create `user_feedback` table
`supabase/functions/send-bug-report/index.ts:122` inserts into a table that does not exist in any migration. Bug reports silently fail.

- [ ] Write migration:
  ```sql
  CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users view own feedback" ON user_feedback FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users insert own feedback" ON user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```
- [ ] Add index on `(user_id, created_at)`

---

### SEC-06 · Move bug-report rate limiting server-side
Current limit (`src/hooks/useBugReport.ts:51`) uses in-memory state — reset on page reload.

- [ ] Add server-side rate limit in `supabase/functions/send-bug-report/index.ts`
  - Query `user_feedback` count for `user_id` in the last hour
  - Reject with 429 if > 5

---

### SEC-07 · Stripe webhook endpoint (payment reliability)
If a user pays then closes the browser before reaching `/success`, `orders.status` stays `pending` and credits are never added.

- [ ] Create `supabase/functions/stripe-webhook/index.ts`
  - Validate `Stripe-Signature` header using `STRIPE_WEBHOOK_SECRET`
  - Handle `checkout.session.completed` → update order to `paid`, call `consume_credit` in reverse (add credits)
  - Handle `payment_intent.payment_failed` → update order to `failed`
  - Idempotent: check `orders.status = 'pending'` before acting
- [ ] Register webhook URL in Stripe dashboard
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Supabase secrets

---

## P1 — CORE FUNCTIONALITY

### ARCH-01 · Create a `services/` layer
Currently all DB queries are scattered across components and hooks with no separation of concerns. Build a clean service layer that the rest of the app calls.

#### Directory structure to create:
```
src/
  services/
    UserService.ts        ← profiles, credits_balance
    SessionService.ts     ← interview_sessions, interview_logs
    FeedbackService.ts    ← feedback table
    OrderService.ts       ← orders, payment state
    AdminService.ts       ← admin_users, admin_audit_log
  models/
    User.ts               ← UserProfile, CreditBalance types
    Session.ts            ← InterviewSession, SessionLog types
    Feedback.ts           ← FeedbackRecord, Annotation types
    Order.ts              ← Order, PaymentStatus types
```

#### `src/models/User.ts`
- [ ] Define `UserProfile` (id, email, full_name, schools, interview_date, preferred_interview_type)
- [ ] Define `CreditBalance` (user_id, credits, updated_at)
- [ ] Remove duplicate interface declarations from components

#### `src/models/Session.ts`
- [ ] Define `InterviewSession` (id, session_reference, user_id, interview_type, status, started_at, ended_at, last_activity_at)
- [ ] Define `SessionLog` (id, session_id, log_type, log_level, message, metadata, timestamp)
- [ ] Define `SessionStatus = 'active' | 'completed' | 'timed_out' | 'error'`

#### `src/models/Feedback.ts`
- [ ] Define `FeedbackRecord` with typed scores per interview type (not a bag of nullable columns)
- [ ] Define `Annotation` (segment, issue, suggestion, severity)
- [ ] Define `ScoringResult` (scores: Record<string, number>, total: number, band: string)

#### `src/models/Order.ts`
- [ ] Define `Order` (id, user_id, stripe_session_id, amount, credits_purchased, status)
- [ ] Define `OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled'`

#### `src/services/UserService.ts`
- [ ] `getProfile(userId): Promise<UserProfile>`
- [ ] `updateProfile(userId, patch): Promise<UserProfile>`
- [ ] `getCredits(userId): Promise<CreditBalance>`
- [ ] `deleteAccount(userId): Promise<void>` (via existing RPC)
- [ ] All methods use typed return values from `src/models/User.ts`

#### `src/services/SessionService.ts`
- [ ] `createSession(userId, interviewType): Promise<InterviewSession>`
- [ ] `endSession(sessionId, status): Promise<void>`
- [ ] `getActiveSession(userId): Promise<InterviewSession | null>`
- [ ] `getUserSessions(userId, limit, offset): Promise<InterviewSession[]>`
- [ ] `logEvent(sessionId, type, level, message, metadata): Promise<void>`
- [ ] Move all logic from `useInterviewSessionLogger.ts` here

#### `src/services/FeedbackService.ts`
- [ ] `saveFeedback(record: FeedbackRecord): Promise<FeedbackRecord>` (calls edge fn)
- [ ] `getFeedback(feedbackId): Promise<FeedbackRecord>`
- [ ] `getUserFeedbackHistory(userId, limit, offset): Promise<FeedbackRecord[]>`
- [ ] `getProgressSummary(userId): Promise<ProgressSummary>` (aggregation for dashboard)

#### `src/services/OrderService.ts`
- [ ] `createOrder(userId, pack): Promise<{ checkoutUrl: string }>`
- [ ] `verifyOrder(sessionId): Promise<Order>`
- [ ] `getUserOrders(userId): Promise<Order[]>`

---

### ARCH-02 · Refactor hooks to use services
Once services exist, hooks should orchestrate UI state only — not contain SQL.

- [ ] `useCredits.ts` → calls `UserService.getCredits()`
- [ ] `useInterviewSession.ts` → calls `SessionService.createSession()`, `SessionService.endSession()`
- [ ] `useInterviewSessionLogger.ts` → calls `SessionService.logEvent()` (or merge into useInterviewSession)
- [ ] `useBugReport.ts` → calls a thin `FeedbackService.submitBugReport()`
- [ ] Remove direct `supabase.from(...)` calls from all hooks after migration

---

### ARCH-03 · Consolidate TypeScript types
Types are duplicated across `src/types/interview.ts`, individual components, and hooks.

- [ ] Audit all `interface` and `type` declarations in components
- [ ] Move all shared types to `src/models/` (one file per domain)
- [ ] Export everything from `src/models/index.ts` for clean imports
- [ ] Remove duplicate declarations in:
  - `src/components/InterviewFeedback.tsx:32` (migration TODO)
  - `src/components/FeedbackHistory.tsx:31` (migration TODO)

---

### FEAT-01 · Implement microphone mute
**File:** `src/components/InterviewPlatform.tsx:276`

`toggleAudio()` currently changes UI state only — no effect on the anam SDK.

- [ ] Check anam.ai SDK docs for audio mute API (likely `anamClient.muteAudio()` / `anamClient.unmuteAudio()`)
- [ ] Wire the button to actual SDK methods in `useInterviewSession.ts`
- [ ] Test: mute button visually reflects state AND audio is actually suppressed

---

### FEAT-02 · User progress dashboard
Students have no way to see improvement over time.

- [ ] Create `src/pages/ProgressDashboard.tsx`
- [ ] Add `FeedbackService.getProgressSummary()` query:
  - Average score per category over last N sessions
  - Score trend over time (for line chart)
  - Best/worst performing categories
  - Count of sessions by interview type
- [ ] Components needed:
  - `ScoreTrendChart` — line chart, score over last 10 sessions
  - `CategoryBreakdown` — bar chart per scoring dimension
  - `RecentSessions` — last 5 sessions with quick stats
- [ ] Add route `/progress` to `App.tsx`
- [ ] Add nav link in mobile bottom nav and desktop nav

---

### FEAT-03 · Session idle timeout (backend)
Client-side only detection means abandoned sessions never close server-side.

- [ ] Create `supabase/functions/close-idle-sessions/index.ts`
  - Called by Supabase scheduled trigger (pg_cron) every 15 minutes
  - Updates `interview_sessions.status = 'timed_out'` where `status = 'active'` and `last_activity_at < now() - interval '90 minutes'`
- [ ] Set up pg_cron job in a new migration:
  ```sql
  SELECT cron.schedule('close-idle-sessions', '*/15 * * * *', $$
    UPDATE interview_sessions
    SET status = 'timed_out', ended_at = now()
    WHERE status = 'active'
      AND last_activity_at < now() - interval '90 minutes';
  $$);
  ```

---

## P2 — QUALITY & COMPLETENESS

### FEAT-04 · Interactive annotated transcript
Annotations are generated by OpenAI but never surfaced in the UI as an interactive view.

- [ ] Create `src/components/AnnotatedTranscript.tsx`
  - Renders transcript text with highlighted segments
  - Click/hover on highlight → shows annotation (issue + suggestion)
  - Color code by severity (warning = amber, error = red)
- [ ] Wire into `src/components/InterviewFeedback.tsx` as a new tab

---

### FEAT-05 · Post-interview email summary
Infrastructure exists (Resend via edge function). Just needs triggering.

- [ ] After feedback is saved, invoke `send-email` edge function with score summary
- [ ] Create email template with: overall score, top 3 strengths, top 3 improvements, link to full feedback

---

### SEC-08 · Tighten CORS on edge functions
All functions currently use `Access-Control-Allow-Origin: *`.

- [ ] Replace `*` with specific allowed origins (production domain + localhost for dev)
- [ ] Store allowed origin in Supabase secret `ALLOWED_ORIGIN`
- [ ] Add security headers to `send-email` and `send-auth-email` (currently missing CSP, X-Frame-Options)

---

### SEC-09 · Create `rate_limits` table for durable rate limiting
Current in-memory rate limiting (`src/utils/secureErrorHandler.ts`) resets on page reload.

- [ ] Migration:
  ```sql
  CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, endpoint)
  );
  ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
  -- No user SELECT policy — edge functions use service role only
  ```
- [ ] Create RPC `check_and_increment_rate_limit(p_user_id, p_endpoint, p_max, p_window_minutes)`
- [ ] Use this RPC in: `get-anam-session-token`, `generate-interview-feedback`, `send-bug-report`

---

## P3 — TESTING CORE

> No test files exist anywhere in this codebase. Add these before shipping to more users.

### TEST-01 · Unit tests for service layer
- [ ] Set up Vitest (`npm install -D vitest @vitest/ui`)
- [ ] Mock Supabase client in tests (`vi.mock('../../integrations/supabase/client')`)
- [ ] Write tests for:
  - `UserService` — getProfile, updateProfile, getCredits
  - `FeedbackService` — getUserFeedbackHistory, getProgressSummary
  - `SessionService` — createSession, endSession, getActiveSession
  - Score calculation logic in `src/utils/scoringSystem.ts`
  - Input validation in `src/utils/inputValidation.ts`

### TEST-02 · Edge function integration tests
- [ ] Set up Deno test runner for edge functions
- [ ] Tests for `generate-interview-feedback`:
  - Valid transcript → returns scored feedback
  - Short transcript (< 100 chars) → returns 400
  - No credits → returns 402
  - Invalid JWT → returns 401
- [ ] Tests for `get-anam-session-token`:
  - Valid user → returns token
  - Rate limit exceeded → returns 429
  - Invalid JWT → returns 401

### TEST-03 · E2E critical paths
- [ ] Set up Playwright
- [ ] Cover:
  - Sign up → complete profile → land on dashboard
  - Purchase credits → credits reflected in UI
  - Start interview → complete → view feedback
  - View feedback history → sessions appear in order
  - Progress dashboard → charts render with data

---

## Data model summary (current, for reference)

```
auth.users
  └─ profiles (1:1)         ← user info, interview date, schools
  └─ credits_balance (1:1)  ← integer credit count
  └─ orders (1:N)           ← stripe sessions, payment state
  └─ interview_sessions (1:N)
       └─ interview_logs (1:N)  ← event stream per session
  └─ feedback (1:N)         ← linked to session via session_reference
  └─ user_feedback (1:N)    ← bug reports [TO CREATE: SEC-05]

admin_users
  └─ admin_audit_log (1:N)

rate_limits [TO CREATE: SEC-09]
```

---

## Completion checklist

| ID | Category | Title | Priority | Done |
|----|----------|-------|----------|------|
| SEC-01 | Security | Flip site shutdown flag | P0 | [ ] |
| SEC-02 | Security | Rate limit anam token endpoint | P0 | [ ] |
| SEC-03 | Security | Rate limit + credit-check feedback endpoint | P0 | [ ] |
| SEC-04 | Security | Fix interview_logs RLS policy | P0 | [ ] |
| SEC-05 | Security | Create user_feedback table | P0 | [ ] |
| SEC-06 | Security | Server-side bug report rate limit | P0 | [ ] |
| SEC-07 | Security | Stripe webhook endpoint | P0 | [ ] |
| ARCH-01 | Arch | Create services/ + models/ layer | P1 | [ ] |
| ARCH-02 | Arch | Refactor hooks to use services | P1 | [ ] |
| ARCH-03 | Arch | Consolidate TypeScript types | P1 | [ ] |
| FEAT-01 | Feature | Implement mic mute (anam SDK) | P1 | [ ] |
| FEAT-02 | Feature | User progress dashboard | P1 | [ ] |
| FEAT-03 | Feature | Session idle timeout (pg_cron) | P1 | [ ] |
| FEAT-04 | Feature | Interactive annotated transcript | P2 | [ ] |
| FEAT-05 | Feature | Post-interview email summary | P2 | [ ] |
| SEC-08 | Security | Tighten CORS to specific origins | P2 | [ ] |
| SEC-09 | Security | Durable rate_limits table | P2 | [ ] |
| TEST-01 | Testing | Vitest unit tests for services | P3 | [ ] |
| TEST-02 | Testing | Edge function integration tests | P3 | [ ] |
| TEST-03 | Testing | Playwright E2E critical paths | P3 | [ ] |
