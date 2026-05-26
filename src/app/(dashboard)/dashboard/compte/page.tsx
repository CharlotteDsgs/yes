"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, User, Crown, Sparkles, CheckCircle2, AlertCircle, KeyRound, Trash2 } from "lucide-react";

type StdPlan = "essentiel" | "premium" | null;
type ListPlan = "free" | "premium";

interface AccountData {
  email: string;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  plan: ListPlan;
  std_plan: StdPlan;
  created_at: string;
}

const sec: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: 16,
  border: "1px solid #f0e6e2",
  padding: "28px 32px",
  marginBottom: 20,
};

const label: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(109,29,62,0.45)",
  marginBottom: 4,
};

const value: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 15,
  color: "#2c2c2c",
  fontWeight: 400,
};

function PlanBadge({ plan, type }: { plan: string | null; type: "list" | "std" }) {
  if (!plan || plan === "free" || plan === null) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 12px", borderRadius: 20,
        backgroundColor: "#f5f5f5", color: "#888",
        fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
      }}>
        {type === "std" ? "Version test" : "Gratuit"}
      </span>
    );
  }
  if (plan === "essentiel") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 12px", borderRadius: 20,
        backgroundColor: "rgba(109,29,62,0.08)", color: "#6D1D3E",
        fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
      }}>
        <CheckCircle2 size={13}/> Essentiel
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 20,
      background: "linear-gradient(135deg, #6D1D3E, #a83060)",
      color: "white",
      fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
    }}>
      <Crown size={13}/> Premium
    </span>
  );
}

export default function ComptePage() {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/connexion"); return; }

      const { data: reg } = await supabase
        .from("registries")
        .select("plan, std_plan, created_at")
        .eq("user_id", user.id)
        .single();

      const { data: profile } = await supabase
        .from("profiles")
        .select("partner1_name, partner2_name, wedding_date")
        .eq("id", user.id)
        .single();

      setData({
        email: user.email ?? "",
        partner1_name: profile?.partner1_name ?? "",
        partner2_name: profile?.partner2_name ?? "",
        wedding_date: profile?.wedding_date ?? "",
        plan: (reg?.plan as ListPlan) ?? "free",
        std_plan: (reg?.std_plan as StdPlan) ?? null,
        created_at: reg?.created_at ?? user.created_at ?? "",
      });
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleResetPassword() {
    if (!data?.email) return;
    setResetError("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/compte`,
    });
    if (error) setResetError(error.message);
    else setResetSent(true);
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "SUPPRIMER") return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const memberSince = data?.created_at
    ? new Date(data.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "";

  const weddingDateFmt = data?.wedding_date
    ? new Date(data.wedding_date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf8f5" }}>
        <div style={{ width: 28, height: 28, border: "2.5px solid #f0e6e2", borderTopColor: "#6D1D3E", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5", padding: "40px 32px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(109,29,62,0.45)", marginBottom: 6 }}>
            Paramètres
          </p>
          <h1 style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300, fontSize: "2.2rem", color: "#2c2c2c", lineHeight: 1.2 }}>
            Mon compte
          </h1>
          {memberSince && (
            <p style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "#b0a0a8", marginTop: 4 }}>
              Membre depuis {memberSince}
            </p>
          )}
        </div>

        {/* Informations personnelles */}
        <div style={sec}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <User size={16} style={{ color: "#6D1D3E", flexShrink: 0 }}/>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#2c2c2c", margin: 0 }}>
              Informations personnelles
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
            <div>
              <p style={label}>Prénom 1</p>
              <p style={value}>{data?.partner1_name || "—"}</p>
            </div>
            <div>
              <p style={label}>Prénom 2</p>
              <p style={value}>{data?.partner2_name || "—"}</p>
            </div>
            <div>
              <p style={label}>Date du mariage</p>
              <p style={value}>{weddingDateFmt}</p>
            </div>
            <div>
              <p style={label}>Email</p>
              <p style={value}>{data?.email}</p>
            </div>
          </div>

          <p style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "#b0a0a8", marginTop: 16 }}>
            Pour modifier ces informations, rendez-vous dans{" "}
            <a href="/dashboard/mariage" style={{ color: "#6D1D3E", textDecoration: "underline" }}>Votre mariage</a>.
          </p>
        </div>

        {/* Abonnements */}
        <div style={sec}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Sparkles size={16} style={{ color: "#6D1D3E", flexShrink: 0 }}/>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#2c2c2c", margin: 0 }}>
              Mes abonnements
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Liste de mariage */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, backgroundColor: "#faf8f5", border: "1px solid #f0e6e2" }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "#2c2c2c", margin: 0 }}>
                  Liste de mariage
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "#b0a0a8", margin: "2px 0 0" }}>
                  {data?.plan === "premium" ? "Cagnotte en ligne · Designs premium" : "Accès gratuit · Fonctionnalités de base"}
                </p>
              </div>
              <PlanBadge plan={data?.plan ?? "free"} type="list"/>
            </div>

            {/* Save the Date */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 10, backgroundColor: "#faf8f5", border: "1px solid #f0e6e2" }}>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "#2c2c2c", margin: 0 }}>
                  Save the Date
                </p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "#b0a0a8", margin: "2px 0 0" }}>
                  {data?.std_plan === "premium"
                    ? "Carte animée · RSVP · Envoi email · Gestion invités"
                    : data?.std_plan === "essentiel"
                    ? "Carte animée · Lien de partage public"
                    : "Accès limité · Passez à la version complète"}
                </p>
              </div>
              <PlanBadge plan={data?.std_plan} type="std"/>
            </div>
          </div>

          {(!data?.std_plan || data.std_plan === "free") && (
            <a href="/dashboard/invitations" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 14, padding: "8px 16px", borderRadius: 20,
              background: "linear-gradient(135deg, #6D1D3E, #a83060)",
              color: "white",
              fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600,
              textDecoration: "none",
            }}>
              <Crown size={13}/> Passer à la version Premium →
            </a>
          )}
        </div>

        {/* Sécurité */}
        <div style={sec}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <KeyRound size={16} style={{ color: "#6D1D3E", flexShrink: 0 }}/>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#2c2c2c", margin: 0 }}>
              Sécurité
            </h2>
          </div>

          {resetSent ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 10, backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <CheckCircle2 size={16} style={{ color: "#16a34a" }}/>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "#16a34a", margin: 0 }}>
                Email envoyé à {data?.email}. Vérifiez votre boîte mail.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "#6a6a6a", marginBottom: 14 }}>
                Un email vous sera envoyé pour réinitialiser votre mot de passe.
              </p>
              <button
                onClick={handleResetPassword}
                style={{
                  padding: "9px 20px", borderRadius: 20,
                  border: "1.5px solid #e0d0d8", backgroundColor: "white",
                  fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                  color: "#6D1D3E", cursor: "pointer",
                }}
              >
                Changer mon mot de passe
              </button>
              {resetError && (
                <p style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "#dc2626", marginTop: 8 }}>
                  {resetError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Zone danger */}
        <div style={{ ...sec, border: "1px solid rgba(220,38,38,0.15)", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Trash2 size={16} style={{ color: "#dc2626", flexShrink: 0 }}/>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 600, color: "#dc2626", margin: 0 }}>
              Supprimer mon compte
            </h2>
          </div>

          {!showDeleteConfirm ? (
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 13, color: "#6a6a6a", marginBottom: 14 }}>
                La suppression de votre compte est irréversible. Toutes vos données seront effacées.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  padding: "9px 20px", borderRadius: 20,
                  border: "1.5px solid rgba(220,38,38,0.3)", backgroundColor: "white",
                  fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                  color: "#dc2626", cursor: "pointer",
                }}
              >
                Supprimer mon compte
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 14px", borderRadius: 10, backgroundColor: "rgba(220,38,38,0.05)", marginBottom: 14 }}>
                <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0, marginTop: 1 }}/>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 12, color: "#dc2626", margin: 0 }}>
                  Cette action est irréversible. Tapez <strong>SUPPRIMER</strong> pour confirmer.
                </p>
              </div>
              <input
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="SUPPRIMER"
                style={{
                  width: "100%", padding: "9px 14px", borderRadius: 10,
                  border: "1.5px solid rgba(220,38,38,0.3)", outline: "none",
                  fontFamily: "var(--font-display)", fontSize: 13, marginBottom: 12,
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                  style={{
                    padding: "9px 18px", borderRadius: 20, border: "1.5px solid #e0d0d8",
                    backgroundColor: "white", fontFamily: "var(--font-display)", fontSize: 13,
                    color: "#6a6a6a", cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "SUPPRIMER" || deleting}
                  style={{
                    padding: "9px 18px", borderRadius: 20, border: "none",
                    backgroundColor: deleteInput === "SUPPRIMER" ? "#dc2626" : "#f0e6e2",
                    fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600,
                    color: deleteInput === "SUPPRIMER" ? "white" : "#b0a0a8",
                    cursor: deleteInput === "SUPPRIMER" ? "pointer" : "not-allowed",
                    transition: "all 150ms",
                  }}
                >
                  {deleting ? "Suppression…" : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
