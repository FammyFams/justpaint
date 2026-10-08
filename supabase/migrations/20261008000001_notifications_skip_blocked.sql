-- People you blocked in the app don't notify you: their comments on your
-- paintings are left out of the unread count, the same as getNotifications()
-- leaves them out of the list. Hearts carry no name, so they still count.
-- Same signature and body as 20261007000001, plus the user_blocks check.

create or replace function public.unread_notification_count(
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
       and not exists (
         select 1 from public.user_blocks b
          where b.blocker_id = p_user
            and b.blocked_id = c.user_id)
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
