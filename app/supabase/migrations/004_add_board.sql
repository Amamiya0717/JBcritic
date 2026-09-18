-- 게시판(글/댓글) 기능 추가.
-- Supabase 프로젝트의 SQL Editor에서 한 번만 실행하세요.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index comments_post_id_idx on public.comments (post_id);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

alter table public.posts enable row level security;
alter table public.comments enable row level security;

create policy "posts are viewable by everyone"
  on public.posts for select using (true);
create policy "logged in users can add own posts"
  on public.posts for insert with check (auth.uid() = author_id);
create policy "authors can update own posts"
  on public.posts for update using (auth.uid() = author_id);
create policy "authors can delete own posts"
  on public.posts for delete using (auth.uid() = author_id);

create policy "comments are viewable by everyone"
  on public.comments for select using (true);
create policy "logged in users can add own comments"
  on public.comments for insert with check (auth.uid() = user_id);
create policy "users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);
