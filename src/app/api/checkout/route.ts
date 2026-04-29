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

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { giftId, giftTitle, amount, registrySlug, contributorName, contributorEmail, message } =
      await request.json();

    // Fetch registry to get Stripe Connect account
    const supabase = createAdminClient();
    const { data: registry } = await supabase
      .from("registries")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("slug", registrySlug)
      .single();

    if (!registry?.stripe_account_id || !registry?.stripe_charges_enabled) {
      return NextResponse.json(
        { error: "Les mariés n'ont pas encore connecté leur compte Stripe. Les paiements ne sont pas encore disponibles." },
        { status: 400 }
      );
    }

    // Guest pays: contribution + 2% Wedy fee (on top)
    const wedyFeePct = parseFloat(process.env.WEDY_COMMISSION_PCT ?? "2") / 100;
    const contributionCents = Math.round(amount * 100);
    const wedyFeeCents = Math.round(contributionCents * wedyFeePct);
    const totalChargeCents = contributionCents + wedyFeeCents; // what guest actually pays

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: giftTitle,
              description: `Participation de ${contributorName} · dont ${(wedyFeePct * 100).toFixed(0)}% frais de service`,
            },
            unit_amount: totalChargeCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: wedyFeeCents,
        transfer_data: {
          destination: registry.stripe_account_id,
        },
      },
      metadata: {
        giftId,
        registrySlug,
        contributorName,
        contributorEmail,
        message: message || "",
        amount: String(amount), // the contribution amount (not total charged)
      },
      customer_email: contributorEmail,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/mariage/${registrySlug}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/mariage/${registrySlug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
