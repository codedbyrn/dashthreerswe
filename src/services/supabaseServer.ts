import { createClient as createSupabaseServerClient } from "@/auth/utils/supabase/server";

/**
 * Creates and returns a Supabase client configured for Server Components,
 * Server Actions, and Route Handlers.
 *
 * This function retrieves request cookies automatically, aligning with
 * Next.js App Router server utilities.
 */
export async function getSupabaseServer() {
  return await createSupabaseServerClient();
}
