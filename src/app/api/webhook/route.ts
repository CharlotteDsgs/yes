import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { sendContributionNotification, sendContributorConfirmation } from "@/lib/email/resend";

export const dynamic = "force-dynamic";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { giftId, registrySlug, contributorName, contributorEmail, message, amount } =
      session.metadata!;

    const supabase = createAdminClient();

    const { data: registry } = await supabase
      .from("registries")
      .select("id, title, user_id")
      .eq("slug", registrySlug)
      .single();

    if (!registry) return NextResponse.json({ error: "Registry not found" }, { status: 404 });

    const paidAmount = parseFloat(amount);

    await supabase.from("contributions").insert({
      gift_id: giftId,
      registry_id: registry.id,
      contributor_name: contributorName,
      contributor_email: contributorEmail,
      amount: paidAmount,
      message: message || null,
      stripe_payment_intent_id: session.payment_intent as string,
      status: "succeeded",
    });

    const { data: gift } = await supabase
      .from("gifts")
      .select("amount_collected, price, title")
      .eq("id", giftId)
      .single();

    if (gift) {
      const newAmount = Number(gift.amount_collected) + paidAmount;
      await supabase
        .from("gifts")
        .update({
          amount_collected: newAmount,
          is_funded: newAmount >= Number(gift.price),
        })
        .eq("id", giftId);
    }

    // Get couple email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, partner1_name, partner2_name")
      .eq("id", registry.user_id)
      .single();

    const coupleName = profile?.partner1_name && profile?.partner2_name
      ? `${profile.partner1_name} & ${profile.partner2_name}`
      : "les mariés";

    // Send emails (fire and forget)
    if (profile?.email) {
      sendContributionNotification({
        coupleEmail: profile.email,
        contributorName,
        giftTitle: gift?.title ?? "cadeau",
        amount: paidAmount,
        message: message || undefined,
        coupleName,
      }).catch(() => {});
    }

    sendContributorConfirmation({
      contributorEmail,
      contributorName,
      giftTitle: gift?.title ?? "cadeau",
      amount: paidAmount,
      coupleName,
      registrySlug,
    }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
