import {
  Palette,
  Gift,
  CreditCard,
  Bell,
  Users,
  BarChart3,
  Share2,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Thèmes personnalisables",
    description:
      "Choisissez parmi nos thèmes soigneusement designés. Modifiez couleurs, typographies et photos pour une page qui vous ressemble.",
  },
  {
    icon: Gift,
    title: "Cadeaux libres",
    description:
      "Ajoutez n'importe quel cadeau — avec votre propre photo, description et prix. Pas de catalogue imposé.",
  },
  {
    icon: CreditCard,
    title: "Cagnotte intégrée",
    description:
      "Les invités contribuent en ligne, en partie ou en totalité. Paiement sécurisé par Stripe.",
  },
  {
    icon: Bell,
    title: "Notifications en temps réel",
    description:
      "Recevez un email à chaque don, avec le message de votre invité. Remerciez-les directement depuis l'app.",
  },
  {
    icon: Users,
    title: "Gestion des invités",
    description:
      "Gérez votre liste de convives, envoyez des invitations et suivez les confirmations de présence.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord complet",
    description:
      "Visualisez en un coup d'œil vos cadeaux financés, les montants collectés et les virements disponibles.",
  },
  {
    icon: Share2,
    title: "URL personnalisée",
    description:
      "Partagez une adresse élégante du type yes.fr/charlotte-et-julien, facile à retenir.",
  },
  {
    icon: Heart,
    title: "Page de mariage incluse",
    description:
      "Au-delà de la liste : partagez votre histoire, les détails de la cérémonie et des photos de votre couple.",
  },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="py-32 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#c9a89a] mb-4">
              Tout ce dont vous avez besoin
            </p>
            <h2
              className="text-5xl md:text-6xl text-[#2c2c2c] leading-tight"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
            >
              Des fonctionnalités
              <br />
              <span style={{ fontStyle: "italic" }}>pensées pour vous</span>
            </h2>
          </div>
          <p className="text-sm text-[#7a7370] font-light max-w-xs leading-relaxed">
            Tout ce que vous attendez d'une liste de mariage moderne, sans
            compromis sur le design.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e8ede9]">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#faf8f5] p-8 flex flex-col gap-5 group hover:bg-[#fffef9] transition-colors duration-300"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-[#c9a89a]/40 group-hover:border-[#c9a89a] transition-colors duration-300">
                  <Icon size={18} className="text-[#c9a89a]" strokeWidth={1.5} />
                </div>
                <h3
                  className="text-lg text-[#2c2c2c]"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-[#7a7370] font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
