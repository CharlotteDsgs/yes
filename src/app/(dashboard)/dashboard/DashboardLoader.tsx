"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardClient from "./DashboardClient";

export default function DashboardLoader() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/connexion");
        return;
      }

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

      if (!registry) {
        router.push("/creer");
        return;
      }

      const { data: gifts } = await supabase
        .from("gifts")
        .select("*")
        .eq("registry_id", registry.id)
        .order("display_order");

      const { data: contributions } = await supabase
        .from("contributions")
        .select("*")
        .eq("registry_id", registry.id)
        .eq("status", "succeeded");

      const totalCollected = contributions?.reduce((sum: number, c: any) => sum + Number(c.amount), 0) ?? 0;
      const totalGoal = gifts?.reduce((sum: number, g: any) => sum + Number(g.price), 0) ?? 0;

      setData({ profile, registry, gifts: gifts ?? [], totalCollected, totalGoal, contributions: contributions ?? [] });
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <p className="text-sm text-[#7a7370] font-light tracking-widest">Chargement...</p>
      </div>
    );
  }

  if (!data) return null;

  return <DashboardClient {...data} />;
}
