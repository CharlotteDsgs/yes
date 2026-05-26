import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://weddy.fr";

    // Load envelope image as base64 data URI for email embedding
    let envelopeDataUri = "";
    try {
      const envImgPath = path.join(process.cwd(), "public", "envelope-email.jpg");
      const imgBuffer = fs.readFileSync(envImgPath);
      envelopeDataUri = `data:image/jpeg;base64,${imgBuffer.toString("base64")}`;
    } catch {
      envelopeDataUri = `${appUrl}/envelope-email.jpg`;
    }

    const results = await Promise.allSettled(
      guests.map(async (guest: { name: string; email: string; customLabels?: string[]; customNote?: string }) => {
        // Upsert guest record
        const { data: existing } = await supabase
          .from("std_guests")
          .select("id, token")
          .eq("registry_id", registryId)
          .eq("email", guest.email.toLowerCase().trim())
          .maybeSingle();

        let token: string;
        const customLabelsPayload = guest.customLabels?.length ? guest.customLabels : null;
        const customNotePayload = guest.customNote?.trim() || null;

        if (existing) {
          token = existing.token;
          await supabase.from("std_guests").update({ name: guest.name, sent_at: new Date().toISOString(), rsvp_status: "pending", rsvp_at: null, custom_labels: customLabelsPayload, custom_note: customNotePayload }).eq("id", existing.id);
        } else {
          const { data: inserted } = await supabase
            .from("std_guests")
            .insert({ registry_id: registryId, name: guest.name, email: guest.email.toLowerCase().trim(), custom_labels: customLabelsPayload, custom_note: customNotePayload })
            .select("token")
            .single();
          token = inserted!.token;
        }

        const rsvpUrl = `${appUrl}/rsvp/${token}`;
        const guestFirstName = guest.name.split(" ")[0];

        await resend.emails.send({
          from: "Weddy <no-reply@weddy.fr>",
          to: guest.email,
          subject: `Save the Date — ${coupleName}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 0; color: #2c2c2c; background: #ffffff;">

              <div style="background: linear-gradient(135deg, #6D1D3E 0%, #9e3d60 100%); padding: 48px 40px 40px; text-align: center;">
                <p style="font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin: 0 0 20px; font-family: 'Helvetica Neue', sans-serif;">
                  Weddy · Save the Date
                </p>
                <h1 style="font-size: 42px; font-weight: 300; color: #ffffff; margin: 0; line-height: 1.2; font-style: italic;">
                  ${coupleName}
                </h1>
                ${weddingDate ? `<p style="font-size: 14px; color: rgba(255,255,255,0.75); margin: 16px 0 0; letter-spacing: 0.1em;">${weddingDate}</p>` : ""}
              </div>

              <div style="padding: 40px 40px 32px; background: #fdfaf8;">
                <p style="font-size: 16px; line-height: 1.7; color: #2c2c2c; margin: 0 0 24px;">
                  ${profile?.partner1_name && profile?.partner2_name ? `${profile.partner1_name} et ${profile.partner2_name} vous ont envoyé une invitation.` : `Les mariés vous ont envoyé une invitation.`}
                </p>
                ${message ? `<p style="font-size: 15px; line-height: 1.7; color: #4a4a4a; margin: 0 0 24px; font-style: italic;">${message}</p>` : ""}

                <div style="text-align: center; margin: 32px 0 40px;">
                  <a href="${rsvpUrl}"
                    style="display: inline-block; padding: 16px 40px; background: #6D1D3E; color: white; text-decoration: none; font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase; font-family: 'Helvetica Neue', sans-serif; border-radius: 2px;">
                    Ouvrir l'invitation →
                  </a>
                </div>

                <div style="position: relative; max-width: 460px; margin: 0 auto;">
                  <img src="${envelopeDataUri}" alt="Enveloppe" style="width: 100%; display: block; border-radius: 6px;" />
                  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; padding-top: 10%;">
                    <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 300; color: #8a7e6a; font-style: italic; margin: 0; text-align: center; letter-spacing: 0.04em;">
                      ${guest.name}
                    </p>
                  </div>
                </div>
              </div>

              <div style="padding: 24px 40px; border-top: 1px solid #f0e6e2; text-align: center;">
                <p style="font-size: 11px; color: #c9a89a; margin: 0; letter-spacing: 0.2em; text-transform: uppercase; font-family: 'Helvetica Neue', sans-serif;">
                  Weddy · La liste de mariage qui vous ressemble
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
