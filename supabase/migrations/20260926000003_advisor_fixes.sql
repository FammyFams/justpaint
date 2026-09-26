-- Supabase security advisor (2026-09-26): nothing outside the server needs
-- these functions, so browser roles can't call them.
--
-- display_name_taken() is only called by the Next.js server's service-role
-- client now. It reads public data anyway, so it runs as the caller.
alter function public.display_name_taken(text, uuid) security invoker;
revoke execute on function public.display_name_taken(text, uuid) from anon, authenticated, public;
grant execute on function public.display_name_taken(text, uuid) to service_role;

-- handle_new_user() is a trigger; it still fires on sign-up without anyone
-- holding EXECUTE on it.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
