import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-40 bg-[#faf8f5] relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, #f0e6e2 0%, transparent 50%), radial-gradient(circle at 70% 50%, #e8ede9 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-[#c9a89a] mb-6">
          Votre jour J approche
        </p>
        <h2
          className="text-5xl md:text-7xl text-[#2c2c2c] leading-[0.95] mb-10"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
        >
          Créez votre liste
          <br />
          <span style={{ fontStyle: "italic", color: "#9e6b5c" }}>
            dès aujourd'hui
          </span>
        </h2>
        <p className="text-base text-[#7a7370] font-light mb-14 max-w-md mx-auto leading-relaxed">
          Gratuit, sans engagement, en 2 minutes. Votre liste peut être en ligne
          avant la fin de la journée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/creer"
            className="group px-12 py-4 bg-[#2c2c2c] text-white text-xs tracking-[0.25em] uppercase hover:bg-[#9e6b5c] transition-colors duration-400 flex items-center gap-3"
          >
            Commencer maintenant
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-[#c9a89a]">
          <div className="w-12 h-px bg-[#c9a89a]" />
          <span className="text-xs tracking-widest uppercase">
            Aucune carte bancaire requise
          </span>
          <div className="w-12 h-px bg-[#c9a89a]" />
        </div>
      </div>
    </section>
  );
}
