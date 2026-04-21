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
    <section className="py-32 bg-[#2c2c2c] text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#c9a89a] mb-4">
              Votre identité visuelle
            </p>
            <h2
              className="text-5xl md:text-6xl leading-tight"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 300,
                color: "white",
              }}
            >
              Des thèmes
              <br />
              <span style={{ fontStyle: "italic", color: "#c9a89a" }}>
                soigneusement designés
              </span>
            </h2>
          </div>
          <p className="text-sm text-[#7a7370] font-light max-w-xs leading-relaxed">
            Chaque thème est une invitation visuelle. Modifiez-le à votre guise
            ou laissez-vous porter.
          </p>
        </div>

        {/* Theme cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {themes.map((theme) => (
            <div key={theme.name} className="group cursor-pointer">
              {/* Color palette preview */}
              <div className="h-48 flex mb-4 overflow-hidden">
                {theme.palette.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-all duration-500 group-hover:flex-[1.4] first:group-hover:flex-[0.8]"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm text-white"
                    style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                  >
                    {theme.name}
                  </p>
                  <p className="text-xs tracking-widest uppercase text-[#7a7370] mt-1">
                    {theme.tag}
                  </p>
                </div>
                <span className="text-[#c9a89a] group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs tracking-[0.3em] uppercase text-[#7a7370]">
          + Créez votre propre palette de couleurs
        </p>
      </div>
    </section>
  );
}
