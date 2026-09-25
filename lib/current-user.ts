import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string | undefined;
  displayName: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", claims.sub)
    .single();

  return {
    id: claims.sub,
    email: claims.email,
    displayName: profile?.display_name || claims.email?.split("@")[0] || "You",
  };
}
