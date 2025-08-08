-- Idempotent migration to retrofit per-user scoping on an existing messages table
-- 1) Add column user_email if missing
alter table if exists public.messages
  add column if not exists user_email text;

-- 2) Backfill nulls to empty string to satisfy NOT NULL (temporary)
update public.messages
  set user_email = coalesce(user_email, '')
where user_email is null;

-- 3) Enforce NOT NULL
alter table if exists public.messages
  alter column user_email set not null;

-- 4) Helpful indexes
create index if not exists idx_messages_user_email on public.messages(user_email);
create index if not exists idx_messages_user_email_created_at on public.messages(user_email, created_at);

-- 5) Enable RLS (safe to run multiple times)
alter table if exists public.messages enable row level security;

-- 6) Policies using PostgREST header x-user-email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can read own'
  ) THEN
    CREATE POLICY "Users can read own" ON public.messages
      FOR SELECT USING (user_email = current_setting('request.headers.x-user-email', true));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can write own'
  ) THEN
    CREATE POLICY "Users can write own" ON public.messages
      FOR INSERT WITH CHECK (user_email = current_setting('request.headers.x-user-email', true));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Users can delete own'
  ) THEN
    CREATE POLICY "Users can delete own" ON public.messages
      FOR DELETE USING (user_email = current_setting('request.headers.x-user-email', true));
  END IF;
END $$;

-- Notes:
-- - Existing legacy rows will have user_email = '' after backfill and will not be visible under RLS.
--   You may manually update those rows to a specific user's email if desired.
