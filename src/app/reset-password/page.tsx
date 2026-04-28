"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WedyLogo from "@/components/WedyLogo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row pt-20 lg:pt-0">
      {/* Left panel */}
      <div className="hidden lg:block lg:w-[33%] relative flex-shrink-0">
        <Image src="/creer-image-2.jpg" alt="" fill className="object-cover" priority />
        <div className="absolute top-8 left-8">
          <WedyLogo size="md" />
        </div>
      </div>

      {/* Right panel */}
      <div
        className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-16"
        style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}
      >
        <div className="w-full max-w-md mx-auto">
          <div className="flex lg:hidden justify-center mb-10">
            <WedyLogo size="md" />
          </div>

          {done ? (
            <div className="text-center">
              <h1
                className="text-4xl font-bold text-[#6D1D3E] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Mot de passe mis à jour !
              </h1>
              <p className="text-sm text-[#6D1D3E]/60 font-light">
                Vous allez être redirigé vers votre tableau de bord…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <p
                  className="text-xs font-bold tracking-[0.3em] uppercase text-[#6D1D3E]/50 mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Sécurité
                </p>
                <h1
                  className="text-4xl font-bold text-[#6D1D3E] mb-2 leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Nouveau mot de passe
                </h1>
                <p className="text-sm text-[#6D1D3E]/60 font-light">
                  Choisissez un mot de passe de 8 caractères minimum.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-bold tracking-widest uppercase text-[#6D1D3E]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="rounded-2xl px-5 py-4 text-base bg-white border-2 border-transparent focus:border-[#6D1D3E] focus:outline-none transition-colors placeholder:text-[#6D1D3E]/25 text-[#6D1D3E] font-medium"
                  style={{ fontFamily: "var(--font-display)" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-bold tracking-widest uppercase text-[#6D1D3E]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  className="rounded-2xl px-5 py-4 text-base bg-white border-2 border-transparent focus:border-[#6D1D3E] focus:outline-none transition-colors placeholder:text-[#6D1D3E]/25 text-[#6D1D3E] font-medium"
                  style={{ fontFamily: "var(--font-display)" }}
                />
              </div>

              {error && (
                <div
                  className="rounded-2xl px-5 py-4 text-sm font-medium text-[#6D1D3E]"
                  style={{ backgroundColor: "rgba(109,29,62,0.08)" }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-full text-base font-bold text-white transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: "#6D1D3E", fontFamily: "var(--font-display)" }}
              >
                {loading ? "Mise à jour…" : "Enregistrer le mot de passe →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
