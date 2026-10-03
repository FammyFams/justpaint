-- Notifications: comments and hearts on your paintings, listed on
-- /notifications (never emailed). This remembers when each person last
-- opened that page, so the account menu can say how many are new.
create table public.notification_reads (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  seen_at timestamptz not null default now()
);
alter table public.notification_reads enable row level security;
revoke all on public.notification_reads from anon, authenticated;
-- No policies: only the service role (which bypasses RLS) touches it.

-- Notifications look up paintings by owner and comments by painting.
create index if not exists paintings_owner_id_idx on public.paintings (owner_id);
create index if not exists comments_painting_created_idx on public.comments (painting_id, created_at);

-- How many notifications came in since the person last opened the page:
-- comments by other people, plus hearts grouped per painting per day
-- (Pacific time, matching the page), not counting their own heart. Someone
-- who has never opened the page gets the last 7 days.
create or replace function public.unread_notification_count(p_user uuid, p_own_heart_key text)
returns int
language sql
stable
security definer
set search_path = public
as $$
  with since as (
    select coalesce(
      (select seen_at from public.notification_reads where user_id = p_user),
      now() - interval '7 days'
    ) as at
  )
  select (
    (select count(*)
       from public.comments c
       join public.paintings p on p.id = c.painting_id
      where p.owner_id = p_user
        and c.user_id <> p_user
        and c.created_at > (select at from since))
    +
    (select count(distinct (h.painting_id, (h.created_at at time zone 'America/Los_Angeles')::date))
       from public.painting_hearts h
       join public.paintings p on p.id = h.painting_id
      where p.owner_id = p_user
        and h.ip_hash <> p_own_heart_key
        and h.created_at > (select at from since))
  )::int;
$$;

revoke execute on function public.unread_notification_count(uuid, text) from anon, authenticated, public;
grant execute on function public.unread_notification_count(uuid, text) to service_role;
