import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white pt-20">

      {/* Pink blob top right */}
      <div
        className="absolute top-0 right-0 w-[50vw] h-[60vh] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at top right, #FF4D7D 0%, transparent 65%)",
        }}
      />
      {/* Red blob bottom left */}
      <div
        className="absolute bottom-0 left-0 w-[40vw] h-[40vh] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at bottom left, #E8001A 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 py-20">
        {/* Eyebrow */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-0.5 bg-[#E8001A]" />
          <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#E8001A]"
            style={{ fontFamily: "var(--font-display)" }}>
            Liste de mariage
          </p>
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(3.5rem,9vw,7.5rem)] leading-[0.92] font-extrabold text-[#0A0A0A] mb-8 max-w-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          La liste de
          <br />
          mariage qui{" "}
          <span className="text-[#E8001A]">vous</span>
          <br />
          <span className="text-[#FF4D7D]">ressemble.</span>
        </h1>

        {/* Sub */}
        <p className="text-lg text-[#888] font-light max-w-lg leading-relaxed mb-12">
          Créez une page unique, composez vos cadeaux, recevez les participations de vos invités — avec un design dont vous serez fiers.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Link
            href="/creer"
            className="group px-10 py-5 bg-[#E8001A] text-white text-sm font-bold tracking-wide uppercase hover:bg-[#B8001A] transition-colors duration-200 flex items-center gap-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Créer ma liste gratuitement
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
          <Link
            href="#comment-ca-marche"
            className="px-10 py-5 border-2 border-[#0A0A0A] text-[#0A0A0A] text-sm font-bold tracking-wide uppercase hover:bg-[#0A0A0A] hover:text-white transition-colors duration-200"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Comment ça marche
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 bg-[#0A0A0A] mt-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-7 flex flex-col sm:flex-row items-center justify-between gap-6">
          {[
            { number: "3 200+", label: "couples heureux" },
            { number: "48 000+", label: "cadeaux offerts" },
            { number: "4.9 / 5", label: "note moyenne" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-6">
              {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/20" />}
              <div className="text-center sm:text-left">
                <span
                  className="block text-3xl font-extrabold text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.number}
                </span>
                <span className="text-xs tracking-widest uppercase text-[#FF4D7D]">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
