import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Essentiel",
    price: "Gratuit",
    sub: "Pour toujours",
    description: "Tout ce qu'il faut pour une belle liste de mariage.",
    cta: "Commencer gratuitement",
    ctaHref: "/creer",
    featured: false,
    features: [
      "Page de mariage personnalisée",
      "Jusqu'à 20 cadeaux",
      "3 thèmes au choix",
      "Cagnotte en ligne",
      "Notifications par email",
      "Virements bancaires",
    ],
  },
  {
    name: "Premium",
    price: "29€",
    sub: "Paiement unique",
    description: "Pour une expérience sans limite et un design sur-mesure.",
    cta: "Choisir Premium",
    ctaHref: "/creer?plan=premium",
    featured: true,
    features: [
      "Tout l'Essentiel, plus :",
      "Cadeaux illimités",
      "Tous les thèmes (12+)",
      "Palette de couleurs custom",
      "Photo de couverture HD",
      "URL personnalisée",
      "Page histoire du couple",
      "Gestionnaire d'invités",
      "Support prioritaire",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="tarifs" className="py-32 bg-[#faf8f5]">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs tracking-[0.35em] uppercase text-[#c9a89a] mb-4">
            Transparent &amp; simple
          </p>
          <h2
            className="text-5xl md:text-6xl text-[#2c2c2c] leading-tight mb-6"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            Des tarifs
            <span style={{ fontStyle: "italic" }}> honnêtes</span>
          </h2>
          <p className="text-sm text-[#7a7370] font-light">
            Stripe prélève 1,5% + 0,25€ par transaction. Nous, rien de plus.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-10 flex flex-col gap-8 ${
                plan.featured
                  ? "bg-[#2c2c2c] text-white"
                  : "bg-white border border-[#f0e6e2]"
              }`}
            >
              {/* Plan header */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-xs tracking-[0.3em] uppercase ${
                      plan.featured ? "text-[#c9a89a]" : "text-[#7a7370]"
                    }`}
                  >
                    {plan.name}
                  </span>
                  {plan.featured && (
                    <span className="text-[10px] tracking-widest uppercase bg-[#9e6b5c] text-white px-3 py-1">
                      Recommandé
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span
                    className="text-5xl"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
                  >
                    {plan.price}
                  </span>
                </div>
                <p
                  className={`text-xs tracking-widest uppercase mb-4 ${
                    plan.featured ? "text-[#7a7370]" : "text-[#c9a89a]"
                  }`}
                >
                  {plan.sub}
                </p>
                <p
                  className={`text-sm font-light leading-relaxed ${
                    plan.featured ? "text-[#7a7370]" : "text-[#7a7370]"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={14}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.featured ? "text-[#c9a89a]" : "text-[#8a9e8c]"
                      }`}
                    />
                    <span
                      className={`text-sm font-light ${
                        plan.featured ? "text-[#e8ede9]" : "text-[#7a7370]"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaHref}
                className={`mt-auto text-center px-8 py-4 text-xs tracking-[0.25em] uppercase transition-colors duration-300 ${
                  plan.featured
                    ? "bg-white text-[#2c2c2c] hover:bg-[#f0e6e2]"
                    : "bg-[#2c2c2c] text-white hover:bg-[#9e6b5c]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
