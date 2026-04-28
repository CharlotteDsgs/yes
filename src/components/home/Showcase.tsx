import Link from "next/link";

const themes = [
  {
    name: "Classique",
    tag: "Intemporel",
    preview: {
      bg: "#1a1510",
      coverBg: "#1a1510",
      coverImg: "/flowers-35mm-2.jpg",
      accent: "#FFFFFF",
      muted: "#c9a89a",
      cardBg: "#FFFFFF",
      cardBorder: "#3a3020",
      font: "serif",
    },
  },
  {
    name: "Moderne",
    tag: "Audacieux",
    preview: {
      bg: "#FFF8D6",
      coverBg: "#FFF8D6",
      coverImg: null,
      accent: "#E85C00",
      muted: "#C44A00",
      cardBg: "#FFF8D6",
      cardBorder: "#F5D88A",
      font: "sans-serif",
    },
  },
  {
    name: "Fleuri",
    tag: "Romantique",
    preview: {
      bg: "#f5f0e4",
      coverBg: "#f5f0e4",
      coverImg: "/paysages/paysage_8.JPG",
      accent: "#8a7156",
      muted: "#6b5535",
      cardBg: "#faf7f0",
      cardBorder: "#c4a97a",
      font: "serif",
    },
  },
  {
    name: "Minimaliste",
    tag: "Épuré",
    preview: {
      bg: "#FFFFFF",
      coverBg: "#FFFFFF",
      coverImg: "/mer_2.png",
      accent: "#0A0A0A",
      muted: "#888888",
      cardBg: "#FFFFFF",
      cardBorder: "#E8E8E8",
      font: "sans-serif",
    },
  },
];

function ThemePreview({ theme }: { theme: typeof themes[0] }) {
  const p = theme.preview;
  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden flex flex-col"
      style={{ backgroundColor: p.bg, border: `1px solid ${p.cardBorder}` }}
    >
      {/* Cover mini */}
      <div className="relative flex-shrink-0 h-[52%] overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: p.coverBg }}>
        {p.coverImg && (
          <img src={p.coverImg} alt="" className="w-full h-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-3">
          <div className="h-[3px] rounded-full w-8 mb-1" style={{ backgroundColor: p.accent, opacity: 0.5 }} />
          <div className="h-[6px] rounded-sm w-16" style={{ backgroundColor: p.accent, opacity: 0.9 }} />
          <div className="h-[4px] rounded-sm w-10 mt-1" style={{ backgroundColor: p.accent, opacity: 0.6 }} />
          <div className="h-[3px] rounded-sm w-8 mt-0.5" style={{ backgroundColor: p.muted, opacity: 0.5 }} />
        </div>
      </div>

      {/* Gift cards mini */}
      <div className="flex gap-1.5 p-2 flex-1">
        {[1, 2].map(i => (
          <div key={i}
            className="flex-1 rounded-lg flex flex-col overflow-hidden"
            style={{ backgroundColor: p.cardBg, border: `1px solid ${p.cardBorder}` }}>
            <div className="h-[55%]" style={{ backgroundColor: p.cardBorder, opacity: 0.5 }} />
            <div className="p-1.5 flex flex-col gap-1">
              <div className="h-[3px] rounded-full w-full" style={{ backgroundColor: p.accent, opacity: 0.7 }} />
              <div className="h-[2px] rounded-full w-2/3" style={{ backgroundColor: p.muted, opacity: 0.4 }} />
              <div className="h-[5px] rounded-sm w-full mt-0.5" style={{ backgroundColor: p.accent, opacity: 0.15 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Showcase() {
  return (
    <section className="py-32 bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <p className="text-xs font-bold tracking-[0.35em] uppercase text-[#A8304A] mb-4"
              style={{ fontFamily: "var(--font-display)" }}>
              Votre identité visuelle
            </p>
            <h2
              className="text-4xl md:text-5xl font-normal text-white leading-tight uppercase tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Des thèmes
              <br />
              <span className="text-[#A8304A]">soigneusement</span>
              <br />
              designés.
            </h2>
          </div>
          <p className="text-sm text-white/40 font-light max-w-xs leading-relaxed">
            Chaque thème est une invitation visuelle. Modifiez-le à votre guise ou laissez-vous porter.
          </p>
        </div>

        {/* Theme cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme) => (
            <div key={theme.name} className="group cursor-pointer">
              <div className="h-64 mb-4">
                <ThemePreview theme={theme} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white"
                    style={{ fontFamily: "var(--font-display)" }}>
                    {theme.name}
                  </p>
                  <p className="text-xs tracking-widest uppercase text-white/40 mt-1">
                    {theme.tag}
                  </p>
                </div>
                <span className="text-[#A8304A] group-hover:translate-x-1 transition-transform duration-300 text-lg font-bold">
                  →
                </span>
              </div>
            </div>
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
