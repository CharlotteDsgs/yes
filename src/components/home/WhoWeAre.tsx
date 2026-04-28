import Image from "next/image";

export default function WhoWeAre() {
  return (
    <section
      id="qui-sommes-nous"
      className="py-24 md:py-32"
      style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Image */}
          <div className="w-full lg:w-[42%] flex-shrink-0">
            <div
              className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 24px 60px rgba(109,29,62,0.14)" }}
            >
              <Image
                src="/qui-sommes-nous.jpg"
                alt="L'équipe Wedy"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1">
            <p
              className="text-sm font-semibold text-[#8B2A4E] mb-4 tracking-widest uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Qui sommes-nous
            </p>
            <h2
              className="text-[clamp(2.2rem,4vw,3.5rem)] font-bold text-[#6D1D3E] leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Créé par des amoureux,
              <br />pour des amoureux.
            </h2>
            <p className="text-base text-[#8B6070] font-light leading-relaxed mb-6 max-w-lg">
              Wedy est né d'une frustration simple : les listes de mariage existantes étaient soit laides, soit compliquées, soit les deux. On a décidé de faire mieux.
            </p>
            <p className="text-base text-[#8B6070] font-light leading-relaxed max-w-lg">
              Notre équipe est petite, passionnée, et obsédée par les détails. On croit que votre liste de mariage mérite autant de soin que votre robe ou votre lieu de réception — et on met tout en œuvre pour que ce soit le cas.
            </p>

            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[#E8B4C0]/40">
              <div>
                <span
                  className="block text-2xl font-bold text-[#6D1D3E]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  2026
                </span>
                <span className="text-xs text-[#8B6070]">année de création</span>
              </div>
              <div className="w-px h-10 bg-[#E8B4C0]/40" />
              <div>
                <span
                  className="block text-2xl font-bold text-[#6D1D3E]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Paris
                </span>
                <span className="text-xs text-[#8B6070]">basés en France</span>
              </div>
              <div className="w-px h-10 bg-[#E8B4C0]/40" />
              <div>
                <span
                  className="block text-2xl font-bold text-[#6D1D3E]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  100%
                </span>
                <span className="text-xs text-[#8B6070]">indépendant</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
