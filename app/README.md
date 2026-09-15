# 정병크리틱

정신병동(친구 디스코드 서버) 멤버들이 플레이한 게임에 직접 점수를 매기는 평점 사이트.
`html/초안4.html` 아티팩트 프로토타입을 Next.js + Supabase 기반 실서비스로 옮기는 중입니다.
전체 로드맵은 [`../계획서/정병크리틱_로드맵.html`](../계획서/정병크리틱_로드맵.html) 참고.

## 기술 스택

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Supabase** — Postgres DB, 인증(Discord OAuth / 이메일 매직링크), RLS
- **Vercel** — 배포 예정

## 처음 설정하는 방법

### 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성 (무료 플랜)
2. 프로젝트 대시보드 → **SQL Editor** 에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 그대로 실행
   (`profiles`, `games`, `reviews` 테이블 + RLS 정책 + 회원가입 트리거가 만들어져요)
3. 프로젝트 대시보드 → **Settings → API** 에서 `Project URL`과 `anon public` 키 복사

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열어서 방금 복사한 값을 채워넣으세요. (이 파일은 git에 올라가지 않아요)

### 3. 디스코드 로그인 연동 (선택, 나중에 해도 됨)

1. [Discord Developer Portal](https://discord.com/developers/applications) 에서 새 애플리케이션 생성
2. OAuth2 → Redirect에 Supabase가 알려주는 콜백 URL 등록
   (Supabase 대시보드 → Authentication → Providers → Discord 에 안내되어 있음)
3. 발급받은 Client ID / Client Secret을 Supabase 대시보드 → Authentication → Providers → Discord 에 입력하고 활성화

이 단계를 건너뛰어도 이메일 매직링크 로그인으로 바로 테스트할 수 있어요.

### 4. 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

## 프로젝트 구조

```
src/
  app/
    page.tsx              게임 목록 (검색/정렬)
    games/[id]/page.tsx    게임 상세 + 리뷰 작성/삭제
    games/new/page.tsx     게임 등록
    login/page.tsx         로그인 (디스코드 / 이메일)
    auth/callback/route.ts OAuth·매직링크 콜백
  components/               UI 컴포넌트
  lib/
    supabase/               브라우저/서버/미들웨어용 Supabase 클라이언트
    actions.ts               서버 액션 (게임 등록, 리뷰 등록/삭제, 로그아웃)
    types.ts, format.ts
supabase/schema.sql          DB 스키마 (Supabase SQL Editor에 붙여넣기)
```

## 다음 단계 (로드맵 기준)

- [x] 프로젝트 뼈대 / DB 스키마 / 게임·리뷰 CRUD / 로그인 UI
- [ ] 실제 Supabase 프로젝트 연결 + 디스코드 OAuth 앱 등록
- [ ] 게시판 기능
- [ ] 친구들과 베타 테스트
- [ ] Vercel 배포
