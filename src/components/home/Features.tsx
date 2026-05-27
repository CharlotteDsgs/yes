const cards = [
  {
    title: "Ajoutez n'importe quel cadeau",
    description:
      "Créez chaque cadeau avec votre propre photo, description et prix. Aucun catalogue imposé — votre liste reflète exactement vos envies.",
    photo: "/screenshot-cadeaux2.png",
    alt: "Ajout de cadeaux sur Weddy",
  },
  {
    title: "Personnalisez le rendu",
    description:
      "Choisissez parmi nos thèmes élégants et adaptez couleurs, typographies et photos pour une page qui vous ressemble.",
    photo: "/screenshot-std.png",
    alt: "Personnalisation du thème Weddy",
  },
  {
    title: "Monitorez les participations à chaque instant",
    description:
      "Suivez en temps réel les contributions de vos invités, les montants collectés et les virements disponibles sur votre tableau de bord.",
    photo: "/screenshot-cadeaux3.png",
    alt: "Tableau de bord des participations",
  },
];

export default function Features() {
  return (
    <section id="fonctionnalites" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-xs font-bold tracking-[0.35em] uppercase text-[#6D1D3E]/60 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Liste de mariage
          </p>
          <h2
            className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            Créez rapidement une liste de mariage{" "}
            <em>personnalisée</em>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col rounded-2xl overflow-hidden border border-[#e8ddd9]"
              style={{ background: "#fdf8f6" }}
            >
              {/* Photo area */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
                <img
                  src={card.photo}
                  alt={card.alt}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Text */}
              <div className="p-7 flex flex-col gap-3">
                <h3
                  className="text-lg text-[#1a1a1a]"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 400 }}
                >
                  {card.title}
                </h3>
                <p className="text-sm text-[#888] font-light leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
