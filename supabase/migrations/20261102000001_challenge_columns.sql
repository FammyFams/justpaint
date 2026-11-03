-- Monthly painting challenges. One pair of columns for every month instead
-- of a new pair per month: which challenge a painting is in
-- ('october-2026', 'november-2026', see lib/challenges.ts) and which day's
-- prompt it's for (1 = the 1st).
alter table public.paintings
  add column challenge text check (challenge ~ '^[a-z]+-[0-9]{4}$'),
  add column challenge_day smallint check (challenge_day between 1 and 31);

-- October's entries move over as they are. october_challenge and
-- october_day stay, since the app still reads them; the website keeps them
-- in step (challengeColumns in lib/challenges.ts).
update public.paintings
  set challenge = 'october-2026', challenge_day = october_day
  where october_challenge;

-- Each challenge's feed is grouped by day, newest day first.
create index paintings_challenge_idx
  on public.paintings (challenge, challenge_day desc nulls last, created_at desc)
  where challenge is not null;
