import Link from "next/link";
import Image from "next/image";
import WedyLogo from "@/components/WedyLogo";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <WedyLogo size="md" href="/" />
            </div>
            <p className="text-sm text-white/40 font-light leading-relaxed max-w-xs">
              La plateforme de liste de mariage qui allie élégance, simplicité et technologie. Pour les couples qui ont du goût.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#A8304A] mb-6"
              style={{ fontFamily: "var(--font-display)" }}>
              Plateforme
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Créer ma liste", href: "/creer" },
                { label: "Trouver une liste", href: "/trouver" },
                { label: "Comment ça marche", href: "#comment-ca-marche" },
                { label: "Tarifs", href: "#tarifs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/40 hover:text-white transition-colors font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#A8304A] mb-6"
              style={{ fontFamily: "var(--font-display)" }}>
              Légal
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "CGU", href: "/cgu" },
                { label: "Confidentialité", href: "/confidentialite" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/40 hover:text-white transition-colors font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 font-light">
            © 2024 Wedy. Fait avec soin en France.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#A8304A]" />
            <p className="text-xs text-white/30 font-light">
              Tous les systèmes opérationnels
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
