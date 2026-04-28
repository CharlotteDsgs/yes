"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import WedyLogo from "@/components/WedyLogo";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Gift, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [registrySlug, setRegistrySlug] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("registries")
        .select("slug")
        .eq("user_id", user.id)
        .single();
      if (data) setRegistrySlug(data.slug);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const navItems = [
    { href: "/dashboard/mariage", label: "Votre mariage", Icon: Heart },
    { href: "/dashboard", label: "Liste de mariage", Icon: Gift },
  ];

  const labelStyle = {
    opacity: expanded ? 1 : 0,
    width: expanded ? "auto" : 0,
    overflow: "hidden" as const,
    whiteSpace: "nowrap" as const,
    transition: "opacity 150ms ease",
    pointerEvents: "none" as const,
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-[#f0e6e2] z-30 overflow-hidden"
      style={{
        backgroundColor: "#FAFAFA",
        width: expanded ? "220px" : "64px",
        transition: "width 220ms ease",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="border-b border-[#f0e6e2] flex items-center h-16 flex-shrink-0 px-3 gap-2 overflow-hidden">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/fox_no-bg.png" alt="Wedy" width={36} height={36} className="object-contain flex-shrink-0" />
          <span
            style={{
              fontFamily: "var(--font-bagel)",
              fontSize: "1.3rem",
              color: "#7A1B45",
              lineHeight: 1,
              whiteSpace: "nowrap",
              opacity: expanded ? 1 : 0,
              transition: "opacity 150ms ease",
            }}
          >
            WEDY
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors"
              style={{
                backgroundColor: active ? "rgba(109,29,62,0.08)" : "transparent",
                color: active ? "#6D1D3E" : "#4a4a4a",
                fontFamily: "var(--font-display)",
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              <span style={labelStyle}>{label}</span>
            </Link>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-[#f0e6e2]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors hover:bg-[rgba(109,29,62,0.05)]"
          style={{ color: "#9a9a9a", fontFamily: "var(--font-display)" }}
        >
          <LogOut size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <span style={labelStyle}>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
