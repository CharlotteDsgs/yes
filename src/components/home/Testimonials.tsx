const testimonials = [
  {
    quote:
      "Notre page était exactement comme je l'imaginais. Nos invités nous ont dit que c'était la plus belle liste de mariage qu'ils avaient vue.",
    names: "Camille & Édouard",
    date: "Mariés en juin 2024",
    location: "Lyon",
  },
  {
    quote:
      "Simple, rapide, et tellement plus beau que les autres plateformes. Le virement a été fait en 48h, sans aucun problème.",
    names: "Sophie & Maxime",
    date: "Mariés en septembre 2024",
    location: "Paris",
  },
  {
    quote:
      "J'ai personnalisé ma liste en 30 minutes. Le résultat était parfait. Je recommande à tous les couples.",
    names: "Amandine & Thomas",
    date: "Mariés en avril 2025",
    location: "Bordeaux",
  },
];

export default function Testimonials() {
  return (
    <section className="py-32 bg-[#FFF0F4]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#6D1D3E] mb-4"
            style={{ fontFamily: "var(--font-display)" }}>
            Ils nous font confiance
          </p>
          <h2
            className="text-4xl md:text-5xl font-normal text-[#0A0A0A] leading-tight uppercase tracking-wide"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Des couples
            <br />
            <span className="text-[#6D1D3E]">comblés.</span>
          </h2>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#D4889A]/40">
          {testimonials.map((t) => (
            <div
              key={t.names}
              className="bg-[#FFF0F4] p-10 flex flex-col justify-between gap-8 hover:bg-white transition-colors duration-300"
            >
              <div>
                <span
                  className="text-7xl font-extrabold text-[#A8304A] leading-none block mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  "
                </span>
                <p
                  className="text-lg text-[#0A0A0A] leading-relaxed font-light"
                >
                  {t.quote}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#6D1D3E] flex items-center justify-center text-white text-sm font-bold"
                  style={{ fontFamily: "var(--font-display)" }}>
                  {t.names.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A]"
                    style={{ fontFamily: "var(--font-display)" }}>
                    {t.names}
                  </p>
                  <p className="text-xs text-[#888] tracking-wide mt-0.5">
                    {t.date} · {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
