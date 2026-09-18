-- 게시글 조회수, 추천/비추천 기능 추가.
-- Supabase 프로젝트의 SQL Editor에서 한 번만 실행하세요.

alter table public.posts add column view_count integer not null default 0;

create table public.post_votes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  value smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index post_votes_post_id_idx on public.post_votes (post_id);

alter table public.post_votes enable row level security;

create policy "post votes are viewable by everyone"
  on public.post_votes for select using (true);
create policy "logged in users can vote"
  on public.post_votes for insert with check (auth.uid() = user_id);
create policy "users can change own vote"
  on public.post_votes for update using (auth.uid() = user_id);
create policy "users can remove own vote"
  on public.post_votes for delete using (auth.uid() = user_id);

-- RLS와 무관하게(비로그인 방문자 포함) 조회수를 원자적으로 1 증가시키는 함수.
create function public.increment_post_views(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set view_count = view_count + 1 where id = p_post_id;
$$;
