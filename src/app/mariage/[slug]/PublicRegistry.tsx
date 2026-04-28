"use client";
// v3-stripe
import { useState, useEffect } from "react";
import { Heart, MapPin, Calendar, ChevronDown, Check } from "lucide-react";

const themeStyles: Record<string, {
  bg: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  text: string;
  muted: string;
  border: string;
  font?: string;
  headingSize?: string;
  uppercase?: boolean;
  bgImage?: string;
  layout?: string;
  squareImage?: string;
  giftImage?: string;
}> = {
  moderne: {
    bg: "#FFF8D6",
    accent: "#E85C00",
    accentLight: "#FFF8D6",
    accentDark: "#E85C00",
    text: "#E85C00",
    muted: "#C44A00",
    border: "#F5D88A",
    font: "var(--font-anton)",
    headingSize: "text-7xl md:text-[10rem]",
    uppercase: true,
    giftImage: "/th%C3%A8me%20moderne/cadeau_1.jpeg",
  },
  classique: {
    bg: "#1a1510",
    accent: "#FFFFFF",
    accentLight: "#1a1510",
    accentDark: "#FFFFFF",
    text: "#FFFFFF",
    muted: "#FFFFFF",
    border: "#3a3020",
    font: "var(--font-serif)",
    headingSize: "text-7xl md:text-9xl",
    bgImage: "/flowers-35mm-2.jpg",
    uppercase: false,
  },
  rose: {
    bg: "#fffef9",
    accent: "#c9a89a",
    accentLight: "#f0e6e2",
    accentDark: "#9e6b5c",
    text: "#2c2c2c",
    muted: "#7a7370",
    border: "#f0e6e2",
  },
  gold: {
    bg: "#fffdf5",
    accent: "#c4a35a",
    accentLight: "#f5edd8",
    accentDark: "#8a6a2a",
    text: "#2c2c2c",
    muted: "#7a7060",
    border: "#f5edd8",
  },
  minimaliste: {
    bg: "#FFFFFF",
    accent: "#0A0A0A",
    accentLight: "#F5F5F5",
    accentDark: "#0A0A0A",
    text: "#0A0A0A",
    muted: "#888888",
    border: "#E8E8E8",
    font: "var(--font-montserrat)",
    layout: "split",
    uppercase: false,
    squareImage: "/mer_2.png",
  },
  fleuri: {
    bg: "#f5f0e4",
    accent: "#8a7156",
    accentLight: "#f5f0e4",
    accentDark: "#6b5535",
    text: "#3d2b1f",
    muted: "#8a7156",
    border: "#c4a97a",
    font: "var(--font-serif)",
    layout: "fleuri",
    uppercase: false,
    bgImage: "/th%C3%A8me%20fleuri/fleuri_1_complet.png",
  },
  sage: {
    bg: "#f8faf8",
    accent: "#8a9e8c",
    accentLight: "#e8ede9",
    accentDark: "#3d5440",
    text: "#2c2c2c",
    muted: "#607060",
    border: "#e8ede9",
  },
  noir: {
    bg: "#1a1a1a",
    accent: "#c9a89a",
    accentLight: "#2c2c2c",
    accentDark: "#e0c8be",
    text: "#f0ede8",
    muted: "#7a7370",
    border: "#3c3c3c",
  },
};

interface Props {
  registry: any;
  profile: any;
  gifts: any[];
}

export default function RegistryClient({ registry, profile, gifts }: Props) {
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterPrices, setFilterPrices] = useState<("0-100" | "100-300" | "300+")[]>([]);
  const [hideFunded, setHideFunded] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [contributionForm, setContributionForm] = useState({
    name: "",
    email: "",
    amount: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [liveCover, setLiveCover] = useState<string | null>(null);
  const [liveSettings, setLiveSettings] = useState<{ bgColor?: string; textColor?: string; giftStyle?: string; coverTextColor?: string; giftTextColor?: string; giftBgColor?: string } | null>(null);
  const [liveInfo, setLiveInfo] = useState<{ partner1?: string; partner2?: string; date?: string; location?: string } | null>(null);

  const theme = { ...(themeStyles[registry.theme] ?? themeStyles.rose) };
  const ts = liveSettings ?? registry.theme_settings?.[registry.theme];
  if (ts) {
    if (ts.bgColor)   { theme.bg = ts.bgColor; theme.accentLight = ts.bgColor; }
    if (ts.textColor) { theme.text = ts.textColor; theme.accent = ts.textColor; theme.muted = ts.textColor; }
  }
  const isClassique    = registry.theme === "classique";
  const isMinimaliste  = registry.theme === "minimaliste";
  const coverTextColor = ts?.coverTextColor ?? theme.text;
  const giftTextColor  = isClassique ? (ts?.giftTextColor ?? "#2c2c2c") : theme.text;
  const giftSectionBg  = registry.theme === "moderne" ? theme.bg : (ts?.giftBgColor ?? "#FAF7F2");

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "WEDY_UPDATE_COVER" && e.data.theme === registry.theme) {
        setLiveCover(e.data.cover);
      }
      if (e.data?.type === "WEDY_UPDATE_SETTINGS" && e.data.theme === registry.theme) {
        setLiveSettings(e.data.settings);
      }
      if (e.data?.type === "WEDY_UPDATE_INFO") {
        setLiveInfo(e.data.info);
      }
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "WEDY_READY", theme: registry.theme }, "*");
    return () => window.removeEventListener("message", handler);
  }, [registry.theme]);

  const p1 = liveInfo?.partner1 ?? profile?.partner1_name ?? "";
  const p2 = liveInfo?.partner2 ?? profile?.partner2_name ?? "";
  const names = p1 && p2 ? `${p1} & ${p2}` : registry.title;
  const COVER_DEFAULTS: Record<string, string> = {
    classique: "/flowers-35mm-2.jpg",
    minimaliste: "/mer_2.png",
    moderne: "/th%C3%A8me%20moderne/cadeau_1.jpeg",
    fleuri: "/paysages/paysage_8.JPG",
  };
  const themeCoverUrl: string | null = liveCover ?? registry.theme_covers?.[registry.theme] ?? COVER_DEFAULTS[registry.theme] ?? null;
  const liveLocation = liveInfo?.location ?? registry.ceremony_location;
  const liveDate = liveInfo?.date ?? registry.ceremony_date;

  const weddingDate = liveDate
    ? new Date(liveDate).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  function handleContribute(gift: any) {
    setSelectedGift(gift);
    setContributionForm({ name: "", email: "", amount: String(gift.price - gift.amount_collected), message: "" });
    setSubmitted(false);
  }

  async function handleSubmitContribution(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: selectedGift.id,
          giftTitle: selectedGift.title,
          amount: parseFloat(contributionForm.amount),
          registrySlug: registry.slug,
          contributorName: contributionForm.name,
          contributorEmail: contributionForm.email,
          message: contributionForm.message,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || "Une erreur est survenue. Réessayez.");
        setLoading(false);
      }
    } catch (err: any) {
      setCheckoutError("Erreur de connexion. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg, color: theme.text }}>

      {/* Hero — Minimaliste split layout */}
      {(theme as any).layout === "split" ? (
        <section
          className="relative flex flex-col md:flex-row md:min-h-screen items-stretch overflow-hidden"
          style={{ backgroundColor: theme.bg, height: "100dvh" }}
        >
          {/* Left — Text (1/2 on mobile, flex-1 on desktop) */}
          <div className="flex-[1] md:flex-1 flex flex-col justify-center px-10 md:px-20 pt-8 pb-0 md:py-24">
            <p className="text-xs tracking-[0.35em] uppercase mb-6" style={{ color: theme.muted }}>
              Liste de mariage
            </p>
            <h1
              className="leading-[1.0] mb-6"
              style={{
                fontFamily: theme.font ?? "var(--font-montserrat)",
                fontWeight: 300,
                color: coverTextColor,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                fontSize: "clamp(1.6rem, 6vw, 2.5rem)",
              }}
            >
              {p1 && (
                <>{p1} &amp; {p2}</>
              )}
            </h1>
            <div className="flex flex-col gap-3 mt-4">
              {weddingDate && (
                <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                  <Calendar size={14} strokeWidth={1.5} />
                  <span className="text-sm font-light">{weddingDate}</span>
                </div>
              )}
              {liveLocation && (
                <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                  <MapPin size={14} strokeWidth={1.5} />
                  <span className="text-sm font-light">{liveLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right — Framed photo with whitespace */}
          {/* Right — Image (1/2 on mobile, 60% on desktop) */}
          <div className="flex-[1] md:flex-none md:w-[60%] flex items-start md:items-center justify-center px-4 pt-0 pb-6 md:p-6 min-h-0">
            <div className="w-[78%] md:w-[70%] aspect-square overflow-hidden max-h-full" style={{ border: `1px solid ${theme.border}` }}>
              {themeCoverUrl ? (
                <img src={themeCoverUrl} alt="Photo du couple" className="w-full h-full object-cover" />
              ) : theme.squareImage ? (
                <img src={theme.squareImage} alt="Thème" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}>
                  <Heart size={28} strokeWidth={1} style={{ color: theme.accent }} />
                </div>
              )}
            </div>
          </div>
        </section>

      ) : (theme as any).layout === "fleuri" ? (

      /* Hero — Fleuri layout */
      <section className="relative min-h-screen flex items-center overflow-hidden"
        style={{ backgroundColor: (theme as any).bg }}>
        {/* Floral background image — mobile vs desktop */}
        <img src={(theme as any).bgImage} alt=""
          className="hidden md:block absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />
        <img src="/th%C3%A8me%20fleuri/fleuri_1_complet_iphone2.png" alt=""
          className="block md:hidden absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto pt-12 pb-10 md:py-24 px-8 md:pl-[9%] md:pr-[20%] flex flex-col md:flex-row items-center gap-6 md:gap-12">

          {/* Left — names + date/location */}
          <div className="flex-1 flex flex-col gap-5">
            <p className="text-xs tracking-[0.4em] uppercase" style={{ color: theme.muted }}>
              Liste de mariage
            </p>
            <h1 style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 300,
              color: coverTextColor,
              fontSize: "clamp(1.8rem, 5.5vw, 3.5rem)",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}>
              {p1 && <>{p1} &amp; {p2}</>}
            </h1>
            <div className="flex flex-col gap-2 mt-2">
              {weddingDate && (
                <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                  <Calendar size={14} strokeWidth={1.5} />
                  <span className="text-sm font-light">{weddingDate}</span>
                </div>
              )}
              {liveLocation && (
                <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                  <MapPin size={14} strokeWidth={1.5} />
                  <span className="text-sm font-light">{liveLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right — square photo frame */}
          <div className="w-[205px] h-[205px] md:w-80 md:h-80 flex-shrink-0 overflow-hidden"
            style={{ border: `2px solid ${theme.border}` }}>
            {themeCoverUrl ? (
              <img src={themeCoverUrl} alt="Photo du couple" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${theme.bg}cc` }}>
                <Heart size={32} strokeWidth={1} style={{ color: theme.border }} />
              </div>
            )}
          </div>
        </div>
      </section>

      ) : (

      /* Hero — Standard layout */
      <section
        className={`relative overflow-hidden ${theme.uppercase ? "min-h-screen flex items-stretch" : "flex flex-col items-center justify-center text-center px-6"}`}
        style={{
          backgroundColor: theme.uppercase ? theme.bg : theme.accentLight,
          backgroundImage: (theme as any).bgImage
            ? `url(${themeCoverUrl ?? (theme as any).bgImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: theme.uppercase ? undefined : "100dvh",
        }}
      >
        {(theme as any).bgImage && (
          <div className="absolute inset-0 bg-black/50" />
        )}

        {/* Moderne layout: text left + gift right */}
        {theme.uppercase ? (
          <>
            {/* Left — Text, vertically centered */}
            <div className="flex-1 flex flex-col justify-center items-start px-8 md:px-16 py-20 relative z-10">
              <p className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: theme.accent }}>
                Liste de mariage
              </p>
              <h1
                className="leading-[0.88] mb-8"
                style={{
                  fontFamily: theme.font ?? "var(--font-anton)",
                  fontWeight: 400,
                  color: coverTextColor,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  fontSize: "clamp(3.5rem, 8vw, 10rem)",
                }}
              >
                {p1 && (
                  <>
                    <div>{p1}</div>
                    <div>&amp; {p2}</div>
                  </>
                )}
              </h1>
              <div className="flex flex-col gap-3">
                {weddingDate && (
                  <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                    <Calendar size={14} strokeWidth={1.5} />
                    <span className="text-sm font-light">{weddingDate}</span>
                  </div>
                )}
                {liveLocation && (
                  <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                    <MapPin size={14} strokeWidth={1.5} />
                    <span className="text-sm font-light">{liveLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right — couple photo or gift image, vertically centered */}
            <div className="hidden md:flex w-[40%] flex-shrink-0 items-center justify-center relative z-10 overflow-hidden">
              {themeCoverUrl ? (
                <img src={themeCoverUrl} alt="Photo du couple" className="w-full max-w-sm object-cover"
                  style={{ borderRadius: "24px", boxShadow: "0 24px 60px rgba(232,92,0,0.2)" }} />
              ) : (theme as any).giftImage ? (
                <img
                  src={(theme as any).giftImage}
                  alt="Cadeau"
                  className="w-full max-w-sm object-cover"
                  style={{ borderRadius: "24px", boxShadow: "0 24px 60px rgba(232,92,0,0.2)" }}
                />
              ) : null}
            </div>
          </>
        ) : (
          /* Non-moderne standard layout */
          <>
            {!theme.uppercase && !(theme as any).bgImage && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `radial-gradient(ellipse at 50% 0%, ${theme.accent} 0%, transparent 70%)`,
                }}
              />
            )}
            <div className="relative z-10">
              <p className="text-xs tracking-[0.4em] uppercase mb-6" style={{ color: theme.accent }}>
                Liste de mariage
              </p>
              <h1
                className="leading-[0.9] mb-6 w-full"
                style={{
                  fontFamily: theme.font ?? "var(--font-serif)",
                  fontWeight: theme.font ? 400 : 300,
                  fontStyle: "italic",
                  color: coverTextColor,
                  textTransform: "none",
                  letterSpacing: "normal",
                  fontSize: "clamp(1.5rem, 11vw, 6rem)",
                  whiteSpace: "nowrap",
                  overflow: "visible",
                }}
              >
                {p1 && <>{p1} &amp; {p2}</>}
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                {weddingDate && (
                  <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                    <Calendar size={14} strokeWidth={1.5} />
                    <span className="text-sm font-light">{weddingDate}</span>
                  </div>
                )}
                {liveLocation && (
                  <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                    <MapPin size={14} strokeWidth={1.5} />
                    <span className="text-sm font-light">{liveLocation}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              style={{ color: theme.accent, opacity: 0.5 }}>
              <ChevronDown size={18} />
            </div>
          </>
        )}
      </section>
      )}

      {/* Story */}
      {registry.story && (
        <section className="py-20 max-w-2xl mx-auto px-6 text-center">
          <p
            className="text-2xl leading-relaxed"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, color: theme.text }}
          >
            "{registry.story}"
          </p>
        </section>
      )}

      {/* Gifts */}
      <div style={{
        position: "relative",
        backgroundColor: giftSectionBg,
        ...(registry.theme === "fleuri" ? {
          backgroundImage: `linear-gradient(rgba(250,247,240,0.82), rgba(250,247,240,0.82)), url(/th%C3%A8me%20fleuri/fleuri_1_vide.png)`,
          backgroundSize: "100% auto",
          backgroundPosition: "top center",
          backgroundRepeat: "repeat-y",
          backgroundColor: "#faf7f0",
        } : {}),
      }}>
      <section className="py-20 max-w-4xl mx-auto px-6" style={{ position: "relative", zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300, color: (registry.theme === "moderne" || registry.theme === "classique") ? "#2c2c2c" : theme.text }}
          >
            Notre liste de <span style={{ fontStyle: "italic" }}>cadeaux</span>
          </h2>
        </div>

        {gifts.length === 0 ? (
          <p className="text-center text-sm font-light" style={{ color: theme.muted }}>
            La liste est en cours de préparation...
          </p>
        ) : (() => {
          const categories = Array.from(new Set(gifts.map((g: any) => g.category || "Divers"))) as string[];
          const sortedCategories = [...categories.filter(c => c !== "Divers").sort(), ...(categories.includes("Divers") ? ["Divers"] : [])];

          let displayed = [...gifts];
          if (filterCategories.length > 0) displayed = displayed.filter((g: any) => filterCategories.includes(g.category || "Divers"));
          if (filterPrices.length > 0) displayed = displayed.filter((g: any) => filterPrices.some(r =>
            r === "0-100"   ? g.price < 100 :
            r === "100-300" ? g.price >= 100 && g.price < 300 :
                              g.price >= 300
          ));
          if (hideFunded) displayed = displayed.filter((g: any) => !g.is_funded && (g.amount_collected / g.price) < 1);
          const fundedCount = gifts.filter((g: any) => g.is_funded || g.amount_collected >= g.price).length;

          // Group by category; gifts without category go into "Divers" (last)
          const groupMap = new Map<string, any[]>();
          for (const gift of displayed) {
            const cat: string = gift.category || "Divers";
            if (!groupMap.has(cat)) groupMap.set(cat, []);
            groupMap.get(cat)!.push(gift);
          }
          const divers = groupMap.get("Divers");
          if (divers) { groupMap.delete("Divers"); groupMap.set("Divers", divers); }
          const groups = Array.from(groupMap.entries());

          const isModerne = registry.theme === "moderne";
          const isFleuri  = registry.theme === "fleuri";
          const filterBtnBg = isFleuri ? "#ede8dc" : "transparent";
          const catHeadingColor = isModerne ? theme.text : "#5a4a3a";
          const catLineColor    = isModerne ? `${theme.text}33` : "#E8E0D6";

          function renderCard(gift: any) {
            const progress = gift.price > 0
              ? Math.min((gift.amount_collected / gift.price) * 100, 100)
              : 0;
            const remaining = Math.max(gift.price - gift.amount_collected, 0);
            const isFunded = gift.is_funded || progress >= 100;

            if (isModerne) {
              const cardBg = isFunded ? "#EBEBEB" : theme.bg;
              return (
                <div key={gift.id} className="flex flex-col overflow-hidden transition-all duration-300"
                  style={{ borderRadius: "20px", backgroundColor: cardBg, boxShadow: `0 4px 20px 0 ${theme.text}38`, opacity: isFunded ? 0.7 : 1 }}>
                  {gift.image_url ? (
                    <img src={gift.image_url} alt={gift.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-36 flex items-center justify-center" style={{ backgroundColor: "#E8E8E8" }}>
                      <Heart size={28} strokeWidth={1} style={{ color: theme.text }} />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5 gap-2">
                    <h3 className="font-bold text-base leading-tight" style={{ fontFamily: "var(--font-display)", color: theme.text }}>
                      {gift.title}
                    </h3>
                    {gift.description && (
                      <p className="text-xs font-light leading-relaxed line-clamp-2" style={{ color: theme.text, opacity: 0.75 }}>
                        {gift.description}
                      </p>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <span className="font-bold text-base" style={{ color: theme.text, fontFamily: "var(--font-display)" }}>
                        {Number(gift.price).toFixed(0)} €
                      </span>
                      {isFunded && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
                          ✓ Financé
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: theme.text }} />
                    </div>
                    {!isFunded && (
                      <button onClick={() => handleContribute(gift)}
                        className="mt-2 py-3 rounded-full text-sm font-bold transition-all duration-200"
                        style={{ backgroundColor: theme.text, color: theme.bg, fontFamily: "var(--font-display)" }}>
                        Participer · {remaining.toFixed(0)}€ restants
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            {
              const giftStyle = ts?.giftStyle ?? "carre";
              const cardRadius = giftStyle === "arrondi" ? "20px" : "0px";
              const cardBorder = giftStyle === "none" ? "none" : "1px solid #EDE8E2";
              const cardBg = giftStyle === "none" ? "transparent" : (isFunded ? "#F5F0EA" : "#FFFFFF");
              const cardPadding = giftStyle === "none" ? "0" : "24px";
              return (
              <div key={gift.id} className="flex flex-col transition-all duration-300"
                style={{ border: cardBorder, borderRadius: cardRadius, backgroundColor: cardBg, padding: cardPadding, opacity: isFunded ? 0.75 : 1 }}>
                {gift.image_url ? (
                  <img src={gift.image_url} alt={gift.title} className="w-full h-40 object-cover mb-4"
                    style={{ borderRadius: giftStyle === "arrondi" ? "20px 20px 0 0" : "0" }} />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center mb-4" style={{ backgroundColor: "#F5F0EA", borderRadius: giftStyle === "arrondi" ? "20px 20px 0 0" : "0" }}>
                    <Heart size={24} strokeWidth={1} style={{ color: theme.accent }} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg mb-1" style={{ fontFamily: "var(--font-serif)", fontWeight: 500, color: giftTextColor }}>
                    {gift.title}
                  </h3>
                  {gift.description && (
                    <p className="text-sm font-light mb-4 leading-relaxed" style={{ color: `${giftTextColor}aa` }}>
                      {gift.description}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-2" style={{ color: `${giftTextColor}88` }}>
                    <span>{Number(gift.amount_collected).toFixed(0)}€ collectés</span>
                    <span>{Number(gift.price).toFixed(0)}€</span>
                  </div>
                  <div className="w-full h-px" style={{ backgroundColor: "#EDE8E2" }}>
                    <div className="h-px transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: theme.accentDark }} />
                  </div>
                </div>
                {isFunded ? (
                  <div className="mt-4 text-center py-3 text-xs tracking-widest uppercase" style={{ color: theme.accentDark, border: "1px solid #EDE8E2" }}>
                    Cadeau financé ✓
                  </div>
                ) : (
                  <button onClick={() => handleContribute(gift)}
                    className="mt-4 py-3 text-xs tracking-widest uppercase transition-all duration-300"
                    style={(isMinimaliste || isFleuri)
                      ? { backgroundColor: filterBtnBg, color: theme.text, border: `1.5px solid ${theme.border}` }
                      : { backgroundColor: theme.accentDark, color: giftTextColor }
                    }
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                    Participer · {remaining.toFixed(0)}€ restants
                  </button>
                )}
              </div>
            );
            }
          }

          return (
            <>
              {/* Filter bar */}
              <div className="flex items-center gap-3 mb-12 flex-wrap justify-center">

                {/* Category multi-filter */}
                <div className="relative">
                  <button onClick={() => { setCategoryOpen(!categoryOpen); setPriceOpen(false); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: filterBtnBg,
                      color: isModerne ? theme.text : "#2c2c2c",
                      border: `2px solid ${isModerne ? theme.text : "#EDE8E2"}`,
                      fontFamily: "var(--font-display)",
                    }}>
                    {filterCategories.length > 0 ? `Catégories (${filterCategories.length})` : "Catégories"}
                    <ChevronDown size={13} />
                  </button>
                  {categoryOpen && (
                    <div className="absolute left-0 top-full mt-2 rounded-2xl z-20 min-w-[190px] py-2"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #EDE8E2", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}>
                      {sortedCategories.map(c => {
                        const checked = filterCategories.includes(c);
                        return (
                          <button key={c}
                            onClick={() => setFilterCategories(prev => checked ? prev.filter(x => x !== c) : [...prev, c])}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#FAF7F2]"
                            style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>
                            <span style={{
                              width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                              border: `2px solid ${checked ? "#1a1a1a" : "rgba(0,0,0,0.2)"}`,
                              backgroundColor: checked ? "rgba(0,0,0,0.07)" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {checked && <Check size={10} color="#1a1a1a" strokeWidth={3} />}
                            </span>
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Price range multi-filter */}
                <div className="relative">
                  <button onClick={() => { setPriceOpen(!priceOpen); setCategoryOpen(false); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: filterBtnBg,
                      color: isModerne ? theme.text : "#2c2c2c",
                      border: `2px solid ${isModerne ? theme.text : "#EDE8E2"}`,
                      fontFamily: "var(--font-display)",
                    }}>
                    {filterPrices.length > 0 ? `Prix (${filterPrices.length})` : "Prix"}
                    <ChevronDown size={13} />
                  </button>
                  {priceOpen && (
                    <div className="absolute left-0 top-full mt-2 rounded-2xl z-20 min-w-[180px] py-2"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #EDE8E2", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}>
                      {([
                        { label: "0 – 100 €",   value: "0-100"   as const },
                        { label: "100 – 300 €", value: "100-300" as const },
                        { label: "300 € +",     value: "300+"    as const },
                      ]).map(opt => {
                        const checked = filterPrices.includes(opt.value);
                        return (
                          <button key={opt.value}
                            onClick={() => setFilterPrices(prev => checked ? prev.filter(x => x !== opt.value) : [...prev, opt.value])}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#FAF7F2]"
                            style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>
                            <span style={{
                              width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                              border: `2px solid ${checked ? "#1a1a1a" : "rgba(0,0,0,0.2)"}`,
                              backgroundColor: checked ? "rgba(0,0,0,0.07)" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {checked && <Check size={10} color="#1a1a1a" strokeWidth={3} />}
                            </span>
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {fundedCount > 0 && (
                  <button onClick={() => setHideFunded(!hideFunded)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: hideFunded ? theme.accentDark : filterBtnBg,
                      color: hideFunded ? "#FAF7F2" : (isModerne ? theme.text : "#2c2c2c"),
                      border: `2px solid ${isModerne ? theme.text : "#EDE8E2"}`,
                      fontFamily: "var(--font-display)",
                    }}>
                    {hideFunded ? `Financés masqués (${fundedCount})` : `Déjà financé (${fundedCount})`}
                  </button>
                )}

              </div>

              {/* Grouped gifts */}
              <div className="flex flex-col gap-16">
                {groups.map(([cat, catGifts]) => (
                  <div key={cat}>
                    {/* Category header */}
                    <div className="flex items-center gap-5 mb-8">
                      <span className="flex-shrink-0"
                        style={{ fontFamily: isModerne ? "var(--font-bagel)" : "var(--font-serif)", color: catHeadingColor, fontWeight: isModerne ? 400 : 600, fontSize: isModerne ? "1.5rem" : "1rem", letterSpacing: isModerne ? "0.01em" : "0.35em", textTransform: isModerne ? "none" : "uppercase" }}>
                        {cat}
                      </span>
                      <div className="flex-1 h-px" style={{ backgroundColor: catLineColor }} />
                      <span className="text-xs flex-shrink-0" style={{ color: catHeadingColor, opacity: 0.5, fontFamily: "var(--font-display)" }}>
                        {catGifts.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catGifts.map(renderCard)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </section>
      </div>

      {/* Contribution modal */}
      {selectedGift && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedGift(null); }}
        >
          <div
            className="w-full max-w-md p-8 relative"
            style={{ backgroundColor: theme.bg }}
          >
            <button
              onClick={() => setSelectedGift(null)}
              className="absolute top-4 right-4 text-sm"
              style={{ color: theme.muted }}
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <Heart size={32} className="mx-auto mb-4" style={{ color: theme.accent }} strokeWidth={1} />
                <h3
                  className="text-2xl mb-3"
                  style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: theme.text }}
                >
                  Merci pour votre générosité !
                </h3>
                <p className="text-sm font-light" style={{ color: theme.muted }}>
                  Le paiement par carte sera disponible très bientôt.
                </p>
                <button
                  onClick={() => setSelectedGift(null)}
                  className="mt-6 px-8 py-3 text-xs tracking-widest uppercase"
                  style={{ backgroundColor: theme.text, color: theme.bg }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContribution} className="flex flex-col gap-5">
                <div>
                  <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: theme.accent }}>
                    Participer à
                  </p>
                  <h3
                    className="text-2xl"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 500, color: theme.text }}
                  >
                    {selectedGift.title}
                  </h3>
                </div>

                {[
                  { name: "name", label: "Votre prénom", placeholder: "Sophie", type: "text" },
                  { name: "email", label: "Votre email", placeholder: "sophie@exemple.fr", type: "email" },
                  { name: "amount", label: "Montant (€)", placeholder: String(selectedGift.price - selectedGift.amount_collected), type: "number" },
                  { name: "message", label: "Un message (optionnel)", placeholder: "Tous nos vœux de bonheur !", type: "text" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="text-xs tracking-[0.2em] uppercase" style={{ color: theme.muted }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required={field.name !== "message"}
                      min={field.name === "amount" ? "1" : undefined}
                      max={field.name === "amount" ? String(selectedGift.price - selectedGift.amount_collected) : undefined}
                      placeholder={field.placeholder}
                      value={contributionForm[field.name as keyof typeof contributionForm]}
                      onChange={(e) => setContributionForm({ ...contributionForm, [field.name]: e.target.value })}
                      className="border-b bg-transparent py-2 text-sm focus:outline-none transition-colors"
                      style={{
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />
                  </div>
                ))}

                {checkoutError && (
                  <p className="text-sm px-4 py-3" style={{ backgroundColor: theme.accentLight, color: theme.accentDark }}>
                    {checkoutError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 py-4 text-xs tracking-widest uppercase transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.text, color: theme.bg }}
                >
                  {loading ? "Redirection..." : "Payer par carte →"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 text-center border-t" style={{ borderColor: theme.border }}>
        <p className="text-xs tracking-widest uppercase" style={{ color: theme.muted }}>
          Créé avec{" "}
          <a href="/" style={{ color: theme.accent }} className="hover:underline">
            Wedy
          </a>
        </p>
      </footer>
    </div>
  );
}
