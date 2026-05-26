import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-28 pb-20 min-h-screen flex flex-col"
      style={{ background: "#FFF5F7" }}
    >
<div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

        {/* ── Titre centré ── */}
        <h1
          className="text-center mb-14 mt-20"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-24">

          {/* ── Colonne gauche : Liste de mariage ── */}
          <div className="flex flex-col items-center gap-5">
            <Link
              href="/creer"
              className="w-[85%] text-center py-5 rounded-full transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: "#7A1535", color: "white", fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}
            >
              Liste de mariage
            </Link>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ aspectRatio: "16/10", position: "relative", width: "85%", border: "6px solid white", boxShadow: "0 6px 28px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)" }}
            >
              <Image src="/screenshot-cadeaux2.png" alt="Liste de cadeaux" fill className="object-cover object-top" />
            </div>
          </div>

          {/* ── Colonne droite : Save the Date ── */}
          <div className="flex flex-col items-center gap-5">
            <Link
              href="/dashboard/invitations"
              className="w-[85%] text-center py-5 rounded-full transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: "#C4607A", color: "white", fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}
            >
              Save the Date
            </Link>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ aspectRatio: "16/10", position: "relative", width: "85%", border: "6px solid white", boxShadow: "0 6px 28px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)" }}
            >
              <Image src="/screenshot-std.png" alt="Éditeur Save the Date" fill className="object-cover object-top" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
