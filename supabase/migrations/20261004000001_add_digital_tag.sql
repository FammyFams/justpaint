insert into public.tags (name, slug) values ('iPad / Digital', 'digital')
on conflict (slug) do nothing;
