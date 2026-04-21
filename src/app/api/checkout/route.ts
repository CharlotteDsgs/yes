import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { giftId, giftTitle, amount, registrySlug, contributorName, contributorEmail, message } =
      await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: giftTitle,
              description: `Participation au cadeau de mariage : ${giftTitle}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        giftId,
        registrySlug,
        contributorName,
        contributorEmail,
        message: message || "",
        amount: String(amount),
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
