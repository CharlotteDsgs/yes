"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ConnexionPage() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2c2c2c] flex-col items-center justify-center p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, #c9a89a 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 text-center">
          <Link href="/">
            <span
              className="text-4xl text-white italic block mb-12"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Yes
            </span>
          </Link>
          <p
            className="text-3xl text-white leading-snug mb-6"
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300 }}
          >
            Votre liste de mariage vous attend.
          </p>
          <p className="text-sm text-[#7a7370]">Bon retour parmi nous.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8">
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
            Bon retour
          </p>
          <h1
            className="text-4xl text-[#2c2c2c] mb-2"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            Connexion
          </h1>
          <p className="text-sm text-[#7a7370] font-light mb-10">
            Gérez votre liste et suivez les contributions.
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <p className="mt-8 text-sm text-[#7a7370] font-light text-center">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="text-[#2c2c2c] hover:text-[#9e6b5c] transition-colors">
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
