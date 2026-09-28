insert into public.tags (name, slug) values ('Acrylic', 'acrylic')
on conflict (slug) do nothing;
