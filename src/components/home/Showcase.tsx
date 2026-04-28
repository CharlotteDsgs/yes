const themes = [
  {
    id: "classique",
    name: "Classique",
    tag: "Antique",
    font: "var(--font-serif)",
    bg: "#1a1510",
    text: "#FFFFFF",
    bgImage: "/flowers-35mm-2.jpg",
  },
  {
    id: "fleuri",
    name: "Floral",
    tag: "Fleuri",
    font: "var(--font-serif)",
    bg: "#f5f0e4",
    text: "#3d2b1f",
    bgImage: "/th%C3%A8me%20fleuri/fleuri_1_complet.png",
    squareImage: "/paysages/paysage_8.JPG",
  },
  {
    id: "minimaliste",
    name: "Minimaliste",
    tag: "Épuré",
    font: "var(--font-montserrat)",
    bg: "#FFFFFF",
    text: "#0A0A0A",
    squareImage: "/mer-minimaliste.jpeg",
  },
  {
    id: "moderne",
    name: "Moderne",
    tag: "Audacieux",
    font: "var(--font-anton)",
    bg: "#FFF8D6",
    text: "#E85C00",
    giftImage: "/th%C3%A8me%20moderne/cadeau_1.jpeg",
  },
];

const p1 = "Emma";
const p2 = "Charlie";
const dateShort = "18.06.2026";
const dateLong = "18 juin 2026";
const classiqueFontSize = "1.1rem";
const minimalisteFontSize = "0.42rem";
const moderneFontSize = "1.3rem";

function ThemeCard({ theme }: { theme: typeof themes[0] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.10)" }}
    >
      {/* Preview */}
      {theme.id === "fleuri" ? (
        <div className="relative h-36 overflow-hidden flex items-center px-4 gap-3" style={{ backgroundColor: theme.bg }}>
          <img src={(theme as any).bgImage} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          <div className="relative z-10 flex-1 flex flex-col justify-center gap-0.5 min-w-0 pl-10">
            <span style={{ fontFamily: theme.font, color: theme.text, fontSize: classiqueFontSize, fontStyle: "italic", fontWeight: 500, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              {p1} &amp;
            </span>
            <span style={{ fontFamily: theme.font, color: theme.text, fontSize: classiqueFontSize, fontStyle: "italic", fontWeight: 500, lineHeight: 1.2, whiteSpace: "nowrap" }}>
              {p2}
            </span>
            <span style={{ fontFamily: theme.font, color: theme.text, fontSize: "0.55rem", opacity: 0.6, marginTop: "2px" }}>{dateShort}</span>
          </div>
          <div className="relative z-10 flex-shrink-0 overflow-hidden mr-10" style={{ width: "58px", height: "58px", border: "1.5px solid rgba(61,43,31,0.3)" }}>
            <img src={(theme as any).squareImage} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      ) : (
        <div
          className={`relative h-36 overflow-hidden flex ${theme.id === "moderne" ? "items-center justify-between px-6" : theme.id === "minimaliste" ? "items-center justify-between px-3" : "items-center justify-center px-6"}`}
          style={{
            backgroundColor: theme.bg,
            backgroundImage: (theme as any).bgImage ? `url(${(theme as any).bgImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {(theme as any).bgImage && <div className="absolute inset-0 bg-black/40" />}

          {theme.id === "moderne" ? (
            <div className="relative z-10 flex-1 leading-tight text-left" style={{ fontFamily: theme.font, color: theme.text, textTransform: "uppercase" }}>
              <div style={{ fontSize: moderneFontSize, fontWeight: 400, lineHeight: 1 }}>{p1} &amp;</div>
              <div style={{ fontSize: moderneFontSize, fontWeight: 400, lineHeight: 1 }}>{p2}</div>
              <div style={{ fontSize: "0.6rem", marginTop: "0.35rem", opacity: 0.7 }}>{dateShort}</div>
            </div>
          ) : theme.id === "classique" ? (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center gap-1">
              <span style={{ fontFamily: theme.font, color: theme.text, fontSize: classiqueFontSize, fontStyle: "italic", fontWeight: 500, lineHeight: 1.1, whiteSpace: "nowrap" }}>
                {p1} &amp; {p2}
              </span>
              <span style={{ fontFamily: theme.font, color: theme.text, fontSize: "0.65rem", fontWeight: 600, fontStyle: "normal", opacity: 0.9 }}>{dateLong}</span>
            </div>
          ) : theme.id === "minimaliste" ? (
            <>
              <div className="relative z-10 flex flex-col items-start text-left flex-1 justify-center pl-10">
                <span style={{ fontFamily: theme.font, color: theme.text, fontSize: minimalisteFontSize, fontWeight: 400, letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1.3 }}>{p1} &amp; {p2}</span>
                <span style={{ fontFamily: theme.font, color: theme.text, fontSize: "0.5rem", letterSpacing: "0.15em", opacity: 0.6, marginTop: "0.3em" }}>{dateShort}</span>
              </div>
              <div className="relative z-10 flex-shrink-0 overflow-hidden mr-10" style={{ width: "52px", height: "52px" }}>
                <img src={(theme as any).squareImage} alt="" className="w-full h-full object-cover" />
              </div>
            </>
          ) : null}

          {theme.id === "moderne" && (theme as any).giftImage && (
            <div className="relative z-10 flex items-center justify-center flex-shrink-0" style={{ width: "64px", height: "64px" }}>
              <img src={(theme as any).giftImage} alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "multiply" }} />
            </div>
          )}
        </div>
      )}

      {/* Label */}
      <div className="px-5 py-3 flex items-center justify-between bg-white">
        <span className="text-sm font-bold text-[#6D1D3E]" style={{ fontFamily: "var(--font-display)" }}>
          {theme.name}
        </span>
        <span className="text-xs text-[#6D1D3E]/40" style={{ fontFamily: "var(--font-display)" }}>
          {theme.tag}
        </span>
      </div>
    </div>
  );
}

export default function Showcase() {
  return (
    <section className="py-32 bg-[#6D1D3E] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#D4889A] mb-4"
              style={{ fontFamily: "var(--font-display)" }}>
              Votre identité visuelle
            </p>
            <h2
              className="text-4xl md:text-5xl font-normal text-white leading-tight uppercase tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Des thèmes
              <br />
              <span className="text-[#D4889A]">soigneusement</span>
              <br />
              designés.
            </h2>
          </div>
          <p className="text-sm text-white/50 font-light max-w-xs leading-relaxed">
            Chaque thème est une invitation visuelle. Modifiez-le à votre guise ou laissez-vous porter.
          </p>
        </div>

        {/* Theme cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {themes.map((theme) => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>

        <p className="mt-12 text-center text-xs font-bold tracking-[0.3em] uppercase text-white/30"
          style={{ fontFamily: "var(--font-display)" }}>
          + Personnalisez les couleurs à votre image
        </p>
      </div>
    </section>
  );
}
