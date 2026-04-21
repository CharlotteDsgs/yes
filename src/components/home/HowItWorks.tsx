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
      "Les contributions sont versées sur votre compte bancaire, sans frais supplémentaires. À tout moment.",
  },
];

export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="py-32 bg-[#fffef9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-24">
          <p className="text-xs tracking-[0.35em] uppercase text-[#c9a89a] mb-4">
            Simple &amp; élégant
          </p>
          <h2
            className="text-5xl md:text-6xl text-[#2c2c2c] leading-tight"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            Quatre étapes,
            <br />
            <span style={{ fontStyle: "italic" }}>une liste parfaite</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#f0e6e2]">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="bg-[#fffef9] p-10 flex flex-col gap-6 group hover:bg-[#faf8f5] transition-colors duration-300"
            >
              <span
                className="text-6xl text-[#f0e6e2] leading-none"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
              >
                {step.number}
              </span>
              <div
                className="w-8 h-px bg-[#c9a89a] group-hover:w-16 transition-all duration-500"
              />
              <h3
                className="text-xl text-[#2c2c2c]"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-[#7a7370] font-light leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
