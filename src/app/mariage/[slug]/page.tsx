import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegistryClient from "./RegistryClient";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("partner1_name, partner2_name, wedding_date")
    .eq("id", registry.user_id)
    .single();

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
