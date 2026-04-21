"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Gift, TrendingUp, Eye, LogOut, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  profile: any;
  registry: any;
  gifts: any[];
  totalCollected: number;
  totalGoal: number;
  contributions: any[];
}

export default function DashboardClient({ profile, registry, gifts, totalCollected, totalGoal, contributions }: Props) {
  const router = useRouter();
  const [showAddGift, setShowAddGift] = useState(false);
  const [giftForm, setGiftForm] = useState({ title: "", description: "", price: "" });
  const [loading, setLoading] = useState(false);
  const [localGifts, setLocalGifts] = useState(gifts);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleAddGift(e: React.FormEvent) {
    e.preventDefault();
    if (!registry) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.from("gifts").insert({
      registry_id: registry.id,
      title: giftForm.title,
      description: giftForm.description || null,
      price: parseFloat(giftForm.price),
      display_order: localGifts.length,
    }).select().single();

    if (!error && data) {
      setLocalGifts([...localGifts, data]);
      setGiftForm({ title: "", description: "", price: "" });
      setShowAddGift(false);
    }
    setLoading(false);
  }

  async function handleDeleteGift(giftId: string) {
    const supabase = createClient();
    await supabase.from("gifts").delete().eq("id", giftId);
    setLocalGifts(localGifts.filter((g) => g.id !== giftId));
  }

  const progressPercent = totalGoal > 0 ? Math.min((totalCollected / totalGoal) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <header className="bg-white border-b border-[#f0e6e2] px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl italic text-[#2c2c2c]" style={{ fontFamily: "var(--font-serif)" }}>
            Yes
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {registry && (
            <Link
              href={`/mariage/${registry.slug}`}
              target="_blank"
              className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#7a7370] hover:text-[#2c2c2c] transition-colors"
            >
              <Eye size={14} />
              Voir ma page
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#7a7370] hover:text-[#9e6b5c] transition-colors"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c9a89a] mb-2">
            Votre espace
          </p>
          <h1
            className="text-4xl text-[#2c2c2c]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            {profile?.partner1_name && profile?.partner2_name
              ? `${profile.partner1_name} & ${profile.partner2_name}`
              : "Votre liste de mariage"}
          </h1>
          {registry && (
            <p className="text-sm text-[#7a7370] font-light mt-2">
              yes-omega-drab.vercel.app/mariage/{registry.slug}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#f0e6e2] mb-12">
          {[
            { label: "Cadeaux", value: localGifts.length, icon: Gift },
            { label: "Collecté", value: `${totalCollected.toFixed(0)}€`, icon: TrendingUp },
            { label: "Contributions", value: contributions.length, icon: ExternalLink },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white p-8 flex flex-col gap-2">
                <Icon size={16} className="text-[#c9a89a]" strokeWidth={1.5} />
                <span
                  className="text-3xl text-[#2c2c2c]"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
                >
                  {stat.value}
                </span>
                <span className="text-xs tracking-widest uppercase text-[#7a7370]">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        {totalGoal > 0 && (
          <div className="bg-white p-8 mb-12 border border-[#f0e6e2]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#7a7370] font-light">Progression de la liste</span>
              <span className="text-sm text-[#2c2c2c]" style={{ fontFamily: "var(--font-serif)" }}>
                {totalCollected.toFixed(0)}€ / {totalGoal.toFixed(0)}€
              </span>
            </div>
            <div className="w-full h-px bg-[#f0e6e2]">
              <div
                className="h-px bg-[#c9a89a] transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Gifts section */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl text-[#2c2c2c]"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            Vos cadeaux
          </h2>
          <button
            onClick={() => setShowAddGift(!showAddGift)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2c2c2c] text-white text-xs tracking-widest uppercase hover:bg-[#9e6b5c] transition-colors"
          >
            <Plus size={14} />
            Ajouter
          </button>
        </div>

        {/* Add gift form */}
        {showAddGift && (
          <form
            onSubmit={handleAddGift}
            className="bg-white border border-[#f0e6e2] p-8 mb-6 flex flex-col gap-5"
          >
            <h3
              className="text-lg text-[#2c2c2c]"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
            >
              Nouveau cadeau
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                  Nom du cadeau
                </label>
                <input
                  required
                  value={giftForm.title}
                  onChange={(e) => setGiftForm({ ...giftForm, title: e.target.value })}
                  placeholder="Voyage de noces à Kyoto"
                  className="border-b border-[#d4c9c5] bg-transparent py-2 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                  Prix (€)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={giftForm.price}
                  onChange={(e) => setGiftForm({ ...giftForm, price: e.target.value })}
                  placeholder="250"
                  className="border-b border-[#d4c9c5] bg-transparent py-2 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs tracking-[0.2em] uppercase text-[#7a7370]">
                Description (optionnel)
              </label>
              <input
                value={giftForm.description}
                onChange={(e) => setGiftForm({ ...giftForm, description: e.target.value })}
                placeholder="Une nuit dans un ryokan traditionnel..."
                className="border-b border-[#d4c9c5] bg-transparent py-2 text-sm text-[#2c2c2c] placeholder-[#c9b8b3] focus:outline-none focus:border-[#2c2c2c] transition-colors"
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setShowAddGift(false)}
                className="px-6 py-3 border border-[#d4c9c5] text-[#7a7370] text-xs tracking-widest uppercase hover:border-[#2c2c2c] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#2c2c2c] text-white text-xs tracking-widest uppercase hover:bg-[#9e6b5c] transition-colors disabled:opacity-50"
              >
                {loading ? "Ajout..." : "Ajouter →"}
              </button>
            </div>
          </form>
        )}

        {/* Gift list */}
        {localGifts.length === 0 ? (
          <div className="bg-white border border-dashed border-[#d4c9c5] p-16 text-center">
            <Gift size={32} className="text-[#d4c9c5] mx-auto mb-4" strokeWidth={1} />
            <p className="text-sm text-[#7a7370] font-light">
              Aucun cadeau pour l'instant. Ajoutez votre premier cadeau.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {localGifts.map((gift) => {
              const progress = gift.price > 0
                ? Math.min((gift.amount_collected / gift.price) * 100, 100)
                : 0;
              return (
                <div
                  key={gift.id}
                  className="bg-white border border-[#f0e6e2] p-6 flex items-center justify-between gap-6"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm text-[#2c2c2c] font-medium truncate">{gift.title}</p>
                      {gift.is_funded && (
                        <span className="text-[10px] tracking-widest uppercase bg-[#e8ede9] text-[#3d5440] px-2 py-0.5 flex-shrink-0">
                          Financé
                        </span>
                      )}
                    </div>
                    {gift.description && (
                      <p className="text-xs text-[#7a7370] font-light truncate">{gift.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#f0e6e2]">
                        <div
                          className="h-px bg-[#c9a89a] transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#7a7370] flex-shrink-0">
                        {Number(gift.amount_collected).toFixed(0)}€ / {Number(gift.price).toFixed(0)}€
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGift(gift.id)}
                    className="text-[#d4c9c5] hover:text-[#9e6b5c] transition-colors flex-shrink-0"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
