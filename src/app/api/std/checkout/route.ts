import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const PLANS = {
  essentiel: {
    amount: 2500, // cents
    name: "Save the Date · Formule Essentielle",
    description: "Carte animée + lien de partage public",
  },
  premium: {
    amount: 7000,
    name: "Save the Date · Formule Premium",
    description: "Carte animée + RSVP + Gestion des invités + Envoi par email",
  },
} as const;

export async function POST(request: Request) {
  try {
    const { plan, registryId } = await request.json();

    if (!plan || !registryId || !(plan in PLANS)) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weddy.fr";
    const p = PLANS[plan as keyof typeof PLANS];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: p.name, description: p.description },
            unit_amount: p.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { type: "std_plan", plan, registryId },
      success_url: `${appUrl}/dashboard/invitations?std_paid=${plan}`,
      cancel_url: `${appUrl}/dashboard/invitations`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
