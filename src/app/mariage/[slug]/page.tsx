import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import RegistryClient from "./PublicRegistry";

export const dynamic = "force-dynamic";

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RegistryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: registry } = await supabase
    .from("registries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!registry) notFound();

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("partner1_name, partner2_name, wedding_date")
    .eq("id", registry.user_id)
    .single();

  // Fallback: if RLS blocks profile read (anonymous visitor), extract names from registry title
  let profile = profileRaw;
  if (!profileRaw?.partner1_name || !profileRaw?.partner2_name) {
    const match = registry.title?.match(/^Liste de mariage de (.+) & (.+)$/);
    if (match) {
      profile = {
        ...profileRaw,
        partner1_name: profileRaw?.partner1_name || match[1],
        partner2_name: profileRaw?.partner2_name || match[2],
      } as typeof profileRaw;
    }
  }

  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("registry_id", registry.id)
    .order("display_order", { ascending: true });

  return (
    <RegistryClient
      registry={registry}
      profile={profile}
      gifts={gifts ?? []}
    />
  );
}
