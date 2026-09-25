insert into public.tags (name, slug) values ('Gouache', 'gouache')
on conflict (slug) do nothing;
