"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#fffef9]/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-2xl tracking-wide text-[#2c2c2c]"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
          >
            Yes
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: "Comment ça marche", href: "#comment-ca-marche" },
            { label: "Fonctionnalités", href: "#fonctionnalites" },
            { label: "Tarifs", href: "#tarifs" },
            { label: "Trouver une liste", href: "/trouver" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-light tracking-widest uppercase text-[#7a7370] hover:text-[#2c2c2c] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/connexion"
            className="text-sm tracking-widest uppercase text-[#7a7370] hover:text-[#2c2c2c] transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/creer"
            className="px-6 py-3 bg-[#2c2c2c] text-white text-xs tracking-widest uppercase hover:bg-[#9e6b5c] transition-colors duration-300"
          >
            Créer ma liste
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#2c2c2c]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#fffef9] border-t border-[#f0e6e2] px-6 py-8 flex flex-col gap-6">
          {[
            { label: "Comment ça marche", href: "#comment-ca-marche" },
            { label: "Fonctionnalités", href: "#fonctionnalites" },
            { label: "Tarifs", href: "#tarifs" },
            { label: "Trouver une liste", href: "/trouver" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm tracking-widest uppercase text-[#7a7370]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/creer"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-6 py-3 bg-[#2c2c2c] text-white text-xs tracking-widest uppercase text-center"
          >
            Créer ma liste
          </Link>
        </div>
      )}
    </header>
  );
}
