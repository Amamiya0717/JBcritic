alter table public.games
  add column category text not null default 'game';

alter table public.games
  add constraint games_category_check
  check (category in ('game', 'anime', 'movies', 'music', 'lives'));
