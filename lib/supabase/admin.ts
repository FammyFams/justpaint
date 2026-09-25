import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Service-role client for privileged operations the regular session-scoped
 * client can't do (e.g. deleting a user's auth account). The `server-only`
 * import makes any accidental client-component import a build error.
 * Never expose SUPABASE_SECRET_KEY via a NEXT_PUBLIC_* variable.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
