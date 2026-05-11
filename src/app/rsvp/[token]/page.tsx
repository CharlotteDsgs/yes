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

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"animation" | "form" | "done">("animation");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

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
        // else: stays on "animation" step
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleSubmit(chosenLabel: string, chosenStatus: "confirmed" | "declined") {
    setStatus(chosenLabel);
    setSubmitting(true);
    await fetch(`/api/rsvp/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: chosenStatus, name: data?.name, guestCount: null, message: null }),
    });
    setSubmitting(false);
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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundImage: "url('/fond/marbre.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        {/* Marbre au-dessus */}
        <div style={{ height: "60px", flexShrink: 0 }} />
        {/* Animation */}
        <div style={{ flex: "0 0 auto", height: "600px", position: "relative" }}>
          {AnimationCard}
        </div>
        {/* Fondu marbre → blanc */}
        <div style={{ height: "80px", flexShrink: 0, background: "linear-gradient(to bottom, transparent, white)" }} />

        {/* RSVP section */}
        <div style={{ background: "white", padding: "0 24px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          {/* Texte personnalisé */}
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
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {rsvpLabels.map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(label, idx === 0 ? "confirmed" : "declined")}
                disabled={submitting}
                style={{
                  padding: "16px 24px",
                  background: idx === 0 ? "#6D1D3E" : "white",
                  color: idx === 0 ? "white" : "#6D1D3E",
                  border: idx === 0 ? "none" : "1.5px solid rgba(109,29,62,0.25)",
                  borderRadius: "4px", fontSize: "12px", letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  fontFamily: "var(--font-display)", cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1, transition: "opacity 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {cfg?.rsvp_note && (
            <p style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "21px", color: "#7a7370", lineHeight: 1.7, maxWidth: "360px", margin: "4px 0 0" }}>
              {cfg.rsvp_note}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── RSVP form ──────────────────────────────────────────────
  if (step === "form") {
    return (
      <div className="min-h-screen flex flex-col items-center" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>

        {/* Card preview */}
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

        {/* RSVP buttons */}
        {cfg?.rsvp_enabled !== false && (
          <div style={{ width: "100%", maxWidth: "400px", padding: "0 24px 48px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "13px", color: "#9e6b5c", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px" }}>
              Votre réponse
            </p>
            {rsvpLabels.map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleSubmit(label, idx === 0 ? "confirmed" : "declined")}
                disabled={submitting}
                style={{
                  padding: "18px 24px",
                  background: idx === 0 ? "#6D1D3E" : "white",
                  color: idx === 0 ? "white" : "#6D1D3E",
                  border: idx === 0 ? "none" : "1.5px solid rgba(109,29,62,0.25)",
                  borderRadius: "4px",
                  fontSize: "13px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                  fontFamily: "var(--font-display)",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {label}
              </button>
            ))}
            {cfg?.rsvp_note && (
              <p style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "21px", color: "#7a7370", lineHeight: 1.7, marginTop: "8px" }}>
                {cfg.rsvp_note}
              </p>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "11px", color: "#c9a89a", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-display)", paddingBottom: "24px" }}>
          Wedy · La liste de mariage qui vous ressemble
        </p>
      </div>
    );
  }

  // ── Done step ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "16px", boxShadow: "0 8px 48px rgba(109,29,62,0.12)", padding: "48px 36px", textAlign: "center", margin: "24px" }}>
        {(status ?? data.rsvp_status) === "confirmed" ? (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💐</div>
            <h2 style={{ fontSize: "24px", fontWeight: 300, color: "#6D1D3E", margin: "0 0 12px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Merci, à bientôt !</h2>
            <p style={{ fontSize: "15px", color: "#7a7370", margin: "0 0 32px", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>Votre présence est confirmée. Nous avons hâte de vous retrouver pour ce beau jour.</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💌</div>
            <h2 style={{ fontSize: "24px", fontWeight: 300, color: "#6D1D3E", margin: "0 0 12px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Nous comprenons.</h2>
            <p style={{ fontSize: "15px", color: "#7a7370", margin: "0 0 32px", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>Merci de nous avoir répondu. Vous serez avec nous en pensée ce jour-là.</p>
          </>
        )}
        {data.registrySlug && (
          <a href={`/mariage/${data.registrySlug}`} style={{ display: "inline-block", padding: "14px 32px", background: "#6D1D3E", color: "white", textDecoration: "none", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "var(--font-display)", borderRadius: "4px" }}>
            Voir la liste de mariage →
          </a>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: "11px", color: "#c9a89a", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-display)", paddingBottom: "24px" }}>
        Wedy · La liste de mariage qui vous ressemble
      </p>
    </div>
  );
}
