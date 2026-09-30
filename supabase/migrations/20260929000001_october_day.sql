-- Which day's prompt an October challenge painting is for (1 = October 1).
-- Picked on the upload form when the challenge box is ticked; null for
-- everything else, including challenge posts from before this column.
alter table public.paintings
  add column october_day smallint
  check (october_day between 1 and 31);

-- The October Challenge feed is grouped by day, newest day first.
drop index if exists public.paintings_october_challenge_idx;
create index paintings_october_challenge_idx
  on public.paintings (october_day desc nulls last, created_at desc)
  where october_challenge;
