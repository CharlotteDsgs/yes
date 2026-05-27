const cards = [
  {
    bg: "#7A1535",
    title: "Ajoutez n'importe quel cadeau",
    description: "Composez votre liste de cadeaux sans contrainte ni obligation d'achat",
    photo: "/screenshot-liste-cadeaux.png",
    alt: "Grille de cadeaux Weddy",
  },
  {
    bg: "#A84060",
    title: "Personnalisez le design de votre liste",
    description: "Créez une liste de mariage qui vous ressemble grâce à l'outil dédié, facile à prendre en main",
    photo: "/screenshot-cadeaux.png",
    alt: "Éditeur de design Weddy",
  },
  {
    bg: "#C4607A",
    title: "Gérez votre cagnotte en temps réel",
    description: "Gérez les cadeaux et les dons reçus depuis l'interface dédiée. Votre argent n'est jamais bloqué",
    photo: "/screenshot-cadeaux3.png",
    alt: "Dashboard Weddy",
  },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="py-24" style={{ background: "#FFF5F7" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* Title */}
        <h2
          className="text-center text-3xl md:text-4xl text-[#1a1a1a] mb-14 leading-snug"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          Créez une liste de mariage personnalisée en quelques clics
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-2xl overflow-hidden p-6 gap-5"
              style={{ backgroundColor: card.bg }}
            >
              {/* Card title */}
              <h3
                className="text-xl font-bold text-white text-center leading-snug"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {card.title}
              </h3>

              {/* Photo */}
              <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img
                  src={card.photo}
                  alt={card.alt}
                  className="w-full h-full object-cover object-top"
                  style={{ transform: "rotate(-6deg) scale(1.18)", transformOrigin: "center top" }}
                />
              </div>

              {/* Description */}
              <p
                className="text-sm text-white/80 text-center leading-relaxed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <a
            href="/creer"
            className="px-8 py-4 rounded-full border-2 text-base font-bold transition-colors hover:bg-[#7A1535] hover:text-white hover:border-[#7A1535]"
            style={{ borderColor: "#7A1535", color: "#7A1535", fontFamily: "var(--font-display)" }}
          >
            Créer ma liste de mariage
          </a>
        </div>

      </div>
    </section>
  );
}
