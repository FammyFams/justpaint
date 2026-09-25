-- Starter tag taxonomy so the tag filter isn't empty before the first upload.

insert into public.tags (name, slug) values
  ('Abstract', 'abstract'),
  ('Mixed Media', 'mixed-media'),
  ('Oil', 'oil'),
  ('Watercolor', 'watercolor'),
  ('Ink & Wash', 'ink-wash'),
  ('Color Field', 'color-field'),
  ('Landscape', 'landscape'),
  ('Contemporary', 'contemporary')
on conflict (slug) do nothing;
