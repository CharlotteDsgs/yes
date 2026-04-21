"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const themes = [
  { id: "rose", name: "Rose Poudré", colors: ["#f0e6e2", "#c9a89a", "#9e6b5c"] },
  { id: "gold", name: "Douceur Dorée", colors: ["#f5edd8", "#c4a35a", "#2c2c2c"] },
  { id: "sage", name: "Jardin de Sauge", colors: ["#e8ede9", "#8a9e8c", "#3d5440"] },
  { id: "noir", name: "Nuit Élégante", colors: ["#2c2c2c", "#7a7370", "#c9a89a"] },
];

export default function CreerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    partner1_name: "",
    partner2_name: "",
    wedding_date: "",
    ceremony_location: "",
    theme: "rose",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/connexion");
      return;
    }

    // Upsert profile (crée ou met à jour)
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email!,
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

    // Create slug
    const slug = `${form.partner1_name}-et-${form.partner2_name}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if registry already exists
    const { data: existing } = await supabase
      .from("registries")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existing) {
      router.push("/dashboard");
      return;
    }

    // Create registry
    const { error: registryError } = await supabase.from("registries").insert({
      user_id: user.id,
      slug,
      title: `Liste de mariage de ${form.partner1_name} & ${form.partner2_name}`,
      theme: form.theme,
      ceremony_location: form.ceremony_location || null,
      ceremony_date: form.wedding_date || null,
    });

    if (registryError) {
      setError(`Erreur : ${registryError.message}`);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center px-6 py-16">
      {/* Logo */}
      <span
        className="text-3xl text-[#2c2c2c] italic mb-16 block"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Yes
      </span>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-12">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 flex items-center justify-center text-xs transition-colors duration-300 ${
                step >= s
                  ? "bg-[#2c2c2c] text-white"
                  : "border border-[#d4c9c5] text-[#7a7370]"
              }`}
            >
              {s}
            </div>
            {s < 2 && <div className={`w-12 h-px ${step > s ? "bg-[#2c2c2c]" : "bg-[#d4c9c5]"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        {step === 1 && (
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#c9a89a] mb-3">
              Étape 1 sur 2
            </p>
            <h1
              className="text-4xl text-[#2c2c2c] mb-2"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
            >
              Vos informations
            </h1>
            <p className="text-sm text-[#7a7370] font-light mb-10">
              Dites-nous qui vous êtes et quand vous vous mariez.
            </p>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                    Prénom 1
                  </label>
                  <input
                    name="partner1_name"
                    required
                    value={form.partner1_name}
                    onChange={handleChange}
                    placeholder="Charlotte"
                    className="border-b border-[#d4c9c5] bg-transparent py-3 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                    Prénom 2
                  </label>
                  <input
                    name="partner2_name"
                    required
                    value={form.partner2_name}
                    onChange={handleChange}
                    placeholder="Julien"
                    className="border-b border-[#d4c9c5] bg-transparent py-3 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                  Date du mariage
                </label>
                <input
                  type="date"
                  name="wedding_date"
                  value={form.wedding_date}
                  onChange={handleChange}
                  className="border-b border-[#d4c9c5] bg-transparent py-3 text-sm text-[#2c2c2c] focus:outline-none focus:border-[#2c2c2c] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                  Lieu de la cérémonie
                </label>
                <input
                  name="ceremony_location"
                  value={form.ceremony_location}
                  onChange={handleChange}
                  placeholder="Paris, France"
                  className="border-b border-[#d4c9c5] bg-transparent py-3 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.partner1_name || !form.partner2_name}
                className="mt-4 w-full py-4 bg-[#2c2c2c] text-white text-xs tracking-[0.25em] uppercase hover:bg-[#9e6b5c] transition-colors duration-300 disabled:opacity-40"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <p className="text-xs tracking-[0.3em] uppercase text-[#c9a89a] mb-3">
              Étape 2 sur 2
            </p>
            <h1
              className="text-4xl text-[#2c2c2c] mb-2"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
            >
              Votre thème
            </h1>
            <p className="text-sm text-[#7a7370] font-light mb-10">
              Choisissez l'ambiance visuelle de votre page. Vous pourrez la changer plus tard.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setForm({ ...form, theme: theme.id })}
                  className={`p-4 text-left transition-all duration-200 border-2 ${
                    form.theme === theme.id
                      ? "border-[#2c2c2c]"
                      : "border-transparent hover:border-[#d4c9c5]"
                  }`}
                >
                  {/* Palette preview */}
                  <div className="flex h-10 mb-3 overflow-hidden">
                    {theme.colors.map((color, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p
                    className="text-sm text-[#2c2c2c]"
                    style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
                  >
                    {theme.name}
                  </p>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-[#9e6b5c] bg-[#f0e6e2] px-4 py-3 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-4 border border-[#d4c9c5] text-[#7a7370] text-xs tracking-[0.25em] uppercase hover:border-[#2c2c2c] hover:text-[#2c2c2c] transition-colors"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 bg-[#2c2c2c] text-white text-xs tracking-[0.25em] uppercase hover:bg-[#9e6b5c] transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer ma liste →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
