import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// GET — fetch registry config for public RSVP page
export async function GET(_req: Request, { params }: { params: Promise<{ registryId: string }> }) {
  const { registryId } = await params;
  const supabase = createAdminClient();

  const { data: registry } = await supabase
    .from("registries")
    .select("slug, title, user_id, std_config")
    .eq("id", registryId)
    .single();

  if (!registry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("partner1_name, partner2_name, wedding_date")
    .eq("id", registry.user_id)
    .single();

  return NextResponse.json({
    coupleName: profile?.partner1_name && profile?.partner2_name
      ? `${profile.partner1_name} & ${profile.partner2_name}`
      : registry.title ?? "les mariés",
    weddingDate: profile?.wedding_date ?? null,
    registrySlug: registry.slug ?? null,
    partner1_name: profile?.partner1_name ?? null,
    partner2_name: profile?.partner2_name ?? null,
    location: null,
    stdConfig: registry.std_config ?? null,
  });
}

// POST — submit RSVP (upsert guest by email)
export async function POST(req: Request, { params }: { params: Promise<{ registryId: string }> }) {
  const { registryId } = await params;
  const { status, name, email, message } = await req.json();

  if (!["confirmed", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const supabase = createAdminClient();
  const normalizedEmail = email.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("std_guests")
    .select("id")
    .eq("registry_id", registryId)
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    await supabase.from("std_guests").update({
      name: name ?? existing,
      rsvp_status: status,
      rsvp_at: new Date().toISOString(),
      rsvp_message: message ?? null,
    }).eq("id", existing.id);
  } else {
    await supabase.from("std_guests").insert({
      registry_id: registryId,
      name: name ?? normalizedEmail,
      email: normalizedEmail,
      rsvp_status: status,
      rsvp_at: new Date().toISOString(),
      rsvp_message: message ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}
