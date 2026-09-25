-- Repoint owner/author foreign keys at public.profiles instead of auth.users,
-- so PostgREST can embed profile info directly (e.g. paintings -> profiles)
-- without a manual join in application code. profiles.id already references
-- auth.users(id) with the same on-delete-cascade semantics and is created
-- synchronously by the handle_new_user trigger, so this is a safe redirect
-- on an empty database.

alter table public.paintings
  drop constraint paintings_owner_id_fkey,
  add constraint paintings_owner_id_fkey
    foreign key (owner_id) references public.profiles(id) on delete cascade;

alter table public.likes
  drop constraint likes_user_id_fkey,
  add constraint likes_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.comments
  drop constraint comments_user_id_fkey,
  add constraint comments_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete cascade;
