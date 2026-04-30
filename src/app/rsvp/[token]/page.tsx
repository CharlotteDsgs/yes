"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function RsvpPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"form" | "done">("form");
  const [status, setStatus] = useState<"confirmed" | "declined" | null>(null);
  const [name, setName] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        if (d.name) setName(d.name);
        if (d.rsvp_status !== "pending") setStep("done");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleSubmit(chosen: "confirmed" | "declined") {
    setStatus(chosen);
    setSubmitting(true);
    await fetch(`/api/rsvp/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: chosen, name, guestCount: chosen === "confirmed" ? guestCount : null, message }),
    });
    setSubmitting(false);
    setStep("done");
  }

  const weddingDate = data?.weddingDate
    ? new Date(data.weddingDate + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #6D1D3E 0%, #9e3d60 100%)", padding: "48px 24px 40px", textAlign: "center" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "0 0 16px", fontFamily: "'Helvetica Neue', sans-serif" }}>
          Wedy · Save the Date
        </p>
        <h1 style={{ fontSize: "clamp(28px, 8vw, 48px)", fontWeight: 300, color: "#ffffff", margin: 0, lineHeight: 1.2, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          {data.coupleName}
        </h1>
        {weddingDate && (
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: "16px 0 0", letterSpacing: "0.08em", fontFamily: "Georgia, serif" }}>
            {weddingDate}
          </p>
        )}
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div style={{ width: "100%", maxWidth: "480px", background: "white", borderRadius: "16px", boxShadow: "0 8px 48px rgba(109,29,62,0.12)", overflow: "hidden" }}>

          {step === "form" && (
            <div style={{ padding: "40px 36px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 300, color: "#2c2c2c", margin: "0 0 8px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                Serez-vous des nôtres ?
              </h2>
              <p style={{ fontSize: "14px", color: "#7a7370", margin: "0 0 32px", fontFamily: "Georgia, serif" }}>
                Merci de nous confirmer votre présence.
              </p>

              {/* Name */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e6b5c", marginBottom: "8px", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Votre prénom
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Prénom"
                  style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #f0e6e2", borderRadius: "8px", fontSize: "15px", fontFamily: "Georgia, serif", color: "#2c2c2c", outline: "none", boxSizing: "border-box", background: "#fdfaf8" }}
                />
              </div>

              {/* Guest count */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e6b5c", marginBottom: "8px", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Nombre de personnes
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setGuestCount(n)}
                      style={{
                        flex: 1, padding: "10px", border: `1.5px solid ${guestCount === n ? "#6D1D3E" : "#f0e6e2"}`,
                        borderRadius: "8px", fontSize: "15px", fontFamily: "Georgia, serif",
                        background: guestCount === n ? "#6D1D3E" : "white",
                        color: guestCount === n ? "white" : "#7a7370", cursor: "pointer",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e6b5c", marginBottom: "8px", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Un mot pour les mariés <span style={{ color: "#c9a89a" }}>(optionnel)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Avec grand plaisir…"
                  rows={3}
                  style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #f0e6e2", borderRadius: "8px", fontSize: "14px", fontFamily: "Georgia, serif", color: "#2c2c2c", outline: "none", resize: "none", boxSizing: "border-box", background: "#fdfaf8" }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => handleSubmit("confirmed")}
                  disabled={submitting || !name.trim()}
                  style={{
                    padding: "16px", background: "#6D1D3E", color: "white", border: "none",
                    borderRadius: "8px", fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase",
                    fontFamily: "'Helvetica Neue', sans-serif", cursor: submitting ? "not-allowed" : "pointer",
                    opacity: !name.trim() ? 0.5 : 1, transition: "opacity 0.2s",
                  }}
                >
                  Oui, je serai présent(e) ✓
                </button>
                <button
                  onClick={() => handleSubmit("declined")}
                  disabled={submitting || !name.trim()}
                  style={{
                    padding: "16px", background: "white", color: "#7a7370",
                    border: "1.5px solid #f0e6e2", borderRadius: "8px", fontSize: "13px",
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    fontFamily: "'Helvetica Neue', sans-serif", cursor: submitting ? "not-allowed" : "pointer",
                    opacity: !name.trim() ? 0.5 : 1, transition: "opacity 0.2s",
                  }}
                >
                  Je ne pourrai pas être là
                </button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div style={{ padding: "48px 36px", textAlign: "center" }}>
              {(status ?? data.rsvp_status) === "confirmed" ? (
                <>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>💐</div>
                  <h2 style={{ fontSize: "24px", fontWeight: 300, color: "#6D1D3E", margin: "0 0 12px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                    Merci, à bientôt !
                  </h2>
                  <p style={{ fontSize: "15px", color: "#7a7370", margin: "0 0 32px", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>
                    Votre présence est confirmée. Nous avons hâte de vous retrouver pour ce beau jour.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>💌</div>
                  <h2 style={{ fontSize: "24px", fontWeight: 300, color: "#6D1D3E", margin: "0 0 12px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                    Nous comprenons.
                  </h2>
                  <p style={{ fontSize: "15px", color: "#7a7370", margin: "0 0 32px", fontFamily: "Georgia, serif", lineHeight: 1.7 }}>
                    Merci de nous avoir répondu. Vous serez avec nous en pensée ce jour-là.
                  </p>
                </>
              )}
              {data.registrySlug && (
                <a
                  href={`/mariage/${data.registrySlug}`}
                  style={{
                    display: "inline-block", padding: "14px 32px", background: "#6D1D3E",
                    color: "white", textDecoration: "none", fontSize: "11px",
                    letterSpacing: "0.25em", textTransform: "uppercase",
                    fontFamily: "'Helvetica Neue', sans-serif", borderRadius: "4px",
                  }}
                >
                  Voir la liste de mariage →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: "11px", color: "#c9a89a", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'Helvetica Neue', sans-serif", paddingBottom: "24px" }}>
        Wedy · La liste de mariage qui vous ressemble
      </p>
    </div>
  );
}
