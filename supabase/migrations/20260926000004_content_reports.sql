-- Content reports, for the TAKE IT DOWN Act (in force for platforms since
-- 2026-05-19): anyone, with or without an account, can ask for removal of an
-- intimate image shared without consent (including AI fakes), and the post
-- plus any known identical copies must come down within 48 hours of a valid
-- request. Other problems (copyright aside, which uses the DMCA process in
-- the Terms) can be reported the same way.
--
-- Only the server's service role touches this table: RLS on, no policies.
-- Rows are kept for at least two years as a record of each request and what
-- was done about it.

create table public.content_reports (
  -- Shown to the reporter as their reference number.
  id bigint generated always as identity (start with 1001) primary key,
  created_at timestamptz not null default now(),
  -- The reported post. Kept as plain values (no foreign key) so the record
  -- survives the post being deleted.
  painting_id uuid,
  painting_title text,
  reason text not null check (reason in ('intimate', 'minor', 'harassment', 'other')),
  details text not null default '' check (char_length(details) <= 1000),
  contact_email text not null check (char_length(contact_email) <= 254),
  signature text not null check (char_length(signature) between 2 and 100),
  reporter_hash text not null,
  status text not null default 'open' check (status in ('open', 'removed', 'no_action')),
  resolved_at timestamptz,
  -- How many posts were removed for this report (the post plus identical copies).
  removed_count int not null default 0
);

create index content_reports_status_created on public.content_reports (status, created_at);
create index content_reports_reporter on public.content_reports (reporter_hash, created_at);

alter table public.content_reports enable row level security;

-- A fingerprint (SHA-256) of each stored image, so a removal can also find
-- identical copies someone posted again. Filled in for new uploads by the
-- server; older posts are backfilled separately.
alter table public.paintings add column image_sha256 text;
create index paintings_image_sha256 on public.paintings (image_sha256) where image_sha256 is not null;
