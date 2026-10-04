import { createClient } from "@/lib/supabase/server";

// RPC 오류(예: 아직 마이그레이션 전)는 관리자가 아닌 것으로 취급한다.
export async function isAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<boolean> {
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}
