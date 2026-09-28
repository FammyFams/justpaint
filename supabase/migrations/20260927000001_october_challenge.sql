-- October painting challenge: the uploader ticks a box to enter a painting,
-- and the home feed can show only those. Set by the upload server action
-- (service role) right after create_painting, so that function is unchanged.
alter table public.paintings
  add column october_challenge boolean not null default false;

create index paintings_october_challenge_idx
  on public.paintings (created_at desc)
  where october_challenge;
