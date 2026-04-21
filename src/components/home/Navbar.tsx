"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-yes.png"
            alt="Yes!"
            width={72}
            height={36}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: "Comment ça marche", href: "#comment-ca-marche" },
            { label: "Fonctionnalités", href: "#fonctionnalites" },
            { label: "Tarifs", href: "#tarifs" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium tracking-wide text-[#0A0A0A] hover:text-[#E8001A] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/connexion"
            className="text-sm font-medium text-[#0A0A0A] hover:text-[#E8001A] transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/creer"
            className="px-6 py-3 bg-[#E8001A] text-white text-sm font-bold tracking-wide uppercase hover:bg-[#B8001A] transition-colors duration-200"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Créer ma liste
          </Link>
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
          {[
            { label: "Comment ça marche", href: "#comment-ca-marche" },
            { label: "Fonctionnalités", href: "#fonctionnalites" },
            { label: "Tarifs", href: "#tarifs" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-[#0A0A0A]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/creer"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-6 py-4 bg-[#E8001A] text-white text-sm font-bold tracking-wide uppercase text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Créer ma liste
          </Link>
        </div>
      )}
    </header>
  );
}
