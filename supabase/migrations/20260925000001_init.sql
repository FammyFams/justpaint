-- justpaint initial schema: profiles, paintings (with guest posting), tags, likes, comments.

create extension if not exists pgcrypto;

-- ============================================================
-- profiles
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- paintings (owner_id null => guest upload, guest_name set instead)
-- ============================================================

create table public.paintings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  guest_name text,
  title text not null,
  description text not null default '',
  image_path text not null,
  aspect text not null default 'square' check (aspect in ('portrait', 'landscape', 'square')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paintings_owner_xor_guest check (
    (owner_id is not null and guest_name is null)
    or (owner_id is null and guest_name is not null)
  )
);

alter table public.paintings enable row level security;

create policy "paintings are publicly readable"
  on public.paintings for select
  using (true);

-- Direct table inserts are for registered owners only (owner_id = auth.uid()).
-- Guest uploads (owner_id null) can never satisfy this check, by design --
-- they must go through the create_painting() RPC below.
create policy "owners can insert their own paintings"
  on public.paintings for insert
  with check (owner_id = auth.uid());

create policy "owners can update their own paintings"
  on public.paintings for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners can delete their own paintings"
  on public.paintings for delete
  using (owner_id = auth.uid());

-- ============================================================
-- tags + paintings_tags
-- ============================================================

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "tags are publicly readable"
  on public.tags for select
  using (true);

-- No direct client insert/update/delete on tags -- created via create_painting().

create table public.paintings_tags (
  painting_id uuid not null references public.paintings(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (painting_id, tag_id)
);

alter table public.paintings_tags enable row level security;

create policy "painting tags are publicly readable"
  on public.paintings_tags for select
  using (true);

create policy "owners can tag their own paintings"
  on public.paintings_tags for insert
  with check (
    exists (
      select 1 from public.paintings p
      where p.id = painting_id and p.owner_id = auth.uid()
    )
  );

create policy "owners can untag their own paintings"
  on public.paintings_tags for delete
  using (
    exists (
      select 1 from public.paintings p
      where p.id = painting_id and p.owner_id = auth.uid()
    )
  );

-- ============================================================
-- create_painting RPC -- the only path for guest (anonymous) uploads.
-- SECURITY DEFINER so it can insert a null-owner row despite the
-- owner-only table policy above; validates guest_name itself instead.
-- ============================================================

create or replace function public.create_painting(
  p_title text,
  p_description text,
  p_image_path text,
  p_aspect text,
  p_tag_names text[] default '{}',
  p_guest_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_painting_id uuid;
  v_tag_name text;
  v_tag_slug text;
  v_tag_id uuid;
begin
  if v_owner is null and (p_guest_name is null or length(trim(p_guest_name)) = 0) then
    raise exception 'guest_name is required when posting without an account';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'title is required';
  end if;

  if p_aspect not in ('portrait', 'landscape', 'square') then
    raise exception 'invalid aspect: %', p_aspect;
  end if;

  insert into public.paintings (owner_id, guest_name, title, description, image_path, aspect)
  values (
    v_owner,
    case when v_owner is null then trim(p_guest_name) else null end,
    trim(p_title),
    coalesce(p_description, ''),
    p_image_path,
    p_aspect
  )
  returning id into v_painting_id;

  foreach v_tag_name in array coalesce(p_tag_names, '{}')
  loop
    v_tag_name := trim(v_tag_name);
    continue when length(v_tag_name) = 0;

    v_tag_slug := trim(both '-' from lower(regexp_replace(v_tag_name, '[^a-zA-Z0-9]+', '-', 'g')));
    continue when length(v_tag_slug) = 0;

    insert into public.tags (name, slug)
    values (v_tag_name, v_tag_slug)
    on conflict (slug) do update set slug = excluded.slug
    returning id into v_tag_id;

    insert into public.paintings_tags (painting_id, tag_id)
    values (v_painting_id, v_tag_id)
    on conflict do nothing;
  end loop;

  return v_painting_id;
end;
$$;

grant execute on function public.create_painting(text, text, text, text, text[], text) to anon, authenticated;

-- ============================================================
-- likes
-- ============================================================

create table public.likes (
  painting_id uuid not null references public.paintings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (painting_id, user_id)
);

alter table public.likes enable row level security;

create policy "likes are publicly readable"
  on public.likes for select
  using (true);

create policy "users can like as themselves"
  on public.likes for insert
  with check (user_id = auth.uid());

create policy "users can unlike as themselves"
  on public.likes for delete
  using (user_id = auth.uid());

-- ============================================================
-- comments
-- ============================================================

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  painting_id uuid not null references public.paintings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) <= 2000 and length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "comments are publicly readable"
  on public.comments for select
  using (true);

create policy "users can comment as themselves"
  on public.comments for insert
  with check (user_id = auth.uid());

create policy "authors or painting owners can delete comments"
  on public.comments for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.paintings p
      where p.id = painting_id and p.owner_id = auth.uid()
    )
  );

-- ============================================================
-- storage: paintings bucket
-- Path convention: {owner_id-or-"guest"}/{painting_id}.{ext}
-- ============================================================

insert into storage.buckets (id, name, public)
values ('paintings', 'paintings', true)
on conflict (id) do nothing;

create policy "anyone can view painting images"
  on storage.objects for select
  using (bucket_id = 'paintings');

create policy "owners or guests can upload painting images"
  on storage.objects for insert
  with check (
    bucket_id = 'paintings'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (auth.role() = 'anon' and (storage.foldername(name))[1] = 'guest')
    )
  );

create policy "owners can update their painting images"
  on storage.objects for update
  using (
    bucket_id = 'paintings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owners can delete their painting images"
  on storage.objects for delete
  using (
    bucket_id = 'paintings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
