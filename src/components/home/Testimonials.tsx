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
    <section className="py-32 bg-[#fffef9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs tracking-[0.35em] uppercase text-[#c9a89a] mb-4">
            Ils nous font confiance
          </p>
          <h2
            className="text-5xl md:text-6xl text-[#2c2c2c] leading-tight"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            Des couples
            <span style={{ fontStyle: "italic" }}> comblés</span>
          </h2>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#f0e6e2]">
          {testimonials.map((t) => (
            <div
              key={t.names}
              className="bg-[#fffef9] p-10 flex flex-col justify-between gap-8 hover:bg-[#faf8f5] transition-colors"
            >
              {/* Quote */}
              <div>
                <span
                  className="text-6xl text-[#f0e6e2] leading-none block mb-4"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  "
                </span>
                <p
                  className="text-xl text-[#2c2c2c] leading-relaxed"
                  style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300 }}
                >
                  {t.quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full bg-[#f0e6e2] flex items-center justify-center text-sm text-[#9e6b5c]"
                  style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                >
                  {t.names.charAt(0)}
                </div>
                <div>
                  <p
                    className="text-sm text-[#2c2c2c]"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
                  >
                    {t.names}
                  </p>
                  <p className="text-xs text-[#c9a89a] tracking-wide">
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
