alter table public.games
  add column studio text,
  add column director text,
  add column artist text,
  add column release_year integer,
  add column venue text,
  add column event_date date;
