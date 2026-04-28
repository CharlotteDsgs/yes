"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const navLinks = [
    { label: "Comment ça marche", href: isHome ? "#comment-ca-marche" : "/#comment-ca-marche" },
    { label: "Fonctionnalités", href: isHome ? "#fonctionnalites" : "/#fonctionnalites" },
    { label: "Qui sommes-nous", href: isHome ? "#qui-sommes-nous" : "/#qui-sommes-nous" },
    { label: "Tarifs", href: isHome ? "#tarifs" : "/#tarifs" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FFF0F4]/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span
            style={{
              fontFamily: "var(--font-bagel)",
              fontSize: "1.75rem",
              color: "#7A1B45",
              lineHeight: 1,
              letterSpacing: "0.01em",
            }}
          >
            WEDY
          </span>
          <Image
            src="/fox_no-bg.png"
            alt="Wedy fox"
            width={44}
            height={44}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide text-[#0A0A0A] hover:text-[#6D1D3E] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-[#0A0A0A] hover:text-[#6D1D3E] transition-colors"
              >
                Mon tableau de bord
              </Link>
              <button
                onClick={handleSignOut}
                className="px-6 py-3 bg-[#6D1D3E] text-white text-sm font-bold rounded-full hover:bg-[#5A1733] transition-colors duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-sm font-medium text-[#0A0A0A] hover:text-[#6D1D3E] transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/creer"
                className="px-6 py-3 bg-[#6D1D3E] text-white text-sm font-bold rounded-full hover:bg-[#5A1733] transition-colors duration-200"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Créer ma liste
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#0A0A0A]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#F2F2F2] px-6 py-8 flex flex-col gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-[#0A0A0A]"
            >
              {item.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-[#0A0A0A]"
              >
                Mon tableau de bord
              </Link>
              <button
                onClick={handleSignOut}
                className="mt-2 px-6 py-4 bg-[#6D1D3E] text-white text-sm font-bold tracking-wide uppercase text-center"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/creer"
              onClick={() => setMenuOpen(false)}
              className="mt-2 px-6 py-4 bg-[#6D1D3E] text-white text-sm font-bold tracking-wide uppercase text-center"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Créer ma liste
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
