"use client";
// v3-stripe
import { useState } from "react";
import { Heart, MapPin, Calendar, ChevronDown } from "lucide-react";

const themeStyles: Record<string, {
  bg: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  text: string;
  muted: string;
  border: string;
}> = {
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
  const theme = themeStyles[registry.theme] ?? themeStyles.rose;
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [contributionForm, setContributionForm] = useState({
    name: "",
    email: "",
    amount: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const names = profile?.partner1_name && profile?.partner2_name
    ? `${profile.partner1_name} & ${profile.partner2_name}`
    : registry.title;

  const weddingDate = registry.ceremony_date
    ? new Date(registry.ceremony_date).toLocaleDateString("fr-FR", {
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

    const { url, error } = await res.json();
    if (url) {
      window.location.href = url;
    } else {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg, color: theme.text }}>

      {/* Hero */}
      <section
        className="relative py-32 md:py-48 flex flex-col items-center justify-center text-center px-6 overflow-hidden"
        style={{ backgroundColor: theme.accentLight }}
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 0%, ${theme.accent} 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10">
          <p
            className="text-xs tracking-[0.4em] uppercase mb-6"
            style={{ color: theme.accent }}
          >
            Liste de mariage
          </p>
          <h1
            className="text-6xl md:text-8xl leading-[0.9] mb-8"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300, color: theme.text }}
          >
            {profile?.partner1_name && (
              <>
                {profile.partner1_name}
                <br />
                <span style={{ fontStyle: "italic", color: theme.accentDark }}>
                  & {profile.partner2_name}
                </span>
              </>
            )}
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            {weddingDate && (
              <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                <Calendar size={14} strokeWidth={1.5} />
                <span className="text-sm font-light">{weddingDate}</span>
              </div>
            )}
            {registry.ceremony_location && (
              <div className="flex items-center gap-2" style={{ color: theme.muted }}>
                <MapPin size={14} strokeWidth={1.5} />
                <span className="text-sm font-light">{registry.ceremony_location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: theme.accent, opacity: 0.5 }}>
          <ChevronDown size={18} />
        </div>
      </section>

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
      <section className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.35em] uppercase mb-4" style={{ color: theme.accent }}>
            Nos souhaits
          </p>
          <h2
            className="text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300, color: theme.text }}
          >
            Notre liste de <span style={{ fontStyle: "italic" }}>cadeaux</span>
          </h2>
        </div>

        {gifts.length === 0 ? (
          <p className="text-center text-sm font-light" style={{ color: theme.muted }}>
            La liste est en cours de préparation...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => {
              const progress = gift.price > 0
                ? Math.min((gift.amount_collected / gift.price) * 100, 100)
                : 0;
              const remaining = Math.max(gift.price - gift.amount_collected, 0);
              const isFunded = gift.is_funded || progress >= 100;

              return (
                <div
                  key={gift.id}
                  className="flex flex-col p-6 transition-all duration-300"
                  style={{
                    border: `1px solid ${theme.border}`,
                    backgroundColor: isFunded ? theme.accentLight : theme.bg,
                    opacity: isFunded ? 0.7 : 1,
                  }}
                >
                  {/* Gift image placeholder */}
                  {gift.image_url ? (
                    <img
                      src={gift.image_url}
                      alt={gift.title}
                      className="w-full h-40 object-cover mb-4"
                    />
                  ) : (
                    <div
                      className="w-full h-32 flex items-center justify-center mb-4"
                      style={{ backgroundColor: theme.accentLight }}
                    >
                      <Heart size={24} strokeWidth={1} style={{ color: theme.accent }} />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3
                      className="text-lg mb-1"
                      style={{ fontFamily: "var(--font-serif)", fontWeight: 500, color: theme.text }}
                    >
                      {gift.title}
                    </h3>
                    {gift.description && (
                      <p className="text-sm font-light mb-4 leading-relaxed" style={{ color: theme.muted }}>
                        {gift.description}
                      </p>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-2" style={{ color: theme.muted }}>
                      <span>{Number(gift.amount_collected).toFixed(0)}€ collectés</span>
                      <span>{Number(gift.price).toFixed(0)}€</span>
                    </div>
                    <div className="w-full h-px" style={{ backgroundColor: theme.border }}>
                      <div
                        className="h-px transition-all duration-700"
                        style={{ width: `${progress}%`, backgroundColor: theme.accent }}
                      />
                    </div>
                  </div>

                  {isFunded ? (
                    <div
                      className="mt-4 text-center py-3 text-xs tracking-widest uppercase"
                      style={{ color: theme.accent, border: `1px solid ${theme.border}` }}
                    >
                      Cadeau financé ✓
                    </div>
                  ) : (
                    <button
                      onClick={() => handleContribute(gift)}
                      className="mt-4 py-3 text-xs tracking-widest uppercase transition-colors duration-300"
                      style={{
                        backgroundColor: theme.text,
                        color: theme.bg,
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = theme.accentDark;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.backgroundColor = theme.text;
                      }}
                    >
                      Participer · {remaining.toFixed(0)}€ restants
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

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
            Yes
          </a>
        </p>
      </footer>
    </div>
  );
}
