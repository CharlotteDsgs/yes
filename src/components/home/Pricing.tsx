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
    <section id="tarifs" className="py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#E8001A] mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
            Transparent &amp; simple
          </p>
          <h2
            className="text-5xl md:text-6xl font-extrabold text-[#0A0A0A] leading-[0.92] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Des tarifs
            <br />
            <span className="text-[#FF4D7D]">honnêtes.</span>
          </h2>
          <p className="text-sm text-[#888] font-light">
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
                  ? "bg-[#E8001A] text-white"
                  : "bg-white border-2 border-[#F2F2F2]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-xs font-bold tracking-[0.3em] uppercase ${
                      plan.featured ? "text-[#FFB3C8]" : "text-[#888]"
                    }`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {plan.name}
                  </span>
                  {plan.featured && (
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-white text-[#E8001A] px-3 py-1"
                      style={{ fontFamily: "var(--font-display)" }}>
                      Recommandé
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span
                    className={`text-6xl font-extrabold ${plan.featured ? "text-white" : "text-[#0A0A0A]"}`}
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {plan.price}
                  </span>
                </div>
                <p
                  className={`text-xs font-bold tracking-widest uppercase mb-4 ${
                    plan.featured ? "text-[#FFB3C8]" : "text-[#888]"
                  }`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {plan.sub}
                </p>
                <p
                  className={`text-sm font-light leading-relaxed ${
                    plan.featured ? "text-white/75" : "text-[#888]"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={14}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.featured ? "text-[#FFB3C8]" : "text-[#E8001A]"
                      }`}
                      strokeWidth={3}
                    />
                    <span
                      className={`text-sm font-light ${
                        plan.featured ? "text-white/85" : "text-[#0A0A0A]"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`mt-auto text-center px-8 py-4 text-xs font-bold tracking-[0.25em] uppercase transition-colors duration-200 ${
                  plan.featured
                    ? "bg-white text-[#E8001A] hover:bg-[#FFE8EE]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#E8001A]"
                }`}
                style={{ fontFamily: "var(--font-display)" }}
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
