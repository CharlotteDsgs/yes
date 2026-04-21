const steps = [
  {
    number: "01",
    title: "Créez votre compte",
    description:
      "En moins de 2 minutes. Renseignez vos prénoms, la date de votre mariage, et choisissez un thème.",
  },
  {
    number: "02",
    title: "Composez votre liste",
    description:
      "Ajoutez des cadeaux depuis notre catalogue ou créez les vôtres — avec photo, description et prix libre.",
  },
  {
    number: "03",
    title: "Partagez votre page",
    description:
      "Envoyez le lien à vos invités. Ils découvrent votre univers et participent facilement en ligne.",
  },
  {
    number: "04",
    title: "Recevez les fonds",
    description:
      "Les contributions sont versées sur votre compte bancaire. À tout moment, sans frais supplémentaires.",
  },
];

export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-32 bg-[#E8001A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#FF4D7D] mb-4"
              style={{ fontFamily: "var(--font-display)" }}>
              Simple &amp; rapide
            </p>
            <h2
              className="text-5xl md:text-7xl font-extrabold text-white leading-[0.92]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Quatre étapes,
              <br />
              une liste parfaite.
            </h2>
          </div>
          <p className="text-base text-white/60 font-light max-w-xs leading-relaxed">
            Pas de complexité, pas de mauvaise surprise. Juste ce qu'il faut pour une liste qui vous ressemble.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-[#E8001A] p-10 flex flex-col gap-6 group hover:bg-[#B8001A] transition-colors duration-300"
            >
              <span
                className="text-7xl font-extrabold text-white/15 leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.number}
              </span>
              <div className="w-8 h-0.5 bg-[#FF4D7D] group-hover:w-16 transition-all duration-500" />
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-white/65 font-light leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
