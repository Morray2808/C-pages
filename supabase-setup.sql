-- ─────────────────────────────────────────────────────────────
--  Cépage leaderboard — Supabase setup
--
--  Run this entire file once in your Supabase project:
--    Supabase dashboard → SQL Editor → New query → paste → Run
--
--  It creates the scores table and the security policies that let
--  the public anon key read and insert scores (and nothing else).
-- ─────────────────────────────────────────────────────────────

-- 1. The table.
create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  name        text    not null check (char_length(name) between 1 and 24),
  score       integer not null check (score >= 0),
  total       integer not null check (total > 0),
  mode        text    not null default 'full',
  created_at  timestamptz not null default now()
);

-- Index to keep the 24h time-window query fast as rows accumulate.
create index if not exists scores_created_at_idx on public.scores (created_at desc);

-- 2. Turn on Row Level Security. With RLS on and no policies, the table
--    is locked to everyone — the policies below open exactly two doors.
alter table public.scores enable row level security;

-- 3. Allow anyone (the anon public key) to READ scores.
create policy "Public can read scores"
  on public.scores
  for select
  to anon
  using (true);

-- 4. Allow anyone to INSERT a score, with basic sanity bounds enforced
--    server-side so a tampered client still can't write nonsense.
create policy "Public can insert scores"
  on public.scores
  for insert
  to anon
  with check (
    char_length(name) between 1 and 24
    and score >= 0
    and total > 0
    and score <= total
    and mode in ('quick', 'full')
  );

-- Note: there is deliberately NO update or delete policy, so the anon
-- key cannot modify or remove anyone's scores — only add and read.

-- ─────────────────────────────────────────────────────────────
--  OPTIONAL — auto-purge rows older than 24h.
--
--  Scores older than 24h already stop appearing (the app filters them
--  out on read), so this is just housekeeping to keep the table small.
--  Requires the pg_cron extension (Database → Extensions → enable pg_cron).
--  Uncomment to use:
-- ─────────────────────────────────────────────────────────────

-- select cron.schedule(
--   'purge-old-scores',
--   '0 * * * *',  -- every hour, on the hour
--   $$ delete from public.scores where created_at < now() - interval '24 hours' $$
-- );
