import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#A8304A]">
      {/* Decorative big text in background */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        aria-hidden
      >
        <span
          className="text-[20vw] font-extrabold text-white/10 whitespace-nowrap select-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          YES!
        </span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-40">
        <p className="text-xs font-bold tracking-[0.35em] uppercase text-white/70 mb-6"
          style={{ fontFamily: "var(--font-display)" }}>
          Votre jour J approche
        </p>
        <h2
          className="text-4xl md:text-6xl font-normal text-white leading-tight uppercase tracking-wide mb-10"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Créez votre liste
          <br />
          <span className="text-[#0A0A0A]">dès aujourd'hui.</span>
        </h2>
        <p className="text-base text-white/75 font-light mb-14 max-w-md mx-auto leading-relaxed">
          Gratuit, sans engagement, en 2 minutes. Votre liste peut être en ligne avant la fin de la journée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/creer"
            className="group px-12 py-5 bg-[#0A0A0A] text-white text-sm font-bold tracking-wide uppercase hover:bg-[#6D1D3E] transition-colors duration-200 flex items-center gap-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Commencer maintenant
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </div>

        <p className="mt-10 text-xs font-medium tracking-widest uppercase text-white/50"
          style={{ fontFamily: "var(--font-display)" }}>
          Aucune carte bancaire requise
        </p>
      </div>
    </section>
  );
}
