-- 정병크리틱 DB 스키마
-- Supabase 프로젝트의 SQL Editor에서 그대로 실행하세요.

create extension if not exists "pgcrypto";

-- 로그인한 유저 1명당 1행. auth.users에 계정이 생기면 트리거로 자동 생성됨.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  genre text,
  description text,
  cover_url text,
  color text not null default '#66cc33',
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score numeric(3, 1) not null check (score >= 0 and score <= 10),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_id, user_id)
);

create index reviews_game_id_idx on public.reviews (game_id);
create index games_created_at_idx on public.games (created_at desc);

-- 새 계정이 생기면 profiles 행을 자동으로 만든다.
-- 디스코드 OAuth는 user_name/full_name, 이메일 가입은 이메일 앞부분을 닉네임으로 사용.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      '이름없음'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 리뷰 등록/수정 시 updated_at 자동 갱신
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute procedure public.set_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.reviews enable row level security;

create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "games are viewable by everyone"
  on public.games for select using (true);
create policy "logged in users can add games"
  on public.games for insert with check (auth.uid() = added_by);
create policy "authors can update own games"
  on public.games for update using (auth.uid() = added_by);

create policy "reviews are viewable by everyone"
  on public.reviews for select using (true);
create policy "logged in users can add own reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "users can update own reviews"
  on public.reviews for update using (auth.uid() = user_id);
create policy "users can delete own reviews"
  on public.reviews for delete using (auth.uid() = user_id);
