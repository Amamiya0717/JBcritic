-- 점수 단위를 0~10(소수점) -> 0~100(정수)로 변경.
-- 기존 점수는 10을 곱해서 그대로 이전한다 (예: 9.3 -> 93).
-- Supabase 프로젝트의 SQL Editor에서 한 번만 실행하세요.

alter table public.reviews drop constraint if exists reviews_score_check;

update public.reviews set score = score * 10;

alter table public.reviews
  alter column score type integer using round(score)::integer;

alter table public.reviews
  add constraint reviews_score_check check (score >= 0 and score <= 100);
