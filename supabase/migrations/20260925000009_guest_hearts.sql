-- Account-free "hearts". One heart per painting per (hashed) IP, so a script
-- can't inflate counts; the browser remembers what it hearted in
-- localStorage. The per-IP rows are private (service role only) -- the public
-- only ever sees the denormalized paintings.heart_count, so IP hashes can't
-- be read or used to link one visitor's hearts across paintings.

alter table public.paintings
  add column heart_count int not null default 0;

create table public.painting_hearts (
  painting_id uuid not null references public.paintings(id) on delete cascade,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  primary key (painting_id, ip_hash)
);

alter table public.painting_hearts enable row level security;
-- (No policies: only the service role, used by the server, can touch it.)

create or replace function public.sync_heart_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update paintings set heart_count = heart_count + 1 where id = new.painting_id;
  elsif tg_op = 'DELETE' then
    update paintings set heart_count = greatest(heart_count - 1, 0) where id = old.painting_id;
  end if;
  return null;
end;
$$;

revoke execute on function public.sync_heart_count() from anon, authenticated, public;

create trigger painting_hearts_sync_count
  after insert or delete on public.painting_hearts
  for each row execute function public.sync_heart_count();
