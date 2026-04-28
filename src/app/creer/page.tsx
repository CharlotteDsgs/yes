"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WedyLogo from "@/components/WedyLogo";
import { createClient } from "@/lib/supabase/client";

const themes = [
  {
    id: "classique",
    name: "Classique",
    tag: "Antique",
    font: "var(--font-serif)",
    bg: "#1a1510",
    text: "#FFFFFF",
    accent: "#FFFFFF",
    shape: false,
    bgImage: "/flowers-35mm-2.jpg",
  },
  {
    id: "fleuri",
    name: "Floral",
    tag: "Fleuri",
    font: "var(--font-serif)",
    bg: "#f5f0e4",
    text: "#3d2b1f",
    accent: "#8a7156",
    shape: false,
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
    accent: "#0A0A0A",
    shape: false,
    squareImage: "/mer-minimaliste.jpeg",
  },
  {
    id: "moderne",
    name: "Moderne",
    tag: "Audacieux",
    font: "var(--font-anton)",
    bg: "#FFF8D6",
    text: "#E85C00",
    accent: "#E85C00",
    shape: false,
    giftImage: "/th%C3%A8me%20moderne/cadeau_1.jpeg",
  },
];

export default function CreerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  function scrollCarousel(dir: "left" | "right") {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 216 : -216, behavior: "smooth" });
  }

  function handleCarouselScroll() {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  const [form, setForm] = useState({
    partner1_name: "",
    partner2_name: "",
    wedding_date: "",
    ceremony_location: "",
    theme: "rose",
  });
  const [showSlugModal, setShowSlugModal] = useState(false);
  const [modalRegistryId, setModalRegistryId] = useState<string | null>(null);
  const [modalSlug, setModalSlug] = useState("");
  const [modalSlugStatus, setModalSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const modalSlugCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toSlug(val: string) {
    return val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleModalSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = toSlug(e.target.value);
    setModalSlug(val);
    setModalSlugStatus("idle");
    if (modalSlugCheckRef.current) clearTimeout(modalSlugCheckRef.current);
    if (val) modalSlugCheckRef.current = setTimeout(async () => {
      setModalSlugStatus("checking");
      const supabase = createClient();
      const { data } = await supabase.from("registries").select("id").eq("slug", val).maybeSingle();
      setModalSlugStatus(data ? "taken" : "available");
    }, 600);
  }

  async function confirmModalSlug() {
    if (!modalRegistryId || !modalSlug || modalSlugStatus === "taken" || modalSlugStatus === "checking") return;
    const supabase = createClient();
    await supabase.from("registries").update({ slug: modalSlug }).eq("id", modalRegistryId);
    router.push("/dashboard");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function createRegistry(userId: string, userEmail: string) {
    const supabase = createClient();

    // Si l'utilisateur a déjà une registry, on redirige sans toucher au profil existant
    const { data: existing } = await supabase
      .from("registries")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      router.push("/dashboard");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      email: userEmail,
      partner1_name: form.partner1_name,
      partner2_name: form.partner2_name,
      wedding_date: form.wedding_date || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (profileError) {
      setError("Erreur lors de la création du profil. Réessayez.");
      setLoading(false);
      return;
    }

    const baseSlug = toSlug(`${form.partner1_name}-et-${form.partner2_name}`);
    const suffix = Math.random().toString(36).slice(2, 6);
    const autoSlug = `${baseSlug}-${suffix}`;

    const { data: insertedRegistry, error: registryError } = await supabase.from("registries").insert({
      user_id: userId,
      slug: autoSlug,
      title: `Liste de mariage de ${form.partner1_name} & ${form.partner2_name}`,
      theme: form.theme,
      ceremony_location: form.ceremony_location || null,
      ceremony_date: form.wedding_date || null,
    }).select("id").single();

    if (registryError) {
      setError(`Erreur : ${registryError.message}`);
      setLoading(false);
      return;
    }

    setModalRegistryId(insertedRegistry.id);
    setModalSlug(baseSlug);
    setShowSlugModal(true);
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Renseignez votre email ci-dessus d'abord.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
    });
    setResetSent(true);
    setError(null);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (authMode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        await createRegistry(data.user.id, email);
      }
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }
      if (data.user) {
        await createRegistry(data.user.id, data.user.email!);
      }
    }
  }

  const p1 = form.partner1_name || "Vous";
  const p2 = form.partner2_name || "eux";

  // Moderne: 2 lines ("Prénom1 &" / "Prénom2"), Anton font is wide
  const moderneFontSize = `${Math.min(1.5, Math.max(0.65, 11 / Math.max(p1.length + 2, p2.length)))}rem`;
  // Classique: 1 line ("Prénom1 & Prénom2"), serif is narrower
  const classiqueFontSize = `${Math.min(1.5, Math.max(0.6, 20 / (p1.length + p2.length + 3)))}rem`;
  // Minimaliste: 1 ligne "P1 & P2", letter-spacing ~1.4x char width
  const minimalisteFontSize = `${Math.min(0.55, Math.max(0.3, 9 / (p1.length + p2.length + 3)))}rem`;

  const names = form.partner1_name && form.partner2_name
    ? `${form.partner1_name} & ${form.partner2_name}`
    : "vous deux";

  const dateShort = form.wedding_date
    ? form.wedding_date.split("-").reverse().join(".")
    : null;

  const dateLong = form.wedding_date
    ? new Date(form.wedding_date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <>
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left panel — photo */}
      <div className="hidden lg:block lg:w-[33%] relative flex-shrink-0">
        <Image
          src="/creer-image-2.jpg"
          alt="Cérémonie de mariage"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right panel — form */}
      <div
        className="flex-1 flex flex-col px-8 lg:px-16 py-10"
        style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}
      >
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="text-sm text-[#6D1D3E]/60 hover:text-[#6D1D3E] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}>
            ← Accueil
          </a>
          <div className="flex items-center gap-4">
            <a href="/connexion" className="text-sm font-medium text-[#6D1D3E]/70 hover:text-[#6D1D3E] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}>
              Connexion
            </a>
            <a href="/creer"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: "#6D1D3E", fontFamily: "var(--font-display)" }}>
              Créer ma liste
            </a>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full">

          {/* Step 1 */}
          {step === 1 && (
            <div className="max-w-md mx-auto">
              <p
                className="text-xs font-bold tracking-[0.3em] uppercase text-[#6D1D3E]/50 mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Étape 1 sur 3
              </p>
              <h1
                className="text-4xl font-bold text-[#6D1D3E] mb-2 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Vos informations
              </h1>
              <p className="text-sm text-[#6D1D3E]/60 mb-10 font-light">
                Dites-nous qui vous êtes et quand vous vous mariez.
              </p>

              <div className="flex flex-col gap-6">
                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "partner1_name", label: "Prénom 1", placeholder: "Emma" },
                    { name: "partner2_name", label: "Prénom 2", placeholder: "Charlie" },
                  ].map((field) => (
                    <div key={field.name} className="flex flex-col gap-2">
                      <label
                        className="text-xs font-bold tracking-widest uppercase text-[#6D1D3E]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {field.label}
                      </label>
                      <input
                        name={field.name}
                        required
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="rounded-2xl px-5 py-4 text-base bg-white border-2 border-transparent focus:border-[#6D1D3E] focus:outline-none transition-colors placeholder:text-[#6D1D3E]/25 text-[#6D1D3E] font-medium"
                        style={{ fontFamily: "var(--font-display)" }}
                      />
                    </div>
                  ))}
                </div>

                {/* Date */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-bold tracking-widest uppercase text-[#6D1D3E]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Date du mariage
                  </label>
                  <input
                    type="date"
                    name="wedding_date"
                    value={form.wedding_date}
                    onChange={handleChange}
                    className="rounded-2xl px-5 py-4 text-base bg-white border-2 border-transparent focus:border-[#6D1D3E] focus:outline-none transition-colors text-[#6D1D3E] font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                </div>

                {/* Location */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs font-bold tracking-widest uppercase text-[#6D1D3E]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Lieu de la cérémonie
                  </label>
                  <input
                    name="ceremony_location"
                    value={form.ceremony_location}
                    onChange={handleChange}
                    placeholder="Paris, France"
                    className="rounded-2xl px-5 py-4 text-base bg-white border-2 border-transparent focus:border-[#6D1D3E] focus:outline-none transition-colors placeholder:text-[#6D1D3E]/25 text-[#6D1D3E] font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!form.partner1_name || !form.partner2_name}
                  className="w-full py-5 rounded-full text-base font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                  style={{ backgroundColor: "#6D1D3E", fontFamily: "var(--font-display)" }}
                >
                  Continuer →
                </button>

                <p className="text-center text-sm text-[#6D1D3E]/50 font-light mt-2">
                  Déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setStep(3); }}
                    className="font-bold text-[#6D1D3E] hover:underline"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <p
                className="text-xs font-bold tracking-[0.3em] uppercase text-[#6D1D3E]/50 mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Étape 2 sur 3
              </p>
              <h1
                className="text-4xl font-bold text-[#6D1D3E] mb-2 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Votre thème
              </h1>
              <p className="text-sm text-[#6D1D3E]/60 mb-10 font-light">
                L'ambiance de votre page. Vous pourrez la changer plus tard.
              </p>

              <div className="relative mb-8">
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollCarousel("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#6D1D3E] hover:bg-[#6D1D3E] hover:text-white transition-colors"
                    style={{ fontSize: "1.2rem", lineHeight: 1 }}
                  >
                    ‹
                  </button>
                )}
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollCarousel("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#6D1D3E] hover:bg-[#6D1D3E] hover:text-white transition-colors"
                    style={{ fontSize: "1.2rem", lineHeight: 1 }}
                  >
                    ›
                  </button>
                )}
              <div ref={carouselRef} onScroll={handleCarouselScroll} className="flex gap-3 overflow-x-auto" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", padding: "6px 6px 8px 6px" }}>
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setForm({ ...form, theme: theme.id })}
                    className="text-left transition-all duration-200 rounded-2xl overflow-hidden flex-shrink-0"
                    style={{
                      width: "200px",
                      scrollSnapAlign: "start",
                      outline: form.theme === theme.id ? "3px solid #6D1D3E" : "3px solid transparent",
                      outlineOffset: "2px",
                      boxShadow: form.theme === theme.id ? "0 4px 20px rgba(109,29,62,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Visual preview */}
                    {theme.id === "fleuri" ? (
                      <div className="relative h-36 overflow-hidden flex items-center px-4 gap-3" style={{ backgroundColor: theme.bg }}>
                        <img src={(theme as any).bgImage} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                        <div className="relative z-10 flex-1 flex flex-col justify-center gap-0.5 min-w-0 pl-5">
                          <span style={{ fontFamily: theme.font, color: theme.text, fontSize: classiqueFontSize, fontStyle: "italic", fontWeight: 500, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                            {p1} &amp;
                          </span>
                          <span style={{ fontFamily: theme.font, color: theme.text, fontSize: classiqueFontSize, fontStyle: "italic", fontWeight: 500, lineHeight: 1.2, whiteSpace: "nowrap" }}>
                            {p2}
                          </span>
                          {dateShort && <span style={{ fontFamily: theme.font, color: theme.text, fontSize: "0.55rem", opacity: 0.6, marginTop: "2px" }}>{dateShort}</span>}
                        </div>
                        <div className="relative z-10 flex-shrink-0 overflow-hidden" style={{ width: "58px", height: "58px", border: "1.5px solid rgba(61,43,31,0.3)" }}>
                          {(theme as any).squareImage
                            ? <img src={(theme as any).squareImage} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full" style={{ backgroundColor: "rgba(61,43,31,0.08)" }} />}
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
                          {dateShort && <div style={{ fontSize: "0.6rem", marginTop: "0.35rem", opacity: 0.7 }}>{dateShort}</div>}
                        </div>
                      ) : theme.id === "classique" ? (
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center gap-1">
                          <span style={{ fontFamily: theme.font, color: theme.text, fontSize: classiqueFontSize, fontStyle: "italic", fontWeight: 500, lineHeight: 1.1, whiteSpace: "nowrap" }}>
                            {p1} &amp; {p2}
                          </span>
                          {dateLong && <span style={{ fontFamily: theme.font, color: theme.text, fontSize: "0.65rem", fontWeight: 600, fontStyle: "normal", opacity: 0.9 }}>{dateLong}</span>}
                        </div>
                      ) : theme.id === "minimaliste" ? (
                        <>
                          <div className="relative z-10 flex flex-col items-start text-left flex-1 justify-center pr-4">
                            <span style={{ fontFamily: theme.font, color: theme.text, fontSize: minimalisteFontSize, fontWeight: 400, letterSpacing: "0.2em", textTransform: "uppercase", lineHeight: 1.3 }}>{p1} &amp; {p2}</span>
                            {dateShort && <span style={{ fontFamily: theme.font, color: theme.text, fontSize: "0.5rem", letterSpacing: "0.15em", opacity: 0.6, marginTop: "0.3em" }}>{dateShort}</span>}
                          </div>
                          {(theme as any).squareImage && (
                            <div className="relative z-10 flex-shrink-0 overflow-hidden mr-3" style={{ width: "52px", height: "52px" }}>
                              <img src={(theme as any).squareImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
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
                    <div
                      className="px-5 py-3 flex items-center justify-between"
                      style={{ backgroundColor: form.theme === theme.id ? "rgba(109,29,62,0.06)" : "white" }}
                    >
                      <span className="text-sm font-bold text-[#6D1D3E]" style={{ fontFamily: "var(--font-display)" }}>
                        {theme.name}
                      </span>
                      <span className="text-xs text-[#6D1D3E]/40" style={{ fontFamily: "var(--font-display)" }}>
                        {theme.tag}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              </div>

              {error && (
                <div className="rounded-2xl px-5 py-4 mb-6 text-sm font-medium text-[#6D1D3E]"
                  style={{ backgroundColor: "rgba(109,29,62,0.08)" }}>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-5 rounded-full text-sm font-bold text-[#6D1D3E] border-2 border-[#6D1D3E] hover:bg-[#6D1D3E] hover:text-white transition-colors duration-200"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  ← Retour
                </button>
                <button
                  type="submit"
                  className="flex-1 py-5 rounded-full text-base font-bold text-white transition-all duration-200"
                  style={{ backgroundColor: "#6D1D3E", fontFamily: "var(--font-display)" }}
                >
                  Continuer →
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — Auth */}
          {step === 3 && (
            <form onSubmit={handleAuth} className="max-w-md mx-auto">
              <p
                className="text-xs font-bold tracking-[0.3em] uppercase text-[#6D1D3E]/50 mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Étape 3 sur 3
              </p>
              <h1
                className="text-4xl font-bold text-[#6D1D3E] mb-2 leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {authMode === "signup" ? "Créez votre compte" : "Connectez-vous"}
              </h1>
              <p className="text-sm text-[#6D1D3E]/60 mb-8 font-light">
                {authMode === "signup"
                  ? "Pour sauvegarder votre liste et la partager à vos invités."
                  : "Votre liste sera liée à votre compte existant."}
              </p>

              {/* Toggle */}
              <div className="flex rounded-2xl overflow-hidden border-2 border-[#6D1D3E]/15 mb-8">
                {(["signup", "login"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setAuthMode(mode); setError(null); }}
                    className="flex-1 py-3 text-sm font-bold transition-colors duration-200"
                    style={{
                      fontFamily: "var(--font-display)",
                      backgroundColor: authMode === mode ? "#6D1D3E" : "transparent",
                      color: authMode === mode ? "white" : "#6D1D3E",
                    }}
                  >
                    {mode === "signup" ? "Nouveau compte" : "Déjà un compte"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-[#6D1D3E]" style={{ fontFamily: "var(--font-display)" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    className="rounded-2xl px-5 py-4 text-base bg-white border-2 border-transparent focus:border-[#6D1D3E] focus:outline-none transition-colors placeholder:text-[#6D1D3E]/25 text-[#6D1D3E] font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-[#6D1D3E]" style={{ fontFamily: "var(--font-display)" }}>
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={authMode === "signup" ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === "signup" ? "8 caractères minimum" : "••••••••"}
                    className="rounded-2xl px-5 py-4 text-base bg-white border-2 border-transparent focus:border-[#6D1D3E] focus:outline-none transition-colors placeholder:text-[#6D1D3E]/25 text-[#6D1D3E] font-medium"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                </div>

                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-[#6D1D3E]/50 hover:text-[#6D1D3E] transition-colors text-left"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Mot de passe oublié ?
                  </button>
                )}

                {resetSent && (
                  <div className="rounded-2xl px-5 py-4 text-sm font-medium text-[#6D1D3E]"
                    style={{ backgroundColor: "rgba(109,29,62,0.08)" }}>
                    Un lien de réinitialisation a été envoyé à {email}.
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl px-5 py-4 text-sm font-medium text-[#6D1D3E]"
                    style={{ backgroundColor: "rgba(109,29,62,0.08)" }}>
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-5 rounded-full text-sm font-bold text-[#6D1D3E] border-2 border-[#6D1D3E] hover:bg-[#6D1D3E] hover:text-white transition-colors duration-200"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-5 rounded-full text-base font-bold text-white transition-all duration-200 disabled:opacity-50"
                    style={{ backgroundColor: "#6D1D3E", fontFamily: "var(--font-display)" }}
                  >
                    {loading ? "En cours..." : authMode === "signup" ? "Créer ma liste →" : "Se connecter →"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>

    {/* Modale URL post-création */}

    {showSlugModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
        <div className="w-full max-w-md rounded-3xl bg-white p-8 flex flex-col gap-6 shadow-2xl">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#6D1D3E]/50 mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Dernière étape
            </p>
            <h2 className="text-2xl font-bold text-[#6D1D3E] leading-tight mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Choisissez votre URL
            </h2>
            <p className="text-sm text-[#6D1D3E]/60 font-light">
              C'est le lien que vous partagerez à vos invités.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center rounded-2xl bg-[#FFF5F0] border-2 border-transparent focus-within:border-[#6D1D3E] transition-colors overflow-hidden">
              <span className="pl-5 pr-1 text-sm text-[#6D1D3E]/40 whitespace-nowrap flex-shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                wedy.fr/mariage/
              </span>
              <input
                autoFocus
                value={modalSlug}
                onChange={handleModalSlugChange}
                placeholder="prenom-et-prenom"
                className="flex-1 py-4 pr-2 text-sm bg-transparent focus:outline-none text-[#6D1D3E] font-medium min-w-0"
                style={{ fontFamily: "var(--font-display)" }}
              />
              <span className="pr-4 flex-shrink-0 text-sm w-6 text-center">
                {modalSlugStatus === "checking" && <span className="text-[#6D1D3E]/40">…</span>}
                {modalSlugStatus === "available" && <span className="text-green-600">✓</span>}
                {modalSlugStatus === "taken" && <span className="text-red-500">✗</span>}
              </span>
            </div>
            {modalSlugStatus === "taken" && (
              <p className="text-xs text-red-500" style={{ fontFamily: "var(--font-display)" }}>
                Cette URL est déjà prise. Essayez une autre.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={confirmModalSlug}
              disabled={!modalSlug || modalSlugStatus === "taken" || modalSlugStatus === "checking"}
              className="w-full py-4 rounded-full text-base font-bold text-white transition-all duration-200 disabled:opacity-40"
              style={{ backgroundColor: "#6D1D3E", fontFamily: "var(--font-display)" }}
            >
              Confirmer mon URL →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 text-sm text-[#6D1D3E]/50 hover:text-[#6D1D3E] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Passer cette étape
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
