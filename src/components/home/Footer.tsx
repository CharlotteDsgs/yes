import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#2c2c2c] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="md:col-span-2">
            <span
              className="text-2xl tracking-wide italic text-white block mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Yes
            </span>
            <p className="text-sm text-[#7a7370] font-light leading-relaxed max-w-xs">
              La plateforme de liste de mariage qui allie élégance, simplicité et
              technologie. Pour les couples qui ont du goût.
            </p>
          </div>

          {/* Liens */}
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#c9a89a] mb-6">
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
                  <Link
                    href={item.href}
                    className="text-sm text-[#7a7370] hover:text-white transition-colors font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#c9a89a] mb-6">
              Légal
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "CGU", href: "/cgu" },
                { label: "Politique de confidentialité", href: "/confidentialite" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#7a7370] hover:text-white transition-colors font-light"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#3c3c3c] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#7a7370] font-light">
            © 2024 Yes. Fait avec soin en France.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#8a9e8c]" />
            <p className="text-xs text-[#7a7370] font-light">
              Tous les systèmes opérationnels
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
