import Link from "next/link";
import Image from "next/image";


export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      style={{ background: "#FFFFFF" }}
    >
      {/* Background polka dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          // Bords gauche
          { pos: "top-[6%]   left-[2%]",   size: 60,  color: "#D4789A", opacity: 0.13 },
          { pos: "top-[28%]  left-[0%]",   size: 84,  color: "#E8A0BB", opacity: 0.11 },
          { pos: "top-[58%]  left-[3%]",   size: 48,  color: "#C45C85", opacity: 0.10 },
          { pos: "bottom-[8%] left-[6%]",  size: 36,  color: "#7A1B45", opacity: 0.09 },
          // Bords droit
          { pos: "top-[10%]  right-[2%]",  size: 72,  color: "#E8A0BB", opacity: 0.12 },
          { pos: "top-[42%]  right-[0%]",  size: 100, color: "#D4789A", opacity: 0.08 },
          { pos: "bottom-[15%] right-[3%]",size: 56,  color: "#C45C85", opacity: 0.10 },
          // Milieu haut
          { pos: "top-[5%]   left-[38%]",  size: 44,  color: "#F0BACE", opacity: 0.18 },
          { pos: "top-[3%]   left-[55%]",  size: 28,  color: "#7A1B45", opacity: 0.10 },
          { pos: "top-[8%]   left-[70%]",  size: 52,  color: "#E8A0BB", opacity: 0.13 },
          // Milieu page
          { pos: "top-[38%]  left-[28%]",  size: 22,  color: "#C45C85", opacity: 0.12 },
          { pos: "top-[52%]  left-[42%]",  size: 38,  color: "#F0BACE", opacity: 0.15 },
          { pos: "top-[44%]  left-[60%]",  size: 26,  color: "#D4789A", opacity: 0.13 },
          { pos: "top-[65%]  left-[35%]",  size: 48,  color: "#E8A0BB", opacity: 0.10 },
          { pos: "top-[70%]  left-[55%]",  size: 18,  color: "#7A1B45", opacity: 0.09 },
          // Milieu bas
          { pos: "bottom-[18%] left-[40%]",size: 34,  color: "#C45C85", opacity: 0.11 },
          { pos: "bottom-[10%] left-[60%]",size: 56,  color: "#F0BACE", opacity: 0.14 },
          // Petits accents partout
          { pos: "top-[18%]  left-[18%]",  size: 12,  color: "#D4789A", opacity: 0.28 },
          { pos: "top-[75%]  left-[14%]",  size: 10,  color: "#C45C85", opacity: 0.22 },
          { pos: "top-[20%]  right-[20%]", size: 14,  color: "#7A1B45", opacity: 0.18 },
          { pos: "top-[60%]  right-[18%]", size: 10,  color: "#E8A0BB", opacity: 0.25 },
          { pos: "bottom-[28%] right-[22%]",size: 16, color: "#D4789A", opacity: 0.22 },
          { pos: "top-[33%]  left-[48%]",  size: 10,  color: "#C45C85", opacity: 0.20 },
        ].map((dot, i) => (
          <div
            key={i}
            className={`absolute ${dot.pos} rounded-full`}
            style={{ width: dot.size, height: dot.size, backgroundColor: dot.color, opacity: dot.opacity }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

          {/* ── LEFT — Text ── */}
          <div className="flex-1 flex flex-col items-start">

            {/* Headline */}
            <h1
              className="leading-[1.1] mb-8 max-w-lg"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
                fontWeight: 300,
                color: "#0A0A0A",
              }}
            >
              Créez la{" "}
              <span style={{ fontFamily: "var(--font-bagel)", fontWeight: 400, color: "#7A1B45", textShadow: "4px 5px 0px #EABACB" }}>
                liste cadeau
              </span>{" "}
              dont vos invités vont parler.
            </h1>

            {/* Sub */}
            <p
              className="text-lg leading-relaxed mb-10 max-w-md"
              style={{ color: "#5A3A4A", fontFamily: "var(--font-sans)", fontWeight: 300 }}
            >
              En 5 minutes, une page magnifique pour vos invités. Cagnotte en ligne, liste personnalisée, design qui vous ressemble.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/creer"
                className="px-8 py-4 text-base font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
                style={{
                  fontFamily: "var(--font-bagel)",
                  backgroundColor: "#D4789A",
                  color: "white",
                  boxShadow: "4px 5px 0px #7A1B45",
                  letterSpacing: "0.01em",
                }}
              >
                Créer ma liste →
              </Link>
              <Link
                href="#comment-ca-marche"
                className="px-8 py-4 text-base font-bold rounded-full transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  border: "2.5px solid #D4789A",
                  color: "#7A1B45",
                  backgroundColor: "transparent",
                }}
              >
                Comment ça marche
              </Link>
            </div>

          </div>

          {/* ── RIGHT — Visual ── */}
          <div className="w-full lg:w-[42%] flex-shrink-0 relative">

            {/* Photo card */}
            <div
              className="relative w-full aspect-[3/4] overflow-hidden"
              style={{
                borderRadius: "32px",
                border: "3px solid #EABACB",
                boxShadow: "8px 10px 0px #D4789A",
              }}
            >
              <Image
                src="/hero-image-3.jpg"
                alt="Votre liste de mariage"
                fill
                className="object-cover"
                priority
              />
              {/* Pink overlay tint - très subtil */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(244,114,182,0.12) 100%)" }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
