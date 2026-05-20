"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TemplateRender, CardFoldModal, CardFlipScene, TEMPLATES, type UserData, type CardCustomization } from "@/components/std/StdCardRenderer";

interface StdConfig {
  animation_type: "ouverture" | "retournement" | "rien";
  rsvp_enabled: boolean;
  rsvp_labels: string[];
  rsvp_note?: string;
  template_id: string;
  palette_id: string;
  card_custom: CardCustomization;
}

const ANIM_BG_COLORS: Record<string, string> = {
  white: "#FFFFFF", beige: "#F5EFE4", grey: "#ECEAE6", blush: "#F8EDE8", sage: "#EBF0E9",
};
const ANIM_BG_IMAGES: Record<string, string> = {
  marble: "/fond/marbre.png",
  aquarelle: "/fond/aquarelle_kaki.png",
  aquarelle2: "/fond/aquarelle_beige.png",
  aquarelle3: "/fond/aquarelle_rose.png",
  aquarelle4: "/fond/aquarelle_bleu.png",
};
function getBgStyle(animBg?: string): React.CSSProperties {
  const img = ANIM_BG_IMAGES[animBg ?? "marble"];
  if (img) return { backgroundImage: `url('${img}')`, backgroundSize: "cover", backgroundPosition: "center" };
  return { backgroundColor: ANIM_BG_COLORS[animBg ?? ""] ?? "#ECEAE6" };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "8px",
  border: "1.5px solid #f0e6e2", fontSize: "15px", fontFamily: "Georgia, serif",
  color: "#2c2c2c", background: "#fdfaf8", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-display)", fontSize: "11px",
  letterSpacing: "0.15em", textTransform: "uppercase", color: "#9e6b5c",
  marginBottom: "6px",
};

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"animation" | "form" | "done">("animation");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Modal state
  const [modal, setModal] = useState<{ label: string; rsvpStatus: "confirmed" | "declined" } | null>(null);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        const cfg: StdConfig | null = d.stdConfig;
        if (d.rsvp_status !== "pending") {
          setStep("done");
        } else if (!cfg || cfg.animation_type === "rien") {
          setStep("form");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  function openModal(label: string, rsvpStatus: "confirmed" | "declined") {
    if (data?.name) {
      const parts = data.name.trim().split(" ");
      setPrenom(parts[0] ?? "");
      setNom(parts.slice(1).join(" ") ?? "");
    }
    setModal({ label, rsvpStatus });
  }

  async function submitModal(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setStatus(modal.label);
    setSubmitting(true);
    await fetch(`/api/rsvp/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: modal.rsvpStatus,
        name: `${prenom} ${nom}`.trim(),
        email: email.trim(),
        guestCount: null,
        message: guestMessage || null,
      }),
    });
    setSubmitting(false);
    setModal(null);
    setStep("done");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdfaf8" }}>
        <p style={{ fontFamily: "Georgia, serif", color: "#c9a89a", fontSize: "14px", letterSpacing: "0.2em" }}>Chargement…</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdfaf8" }}>
        <p style={{ fontFamily: "Georgia, serif", color: "#9e6b5c", fontSize: "16px" }}>Lien invalide ou expiré.</p>
      </div>
    );
  }

  const cfg: StdConfig | null = data.stdConfig;
  const tpl = cfg ? TEMPLATES.find(t => t.id === cfg.template_id) : null;
  const palette = tpl ? (tpl.palettes.find(p => p.id === cfg!.palette_id) ?? tpl.palettes[0]) : null;
  const userData: UserData = { p1: data.partner1_name ?? "", p2: data.partner2_name ?? "", date: data.weddingDate ?? "", location: data.location ?? "" };
  const cc: CardCustomization | null = cfg?.card_custom ?? null;
  const rsvpLabels: string[] = cfg?.rsvp_labels?.length ? cfg.rsvp_labels : ["Je participe", "Je ne participe pas"];

  const cardW = Math.min(380, typeof window !== "undefined" ? window.innerWidth - 48 : 380);
  const cardH = Math.round(cardW * 1.4);

  // ── Shared RSVP buttons renderer ─────────────────────────────
  const RsvpButtons = (
    <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {rsvpLabels.map((label, idx) => (
        <button
          key={idx}
          onClick={() => openModal(label, idx === 0 ? "confirmed" : "declined")}
          style={{
            padding: "16px 24px",
            background: idx === 0 ? "#6D1D3E" : "white",
            color: idx === 0 ? "white" : "#6D1D3E",
            border: idx === 0 ? "none" : "1.5px solid rgba(109,29,62,0.25)",
            borderRadius: "4px", fontSize: "12px", letterSpacing: "0.15em",
            textTransform: "uppercase", fontFamily: "var(--font-display)",
            cursor: "pointer", transition: "opacity 0.2s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // ── Modal ─────────────────────────────────────────────────────
  const Modal = modal && (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(44,28,20,0.45)", backdropFilter: "blur(6px)" }}
        onClick={() => setModal(null)}
      />
      <div style={{ position: "relative", width: "100%", maxWidth: "440px", background: "white", borderRadius: "20px", padding: "36px 28px 32px", boxShadow: "0 24px 64px rgba(109,29,62,0.22)", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 300, fontSize: "22px", color: "#6D1D3E", margin: "0 0 6px", textAlign: "center" }}>
          Confirmer votre réponse
        </h2>

        {/* Réponse pré-remplie */}
        <div style={{ textAlign: "center", margin: "12px 0 24px" }}>
          <span style={{
            display: "inline-block", padding: "8px 20px",
            background: modal.rsvpStatus === "confirmed" ? "#6D1D3E" : "white",
            color: modal.rsvpStatus === "confirmed" ? "white" : "#6D1D3E",
            border: modal.rsvpStatus === "confirmed" ? "none" : "1.5px solid rgba(109,29,62,0.3)",
            borderRadius: "4px", fontSize: "11px", letterSpacing: "0.2em",
            textTransform: "uppercase", fontFamily: "var(--font-display)",
          }}>
            {modal.label}
          </span>
          <button
            onClick={() => setModal(null)}
            style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "rgba(109,29,62,0.4)", fontSize: "12px", fontFamily: "var(--font-display)", cursor: "pointer", letterSpacing: "0.1em" }}
          >
            Modifier →
          </button>
        </div>

        <form onSubmit={submitModal} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prénom *</label>
              <input style={inputStyle} value={prenom} onChange={e => setPrenom(e.target.value)} required autoComplete="given-name" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nom *</label>
              <input style={inputStyle} value={nom} onChange={e => setNom(e.target.value)} required autoComplete="family-name" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Adresse e-mail *</label>
            <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" placeholder="votre@email.com" />
          </div>

          <div>
            <label style={labelStyle}>Un mot pour les mariés <span style={{ textTransform: "none", letterSpacing: 0, color: "rgba(158,107,92,0.6)" }}>(optionnel)</span></label>
            <textarea
              style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
              rows={3}
              value={guestMessage}
              onChange={e => setGuestMessage(e.target.value)}
              placeholder="Avec joie et impatience…"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "16px", background: "#6D1D3E", color: "white", border: "none",
              borderRadius: "8px", fontSize: "12px", letterSpacing: "0.2em",
              textTransform: "uppercase", fontFamily: "var(--font-display)",
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
              transition: "opacity 0.2s", marginTop: "4px",
            }}
          >
            {submitting ? "Envoi…" : "Confirmer ma réponse"}
          </button>
        </form>
      </div>
    </div>
  );

  // ── Animation step ──────────────────────────────────────────
  if (step === "animation" && cfg && tpl && palette) {
    const AnimationCard = cfg.animation_type === "ouverture" ? (
      <CardFoldModal
        key={replayKey}
        tpl={tpl} paletteId={cfg.palette_id} user={userData} isStd={true}
        fontPreset={cc?.fontPreset} label={cc?.label} namesText={cc?.namesText}
        dateText={cc?.dateText} locationText={cc?.locationText} footer={cc?.footer}
        photoUrl={cc?.photoUrl || undefined} photoUrls={cc?.photoUrls}
        elementStyles={cc?.styles} customPaperBg={cc?.customPaperBg}
        onClose={() => {}} inline
      />
    ) : (
      <CardFlipScene
        key={replayKey}
        tpl={tpl} paletteId={cfg.palette_id} user={userData} isStd={true}
        fontPreset={cc?.fontPreset} label={cc?.label} namesText={cc?.namesText}
        dateText={cc?.dateText} locationText={cc?.locationText} footer={cc?.footer}
        photoUrl={cc?.photoUrl || undefined} photoUrls={cc?.photoUrls}
        elementStyles={cc?.styles} customPaperBg={cc?.customPaperBg}
        onAnimationDone={() => {}}
      />
    );

    return (
      <>
        {Modal}
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", ...getBgStyle((cfg as any).anim_bg) }}>
          <div style={{ height: "60px", flexShrink: 0 }} />
          <div style={{ flex: "0 0 auto", height: "600px", position: "relative" }}>
            {AnimationCard}
          </div>
          <div style={{ height: "80px", flexShrink: 0, background: "linear-gradient(to bottom, transparent, white)" }} />
          <div style={{ background: "white", padding: "0 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            {userData.p1 && userData.p2 && (
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#6D1D3E", fontStyle: "italic", margin: "0 0 6px", lineHeight: 1.2 }}>
                  {userData.p1} &amp; {userData.p2}
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "18px", color: "#9e6b5c", margin: 0 }}>
                  attendent votre réponse
                </p>
              </div>
            )}
            {RsvpButtons}
            {cfg?.rsvp_note && (
              <p style={{ textAlign: (cfg as any).rsvp_note_align ?? "center", fontFamily: "Georgia, serif", fontSize: "21px", color: "#7a7370", lineHeight: 1.7, maxWidth: "360px", margin: "4px 0 0", whiteSpace: "pre-wrap" }}>
                {cfg.rsvp_note}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── RSVP form (no animation) ────────────────────────────────
  if (step === "form") {
    return (
      <>
        {Modal}
        <div className="min-h-screen flex flex-col items-center" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>
          {tpl && palette && cc && (
            <div style={{ paddingTop: "40px", paddingBottom: "24px" }}>
              <div style={{ boxShadow: "0 8px 40px rgba(109,29,62,0.18)", borderRadius: 2, overflow: "hidden" }}>
                <TemplateRender
                  id={tpl.id} W={cardW} H={cardH}
                  palette={palette} user={userData} isStd={true}
                  fontPreset={cc.fontPreset} label={cc.label}
                  namesText={cc.namesText} dateText={cc.dateText}
                  locationText={cc.locationText} footer={cc.footer}
                  photoUrl={cc.photoUrl || undefined} photoUrls={cc.photoUrls}
                  elementStyles={cc.styles} customPaperBg={cc.customPaperBg}
                />
              </div>
            </div>
          )}
          {cfg?.rsvp_enabled !== false && (
            <div style={{ width: "100%", maxWidth: "400px", padding: "0 24px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <p style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "13px", color: "#9e6b5c", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
                Votre réponse
              </p>
              {RsvpButtons}
              {cfg?.rsvp_note && (
                <p style={{ textAlign: (cfg as any).rsvp_note_align ?? "center", fontFamily: "Georgia, serif", fontSize: "21px", color: "#7a7370", lineHeight: 1.7, marginTop: "8px", whiteSpace: "pre-wrap" }}>
                  {cfg.rsvp_note}
                </p>
              )}
            </div>
          )}
          <p style={{ textAlign: "center", fontSize: "11px", color: "#c9a89a", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-display)", paddingBottom: "24px" }}>
            Wedy · La liste de mariage qui vous ressemble
          </p>
        </div>
      </>
    );
  }

  // ── Done step ──────────────────────────────────────────────
  const currentRsvpStatus = data.rsvp_status as "confirmed" | "declined" | "pending";

  return (
    <>
      {Modal}
      <div className="min-h-screen flex flex-col items-center" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)", padding: "40px 20px 32px" }}>

        {/* Confirmation message */}
        <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "16px", boxShadow: "0 8px 48px rgba(109,29,62,0.12)", padding: "40px 32px", textAlign: "center", marginBottom: "20px" }}>
          {currentRsvpStatus === "confirmed" ? (
            <>
              <div style={{ fontSize: "44px", marginBottom: "14px" }}>💐</div>
              <h2 style={{ fontSize: "22px", fontWeight: 300, color: "#6D1D3E", margin: "0 0 10px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Merci, à bientôt !</h2>
              <p style={{ fontSize: "15px", color: "#7a7370", margin: "0 0 28px", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>Votre présence est confirmée. Nous avons hâte de vous retrouver pour ce beau jour.</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "44px", marginBottom: "14px" }}>💌</div>
              <h2 style={{ fontSize: "22px", fontWeight: 300, color: "#6D1D3E", margin: "0 0 10px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Nous comprenons.</h2>
              <p style={{ fontSize: "15px", color: "#7a7370", margin: "0 0 24px", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>Merci de nous avoir répondu. Vous serez avec nous en pensée ce jour-là.</p>
              {data.registrySlug && (
                <a href={`/mariage/${data.registrySlug}`} style={{ display: "inline-block", padding: "12px 28px", background: "#6D1D3E", color: "white", textDecoration: "none", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "var(--font-display)", borderRadius: "4px", marginBottom: "20px" }}>
                  Voir la liste de mariage →
                </a>
              )}
            </>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
            {tpl && palette && cc && (
              <button
                onClick={() => { setReplayKey(k => k + 1); setStep(cfg && cfg.animation_type !== "rien" ? "animation" : "form"); }}
                style={{ width: "100%", padding: "13px", background: "none", border: "1.5px solid rgba(109,29,62,0.18)", borderRadius: "8px", fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#6D1D3E", cursor: "pointer" }}
              >
                Revoir l'invitation ↓
              </button>
            )}
            {cfg?.rsvp_enabled !== false && (
              <button
                onClick={() => openModal(
                  currentRsvpStatus === "confirmed" ? (rsvpLabels[1] ?? rsvpLabels[0]) : rsvpLabels[0],
                  currentRsvpStatus === "confirmed" ? "declined" : "confirmed"
                )}
                style={{ width: "100%", padding: "12px", background: "none", border: "1.5px dashed rgba(109,29,62,0.2)", borderRadius: "8px", fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(109,29,62,0.5)", cursor: "pointer" }}
              >
                Modifier ma réponse
              </button>
            )}
          </div>
        </div>


        <p style={{ textAlign: "center", fontSize: "11px", color: "#c9a89a", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-display)", paddingBottom: "8px" }}>
          Wedy · La liste de mariage qui vous ressemble
        </p>
      </div>
    </>
  );
}
