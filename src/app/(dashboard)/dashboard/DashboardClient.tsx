"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Gift, TrendingUp, Trash2, ChevronDown, Pencil, Check, X, SquarePen, ImagePlus, Paintbrush, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  profile: any;
  registry: any;
  gifts: any[];
  totalCollected: number;
  totalGoal: number;
  contributions: any[];
}

export default function DashboardClient({ profile, registry, gifts, totalCollected, totalGoal, contributions }: Props) {
  const [activeTab, setActiveTab] = useState<"participation" | "cadeaux" | "design">("participation");
  const [showAddGift, setShowAddGift] = useState(false);
  const [giftForm, setGiftForm] = useState({ title: "", description: "", price: "", category: "" });
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterPrices, setFilterPrices] = useState<("0-100" | "100-300" | "300+")[]>([]);
const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [priceDropdownOpen, setPriceDropdownOpen] = useState(false);

  const CATEGORIES = ["Voyage", "Cuisine", "Maison", "Expériences", "Électroménager", "Décoration", "Autre"];
  const [loading, setLoading] = useState(false);
  const [localGifts, setLocalGifts] = useState(gifts);
  const [currentTheme, setCurrentTheme] = useState(registry?.theme ?? "rose");
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [editingNames, setEditingNames] = useState(false);
  const [nameForm, setNameForm] = useState({
    partner1_name: profile?.partner1_name ?? "",
    partner2_name: profile?.partner2_name ?? "",
    wedding_date: registry?.ceremony_date ?? "",
    ceremony_location: registry?.ceremony_location ?? "",
  });
  const [nameSaving, setNameSaving] = useState(false);
  const [themeCovers, setThemeCovers] = useState<Record<string, string | null>>(
    registry?.theme_covers ?? {}
  );
  const RENAMED: Record<string, string> = { "/theme-classique-bg.jpg": "/flowers-35mm-2.jpg" };
  const rawCover = themeCovers[currentTheme] ?? null;
  const resolvedCover = rawCover ? (RENAMED[rawCover] ?? rawCover) : null;
  // Si le cover stocké est identique au preset par défaut, on le traite comme "pas de cover custom"
  const DEFAULTS: Record<string, string> = { classique: "/flowers-35mm-2.jpg", minimaliste: "/mer_2.png", moderne: "/th%C3%A8me%20moderne/cadeau_1.jpeg", fleuri: "/paysages/paysage_8.JPG" };
  const coverUrl = resolvedCover === DEFAULTS[currentTheme] ? null : resolvedCover;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [themeSettings, setThemeSettings] = useState<Record<string, any>>(
    registry?.theme_settings ?? {}
  );
  const [giftUploading, setGiftUploading] = useState<Record<string, boolean>>({});
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [editGiftForm, setEditGiftForm] = useState({ title: "", price: "", category: "", description: "" });
  const [editGiftImageUrl, setEditGiftImageUrl] = useState<string | null>(null);
  const [editGiftFile, setEditGiftFile] = useState<File | null>(null);
  const [editGiftError, setEditGiftError] = useState<string | null>(null);
  const [editGiftSaving, setEditGiftSaving] = useState(false);
  const [slug, setSlug] = useState<string>(registry?.slug ?? "");
  const [linkCopied, setLinkCopied] = useState(false);
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugDraft, setSlugDraft] = useState("");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "saved">("idle");
  const slugCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toSlugDash(val: string) {
    return val.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  function handleSlugDraftChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = toSlugDash(e.target.value);
    setSlugDraft(val);
    setSlugStatus("idle");
    if (slugCheckRef.current) clearTimeout(slugCheckRef.current);
    if (val && val !== slug) {
      slugCheckRef.current = setTimeout(async () => {
        setSlugStatus("checking");
        const supabase = createClient();
        const { data } = await supabase.from("registries").select("id").eq("slug", val).maybeSingle();
        setSlugStatus(data ? "taken" : "available");
      }, 500);
    }
  }

  async function saveSlugDash() {
    if (!slugDraft || slugDraft === slug || slugStatus === "taken" || slugStatus === "checking") {
      setSlugEditing(false);
      return;
    }
    const supabase = createClient();
    const { data: exists } = await supabase.from("registries").select("id").eq("slug", slugDraft).maybeSingle();
    if (exists) { setSlugStatus("taken"); return; }
    await supabase.from("registries").update({ slug: slugDraft }).eq("id", registry.id);
    setSlug(slugDraft);
    setSlugEditing(false);
    setSlugStatus("saved");
    setTimeout(() => setSlugStatus("idle"), 2500);
  }
  // Handle Stripe Connect redirect callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe_ok") === "1") {
      fetch(`/api/stripe/connect?registryId=${registry.id}`)
        .then(r => r.json())
        .then(d => { if (d.enabled) setStripeEnabled(true); });
      router.replace("/dashboard");
    } else if (params.get("stripe_refresh") === "1") {
      router.replace("/dashboard");
      handleStripeConnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStripeConnect() {
    setStripeConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registryId: registry.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setStripeConnecting(false);
    }
  }

  const [giftPickerGiftId, setGiftPickerGiftId] = useState<string | null>(null);
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [unsplashLoading, setUnsplashLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const themeCoversRef = useRef(themeCovers);
  const themeSettingsRef = useRef(themeSettings);
  const currentThemeRef = useRef(currentTheme);
  const nameFormRef = useRef(nameForm);
  useEffect(() => { themeCoversRef.current = themeCovers; }, [themeCovers]);
  useEffect(() => { themeSettingsRef.current = themeSettings; }, [themeSettings]);
  useEffect(() => { currentThemeRef.current = currentTheme; }, [currentTheme]);
  useEffect(() => { nameFormRef.current = nameForm; }, [nameForm]);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [stripeEnabled, setStripeEnabled] = useState<boolean>(registry?.stripe_charges_enabled ?? false);
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "WEDY_READY") return;
      const theme = currentThemeRef.current;
      const DEFS: Record<string, string> = { classique: "/flowers-35mm-2.jpg", minimaliste: "/mer_2.png", moderne: "/th%C3%A8me%20moderne/cadeau_1.jpeg", fleuri: "/paysages/paysage_8.JPG" };
      const cover = themeCoversRef.current[theme] ?? DEFS[theme] ?? null;
      const settings = themeSettingsRef.current[theme];
      if (cover) {
        postToIframes({ type: "WEDY_UPDATE_COVER", theme, cover });
      }
      if (settings) {
        postToIframes({ type: "WEDY_UPDATE_SETTINGS", theme, settings });
      }
      const nf = nameFormRef.current;
      postToIframes({
        type: "WEDY_UPDATE_INFO",
        info: { partner1: nf.partner1_name, partner2: nf.partner2_name, date: nf.wedding_date, location: nf.ceremony_location },
      });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (activeTab !== "design") return;
    const el = previewContainerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const pw = rect.width - 48;
      const ph = rect.height - 48;
      if (previewMode === "desktop") {
        setPreviewScale(Math.min(pw / 1280, 0.65));
      } else {
        const PHONE_W = 390 + 20; // W + 2*bezel
        const PHONE_H = 700 + 28 + 12 + 20; // viewport + notch + home + 2*bezel
        const toggleBarH = 60;
        const availH = rect.height - toggleBarH - 32;
        setPreviewScale(Math.min(pw / PHONE_W, availH / PHONE_H, 0.72));
      }
    };
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, [activeTab, previewMode]);

  // Add-gift modal image states
  const [addGiftImageUrl, setAddGiftImageUrl] = useState<string | null>(null);
  const [addGiftFile, setAddGiftFile] = useState<File | null>(null);
  const [addGiftQuery, setAddGiftQuery] = useState("");
  const [addGiftResults, setAddGiftResults] = useState<any[]>([]);
  const [addGiftSearchLoading, setAddGiftSearchLoading] = useState(false);
  const addGiftSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addGiftError, setAddGiftError] = useState<string | null>(null);

  const [previewKey, setPreviewKey] = useState(0);
  const previewReloadRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function schedulePreviewReload() {
    if (previewReloadRef.current) clearTimeout(previewReloadRef.current);
    previewReloadRef.current = setTimeout(() => setPreviewKey(k => k + 1), 1200);
  }
  useEffect(() => { schedulePreviewReload(); }, [currentTheme]);

  const moderneBg       = themeSettings?.moderne?.bgColor       ?? "#FFF8D6";
  const moderneText     = themeSettings?.moderne?.textColor     ?? "#E85C00";
  const classiqueText   = themeSettings?.classique?.textColor   ?? "#FFFFFF";
  const minimalisteBg      = themeSettings?.minimaliste?.bgColor   ?? "#FFFFFF";
  const minimalisteText    = themeSettings?.minimaliste?.textColor ?? "#0A0A0A";
  const minimalisteGiftBg  = themeSettings?.minimaliste?.giftBgColor ?? "#FAF7F2";
  const fleuriText         = themeSettings?.fleuri?.textColor ?? "#3d2b1f";

  const themes = [
    { id: "moderne",    name: "Moderne" },
    { id: "classique",  name: "Classique" },
    { id: "minimaliste", name: "Minimaliste" },
    { id: "fleuri",     name: "Floral" },
  ];

  const themeColors: Record<string, { bg: string; text: string }> = {
    moderne:     { bg: moderneBg,     text: moderneText },
    classique:   { bg: "#1a1510",     text: classiqueText },
    fleuri:      { bg: "#f5f0e4",     text: fleuriText },
    minimaliste: { bg: minimalisteBg, text: minimalisteText },
  };

  async function handleSaveNames() {
    if (!nameForm.partner1_name || !nameForm.partner2_name) return;
    setNameSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        partner1_name: nameForm.partner1_name,
        partner2_name: nameForm.partner2_name,
      }).eq("id", user.id);
    }
    setEditingNames(false);
    setNameSaving(false);
  }

  const PRESET_IMAGES: Record<string, string[]> = {
    fleuri: [
      "/paysages/paysage_1.JPG", "/paysages/paysage_2.JPG", "/paysages/paysage_3.JPG",
      "/paysages/paysage_4.JPG", "/paysages/paysage_5.JPG", "/paysages/paysage_6.JPG",
      "/paysages/paysage_7.JPG", "/paysages/paysage_8.JPG", "/paysages/paysage_9.JPG",
      "/paysages/paysage_10.jpg",
    ],
    moderne: [
      "/th%C3%A8me%20moderne/cadeau_1.jpeg",
      "/th%C3%A8me%20moderne/cadeau_2.png",
      "/th%C3%A8me%20moderne/cadeau_3.png",
      "/th%C3%A8me%20moderne/cadeau_4.png",
      "/th%C3%A8me%20moderne/cadeau_5.png",
      "/th%C3%A8me%20moderne/bouquet_1.jpeg",
      "/th%C3%A8me%20moderne/bouquet_2.png",
      "/th%C3%A8me%20moderne/bouquet_3.png",
      "/th%C3%A8me%20moderne/bouquet_4.png",
      "/th%C3%A8me%20moderne/bouquet_5.png",
    ],
    classique:   [
      "/flowers-35mm-2.jpg",
      "/paysages/paysage_1.JPG", "/paysages/paysage_2.JPG", "/paysages/paysage_3.JPG",
      "/paysages/paysage_4.JPG", "/paysages/paysage_5.JPG", "/paysages/paysage_6.JPG",
      "/paysages/paysage_7.JPG", "/paysages/paysage_8.JPG", "/paysages/paysage_9.JPG",
      "/paysages/paysage_10.jpg",
    ],
    minimaliste: [
      "/mer_2.png",
      "/paysages/paysage_1.JPG", "/paysages/paysage_2.JPG", "/paysages/paysage_3.JPG",
      "/paysages/paysage_4.JPG", "/paysages/paysage_5.JPG", "/paysages/paysage_6.JPG",
      "/paysages/paysage_7.JPG", "/paysages/paysage_8.JPG", "/paysages/paysage_9.JPG",
      "/paysages/paysage_10.jpg",
    ],
  };
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);

  const THEME_DEFAULTS: Record<string, { bgColor?: string; textColor?: string }> = {
    moderne:     { bgColor: "#FFF8D6", textColor: "#E85C00" },
    classique:   { textColor: "#FFFFFF" },
    minimaliste: { bgColor: "#FFFFFF",  textColor: "#0A0A0A" },
    fleuri:      { textColor: "#3d2b1f" },
  };

  const [designSaving, setDesignSaving] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);

  function postToIframes(msg: object) {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
    mobileIframeRef.current?.contentWindow?.postMessage(msg, "*");
  }

  function sendInfoMessage(form: typeof nameForm) {
    postToIframes({
      type: "WEDY_UPDATE_INFO",
      info: {
        partner1: form.partner1_name,
        partner2: form.partner2_name,
        date: form.wedding_date,
        location: form.ceremony_location,
      },
    });
  }

  useEffect(() => {
    sendInfoMessage(nameForm);
  }, [nameForm]); // eslint-disable-line react-hooks/exhaustive-deps

  function sendSettingsMessage(settings: Record<string, any>) {
    postToIframes({ type: "WEDY_UPDATE_SETTINGS", theme: currentTheme, settings });
  }

  function handleColorChange(key: "bgColor" | "textColor", value: string) {
    const updated = {
      ...themeSettings,
      [currentTheme]: { ...(themeSettings[currentTheme] ?? {}), [key]: value },
    };
    setThemeSettings(updated);
    sendSettingsMessage((updated as Record<string, any>)[currentTheme]);
  }

  function handleMinimalisteSettingChange(key: string, value: string) {
    const updated = { ...themeSettings, minimaliste: { ...(themeSettings?.minimaliste ?? {}), [key]: value } };
    setThemeSettings(updated);
    postToIframes({ type: "WEDY_UPDATE_SETTINGS", theme: "minimaliste", settings: updated.minimaliste });
  }

  function handleMinimalisteGiftBgChange(value: string) {
    const updated = { ...themeSettings, minimaliste: { ...(themeSettings?.minimaliste ?? {}), giftBgColor: value } };
    setThemeSettings(updated);
    postToIframes({ type: "WEDY_UPDATE_SETTINGS", theme: "minimaliste", settings: updated.minimaliste });
  }

  function handleClassiqueSettingChange(key: string, value: string) {
    const updated = { ...themeSettings, classique: { ...(themeSettings?.classique ?? {}), [key]: value } };
    setThemeSettings(updated);
    postToIframes({ type: "WEDY_UPDATE_SETTINGS", theme: "classique", settings: updated.classique });
  }

  function handleResetColors() {
    const updated = { ...themeSettings };
    delete updated[currentTheme];
    setThemeSettings(updated);
    sendSettingsMessage({});
  }

  async function handleSaveAll() {
    if (!registry) return;
    setDesignSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const settingsSnapshot = themeSettings;
    const coversSnapshot = themeCoversRef.current;
    const [r1, , r3] = await Promise.all([
      supabase.from("registries").update({
        theme: currentTheme,
        theme_settings: settingsSnapshot,
      }).eq("id", registry.id),
      user ? supabase.from("profiles").update({
        partner1_name: nameForm.partner1_name,
        partner2_name: nameForm.partner2_name,
      }).eq("id", user.id) : Promise.resolve(),
      supabase.from("registries").update({
        ceremony_date: nameForm.wedding_date || null,
        ceremony_location: nameForm.ceremony_location || null,
      }).eq("id", registry.id),
    ]);
    if (r1.error) console.error("[handleSaveAll] theme_settings save failed:", r1.error.message, r1.error.code);
    if (r3?.error) console.error("[handleSaveAll] ceremony save failed:", r3.error.message, r3.error.code);
    // Save covers separately (requires theme_covers column — add it in Supabase if missing)
    const rCovers = await supabase.from("registries").update({ theme_covers: coversSnapshot }).eq("id", registry.id);
    if (rCovers.error) console.warn("[handleSaveAll] theme_covers save skipped (column missing?):", rCovers.error.message);
    setDesignSaving(false);
    setDesignSaved(true);
    setTimeout(() => setDesignSaved(false), 2500);
  }

  function isColorCustomized(): boolean {
    const s = themeSettings[currentTheme];
    if (!s) return false;
    const defaults = THEME_DEFAULTS[currentTheme] ?? {};
    return (s.bgColor && s.bgColor !== defaults.bgColor) ||
           (s.textColor && s.textColor !== defaults.textColor) ||
           (currentTheme === "minimaliste" && s.giftBgColor && s.giftBgColor !== "#FAF7F2");
  }

  const CLASSIQUE_DEFAULTS = { coverTextColor: "#FFFFFF", giftTextColor: "#2c2c2c", giftBgColor: "#FAF7F2" };

  function isClassiqueColorCustomized() {
    const s = themeSettings?.classique;
    if (!s) return false;
    return (s.coverTextColor && s.coverTextColor !== CLASSIQUE_DEFAULTS.coverTextColor) ||
           (s.giftTextColor  && s.giftTextColor  !== CLASSIQUE_DEFAULTS.giftTextColor)  ||
           (s.giftBgColor    && s.giftBgColor    !== CLASSIQUE_DEFAULTS.giftBgColor);
  }

  function handleResetClassiqueColors() {
    const updated = { ...themeSettings, classique: { ...(themeSettings?.classique ?? {}), coverTextColor: undefined, giftTextColor: undefined, giftBgColor: undefined } };
    setThemeSettings(updated);
    postToIframes({ type: "WEDY_UPDATE_SETTINGS", theme: "classique", settings: updated.classique });
  }

  function handleSelectImage(imageUrl: string) {
    if (!registry) return;
    setThemeCovers(prev => ({ ...prev, [currentTheme]: imageUrl }));
    setShowPhotoPicker(false);
    postToIframes({ type: "WEDY_UPDATE_COVER", theme: currentTheme, cover: imageUrl });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !registry) return;
    setPhotoUploading(true);
    setPhotoError(null);

    const prevUrl = themeCovers[currentTheme] ?? null;
    const localPreview = URL.createObjectURL(file);
    setThemeCovers(prev => ({ ...prev, [currentTheme]: localPreview }));

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${registry.id}/cover-${currentTheme}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(path, file, { upsert: true });

    URL.revokeObjectURL(localPreview);

    if (uploadError) {
      setPhotoError("Erreur upload. Vérifiez que le bucket « covers » est public.");
      setThemeCovers(prev => ({ ...prev, [currentTheme]: prevUrl }));
    } else {
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      const updatedCovers = { ...themeCoversRef.current, [currentTheme]: url };
      await supabase.from("registries").update({ theme_covers: updatedCovers }).eq("id", registry.id);
      setThemeCovers(prev => ({ ...prev, [currentTheme]: url }));
      postToIframes({ type: "WEDY_UPDATE_COVER", theme: currentTheme, cover: url });
    }
    setPhotoUploading(false);
  }

  const searchUnsplash = useCallback(async (q: string) => {
    if (!q.trim()) { setUnsplashResults([]); return; }
    setUnsplashLoading(true);
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUnsplashResults(data.results ?? []);
    } finally {
      setUnsplashLoading(false);
    }
  }, []);

  function handleUnsplashQueryChange(q: string) {
    setUnsplashQuery(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchUnsplash(q), 500);
  }

  const searchAddGift = useCallback(async (q: string) => {
    if (!q.trim()) { setAddGiftResults([]); return; }
    setAddGiftSearchLoading(true);
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setAddGiftResults(data.results ?? []);
    } finally {
      setAddGiftSearchLoading(false);
    }
  }, []);

  function handleAddGiftQueryChange(q: string) {
    setAddGiftQuery(q);
    if (addGiftSearchTimeoutRef.current) clearTimeout(addGiftSearchTimeoutRef.current);
    addGiftSearchTimeoutRef.current = setTimeout(() => searchAddGift(q), 500);
  }

  function closeAddGiftModal() {
    setShowAddGift(false);
    setGiftForm({ title: "", description: "", price: "", category: "" });
    setAddGiftImageUrl(null);
    setAddGiftFile(null);
    setAddGiftQuery("");
    setAddGiftResults([]);
    setAddGiftError(null);
  }

  async function handleSelectUnsplashImage(giftId: string, imageUrl: string) {
    setGiftPickerGiftId(null);
    setUnsplashQuery("");
    setUnsplashResults([]);
    const supabase = createClient();
    await supabase.from("gifts").update({ image_url: imageUrl }).eq("id", giftId);
    setLocalGifts(prev => prev.map(g => g.id === giftId ? { ...g, image_url: imageUrl } : g));
  }

  async function handleThemeChange(newTheme: string) {
    if (!registry) return;
    setCurrentTheme(newTheme);
    const supabase = createClient();
    await supabase.from("registries").update({ theme: newTheme }).eq("id", registry.id);
    schedulePreviewReload();
  }

  async function handleAddGift(e: React.FormEvent) {
    e.preventDefault();
    if (!registry) return;
    setLoading(true);
    setAddGiftError(null);

    try {
      const supabase = createClient();

      // If the user picked a local file, upload it first
      let finalImageUrl: string | null = addGiftImageUrl;
      if (addGiftFile) {
        const ext = addGiftFile.name.split(".").pop();
        const path = `gift-tmp-${Date.now()}/photo.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("covers")
          .upload(path, addGiftFile, { upsert: true });
        if (uploadErr) {
          setAddGiftError("Erreur lors de l'upload de la photo. Le cadeau sera ajouté sans image.");
          finalImageUrl = null;
        } else {
          const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
          finalImageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
        }
      }

      const { data, error } = await supabase.from("gifts").insert({
        registry_id: registry.id,
        title: giftForm.title,
        description: giftForm.description || null,
        price: parseFloat(giftForm.price),
        category: giftForm.category || null,
        image_url: finalImageUrl,
        display_order: localGifts.length,
      }).select().single();

      if (error) {
        console.error("Erreur ajout cadeau:", error);
        setAddGiftError(`Impossible d'ajouter le cadeau : ${error.message}`);
        return;
      }

      if (data) {
        setLocalGifts(prev => [...prev, { amount_collected: 0, is_funded: false, ...data }]);
        closeAddGiftModal();
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setAddGiftError("Une erreur inattendue s'est produite. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGift(giftId: string) {
    const supabase = createClient();
    await supabase.from("gifts").delete().eq("id", giftId);
    setLocalGifts(localGifts.filter((g) => g.id !== giftId));
  }

  function startEditGift(gift: any) {
    setEditingGiftId(gift.id);
    setEditGiftForm({
      title: gift.title,
      price: String(gift.price),
      category: gift.category ?? "",
      description: gift.description ?? "",
    });
    setEditGiftImageUrl(gift.image_url ?? null);
    setAddGiftQuery("");
    setAddGiftResults([]);
  }

  function closeEditModal() {
    setEditingGiftId(null);
    setEditGiftImageUrl(null);
    setEditGiftFile(null);
    setEditGiftError(null);
    setAddGiftQuery("");
    setAddGiftResults([]);
  }

  async function handleSaveGift(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGiftId || !editGiftForm.title || !editGiftForm.price) return;
    setEditGiftSaving(true);
    setEditGiftError(null);

    try {
      const supabase = createClient();

      let finalImageUrl: string | null = editGiftImageUrl;
      if (editGiftFile) {
        const ext = editGiftFile.name.split(".").pop();
        const path = `gift-${editingGiftId}/photo.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("covers")
          .upload(path, editGiftFile, { upsert: true });
        if (uploadErr) {
          setEditGiftError("Erreur lors de l'upload de la photo. Les autres modifications seront tout de même sauvegardées.");
          finalImageUrl = null;
        } else {
          const { data: urlData } = supabase.storage.from("covers").getPublicUrl(path);
          finalImageUrl = `${urlData.publicUrl}?t=${Date.now()}`;
        }
      }

      const updated = {
        title: editGiftForm.title,
        price: parseFloat(editGiftForm.price),
        category: editGiftForm.category || null,
        description: editGiftForm.description || null,
        image_url: finalImageUrl,
      };

      const { error } = await supabase.from("gifts").update(updated).eq("id", editingGiftId);

      if (error) {
        console.error("Erreur modification cadeau:", error);
        setEditGiftError(`Impossible de sauvegarder : ${error.message}`);
        return;
      }

      setLocalGifts(prev => prev.map(g => g.id === editingGiftId ? { ...g, ...updated } : g));
      closeEditModal();
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setEditGiftError("Une erreur inattendue s'est produite. Réessayez.");
    } finally {
      setEditGiftSaving(false);
    }
  }

  async function handleGiftPhotoUpload(giftId: string, file: File) {
    if (!registry) return;
    setGiftUploading(prev => ({ ...prev, [giftId]: true }));

    const localPreview = URL.createObjectURL(file);
    setLocalGifts(prev => prev.map(g => g.id === giftId ? { ...g, image_url: localPreview } : g));

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `gift-${giftId}/photo.${ext}`;

    const { error } = await supabase.storage.from("covers").upload(path, file, { upsert: true });
    URL.revokeObjectURL(localPreview);

    if (!error) {
      const { data } = supabase.storage.from("covers").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("gifts").update({ image_url: url }).eq("id", giftId);
      setLocalGifts(prev => prev.map(g => g.id === giftId ? { ...g, image_url: url } : g));
    } else {
      setLocalGifts(prev => prev.map(g => g.id === giftId ? { ...g, image_url: null } : g));
    }
    setGiftUploading(prev => ({ ...prev, [giftId]: false }));
  }

  const progressPercent = totalGoal > 0 ? Math.min((totalCollected / totalGoal) * 100, 100) : 0;

  return (
    <div className={`${activeTab === "design" ? "h-screen" : "min-h-screen"} flex flex-col`} style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>

      {/* Tab bar */}
      <div className="bg-white border-b border-[#f0e6e2]">
        <div className="w-full px-6 lg:px-10 flex items-center gap-0">
          {([
            { id: "participation", label: "Participation" },
            { id: "cadeaux", label: "Cadeaux" },
            { id: "design", label: "Design" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-6 py-4 font-semibold transition-colors"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                color: activeTab === tab.id ? "#6D1D3E" : "rgba(109,29,62,0.38)",
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "#6D1D3E" }} />
              )}
            </button>
          ))}
          {registry?.slug && (
            <button
              onClick={async () => {
                await handleSaveAll();
                window.open(`/mariage/${registry.slug}`, "_blank", "noopener,noreferrer");
              }}
              className="relative px-6 py-4 font-semibold transition-colors flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "rgba(109,29,62,0.38)" }}
            >
              Voir ma liste
              <Eye size={13} strokeWidth={2} style={{ opacity: 0.6 }} />
            </button>
          )}
        </div>
      </div>

      {activeTab === "design" && registry && (
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── LEFT PANEL ── */}
          <div className="w-80 flex-shrink-0 overflow-y-auto bg-white border-r border-[#f0e6e2] flex flex-col gap-8 p-6">

            {/* Thème */}
            <section>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Thème</p>
              <div className="flex flex-col gap-2">
                {([
                  { id: "classique",   label: "Classique",   bg: "#1a1510", text: "#F5EFE0", font: "var(--font-serif)",      sample: "Classique" },
                  { id: "fleuri",      label: "Floral",      bg: "#f5f0e4", text: "#3d2b1f", font: "var(--font-serif)",      sample: "Floral" },
                  { id: "minimaliste", label: "Minimaliste", bg: "#FFFFFF", text: "#0A0A0A", font: "var(--font-montserrat)", sample: "MINIMALISTE" },
                  { id: "moderne",     label: "Moderne",     bg: "#FFF8D6", text: "#E85C00", font: "var(--font-anton)",      sample: "Moderne" },
                ] as const).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className="relative flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-all"
                    style={{
                      borderColor: currentTheme === t.id ? "#6D1D3E" : "#EDE8E2",
                      backgroundColor: currentTheme === t.id ? "rgba(109,29,62,0.04)" : "#FAFAFA",
                    }}
                  >
                    {/* Mini preview swatch */}
                    <div className="w-12 h-9 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: t.bg, border: "1px solid rgba(0,0,0,0.08)" }}>
                      <span style={{ fontFamily: t.font, color: t.text, fontSize: t.id === "moderne" ? "9px" : "7px", fontStyle: t.id === "classique" ? "italic" : "normal", letterSpacing: t.id === "minimaliste" ? "0.15em" : "0", fontWeight: t.id === "moderne" ? 900 : 400, lineHeight: 1 }}>
                        {t.id === "moderne" ? "A&B" : t.id === "classique" ? "A & B" : "A & B"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: currentTheme === t.id ? "#6D1D3E" : "#2c2c2c" }}>
                      {t.label}
                    </span>
                    {currentTheme === t.id && (
                      <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#6D1D3E" }}>
                        <Check size={10} strokeWidth={3} color="white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Prénoms */}
            <section>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Prénoms</p>
              <div className="flex flex-col gap-2">
                <input
                  value={nameForm.partner1_name}
                  onChange={e => setNameForm(f => ({ ...f, partner1_name: e.target.value }))}
                  placeholder="Prénom 1"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                  onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                />
                <input
                  value={nameForm.partner2_name}
                  onChange={e => setNameForm(f => ({ ...f, partner2_name: e.target.value }))}
                  placeholder="Prénom 2"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                  onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                />
              </div>
            </section>

            {/* Date & lieu */}
            <section>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Date & lieu</p>
              <div className="flex flex-col gap-2">
                <input
                  type="date"
                  value={nameForm.wedding_date}
                  onChange={e => setNameForm(f => ({ ...f, wedding_date: e.target.value }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                  onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                />
                <input
                  value={nameForm.ceremony_location}
                  onChange={e => setNameForm(f => ({ ...f, ceremony_location: e.target.value }))}
                  placeholder="Paris, France"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                  onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                />
              </div>
            </section>

            {/* Image de couverture */}
            <section>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Image de couverture</p>

              {/* Aperçu de l'image actuelle */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3" style={{ backgroundColor: "rgba(109,29,62,0.05)" }}>
                {(resolvedCover || DEFAULTS[currentTheme])
                  ? <img src={resolvedCover ?? DEFAULTS[currentTheme]} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImagePlus size={24} strokeWidth={1} style={{ color: "rgba(109,29,62,0.2)" }} /></div>
                }
              </div>

              {/* Bouton changer */}
              <button
                type="button"
                onClick={() => setShowPhotoPicker(v => !v)}
                className="w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors mb-3"
                style={{ backgroundColor: showPhotoPicker ? "rgba(109,29,62,0.12)" : "rgba(109,29,62,0.07)", color: "#6D1D3E", fontFamily: "var(--font-display)" }}
              >
                {showPhotoPicker ? "Fermer" : "Changer la photo"}
              </button>

              {/* Sélecteur */}
              {showPhotoPicker && (
                <div className="flex flex-col gap-3">
                  {/* Banque d'images */}
                  {(PRESET_IMAGES[currentTheme] ?? []).length > 0 && (
                    <div>
                      <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "rgba(109,29,62,0.35)", fontFamily: "var(--font-display)" }}>Banque d'images</p>
                      <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
                        {(PRESET_IMAGES[currentTheme] ?? []).map(img => {
                          const isSelected = themeCovers[currentTheme] === img || (!themeCovers[currentTheme] && img === DEFAULTS[currentTheme]);
                          return (
                            <button
                              key={img}
                              onClick={() => { handleSelectImage(img); setShowPhotoPicker(false); }}
                              className="relative aspect-video rounded-lg overflow-hidden border-2 transition-all"
                              style={{ borderColor: isSelected ? "#6D1D3E" : "transparent" }}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 flex items-end justify-end p-1">
                                  <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#6D1D3E" }}>
                                    <Check size={8} strokeWidth={3} color="white" />
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upload depuis l'ordi */}
                  <div>
                    <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "rgba(109,29,62,0.35)", fontFamily: "var(--font-display)" }}>Depuis mon ordinateur</p>
                    <button
                      type="button"
                      disabled={photoUploading}
                      onClick={() => { coverFileInputRef.current?.click(); }}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-colors hover:border-[#9e6b5c] disabled:opacity-50"
                      style={{ borderColor: "#D4C9C5", cursor: photoUploading ? "not-allowed" : "pointer" }}
                    >
                      <ImagePlus size={14} style={{ color: "#9e6b5c" }} strokeWidth={1.5} />
                      <span className="text-[11px] tracking-wide" style={{ color: "#9e6b5c", fontFamily: "var(--font-display)" }}>
                        {photoUploading ? "Envoi…" : "Choisir un fichier"}
                      </span>
                    </button>
                    <input ref={coverFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { handlePhotoUpload(e); setShowPhotoPicker(false); }} />
                  </div>
                </div>
              )}

              {rawCover && (
                <button
                  onClick={async () => {
                    const updated = { ...themeCoversRef.current };
                    delete updated[currentTheme];
                    setThemeCovers(updated);
                    const supabase = createClient();
                    await supabase.from("registries").update({ theme_covers: updated }).eq("id", registry.id);
                  }}
                  className="w-full py-2 text-[11px] tracking-widest uppercase transition-colors"
                  style={{ color: "rgba(109,29,62,0.45)", fontFamily: "var(--font-display)" }}
                >
                  ↩ Image par défaut
                </button>
              )}
              {photoError && <p className="text-xs mt-1" style={{ color: "#dc2626" }}>{photoError}</p>}
            </section>

            {/* Texte couverture — classique & minimaliste */}
            {(currentTheme === "classique" || currentTheme === "minimaliste") && (
              <section>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Texte couverture</p>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Couleur du texte</span>
                  <div className="relative flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                      style={{ backgroundColor: currentTheme === "classique" ? (themeSettings?.classique?.coverTextColor ?? "#FFFFFF") : (themeSettings?.minimaliste?.coverTextColor ?? "#0A0A0A"), display: "block" }} />
                    <input type="color"
                      value={currentTheme === "classique" ? (themeSettings?.classique?.coverTextColor ?? "#FFFFFF") : (themeSettings?.minimaliste?.coverTextColor ?? "#0A0A0A")}
                      onChange={e => currentTheme === "classique" ? handleClassiqueSettingChange("coverTextColor", e.target.value) : handleMinimalisteSettingChange("coverTextColor", e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                </label>
              </section>
            )}

            {/* Design cadeau — classique & minimaliste */}
            {(currentTheme === "classique" || currentTheme === "minimaliste") && (
              <section>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Design cadeau</p>
                <div className="flex gap-2">
                  {([
                    { value: "carre",   label: "Carré" },
                    { value: "arrondi", label: "Arrondi" },
                    { value: "none",    label: "Aucun" },
                  ] as const).map(opt => {
                    const current = themeSettings?.[currentTheme]?.giftStyle ?? "carre";
                    const active = current === opt.value;
                    return (
                      <button key={opt.value}
                        onClick={() => {
                          const updated = { ...themeSettings, [currentTheme]: { ...(themeSettings?.[currentTheme] ?? {}), giftStyle: opt.value } };
                          setThemeSettings(updated);
                          postToIframes({ type: "WEDY_UPDATE_SETTINGS", theme: currentTheme, settings: (updated as Record<string, any>)[currentTheme] });
                        }}
                        className="flex-1 py-2 text-xs font-semibold rounded-xl border transition-all"
                        style={{
                          fontFamily: "var(--font-display)",
                          backgroundColor: active ? "#6D1D3E" : "transparent",
                          color: active ? "white" : "#2c2c2c",
                          borderColor: active ? "#6D1D3E" : "#EDE8E2",
                        }}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Texte & fond cadeaux — classique only */}
            {currentTheme === "classique" && (
              <section>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Cadeaux</p>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Texte cadeau</span>
                    <div className="relative flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                        style={{ backgroundColor: themeSettings?.classique?.giftTextColor ?? "#2c2c2c", display: "block" }} />
                      <input type="color"
                        value={themeSettings?.classique?.giftTextColor ?? "#2c2c2c"}
                        onChange={e => handleClassiqueSettingChange("giftTextColor", e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Couleur fond</span>
                    <div className="relative flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                        style={{ backgroundColor: themeSettings?.classique?.giftBgColor ?? "#FAF7F2", display: "block" }} />
                      <input type="color"
                        value={themeSettings?.classique?.giftBgColor ?? "#FAF7F2"}
                        onChange={e => handleClassiqueSettingChange("giftBgColor", e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                  </label>
                  {isClassiqueColorCustomized() && (
                    <button onClick={handleResetClassiqueColors}
                      className="text-xs text-left transition-opacity opacity-50 hover:opacity-100"
                      style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
                      ↩ Couleurs par défaut
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Couleurs — moderne & minimaliste */}
            {currentTheme !== "classique" && (
            <section>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Couleurs</p>
              <div className="flex flex-col gap-3">
                {(currentTheme === "moderne" || currentTheme === "minimaliste") && (
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Fond couverture</span>
                    <div className="relative flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                        style={{ backgroundColor: currentTheme === "moderne" ? moderneBg : minimalisteBg, display: "block" }} />
                      <input type="color"
                        value={currentTheme === "moderne" ? moderneBg : minimalisteBg}
                        onChange={e => handleColorChange("bgColor", e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                  </label>
                )}
                {currentTheme === "minimaliste" && (
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Fond cadeau</span>
                    <div className="relative flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                        style={{ backgroundColor: minimalisteGiftBg, display: "block" }} />
                      <input type="color"
                        value={minimalisteGiftBg}
                        onChange={e => handleMinimalisteGiftBgChange(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                  </label>
                )}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Texte</span>
                  <div className="relative flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg border border-black/10 shadow-sm"
                      style={{ backgroundColor: currentTheme === "moderne" ? moderneText : currentTheme === "classique" ? classiqueText : currentTheme === "fleuri" ? fleuriText : minimalisteText, display: "block" }} />
                    <input type="color"
                      value={currentTheme === "moderne" ? moderneText : currentTheme === "classique" ? classiqueText : currentTheme === "fleuri" ? fleuriText : minimalisteText}
                      onChange={e => handleColorChange("textColor", e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                </label>
                {isColorCustomized() && (
                  <button onClick={handleResetColors}
                    className="text-xs text-left transition-opacity opacity-50 hover:opacity-100"
                    style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
                    ↩ Couleurs par défaut
                  </button>
                )}
              </div>
            </section>
            )}

            {/* Bouton sauvegarder */}
            <div className="pt-4 border-t border-[#f0e6e2]">
              <button
                onClick={handleSaveAll}
                disabled={designSaving}
                className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-60"
                style={{
                  backgroundColor: designSaved ? "#4caf50" : "#6D1D3E",
                  color: "white",
                  fontFamily: "var(--font-display)",
                }}
              >
                {designSaving ? "Sauvegarde…" : designSaved ? "✓ Sauvegardé !" : "Sauvegarder les modifications"}
              </button>
            </div>

          </div>

          {/* ── RIGHT PANEL — PREVIEW ── */}
          <div ref={previewContainerRef} className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ backgroundColor: "#EDE8E3" }}>

            {/* Toggle desktop / mobile */}
            <div className="flex items-center justify-center gap-1 pt-4 pb-2 flex-shrink-0">
              <div className="flex items-center rounded-full p-1 gap-1" style={{ backgroundColor: "rgba(0,0,0,0.1)" }}>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: previewMode === "desktop" ? "#fff" : "transparent",
                    color: previewMode === "desktop" ? "#6D1D3E" : "rgba(0,0,0,0.4)",
                    boxShadow: previewMode === "desktop" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                  </svg>
                  Ordinateur
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: previewMode === "mobile" ? "#fff" : "transparent",
                    color: previewMode === "mobile" ? "#6D1D3E" : "rgba(0,0,0,0.4)",
                    boxShadow: previewMode === "mobile" ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
                  </svg>
                  Téléphone
                </button>
              </div>
            </div>

            {/* Preview frame */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
              {previewScale > 0 && previewMode === "desktop" && (() => {
                const W = 1280;
                const H = 720;
                const CHROME = 44;
                return (
                  <div style={{ width: W * previewScale, height: (H + CHROME) * previewScale, flexShrink: 0, borderRadius: 12 * previewScale, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>
                    <div style={{ width: W, height: H + CHROME, transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                      <div style={{ height: CHROME, backgroundColor: "#D8D1CA", display: "flex", alignItems: "center", gap: 12, padding: "0 16px" }}>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FF5F57" }} />
                          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
                          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28C940" }} />
                        </div>
                        <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "6px 12px", fontSize: 12, color: "#888", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          wedy.fr/mariage/{registry.slug}
                        </div>
                        <button
                          onClick={() => setPreviewKey(k => k + 1)}
                          style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#666" }}
                          title="Actualiser"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
                          </svg>
                        </button>
                      </div>
                      <iframe
                        ref={iframeRef}
                        key={previewKey}
                        src={`/mariage/${registry.slug}?t=${previewKey}`}
                        style={{ width: W, height: H, border: 0, display: "block" }}
                      />
                    </div>
                  </div>
                );
              })()}

              {previewScale > 0 && previewMode === "mobile" && (() => {
                const W = 390;
                const VIEWPORT_H = 720;
                const NOTCH_H = 0;
                const HOME_H = 8;
                const BEZEL = 10;
                const RADIUS = 38;
                const totalW = W + BEZEL * 2;
                const totalH = VIEWPORT_H + NOTCH_H + HOME_H + BEZEL * 2;
                return (
                  <div style={{
                    width: totalW * previewScale,
                    height: totalH * previewScale,
                    flexShrink: 0,
                    borderRadius: (RADIUS + BEZEL) * previewScale,
                    backgroundColor: "#1a1a1a",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: totalW,
                      height: totalH,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {/* Screen — overflow:hidden + borderRadius clip le contenu */}
                      <div style={{
                        width: W,
                        height: VIEWPORT_H + NOTCH_H + HOME_H,
                        borderRadius: RADIUS,
                        overflow: "hidden",
                        backgroundColor: "#000",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}>
                        {/* Dynamic Island */}
                        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 110, height: 26, borderRadius: 14, backgroundColor: "#000", zIndex: 10, boxShadow: "0 0 0 1.5px #2a2a2a" }} />
                        {/* iframe — pleine hauteur */}
                        <iframe
                          ref={mobileIframeRef}
                          key={`mobile-${previewKey}`}
                          src={`/mariage/${registry.slug}?t=${previewKey}`}
                          style={{ width: W, height: VIEWPORT_H + HOME_H, border: 0, display: "block", flexShrink: 0 }}
                        />
                        {/* Home indicator — superposé en absolu */}
                        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 100, height: 4, borderRadius: 2, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 10 }} />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      )}

      {activeTab === "participation" && (
      <main className="w-full px-6 lg:px-10 py-12">

        {/* Stripe Connect */}
        <div
          className="rounded-2xl p-6 mb-10 w-full flex flex-col sm:flex-row items-start sm:items-center gap-5"
          style={{ border: "1.5px solid #EABACB", backgroundColor: "#FFFBFD" }}
        >
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-sm font-semibold" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
              Paiements
            </span>
            {stripeEnabled ? (
              <span className="text-sm font-light" style={{ color: "rgba(109,29,62,0.6)", fontFamily: "var(--font-display)" }}>
                Votre compte Stripe est connecté — vos invités peuvent participer.
              </span>
            ) : (
              <span className="text-sm font-light" style={{ color: "rgba(109,29,62,0.6)", fontFamily: "var(--font-display)" }}>
                Connectez votre compte Stripe pour recevoir les participations directement sur votre compte bancaire.
              </span>
            )}
          </div>
          {stripeEnabled ? (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#d4edda", color: "#155724", border: "1px solid #c3e6cb", fontFamily: "var(--font-display)" }}
            >
              <Check size={14} strokeWidth={2.5} />
              Stripe connecté
            </div>
          ) : (
            <button
              onClick={handleStripeConnect}
              disabled={stripeConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
              style={{
                backgroundColor: "#6D1D3E",
                color: "#fff",
                fontFamily: "var(--font-display)",
                opacity: stripeConnecting ? 0.7 : 1,
                cursor: stripeConnecting ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {stripeConnecting ? "Redirection…" : "Connecter mon compte Stripe"}
            </button>
          )}
        </div>

        {/* Header */}
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-bagel)",
              fontSize: "1.8rem",
              color: "#7A1B45",
              lineHeight: 1,
              padding: "10px 28px",
              borderRadius: "999px",
              backgroundColor: "#FFF0F5",
              boxShadow: "3px 4px 0px #D4789A",
              border: "2px solid #EABACB",
            }}
          >
            Dashboard
          </span>

          {/* URL du site — box */}
          <div
            className="rounded-2xl px-5 py-3 flex flex-col gap-1.5"
            style={{ backgroundColor: "white", border: "1.5px solid #EABACB", minWidth: "280px" }}
          >
            {slugEditing ? (
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(109,29,62,0.4)", flexShrink: 0 }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span className="text-xs font-bold tracking-widest uppercase whitespace-nowrap" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Mon URL :</span>
                <div className="flex items-center rounded-lg overflow-hidden border border-[#6D1D3E] bg-[#FFF5F0] flex-1">
                  <span className="pl-2 pr-0.5 text-xs text-[#6D1D3E]/40 whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>wedy.fr/mariage/</span>
                  <input
                    autoFocus
                    value={slugDraft}
                    onChange={handleSlugDraftChange}
                    onBlur={saveSlugDash}
                    onKeyDown={e => { if (e.key === "Enter") saveSlugDash(); if (e.key === "Escape") { setSlugEditing(false); setSlugDraft(slug); setSlugStatus("idle"); } }}
                    className="flex-1 py-1 pr-1 text-xs bg-transparent focus:outline-none text-[#6D1D3E] font-medium min-w-0"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                  <span className="pr-1.5 text-xs w-4 text-center">
                    {slugStatus === "checking" && <span className="text-[#6D1D3E]/40">…</span>}
                    {slugStatus === "available" && <span className="text-green-600">✓</span>}
                    {slugStatus === "taken" && <span className="text-red-500">✗</span>}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(109,29,62,0.4)", flexShrink: 0 }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span className="text-xs font-bold tracking-widest uppercase whitespace-nowrap" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>Mon URL :</span>
                <span className="text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  <span style={{ color: "rgba(109,29,62,0.4)" }}>wedy.fr/mariage/</span><span
                    className="font-bold cursor-pointer"
                    style={{ color: "#6D1D3E", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "3px" }}
                    onClick={() => { setSlugDraft(slug); setSlugStatus("idle"); setSlugEditing(true); }}
                  >{slug}</span>
                </span>
                <button
                  onClick={() => { setSlugDraft(slug); setSlugStatus("idle"); setSlugEditing(true); }}
                  className="p-1 rounded-lg hover:bg-[#6D1D3E]/10 transition-colors flex-shrink-0 ml-auto"
                  title="Modifier l'URL"
                >
                  <Pencil size={12} strokeWidth={2} style={{ color: "rgba(109,29,62,0.5)" }} />
                </button>
                {slugStatus === "saved" && <span className="text-xs text-green-600">✓</span>}
              </div>
            )}
            {slugStatus === "taken" && slugEditing && (
              <p className="text-xs text-red-500 pl-5" style={{ fontFamily: "var(--font-display)" }}>Cette URL est déjà prise.</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          className="rounded-2xl p-6 mb-10 w-full"
          style={{ border: "1.5px solid #EABACB", backgroundColor: "#FFFBFD" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { label: "Cadeaux", value: localGifts.length },
              { label: "Collecté", value: `${totalCollected.toFixed(0)} €` },
              { label: "Contributions", value: contributions.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-8 flex flex-col items-center justify-center gap-2 text-center"
                style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.15)" }}
              >
                <span className="text-4xl font-bold tracking-tight" style={{ color: "#6D1D3E" }}>
                  {stat.value}
                </span>
                <span className="text-sm" style={{ color: "#6D1D3E", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300 }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {totalGoal > 0 && (
          <div className="rounded-2xl p-8 mb-10" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.15)" }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-light" style={{ color: "#6D1D3E", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>Progression de la liste</span>
              <span className="text-sm font-semibold" style={{ color: "#6D1D3E", fontFamily: "var(--font-serif)" }}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(109,29,62,0.12)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(progressPercent, 100)}%`, backgroundColor: "#6D1D3E" }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                {totalCollected.toFixed(0)} € collectés
              </span>
              <span className="text-xs" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
                Objectif : {totalGoal.toFixed(0)} €
              </span>
            </div>
          </div>
        )}

        {/* Participations */}
        <div className="mb-10">
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-bagel)",
              fontSize: "1.8rem",
              color: "#7A1B45",
              lineHeight: 1,
              padding: "10px 28px",
              borderRadius: "999px",
              backgroundColor: "#FFF0F5",
              boxShadow: "3px 4px 0px #D4789A",
              border: "2px solid #EABACB",
              marginBottom: "1.5rem",
            }}
          >
            Participations
          </span>

          {contributions.length === 0 ? (
            <div
              className="py-14 px-8 text-center rounded-2xl flex flex-col items-center gap-4"
              style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.08)", border: "2px dashed rgba(109,29,62,0.15)" }}
            >
              <p className="text-sm font-light" style={{ color: "rgba(109,29,62,0.5)" }}>
                Aucune participation pour l'instant.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {contributions.map((c: any) => {
                const gift = localGifts.find((g: any) => g.id === c.gift_id);
                const date = c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : null;
                return (
                  <div
                    key={c.id}
                    className="rounded-2xl px-6 py-5 flex items-start justify-between gap-4"
                    style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.1)" }}
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>
                          {c.contributor_name || "Anonyme"}
                        </span>
                        {date && (
                          <span className="text-xs" style={{ color: "rgba(109,29,62,0.4)" }}>{date}</span>
                        )}
                      </div>
                      {gift && (
                        <span className="text-xs" style={{ color: "rgba(109,29,62,0.55)", fontFamily: "var(--font-display)" }}>
                          Pour : {gift.title}
                        </span>
                      )}
                      {c.message && (
                        <p className="text-sm font-light mt-1 italic" style={{ color: "rgba(44,44,44,0.65)" }}>
                          &ldquo;{c.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <span
                      className="text-lg font-bold flex-shrink-0"
                      style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}
                    >
                      {Number(c.amount).toFixed(0)} €
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
      )}

      {activeTab === "cadeaux" && (
      <main className="w-full px-6 lg:px-10 py-12">

        {/* Partager le lien */}
        {slug && (
          <div
            className="inline-flex items-center gap-4 rounded-2xl px-5 py-3 mb-10"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.08)", border: "1.5px solid #EABACB" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs tracking-[0.2em] uppercase flex-shrink-0" style={{ color: "rgba(109,29,62,0.35)", fontFamily: "var(--font-display)", fontWeight: 400 }}>
                Partager
              </span>
              <span className="text-sm truncate" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 300 }}>
                wedy.fr/mariage/{slug}
              </span>
            </div>
            <button
                onClick={() => {
                  const url = `${window.location.origin}/mariage/${slug}`;
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(() => {
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    });
                  } else {
                    const ta = document.createElement("textarea");
                    ta.value = url;
                    ta.style.position = "fixed";
                    ta.style.opacity = "0";
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors flex-shrink-0"
                style={{ backgroundColor: linkCopied ? "rgba(109,29,62,0.15)" : "rgba(109,29,62,0.07)", color: linkCopied ? "#6D1D3E" : "rgba(109,29,62,0.6)", fontFamily: "var(--font-display)", fontWeight: 500 }}
                onMouseEnter={e => { if (!linkCopied) e.currentTarget.style.backgroundColor = "rgba(109,29,62,0.14)"; }}
                onMouseLeave={e => { if (!linkCopied) e.currentTarget.style.backgroundColor = "rgba(109,29,62,0.07)"; }}
              >
                {linkCopied ? "Copié ✓" : "Copier le lien"}
              </button>
          </div>
        )}

        {(() => {
          let displayed = [...localGifts];
          if (filterCategories.length > 0)
            displayed = displayed.filter(g => filterCategories.includes(g.category));
          if (filterPrices.length > 0)
            displayed = displayed.filter(g => filterPrices.some(r =>
              r === "0-100"   ? g.price < 100 :
              r === "100-300" ? g.price >= 100 && g.price < 300 :
                                g.price >= 300
            ));
          const existingCategories = Array.from(new Set(localGifts.map((g: any) => g.category).filter(Boolean))) as string[];
          return (
            <>
              <div className="flex items-center justify-between mb-4">
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-bagel)",
                    fontSize: "1.8rem",
                    color: "#7A1B45",
                    lineHeight: 1,
                    padding: "10px 28px",
                    borderRadius: "999px",
                    backgroundColor: "#FFF0F5",
                    boxShadow: "3px 4px 0px #D4789A",
                    border: "2px solid #EABACB",
                  }}
                >
                  Vos cadeaux
                </span>
                <button
                  onClick={() => setShowAddGift(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#2c2c2c] text-white text-xs tracking-widest uppercase hover:bg-[#9e6b5c] transition-colors"
                >
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>

              {localGifts.length > 0 && (
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  <div className="relative">
                    <button
                      onClick={() => { setCategoryDropdownOpen(!categoryDropdownOpen); setPriceDropdownOpen(false); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                      style={{ backgroundColor: "#F0F0F0", color: "#2c2c2c", fontFamily: "var(--font-display)" }}
                    >
                      {filterCategories.length > 0 ? `Catégories (${filterCategories.length})` : "Catégories"}
                      <ChevronDown size={14} />
                    </button>
                    {categoryDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 rounded-2xl bg-white z-50 min-w-[200px] py-2"
                        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f0e6e2" }}>
                        {(existingCategories.length > 0 ? existingCategories : CATEGORIES).map(c => {
                          const checked = filterCategories.includes(c);
                          return (
                            <button key={c}
                              onClick={() => setFilterCategories(prev => checked ? prev.filter(x => x !== c) : [...prev, c])}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#faf5f3]"
                              style={{ fontFamily: "var(--font-display)", color: "#2c2c2c" }}
                            >
                              <span style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, border: `2px solid ${checked ? "#1a1a1a" : "rgba(0,0,0,0.2)"}`, backgroundColor: checked ? "rgba(0,0,0,0.07)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {checked && <Check size={10} color="#1a1a1a" strokeWidth={3}/>}
                              </span>
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => { setPriceDropdownOpen(!priceDropdownOpen); setCategoryDropdownOpen(false); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                      style={{ backgroundColor: "#F0F0F0", color: "#2c2c2c", fontFamily: "var(--font-display)" }}
                    >
                      {filterPrices.length > 0 ? `Prix (${filterPrices.length})` : "Prix"}
                      <ChevronDown size={14} />
                    </button>
                    {priceDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 rounded-2xl bg-white z-50 min-w-[180px] py-2"
                        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #f0e6e2" }}>
                        {([
                          { label: "0 – 100 €", value: "0-100" as const },
                          { label: "100 – 300 €", value: "100-300" as const },
                          { label: "300 € +", value: "300+" as const },
                        ]).map(opt => {
                          const checked = filterPrices.includes(opt.value);
                          return (
                            <button key={opt.value}
                              onClick={() => setFilterPrices(prev => checked ? prev.filter(x => x !== opt.value) : [...prev, opt.value])}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-[#faf5f3]"
                              style={{ fontFamily: "var(--font-display)", color: "#2c2c2c" }}
                            >
                              <span style={{ width: 16, height: 16, borderRadius: 3, flexShrink: 0, border: `2px solid ${checked ? "#1a1a1a" : "rgba(0,0,0,0.2)"}`, backgroundColor: checked ? "rgba(0,0,0,0.07)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {checked && <Check size={10} color="#1a1a1a" strokeWidth={3}/>}
                              </span>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {localGifts.length === 0 ? (
                <div
                  className="py-14 px-8 text-center rounded-2xl flex flex-col items-center gap-4"
                  style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.08)", border: "2px dashed rgba(109,29,62,0.15)" }}
                >
                  <img src="/logo/fox_sitting_gift.png" alt="" style={{ width: 120, height: 120, objectFit: "contain" }} />
                  <p className="text-sm font-light" style={{ color: "rgba(109,29,62,0.5)" }}>
                    Aucun cadeau pour l'instant. Ajoutez votre premier cadeau.
                  </p>
                </div>
              ) : displayed.length === 0 ? (
                <div className="p-12 text-center rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
                  <p className="text-sm font-light" style={{ color: "rgba(109,29,62,0.5)" }}>Aucun cadeau ne correspond à ce filtre.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {displayed.map((gift) => {
                    const funded = gift.is_funded;
                    return (
                      <div
                        key={gift.id}
                        className="rounded-2xl overflow-hidden flex flex-col"
                        style={{ backgroundColor: "#FFFFFF", boxShadow: "0 4px 20px rgba(109,29,62,0.12)", opacity: funded ? 0.65 : 1, filter: funded ? "grayscale(0.3)" : "none", transition: "opacity 0.3s, filter 0.3s" }}
                      >
                        <div
                          className="relative cursor-pointer group"
                          style={{ aspectRatio: "4/3", overflow: "hidden" }}
                          onClick={() => { setGiftPickerGiftId(gift.id); setUnsplashQuery(""); setUnsplashResults([]); }}
                        >
                          {gift.image_url ? (
                            <img src={gift.image_url} alt={gift.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "rgba(109,29,62,0.05)" }}>
                              <Gift size={36} strokeWidth={1} style={{ color: "rgba(109,29,62,0.2)" }} />
                            </div>
                          )}
                          {giftUploading[gift.id] ? (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(109,29,62,0.35)" }}>
                              <span className="text-white text-xs tracking-widest uppercase">Envoi…</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(109,29,62,0.45)" }}>
                              <span className="text-white text-2xl font-light">+</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1 p-4 gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold truncate" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{gift.title}</p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => startEditGift(gift)} className="transition-colors" style={{ color: "rgba(109,29,62,0.25)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(109,29,62,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(109,29,62,0.25)")}>
                                <SquarePen size={14} strokeWidth={1.5} />
                              </button>
                              <button onClick={() => handleDeleteGift(gift.id)} className="transition-colors" style={{ color: "rgba(109,29,62,0.25)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(109,29,62,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(109,29,62,0.25)")}>
                                <Trash2 size={14} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                          {gift.description && (
                            <p className="text-xs font-light line-clamp-2" style={{ color: "rgba(44,44,44,0.55)" }}>{gift.description}</p>
                          )}
                          <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                            <span className="text-base font-bold" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>{Number(gift.price).toFixed(0)} €</span>
                            {funded && (
                              <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>
                                <Check size={13} strokeWidth={2.5} />
                                Financé
                              </span>
                            )}
                          </div>
                          {!funded && (
                            <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: "rgba(109,29,62,0.08)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${gift.price > 0 ? Math.min((gift.amount_collected / gift.price) * 100, 100) : 0}%`, backgroundColor: "#6D1D3E" }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}
      </main>
      )}

      {/* Unsplash image picker modal */}
      {giftPickerGiftId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setGiftPickerGiftId(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0e6e2]">
              <div>
                <h3 className="text-base font-bold" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
                  Choisir une photo
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "rgba(109,29,62,0.5)" }}>
                  Recherchez parmi des milliers de photos gratuites
                </p>
              </div>
              <button
                onClick={() => setGiftPickerGiftId(null)}
                className="text-[#6D1D3E]/40 hover:text-[#6D1D3E] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search + upload */}
            <div className="flex gap-3 px-6 py-4 border-b border-[#f0e6e2]">
              <input
                type="text"
                value={unsplashQuery}
                onChange={e => handleUnsplashQueryChange(e.target.value)}
                placeholder="Rechercher : voyage, fleurs, cuisine…"
                autoFocus
                className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
                style={{
                  backgroundColor: "rgba(109,29,62,0.05)",
                  color: "#6D1D3E",
                  border: "2px solid transparent",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
              />
              <label
                className="flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer text-xs font-bold tracking-wide transition-colors"
                style={{ backgroundColor: "rgba(109,29,62,0.08)", color: "#6D1D3E" }}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file && giftPickerGiftId) {
                      setGiftPickerGiftId(null);
                      handleGiftPhotoUpload(giftPickerGiftId, file);
                    }
                  }}
                />
                Mes photos
              </label>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {unsplashLoading && (
                <div className="flex items-center justify-center py-12">
                  <span className="text-sm" style={{ color: "rgba(109,29,62,0.4)" }}>Recherche…</span>
                </div>
              )}
              {!unsplashLoading && unsplashResults.length === 0 && unsplashQuery && (
                <div className="flex items-center justify-center py-12">
                  <span className="text-sm" style={{ color: "rgba(109,29,62,0.4)" }}>Aucun résultat</span>
                </div>
              )}
              {!unsplashLoading && unsplashResults.length === 0 && !unsplashQuery && (
                <div className="flex items-center justify-center py-12">
                  <span className="text-sm" style={{ color: "rgba(109,29,62,0.35)" }}>Tapez un mot-clé pour chercher une photo</span>
                </div>
              )}
              {!unsplashLoading && unsplashResults.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {unsplashResults.map(img => (
                    <button
                      key={img.id}
                      onClick={() => handleSelectUnsplashImage(giftPickerGiftId!, img.regular)}
                      className="relative group rounded-xl overflow-hidden focus:outline-none"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2"
                        style={{ background: "linear-gradient(to top, rgba(109,29,62,0.7) 0%, transparent 60%)" }}
                      >
                        <span className="text-white text-[10px] truncate">{img.author}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Unsplash credit */}
            <div className="px-6 py-3 border-t border-[#f0e6e2] text-center">
              <span className="text-[10px]" style={{ color: "rgba(109,29,62,0.35)" }}>
                Photos par{" "}
                <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">
                  Unsplash
                </a>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit gift modal */}
      {editingGiftId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={closeEditModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Left: image panel */}
            <div
              className="relative flex-shrink-0 flex flex-col"
              style={{ width: "42%", backgroundColor: "rgba(109,29,62,0.04)" }}
            >
              {editGiftImageUrl ? (
                <div className="relative flex-1 min-h-0">
                  <img src={editGiftImageUrl} alt="" className="w-full h-full object-cover" style={{ minHeight: "200px", maxHeight: "100%" }} />
                  <button
                    onClick={() => { setEditGiftImageUrl(null); setEditGiftFile(null); setAddGiftQuery(""); setAddGiftResults([]); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "white" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full p-4 gap-3">
                  <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Photo
                  </p>
                  <input
                    type="text"
                    value={addGiftQuery}
                    onChange={e => handleAddGiftQueryChange(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ backgroundColor: "rgba(109,29,62,0.07)", color: "#6D1D3E", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />
                  <label
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold cursor-pointer transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.08)", color: "#6D1D3E" }}
                  >
                    <ImagePlus size={14} strokeWidth={2} />
                    Mes photos
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setEditGiftFile(file);
                          setEditGiftImageUrl(URL.createObjectURL(file));
                          setAddGiftQuery("");
                          setAddGiftResults([]);
                        }
                      }}
                    />
                  </label>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {addGiftSearchLoading && (
                      <div className="flex items-center justify-center py-6">
                        <span className="text-xs" style={{ color: "rgba(109,29,62,0.4)" }}>Recherche…</span>
                      </div>
                    )}
                    {!addGiftSearchLoading && addGiftResults.length === 0 && !addGiftQuery && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
                        <ImagePlus size={28} strokeWidth={1} style={{ color: "#6D1D3E" }} />
                        <span className="text-xs text-center" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>Cherchez une photo ou<br/>importez la vôtre</span>
                      </div>
                    )}
                    {!addGiftSearchLoading && addGiftResults.length === 0 && addGiftQuery && (
                      <div className="flex items-center justify-center py-6">
                        <span className="text-xs" style={{ color: "rgba(109,29,62,0.4)" }}>Aucun résultat</span>
                      </div>
                    )}
                    {!addGiftSearchLoading && addGiftResults.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {addGiftResults.map(img => (
                          <button
                            key={img.id}
                            onClick={() => { setEditGiftImageUrl(img.regular); setAddGiftQuery(""); setAddGiftResults([]); }}
                            className="relative group rounded-lg overflow-hidden focus:outline-none"
                            style={{ aspectRatio: "4/3" }}
                          >
                            <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: "rgba(109,29,62,0.3)" }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {(addGiftResults.length > 0 || addGiftQuery) && (
                    <p className="text-[9px] text-center" style={{ color: "rgba(109,29,62,0.3)" }}>
                      Photos par <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: form */}
            <form
              onSubmit={handleSaveGift}
              className="flex-1 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0e6e2]">
                <h3 className="text-base font-bold" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
                  Modifier le cadeau
                </h3>
                <button type="button" onClick={closeEditModal} className="transition-colors" style={{ color: "rgba(109,29,62,0.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#6D1D3E")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(109,29,62,0.35)")}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-5 px-6 py-6 flex-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Nom du cadeau *
                  </label>
                  <input
                    required
                    autoFocus
                    value={editGiftForm.title}
                    onChange={e => setEditGiftForm({ ...editGiftForm, title: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={editGiftForm.price}
                    onChange={e => setEditGiftForm({ ...editGiftForm, price: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Catégorie
                  </label>
                  <select
                    value={editGiftForm.category}
                    onChange={e => setEditGiftForm({ ...editGiftForm, category: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: editGiftForm.category ? "#2c2c2c" : "#9a9a9a", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  >
                    <option value="">— Choisir —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editGiftForm.description}
                    onChange={e => setEditGiftForm({ ...editGiftForm, description: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />
                </div>
              </div>

              <div className="px-6 py-5 border-t border-[#f0e6e2] flex flex-col gap-3">
                {editGiftError && (
                  <p className="text-xs rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626", fontFamily: "var(--font-display)" }}>
                    {editGiftError}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.07)", color: "#6D1D3E", fontFamily: "var(--font-display)" }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={editGiftSaving}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}
                  >
                    {editGiftSaving ? "Sauvegarde…" : "Sauvegarder →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add gift modal */}
      {showAddGift && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={closeAddGiftModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl overflow-hidden flex"
            style={{ backgroundColor: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.22)", maxHeight: "90vh" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Left: image panel */}
            <div
              className="relative flex-shrink-0 flex flex-col"
              style={{ width: "42%", backgroundColor: "rgba(109,29,62,0.04)" }}
            >
              {/* Selected image */}
              {addGiftImageUrl ? (
                <div className="relative flex-1 min-h-0">
                  <img src={addGiftImageUrl} alt="" className="w-full h-full object-cover" style={{ minHeight: "200px", maxHeight: "100%" }} />
                  <button
                    onClick={() => { setAddGiftImageUrl(null); setAddGiftFile(null); setAddGiftQuery(""); setAddGiftResults([]); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "white" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                /* Image search area */
                <div className="flex flex-col h-full p-4 gap-3">
                  <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Photo
                  </p>
                  <input
                    type="text"
                    value={addGiftQuery}
                    onChange={e => handleAddGiftQueryChange(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ backgroundColor: "rgba(109,29,62,0.07)", color: "#6D1D3E", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />

                  {/* Upload button */}
                  <label
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold cursor-pointer transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.08)", color: "#6D1D3E" }}
                  >
                    <ImagePlus size={14} strokeWidth={2} />
                    Mes photos
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAddGiftFile(file);
                          setAddGiftImageUrl(URL.createObjectURL(file));
                          setAddGiftQuery("");
                          setAddGiftResults([]);
                        }
                      }}
                    />
                  </label>

                  {/* Results grid */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {addGiftSearchLoading && (
                      <div className="flex items-center justify-center py-6">
                        <span className="text-xs" style={{ color: "rgba(109,29,62,0.4)" }}>Recherche…</span>
                      </div>
                    )}
                    {!addGiftSearchLoading && addGiftResults.length === 0 && !addGiftQuery && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-40">
                        <ImagePlus size={28} strokeWidth={1} style={{ color: "#6D1D3E" }} />
                        <span className="text-xs text-center" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>Cherchez une photo ou<br/>importez la vôtre</span>
                      </div>
                    )}
                    {!addGiftSearchLoading && addGiftResults.length === 0 && addGiftQuery && (
                      <div className="flex items-center justify-center py-6">
                        <span className="text-xs" style={{ color: "rgba(109,29,62,0.4)" }}>Aucun résultat</span>
                      </div>
                    )}
                    {!addGiftSearchLoading && addGiftResults.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {addGiftResults.map(img => (
                          <button
                            key={img.id}
                            onClick={() => { setAddGiftImageUrl(img.regular); setAddGiftQuery(""); setAddGiftResults([]); }}
                            className="relative group rounded-lg overflow-hidden focus:outline-none"
                            style={{ aspectRatio: "4/3" }}
                          >
                            <img src={img.thumb} alt={img.alt} className="w-full h-full object-cover" />
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ backgroundColor: "rgba(109,29,62,0.3)" }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Unsplash credit */}
                  {(addGiftResults.length > 0 || addGiftQuery) && (
                    <p className="text-[9px] text-center" style={{ color: "rgba(109,29,62,0.3)" }}>
                      Photos par <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline">Unsplash</a>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: form */}
            <form
              onSubmit={handleAddGift}
              className="flex-1 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0e6e2]">
                <h3 className="text-base font-bold" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
                  Ajouter un cadeau
                </h3>
                <button type="button" onClick={closeAddGiftModal} className="transition-colors" style={{ color: "rgba(109,29,62,0.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#6D1D3E")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(109,29,62,0.35)")}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-5 px-6 py-6 flex-1">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Nom du cadeau *
                  </label>
                  <input
                    required
                    autoFocus
                    value={giftForm.title}
                    onChange={e => setGiftForm({ ...giftForm, title: e.target.value })}
                    placeholder="Voyage de noces à Kyoto"
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={giftForm.price}
                    onChange={e => setGiftForm({ ...giftForm, price: e.target.value })}
                    placeholder="250"
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Catégorie
                  </label>
                  <select
                    value={giftForm.category}
                    onChange={e => setGiftForm({ ...giftForm, category: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: giftForm.category ? "#2c2c2c" : "#9a9a9a", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  >
                    <option value="">— Choisir —</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={giftForm.description}
                    onChange={e => setGiftForm({ ...giftForm, description: e.target.value })}
                    placeholder="Une nuit dans un ryokan traditionnel…"
                    className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none"
                    style={{ backgroundColor: "rgba(109,29,62,0.05)", color: "#2c2c2c", border: "2px solid transparent" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#6D1D3E")}
                    onBlur={e => (e.currentTarget.style.borderColor = "transparent")}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-[#f0e6e2] flex flex-col gap-3">
                {addGiftError && (
                  <p className="text-xs rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626", fontFamily: "var(--font-display)" }}>
                    {addGiftError}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeAddGiftModal}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{ backgroundColor: "rgba(109,29,62,0.07)", color: "#6D1D3E", fontFamily: "var(--font-display)" }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}
                  >
                    {loading ? "Ajout…" : "Ajouter →"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
