-- Blocking (W8). Apple's guideline 1.2 asks apps with user content to let
-- people block abusive users; the app hides a blocked artist's paintings and
-- comments from the person who blocked them. One row per block. It's private:
-- the blocked person isn't told and can't see the row.
--
-- Only the website's server writes it (lib/writes/blocks.ts, service role).
-- Browser roles can read their own blocks and nothing else.

create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- Deleting an account removes the blocks against it too (the cascade above);
-- this keeps that from reading the whole table.
create index user_blocks_blocked_id on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

revoke all on public.user_blocks from anon, authenticated;
grant select on public.user_blocks to authenticated;
grant select, insert, delete on public.user_blocks to service_role;

create policy "people read their own blocks"
  on public.user_blocks for select
  to authenticated
  using ((select auth.uid()) = blocker_id);
