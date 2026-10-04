-- 1) 관리자 + 2) 커버 이미지 업로드용 스토리지.
-- Supabase 프로젝트의 SQL Editor에서 한 번만 실행하세요.
-- 실행 후 맨 아래 "관리자 지정" 안내대로 본인 계정을 admins에 등록해야 합니다.

-- ── 관리자 ─────────────────────────────────────────────────────────
-- profiles에 is_admin 컬럼을 두면 "본인 프로필 수정" 정책으로 누구나 자기 자신을
-- 관리자로 바꿀 수 있어서, 클라이언트가 직접 쓸 수 없는 별도 테이블로 분리한다.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- RLS를 켜고 정책을 하나도 만들지 않는다 -> 클라이언트는 이 테이블을 직접 읽거나 쓸 수 없다.
alter table public.admins enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 등록자 본인 또는 관리자가 수정/삭제할 수 있도록 정책을 교체한다.
drop policy "authors can update own games" on public.games;
create policy "authors or admins can update games"
  on public.games for update
  using (auth.uid() = added_by or public.is_admin());

drop policy "authors can delete own games" on public.games;
create policy "authors or admins can delete games"
  on public.games for delete
  using (auth.uid() = added_by or public.is_admin());

-- ── 커버 이미지 스토리지 ───────────────────────────────────────────
-- 공개 버킷(누구나 이미지 URL로 볼 수 있음). 2MB, JPG/PNG/WebP만 허용.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- 로그인한 유저는 자기 uid 폴더(covers/<uid>/...)에만 올릴 수 있다.
create policy "covers: users upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 본인 폴더의 파일 또는 (관리자라면) 모든 파일을 삭제할 수 있다.
create policy "covers: owners or admins delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'covers'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ── 관리자 지정 (위 내용을 실행한 뒤, 아래를 따로 실행) ─────────────
-- 1) 내 계정의 id를 확인한다:
--      select p.id, p.nickname, u.email
--      from public.profiles p join auth.users u on u.id = p.id;
-- 2) 확인한 id로 관리자를 등록한다:
--      insert into public.admins (user_id) values ('여기에-위에서-확인한-id');
