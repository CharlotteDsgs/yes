"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Camera, CalendarDays, MapPin, Link as LinkIcon, Move } from "lucide-react";

type Field = "partner1_name" | "partner2_name" | "wedding_date" | "ceremony_location" | "slug" | null;

export default function VotreMariagePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [editing, setEditing] = useState<Field>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [couplePhoto, setCouplePhoto] = useState<string | null>(null);
  const [photoPositionY, setPhotoPositionY] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartPos = useRef(50);
  const photoContainerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    partner1_name: "",
    partner2_name: "",
    wedding_date: "",
    ceremony_location: "",
  });

  const [slug, setSlug] = useState("");
  const [slugDraft, setSlugDraft] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "saved">("idle");
  const slugCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toSlug(val: string) {
    return val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function checkSlugAvailable(val: string): Promise<boolean> {
    const supabase = createClient();
    const { data } = await supabase.from("registries").select("id").eq("slug", val).maybeSingle();
    return !data;
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/connexion"); return; }
      setUserId(user.id);

      const [{ data: profile }, { data: registry }] = await Promise.all([
        supabase.from("profiles").select("partner1_name, partner2_name, wedding_date").eq("id", user.id).single(),
        supabase.from("registries").select("id, slug, cover_image_url, ceremony_location, ceremony_date").eq("user_id", user.id).single(),
      ]);

      if (!registry) { router.push("/creer"); return; }
      setRegistryId(registry.id);
      setSlug(registry.slug ?? "");
      setSlugDraft(registry.slug ?? "");
      setCouplePhoto(registry.cover_image_url ?? null);
      setPhotoPositionY((registry as any).cover_image_position ?? 50);
      setForm({
        partner1_name: profile?.partner1_name ?? "",
        partner2_name: profile?.partner2_name ?? "",
        wedding_date: profile?.wedding_date ?? registry.ceremony_date ?? "",
        ceremony_location: registry.ceremony_location ?? "",
      });
      setLoading(false);
    }
    load();
  }, [router]);

  async function save(updatedForm: typeof form) {
    if (!userId || !registryId) return;
    const supabase = createClient();
    await Promise.all([
      supabase.from("profiles").update({
        partner1_name: updatedForm.partner1_name || null,
        partner2_name: updatedForm.partner2_name || null,
        wedding_date: updatedForm.wedding_date || null,
        updated_at: new Date().toISOString(),
      }).eq("id", userId),
      supabase.from("registries").update({
        ceremony_location: updatedForm.ceremony_location || null,
        ceremony_date: updatedForm.wedding_date || null,
      }).eq("id", registryId),
    ]);
  }

  function handleSlugDraftChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = toSlug(e.target.value);
    setSlugDraft(val);
    setSlugStatus("idle");
    if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
    if (val && val !== slug) {
      slugCheckRef.current = setTimeout(async () => {
        setSlugStatus("checking");
        const available = await checkSlugAvailable(val);
        setSlugStatus(available ? "available" : "taken");
      }, 600);
    }
  }

  async function saveSlug() {
    if (!registryId || !slugDraft || slugDraft === slug) { setEditing(null); return; }
    if (slugStatus === "taken" || slugStatus === "checking") return;
    const available = await checkSlugAvailable(slugDraft);
    if (!available) { setSlugStatus("taken"); return; }
    const supabase = createClient();
    await supabase.from("registries").update({ slug: slugDraft }).eq("id", registryId);
    setSlug(slugDraft);
    setSlugStatus("saved");
    setEditing(null);
    setTimeout(() => setSlugStatus("idle"), 2500);
  }

  function handleBlur(field: Field) {
    if (field === "slug") { saveSlug(); return; }
    setEditing(null);
    save(form);
  }

  function handleKeyDown(e: React.KeyboardEvent, field: Field) {
    if (field === "slug") {
      if (e.key === "Enter") saveSlug();
      if (e.key === "Escape") { setSlugDraft(slug); setSlugStatus("idle"); setEditing(null); }
      return;
    }
    if (e.key === "Enter") { setEditing(null); save(form); }
    if (e.key === "Escape") setEditing(null);
  }

  async function savePosition(posY: number) {
    if (!registryId) return;
    const supabase = createClient();
    await supabase.from("registries").update({ cover_image_position: posY } as any).eq("id", registryId);
  }

  function handleDragStart(e: React.PointerEvent) {
    if (!couplePhoto) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartPos.current = photoPositionY;

    function onMove(ev: PointerEvent) {
      const container = photoContainerRef.current;
      if (!container) return;
      const delta = ev.clientY - dragStartY.current;
      const containerH = container.clientHeight;
      const percentDelta = (delta / containerH) * 100;
      const newPos = Math.min(100, Math.max(0, dragStartPos.current + percentDelta));
      setPhotoPositionY(newPos);
    }
    function onUp(ev: PointerEvent) {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const container = photoContainerRef.current;
      if (!container) return;
      const delta = ev.clientY - dragStartY.current;
      const containerH = container.clientHeight;
      const percentDelta = (delta / containerH) * 100;
      const newPos = Math.min(100, Math.max(0, dragStartPos.current + percentDelta));
      savePosition(newPos);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  async function handlePhotoUpload(file: File) {
    if (!registryId) return;
    setPhotoUploading(true);
    const preview = URL.createObjectURL(file);
    setCouplePhoto(preview);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${registryId}/couple-photo.${ext}`;
    const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
    URL.revokeObjectURL(preview);

    if (!error) {
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("registries").update({ cover_image_url: url }).eq("id", registryId);
      setCouplePhoto(url);
    }
    setPhotoUploading(false);
  }

  const formattedDate = form.wedding_date
    ? new Date(form.wedding_date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const p1 = form.partner1_name || "Prénom 1";
  const p2 = form.partner2_name || "Prénom 2";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>
        <p className="text-sm font-light tracking-widest" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-12" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>
      <div className="max-w-xl mx-auto flex flex-col items-center gap-6">

        {/* Photo area */}
        <div
          ref={photoContainerRef}
          className="relative w-full group"
          style={{ aspectRatio: "3/2", borderRadius: "20px", overflow: "hidden", cursor: couplePhoto ? (isDragging ? "grabbing" : "grab") : "pointer" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
          />
          {couplePhoto ? (
            <img
              src={couplePhoto}
              alt="Photo du couple"
              className="w-full h-full object-cover select-none"
              style={{ objectPosition: `center ${photoPositionY}%` }}
              draggable={false}
              onPointerDown={handleDragStart}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer"
              style={{ border: "2px dashed rgba(109,29,62,0.25)", borderRadius: "20px", backgroundColor: "rgba(109,29,62,0.03)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={28} strokeWidth={1.5} style={{ color: "rgba(109,29,62,0.4)" }} />
              <span className="text-sm font-medium" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>
                Ajouter une photo
              </span>
            </div>
          )}

          {/* Boutons overlay quand photo existe */}
          {couplePhoto && !isDragging && (
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "rgba(0,0,0,0.55)", fontFamily: "var(--font-display)" }}
              >
                <Camera size={12} strokeWidth={2} /> Changer
              </button>
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: "rgba(0,0,0,0.55)", fontFamily: "var(--font-display)", pointerEvents: "none" }}
              >
                <Move size={12} strokeWidth={2} /> Glisser pour repositionner
              </div>
            </div>
          )}

          {photoUploading && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(109,29,62,0.4)", borderRadius: "20px" }}>
              <span className="text-white text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>Envoi…</span>
            </div>
          )}
        </div>

        {/* Names — inline editable */}
        <div className="flex items-baseline justify-center gap-3 w-full flex-wrap">
          {/* Prénom 1 */}
          {editing === "partner1_name" ? (
            <input
              autoFocus
              value={form.partner1_name}
              onChange={e => setForm({ ...form, partner1_name: e.target.value })}
              onBlur={() => handleBlur("partner1_name")}
              onKeyDown={e => handleKeyDown(e, "partner1_name")}
              className="text-center focus:outline-none bg-transparent"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                color: "#6D1D3E",
                borderBottom: "2px solid #6D1D3E",
                minWidth: "80px",
                width: `${Math.max(form.partner1_name.length + 1, 6)}ch`,
              }}
            />
          ) : (
            <button
              onClick={() => setEditing("partner1_name")}
              className="transition-opacity hover:opacity-70"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                color: form.partner1_name ? "#6D1D3E" : "rgba(109,29,62,0.25)",
                background: "none",
                border: "none",
                cursor: "text",
                padding: 0,
              }}
            >
              {form.partner1_name || "Prénom 1"}
            </button>
          )}

          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(1.4rem, 4vw, 2.4rem)", color: "rgba(109,29,62,0.4)", fontWeight: 300 }}>
            &amp;
          </span>

          {/* Prénom 2 */}
          {editing === "partner2_name" ? (
            <input
              autoFocus
              value={form.partner2_name}
              onChange={e => setForm({ ...form, partner2_name: e.target.value })}
              onBlur={() => handleBlur("partner2_name")}
              onKeyDown={e => handleKeyDown(e, "partner2_name")}
              className="text-center focus:outline-none bg-transparent"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                color: "#6D1D3E",
                borderBottom: "2px solid #6D1D3E",
                minWidth: "80px",
                width: `${Math.max(form.partner2_name.length + 1, 6)}ch`,
              }}
            />
          ) : (
            <button
              onClick={() => setEditing("partner2_name")}
              className="transition-opacity hover:opacity-70"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                color: form.partner2_name ? "#6D1D3E" : "rgba(109,29,62,0.25)",
                background: "none",
                border: "none",
                cursor: "text",
                padding: 0,
              }}
            >
              {form.partner2_name || "Prénom 2"}
            </button>
          )}
        </div>

        {/* Date & lieu pills */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* Date */}
          {editing === "wedding_date" ? (
            <input
              autoFocus
              type="date"
              value={form.wedding_date}
              onChange={e => setForm({ ...form, wedding_date: e.target.value })}
              onBlur={() => handleBlur("wedding_date")}
              onKeyDown={e => handleKeyDown(e, "wedding_date")}
              className="focus:outline-none rounded-full px-5 py-2.5 text-sm"
              style={{
                border: "2px solid #6D1D3E",
                backgroundColor: "white",
                color: "#6D1D3E",
                fontFamily: "var(--font-display)",
              }}
            />
          ) : formattedDate ? (
            <button
              onClick={() => setEditing("wedding_date")}
              className="hover:opacity-60 transition-opacity"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                color: "#6D1D3E",
                background: "none",
                border: "none",
                cursor: "text",
                padding: 0,
              }}
            >
              <CalendarDays size={16} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", opacity: 0.6 }} />
              {formattedDate}
            </button>
          ) : (
            <button
              onClick={() => setEditing("wedding_date")}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all"
              style={{
                border: "2px dashed rgba(109,29,62,0.3)",
                color: "rgba(109,29,62,0.4)",
                fontFamily: "var(--font-display)",
              }}
            >
              <CalendarDays size={15} strokeWidth={1.5} />
              Date du mariage
            </button>
          )}

          {/* Lieu */}
          {editing === "ceremony_location" ? (
            <input
              autoFocus
              value={form.ceremony_location}
              onChange={e => setForm({ ...form, ceremony_location: e.target.value })}
              onBlur={() => handleBlur("ceremony_location")}
              onKeyDown={e => handleKeyDown(e, "ceremony_location")}
              placeholder="Lieu"
              className="focus:outline-none rounded-full px-5 py-2.5 text-sm"
              style={{
                border: "2px solid #6D1D3E",
                backgroundColor: "white",
                color: "#6D1D3E",
                fontFamily: "var(--font-display)",
                minWidth: "160px",
              }}
            />
          ) : form.ceremony_location ? (
            <button
              onClick={() => setEditing("ceremony_location")}
              className="hover:opacity-60 transition-opacity"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
                color: "#6D1D3E",
                background: "none",
                border: "none",
                cursor: "text",
                padding: 0,
              }}
            >
              <MapPin size={16} strokeWidth={1.5} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", opacity: 0.6 }} />
              {form.ceremony_location}
            </button>
          ) : (
            <button
              onClick={() => setEditing("ceremony_location")}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all"
              style={{
                border: "2px dashed rgba(109,29,62,0.3)",
                color: "rgba(109,29,62,0.4)",
                fontFamily: "var(--font-display)",
              }}
            >
              <MapPin size={15} strokeWidth={1.5} />
              Lieu de la cérémonie
            </button>
          )}
        </div>

        {/* Mon URL */}
        <div className="w-full rounded-2xl bg-white/70 px-6 py-5 flex flex-col gap-3" style={{ border: "1.5px solid rgba(109,29,62,0.1)" }}>
          <div className="flex items-center gap-2">
            <LinkIcon size={15} strokeWidth={1.5} style={{ color: "rgba(109,29,62,0.5)" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
              Mon URL
            </span>
          </div>

          {editing === "slug" ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center rounded-xl bg-white border-2 border-[#6D1D3E] overflow-hidden">
                <span className="pl-4 pr-1 text-sm text-[#6D1D3E]/40 whitespace-nowrap flex-shrink-0" style={{ fontFamily: "var(--font-display)" }}>
                  wedy.fr/mariage/
                </span>
                <input
                  autoFocus
                  value={slugDraft}
                  onChange={handleSlugDraftChange}
                  onBlur={() => handleBlur("slug")}
                  onKeyDown={e => handleKeyDown(e, "slug")}
                  className="flex-1 py-3 pr-2 text-sm bg-transparent focus:outline-none text-[#6D1D3E] font-medium min-w-0"
                  style={{ fontFamily: "var(--font-display)" }}
                />
                <span className="pr-3 flex-shrink-0 text-sm w-6 text-center">
                  {slugStatus === "checking" && <span className="text-[#6D1D3E]/40">…</span>}
                  {slugStatus === "available" && <span className="text-green-600">✓</span>}
                  {slugStatus === "taken" && <span className="text-red-500">✗</span>}
                </span>
              </div>
              {slugStatus === "taken" && (
                <p className="text-xs text-red-500" style={{ fontFamily: "var(--font-display)" }}>
                  Cette URL est déjà prise.
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setSlugDraft(slug); setSlugStatus("idle"); setEditing("slug"); }}
              className="flex items-center gap-1 text-sm text-left hover:opacity-70 transition-opacity group"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-[#6D1D3E]/40">wedy.fr/mariage/</span>
              <span className="text-[#6D1D3E] font-semibold underline underline-offset-2 decoration-dotted">{slug}</span>
              {slugStatus === "saved" && <span className="ml-2 text-xs text-green-600">✓ Sauvegardé</span>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
