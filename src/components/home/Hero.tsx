import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-28 pb-20 min-h-screen flex flex-col"
      style={{ background: "#FFF5F7" }}
    >
      {/* Background polka dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { pos: "top-[6%]   left-[2%]",    size: 60,  color: "#D4789A", opacity: 0.13 },
          { pos: "top-[28%]  left-[0%]",    size: 84,  color: "#E8A0BB", opacity: 0.11 },
          { pos: "top-[58%]  left-[3%]",    size: 48,  color: "#C45C85", opacity: 0.10 },
          { pos: "bottom-[8%] left-[6%]",   size: 36,  color: "#7A1B45", opacity: 0.09 },
          { pos: "top-[10%]  right-[2%]",   size: 72,  color: "#E8A0BB", opacity: 0.12 },
          { pos: "top-[42%]  right-[0%]",   size: 100, color: "#D4789A", opacity: 0.08 },
          { pos: "bottom-[15%] right-[3%]", size: 56,  color: "#C45C85", opacity: 0.10 },
          { pos: "top-[5%]   left-[38%]",   size: 44,  color: "#F0BACE", opacity: 0.18 },
          { pos: "top-[3%]   left-[55%]",   size: 28,  color: "#7A1B45", opacity: 0.10 },
          { pos: "top-[8%]   left-[70%]",   size: 52,  color: "#E8A0BB", opacity: 0.13 },
        ].map((dot, i) => (
          <div
            key={i}
            className={`absolute ${dot.pos} rounded-full`}
            style={{ width: dot.size, height: dot.size, backgroundColor: dot.color, opacity: dot.opacity }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* ── Titre centré ── */}
        <h1
          className="text-center mb-14"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(2rem, 4vw, 3.25rem)",
            fontWeight: 300,
            color: "#2c2c2c",
            lineHeight: 1.2,
          }}
        >
          Votre{" "}
          <span style={{ fontFamily: "var(--font-gulf)", color: "#990841", textShadow: "0px 7px 0px #EAB0C0" }}>
            plannification de mariage
          </span>{" "}
          commence ici
        </h1>

        {/* ── Deux colonnes ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* ── Colonne gauche : Liste de mariage ── */}
          <div className="flex flex-col gap-6">
            <div
              className="mx-auto rounded-3xl overflow-hidden"
              style={{ border: "3px solid #C4607A", aspectRatio: "16/10", position: "relative", width: "85%", boxShadow: "10px 10px 0px rgba(196,96,122,0.35), 18px 18px 0px rgba(196,96,122,0.15)" }}
            >
              <Image src="/screenshot-cadeaux2.png" alt="Liste de cadeaux" fill className="object-cover object-top" />
            </div>

            <Link
              href="/creer"
              className="mx-auto flex items-center justify-between px-6 py-4 rounded-full transition-transform hover:scale-[1.02] active:scale-95"
              style={{ width: "85%", backgroundColor: "#831535", color: "white" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/logo5_sansbg.png" alt="" width={40} height={40} style={{ display: "block" }} />
              <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.01em" }}>
                Créer ma liste de mariage
              </span>
              <span style={{ fontSize: "1.5rem" }}>→</span>
            </Link>
          </div>

          {/* ── Colonne droite : Save the Date ── */}
          <div className="flex flex-col gap-6">
            <div
              className="mx-auto rounded-3xl overflow-hidden"
              style={{ border: "3px solid #636F1E", aspectRatio: "16/10", position: "relative", width: "85%", boxShadow: "10px 10px 0px #d9cd7a, 18px 18px 0px #f3ead5" }}
            >
              <Image src="/screenshot-std.png" alt="Éditeur Save the Date" fill className="object-cover object-top" />
            </div>

            <Link
              href="/dashboard/invitations"
              className="mx-auto flex items-center justify-between px-6 py-4 rounded-full transition-transform hover:scale-[1.02] active:scale-95"
              style={{ width: "85%", backgroundColor: "#6B7530", color: "white" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo/logo2_sansbg.png" alt="" width={40} height={40} style={{ display: "block" }} />
              <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.01em" }}>
                Créer mon <em>Save the Date</em>
              </span>
              <span style={{ fontSize: "1.5rem" }}>→</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
