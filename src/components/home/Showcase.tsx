const themes = [
  {
    name: "Douceur Dorée",
    palette: ["#f5edd8", "#c4a35a", "#2c2c2c", "#faf8f5"],
    tag: "Classique",
  },
  {
    name: "Rose Poudré",
    palette: ["#f0e6e2", "#c9a89a", "#9e6b5c", "#fffef9"],
    tag: "Romantique",
  },
  {
    name: "Jardin de Sauge",
    palette: ["#e8ede9", "#8a9e8c", "#3d5440", "#faf8f5"],
    tag: "Nature",
  },
  {
    name: "Nuit Élégante",
    palette: ["#2c2c2c", "#7a7370", "#c9a89a", "#1a1a1a"],
    tag: "Luxe",
  },
];

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
              <div className="h-48 flex mb-4 overflow-hidden">
                {theme.palette.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-500 group-hover:flex-[1.5] first:group-hover:flex-[0.7]"
                    style={{ backgroundColor: color }}
                  />
                ))}
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
          + Créez votre propre palette de couleurs
        </p>
      </div>
    </section>
  );
}
