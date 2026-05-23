import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { error } = await supabase.rpc("run_migration", {
    sql: "ALTER TABLE registries ADD COLUMN IF NOT EXISTS std_config jsonb;"
  });

  // Fallback: try a direct upsert to trigger schema refresh
  if (error) {
    // Column may already exist or RPC not available — try inserting null to check
    const { error: checkErr } = await supabase
      .from("registries")
      .select("std_config")
      .limit(1);

    if (checkErr?.message?.includes("does not exist")) {
      return NextResponse.json({
        ok: false,
        message: "Please run this SQL in your Supabase dashboard SQL editor:\n\nALTER TABLE registries ADD COLUMN IF NOT EXISTS std_config jsonb;",
      }, { status: 200 });
    }
    return NextResponse.json({ ok: true, message: "Column already exists" });
  }

  return NextResponse.json({ ok: true });
}
