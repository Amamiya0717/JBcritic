-- 게임을 등록한 사람만 삭제할 수 있도록 RLS 정책 추가.
-- (수정 정책은 schema.sql에 이미 있음: "authors can update own games")
-- Supabase 프로젝트의 SQL Editor에서 한 번만 실행하세요.

create policy "authors can delete own games"
  on public.games for delete using (auth.uid() = added_by);
