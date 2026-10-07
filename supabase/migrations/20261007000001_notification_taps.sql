-- Notifications are seen when tapped (app) or clicked (website), not when the
-- list opens. One row per tapped notification, keeping its painting too, so
-- either rule can be read from the same rows: "just that notification" or
-- "everything on that painting". Which one applies is TAP_MARKS in
-- lib/notifications.ts, passed here as p_by_painting; switching it needs no
-- change to this table.
--
-- item_id is the notification's id from lib/notifications.ts:
--   comment:<comment id>
--   hearts:<painting id>:<YYYY-MM-DD, Pacific day>
-- A tap covers what had arrived when it happened: hearts that come in later
-- the same day make that row new again.

create table public.notification_taps (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null check (char_length(item_id) <= 100),
  painting_id uuid not null references public.paintings(id) on delete cascade,
  tapped_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index notification_taps_user_painting
  on public.notification_taps (user_id, painting_id, tapped_at desc);

-- No policies: only the website's server (service role) reads or writes it.
alter table public.notification_taps enable row level security;

-- Same count as before (comments, plus hearts grouped per painting per Pacific
-- day, after the person's seen_at), minus what's been tapped. The old
-- two-argument version is replaced; p_by_painting defaults to false, so code
-- still calling it with two arguments keeps working.
drop function if exists public.unread_notification_count(uuid, text);

create function public.unread_notification_count(
  p_user uuid,
  p_own_heart_key text,
  p_by_painting boolean default false
)
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
  ),
  taps as (
    select item_id, painting_id, tapped_at
      from public.notification_taps
     where user_id = p_user
  ),
  new_comments as (
    select c.id, c.painting_id, c.created_at
      from public.comments c
      join public.paintings p on p.id = c.painting_id
     where p.owner_id = p_user
       and c.user_id <> p_user
       and c.created_at > (select at from since)
  ),
  heart_days as (
    select h.painting_id,
           (h.created_at at time zone 'America/Los_Angeles')::date as day,
           max(h.created_at) as newest
      from public.painting_hearts h
      join public.paintings p on p.id = h.painting_id
     where p.owner_id = p_user
       and h.ip_hash <> p_own_heart_key
       and h.created_at > (select at from since)
     group by 1, 2
  )
  select (
    (select count(*)
       from new_comments c
      where not exists (
        select 1 from taps t
         where t.tapped_at >= c.created_at
           and (t.item_id = 'comment:' || c.id
                or (p_by_painting and t.painting_id = c.painting_id))))
    +
    (select count(*)
       from heart_days g
      where not exists (
        select 1 from taps t
         where t.tapped_at >= g.newest
           and (t.item_id = 'hearts:' || g.painting_id || ':' || to_char(g.day, 'YYYY-MM-DD')
                or (p_by_painting and t.painting_id = g.painting_id))))
  )::int;
$$;

revoke execute on function public.unread_notification_count(uuid, text, boolean) from anon, authenticated, public;
grant execute on function public.unread_notification_count(uuid, text, boolean) to service_role;
