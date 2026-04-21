import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: registry } = await supabase
    .from("registries")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: gifts } = registry
    ? await supabase
        .from("gifts")
        .select("*")
        .eq("registry_id", registry.id)
        .order("display_order")
    : { data: [] };

  const { data: contributions } = registry
    ? await supabase
        .from("contributions")
        .select("*")
        .eq("registry_id", registry.id)
        .eq("status", "succeeded")
    : { data: [] };

  const totalCollected = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;
  const totalGoal = gifts?.reduce((sum, g) => sum + Number(g.price), 0) ?? 0;

  return (
    <DashboardClient
      profile={profile}
      registry={registry}
      gifts={gifts ?? []}
      totalCollected={totalCollected}
      totalGoal={totalGoal}
      contributions={contributions ?? []}
    />
  );
}
