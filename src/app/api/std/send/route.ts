import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Resend } from "resend";

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
    const { registryId, guests, message } = await request.json();
    // guests: { name: string; email: string }[]

    if (!registryId || !guests?.length) {
      return NextResponse.json({ error: "Missing registryId or guests" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: registry } = await supabase
      .from("registries")
      .select("slug, title")
      .eq("id", registryId)
      .single();

    if (!registry) return NextResponse.json({ error: "Registry not found" }, { status: 404 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("partner1_name, partner2_name, wedding_date")
      .eq("id", (await supabase.from("registries").select("user_id").eq("id", registryId).single()).data?.user_id)
      .single();

    const coupleName = profile?.partner1_name && profile?.partner2_name
      ? `${profile.partner1_name} & ${profile.partner2_name}`
      : "les mariés";

    const weddingDate = profile?.wedding_date
      ? new Date(profile.wedding_date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "";

    const resend = new Resend(process.env.RESEND_API_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://wedy-app.vercel.app";

    const results = await Promise.allSettled(
      guests.map(async (guest: { name: string; email: string }) => {
        // Upsert guest record
        const { data: existing } = await supabase
          .from("std_guests")
          .select("id, token")
          .eq("registry_id", registryId)
          .eq("email", guest.email.toLowerCase().trim())
          .maybeSingle();

        let token: string;

        if (existing) {
          token = existing.token;
          await supabase.from("std_guests").update({ name: guest.name, sent_at: new Date().toISOString() }).eq("id", existing.id);
        } else {
          const { data: inserted } = await supabase
            .from("std_guests")
            .insert({ registry_id: registryId, name: guest.name, email: guest.email.toLowerCase().trim() })
            .select("token")
            .single();
          token = inserted!.token;
        }

        const rsvpUrl = `${appUrl}/rsvp/${token}`;
        const guestFirstName = guest.name.split(" ")[0];

        await resend.emails.send({
          from: "Wedy <onboarding@resend.dev>",
          to: guest.email,
          subject: `Save the Date — ${coupleName}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 0; color: #2c2c2c; background: #ffffff;">

              <div style="background: linear-gradient(135deg, #6D1D3E 0%, #9e3d60 100%); padding: 48px 40px 40px; text-align: center;">
                <p style="font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin: 0 0 20px; font-family: 'Helvetica Neue', sans-serif;">
                  Wedy · Save the Date
                </p>
                <h1 style="font-size: 42px; font-weight: 300; color: #ffffff; margin: 0; line-height: 1.2; font-style: italic;">
                  ${coupleName}
                </h1>
                ${weddingDate ? `<p style="font-size: 14px; color: rgba(255,255,255,0.75); margin: 16px 0 0; letter-spacing: 0.1em;">${weddingDate}</p>` : ""}
              </div>

              <div style="padding: 40px 40px 32px; background: #fdfaf8;">
                <p style="font-size: 16px; line-height: 1.7; color: #2c2c2c; margin: 0 0 24px;">
                  Cher${guest.name ? ` ${guestFirstName}` : ""},
                </p>
                <p style="font-size: 16px; line-height: 1.7; color: #2c2c2c; margin: 0 0 24px;">
                  ${message || `Nous sommes heureux de vous annoncer notre mariage et espérons vous compter parmi nous lors de cette belle journée.`}
                </p>
                <p style="font-size: 14px; color: #7a7370; margin: 0 0 32px;">
                  Merci de nous confirmer votre présence en cliquant sur le bouton ci-dessous.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${rsvpUrl}"
                    style="display: inline-block; padding: 16px 40px; background: #6D1D3E; color: white; text-decoration: none; font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; font-family: 'Helvetica Neue', sans-serif; border-radius: 2px;">
                    Confirmer ma présence →
                  </a>
                </div>
              </div>

              <div style="padding: 24px 40px; border-top: 1px solid #f0e6e2; text-align: center;">
                <p style="font-size: 11px; color: #c9a89a; margin: 0; letter-spacing: 0.2em; text-transform: uppercase; font-family: 'Helvetica Neue', sans-serif;">
                  Wedy · La liste de mariage qui vous ressemble
                </p>
              </div>
            </div>
          `,
        });
      })
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({ sent, failed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
