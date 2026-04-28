import Link from "next/link";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section id="tarifs" className="py-32 bg-[#FFF0F4]">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#6D1D3E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
            Transparent &amp; simple
          </p>
          <h2
            className="text-4xl md:text-5xl font-normal text-[#0A0A0A] leading-tight uppercase tracking-wide mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Des tarifs
            <br />
            <span className="text-[#A8304A]">honnêtes.</span>
          </h2>
          <p className="text-base text-[#888] font-light max-w-xl mx-auto">
            Wedy est gratuit. On prélève une petite commission uniquement quand vos invités participent — pas avant.
          </p>
        </div>

        {/* Commission centrale */}
        <div className="bg-[#6D1D3E] text-white p-12 md:p-16 text-center mb-8">
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#D4889A] mb-6"
            style={{ fontFamily: "var(--font-display)" }}>
            Commission par transaction
          </p>
          <div className="flex items-center justify-center gap-6 md:gap-12 mb-8 flex-wrap">
            <div>
              <span className="text-7xl md:text-8xl font-extrabold text-white leading-none"
                style={{ fontFamily: "var(--font-display)" }}>
                1,65%
              </span>
              <p className="text-sm text-[#D4889A] mt-2" style={{ fontFamily: "var(--font-display)" }}>
                du montant
              </p>
            </div>
            <span className="text-4xl text-[#D4889A] font-light">+</span>
            <div>
              <span className="text-7xl md:text-8xl font-extrabold text-white leading-none"
                style={{ fontFamily: "var(--font-display)" }}>
                0,30€
              </span>
              <p className="text-sm text-[#D4889A] mt-2" style={{ fontFamily: "var(--font-display)" }}>
                fixe
              </p>
            </div>
          </div>

          <p className="text-white/60 text-sm font-light mb-10">
            Exemple : un invité contribue 100€ → vous recevez <strong className="text-white font-semibold">98,05€</strong>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            {[
              { label: "Cartes européennes", detail: "Visa, Mastercard, CB" },
              { label: "Paiement sécurisé", detail: "Via Stripe, leader mondial" },
              { label: "Virement sous 2-5 jours", detail: "Directement sur votre compte" },
            ].map(({ label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <Check size={14} className="text-[#D4889A] mt-0.5 flex-shrink-0" strokeWidth={3} />
                <div>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>{label}</p>
                  <p className="text-xs text-white/50 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note cartes non-européennes */}
        <p className="text-center text-xs text-[#aaa] mb-14">
          Cartes hors Europe (USA, Asie…) : 2,5% + 0,30€ — frais appliqués par Stripe.
        </p>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/creer"
            className="inline-block px-10 py-4 bg-[#0A0A0A] text-white text-xs font-bold tracking-[0.25em] uppercase hover:bg-[#6D1D3E] transition-colors duration-200"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Créer ma liste gratuitement
          </Link>
        </div>

      </div>
    </section>
  );
}
