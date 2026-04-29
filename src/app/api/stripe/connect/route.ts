import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// POST — start onboarding: create Express account + return onboarding URL
export async function POST(request: Request) {
  const { registryId } = await request.json();
  if (!registryId) return NextResponse.json({ error: "Missing registryId" }, { status: 400 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createAdminClient();

  const { data: registry } = await supabase
    .from("registries")
    .select("stripe_account_id")
    .eq("id", registryId)
    .single();

  let accountId = registry?.stripe_account_id as string | null;

  if (!accountId) {
    const account = await stripe.accounts.create({ type: "express" });
    accountId = account.id;
    await supabase.from("registries").update({ stripe_account_id: accountId }).eq("id", registryId);
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_refresh=1`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripe_ok=1`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}

// GET — check if account is fully enabled
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const registryId = searchParams.get("registryId");
  if (!registryId) return NextResponse.json({ enabled: false });

  const supabase = createAdminClient();
  const { data: registry } = await supabase
    .from("registries")
    .select("stripe_account_id, stripe_charges_enabled")
    .eq("id", registryId)
    .single();

  if (!registry?.stripe_account_id) return NextResponse.json({ enabled: false });

  // If already marked enabled in DB, trust it
  if (registry.stripe_charges_enabled) return NextResponse.json({ enabled: true });

  // Otherwise check live with Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const account = await stripe.accounts.retrieve(registry.stripe_account_id);
  const enabled = account.charges_enabled ?? false;

  if (enabled) {
    await supabase.from("registries")
      .update({ stripe_charges_enabled: true })
      .eq("id", registryId);
  }

  return NextResponse.json({ enabled });
}
