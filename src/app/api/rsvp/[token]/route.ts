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

// GET — fetch guest info for RSVP page
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: guest } = await supabase
    .from("std_guests")
    .select("name, rsvp_status, rsvp_message, guest_count, registry_id")
    .eq("token", token)
    .single();

  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: registry } = await supabase
    .from("registries")
    .select("slug, title, user_id")
    .eq("id", guest.registry_id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("partner1_name, partner2_name, wedding_date")
    .eq("id", registry?.user_id)
    .single();

  return NextResponse.json({
    name: guest.name,
    rsvp_status: guest.rsvp_status,
    rsvp_message: guest.rsvp_message,
    guest_count: guest.guest_count,
    coupleName: profile?.partner1_name && profile?.partner2_name
      ? `${profile.partner1_name} & ${profile.partner2_name}`
      : registry?.title ?? "les mariés",
    weddingDate: profile?.wedding_date ?? null,
    registrySlug: registry?.slug ?? null,
  });
}

// POST — submit RSVP
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { status, name, guestCount, message } = await req.json();

  if (!["confirmed", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("std_guests")
    .update({
      rsvp_status: status,
      rsvp_at: new Date().toISOString(),
      ...(name ? { name } : {}),
      guest_count: guestCount ?? null,
      rsvp_message: message ?? null,
    })
    .eq("token", token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
