"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/creer");
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex pt-20 lg:pt-0">
      {/* Left panel - photo */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/photo_couple/couple_2.JPG"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#7a7370]/70 hover:text-[#7a7370] transition-colors"
            style={{ fontFamily: "var(--font-serif)" }}>
            ← Accueil
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden block mb-10">
            <span
              className="text-3xl text-[#2c2c2c] italic"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Yes
            </span>
          </Link>

          <p className="text-xs tracking-[0.3em] uppercase text-[#c9a89a] mb-3">
            Bienvenue
          </p>
          <h1
            className="text-4xl text-[#2c2c2c] mb-2"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            Créez votre compte
          </h1>
          <p className="text-sm text-[#7a7370] font-light mb-10">
            Gratuit, sans carte bancaire requise.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className="w-full border-b border-[#d4c9c5] bg-transparent py-3 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                Mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="w-full border-b border-[#d4c9c5] bg-transparent py-3 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-[#9e6b5c] bg-[#f0e6e2] px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-4 bg-[#2c2c2c] text-white text-xs tracking-[0.25em] uppercase hover:bg-[#9e6b5c] transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Créer mon compte →"}
            </button>
          </form>

          <p className="mt-8 text-sm text-[#7a7370] font-light text-center">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-[#2c2c2c] hover:text-[#9e6b5c] transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
