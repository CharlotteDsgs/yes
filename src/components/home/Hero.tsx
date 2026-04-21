import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#faf8f5]">
      {/* Decorative background shapes */}
      <div
        className="absolute top-0 right-0 w-[45vw] h-[70vh] opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at top right, #f0e6e2 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[35vw] h-[50vh] opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at bottom left, #e8ede9 0%, transparent 70%)",
        }}
      />

      {/* Fine line decoration */}
      <div className="absolute top-1/2 -translate-y-1/2 left-8 hidden lg:flex flex-col items-center gap-3">
        <div className="w-px h-20 bg-[#c9a89a] opacity-40" />
        <span
          className="text-xs tracking-[0.3em] uppercase text-[#c9a89a] opacity-60 rotate-90 whitespace-nowrap"
          style={{ writingMode: "vertical-rl" }}
        >
          depuis 2024
        </span>
        <div className="w-px h-20 bg-[#c9a89a] opacity-40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <p className="text-xs tracking-[0.35em] uppercase text-[#c9a89a] mb-8">
          La liste de mariage réinventée
        </p>

        {/* Headline */}
        <h1
          className="text-6xl md:text-8xl lg:text-[7rem] leading-[0.95] text-[#2c2c2c] mb-8"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
        >
          Une liste de mariage
          <br />
          <span style={{ fontStyle: "italic", color: "#9e6b5c" }}>
            à votre image
          </span>
        </h1>

        {/* Sub */}
        <p className="text-base md:text-lg text-[#7a7370] font-light max-w-xl mx-auto leading-relaxed mb-14">
          Créez une page unique, choisissez vos cadeaux, recevez les contributions
          de vos invités — le tout avec un design que vous aimez vraiment.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/creer"
            className="group px-10 py-4 bg-[#2c2c2c] text-white text-xs tracking-[0.25em] uppercase hover:bg-[#9e6b5c] transition-colors duration-400 flex items-center gap-3"
          >
            Créer ma liste gratuitement
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </Link>
          <Link
            href="/trouver"
            className="px-10 py-4 border border-[#c9a89a] text-[#7a7370] text-xs tracking-[0.25em] uppercase hover:border-[#2c2c2c] hover:text-[#2c2c2c] transition-colors duration-300"
          >
            Trouver une liste
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-10">
          {[
            { number: "3 200+", label: "couples heureux" },
            { number: "48 000+", label: "cadeaux offerts" },
            { number: "4.9 / 5", label: "note moyenne" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span
                className="text-3xl text-[#2c2c2c]"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
              >
                {stat.number}
              </span>
              <span className="text-xs tracking-widest uppercase text-[#c9a89a]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-12 bg-[#2c2c2c] animate-pulse" />
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#7a7370]">
          Défiler
        </span>
      </div>
    </section>
  );
}
