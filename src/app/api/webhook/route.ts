import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

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

    const supabase = await createClient();

    // Get registry
    const { data: registry } = await supabase
      .from("registries")
      .select("id")
      .eq("slug", registrySlug)
      .single();

    if (!registry) return NextResponse.json({ error: "Registry not found" }, { status: 404 });

    const paidAmount = parseFloat(amount);

    // Save contribution
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

    // Update gift amount collected
    const { data: gift } = await supabase
      .from("gifts")
      .select("amount_collected, price")
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
  }

  return NextResponse.json({ received: true });
}
