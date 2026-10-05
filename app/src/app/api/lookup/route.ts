import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LookupError, detailByCategory, searchByCategory } from "@/lib/lookup";
import { LOOKUP_CATEGORIES, isGameCategory } from "@/lib/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "로그인 후 이용해주세요." }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const category = params.get("category") ?? "";
  if (!isGameCategory(category) || !LOOKUP_CATEGORIES.includes(category)) {
    return Response.json({ error: "지원하지 않는 카테고리예요." }, { status: 400 });
  }

  try {
    const id = params.get("id");
    if (id) {
      if ((category !== "movies" && category !== "game") || !/^\d+$/.test(id)) {
        return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
      }
      return Response.json({ fields: await detailByCategory(category, id) });
    }

    const q = (params.get("q") ?? "").trim();
    if (q.length < 1 || q.length > 100) {
      return Response.json({ error: "검색어를 1~100자로 입력해주세요." }, { status: 400 });
    }
    return Response.json({ results: await searchByCategory(category, q) });
  } catch (e) {
    const message =
      e instanceof LookupError
        ? e.message
        : "검색에 실패했어요. 잠시 후 다시 시도해주세요.";
    return Response.json({ error: message }, { status: 502 });
  }
}
