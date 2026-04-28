import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegistryClient from "./PublicRegistry";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RegistryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

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
    .order("display_order");

  return (
    <RegistryClient
      registry={registry}
      profile={profile}
      gifts={gifts ?? []}
    />
  );
}
