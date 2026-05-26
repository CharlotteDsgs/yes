import { type Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import RsvpTokenClient from "./RsvpTokenClient";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ token: string }> }
): Promise<Metadata> {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: guest } = await supabase
    .from("std_guests")
    .select("registry_id")
    .eq("token", token)
    .single();

  if (!guest) return { title: "Votre invitation · Weddy" };

  const { data: registry } = await supabase
    .from("registries")
    .select("user_id")
    .eq("id", guest.registry_id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("partner1_name, partner2_name")
    .eq("id", registry?.user_id)
    .single();

  const title = profile?.partner1_name && profile?.partner2_name
    ? `Vous êtes invité·e au mariage de ${profile.partner1_name} & ${profile.partner2_name}`
    : "Votre invitation · Weddy";

  const description = "Ouvrez votre invitation et répondez à la demande de présence.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/envelope-email.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/envelope-email.jpg"],
    },
  };
}

export default function Page() {
  return <RsvpTokenClient />;
}
