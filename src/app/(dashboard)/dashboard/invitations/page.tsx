"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, Play, Sparkles, RotateCcw, Trash2, Move } from "lucide-react";

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */

interface Palette {
  id: string; label: string;
  bg: string; inner: string;
  textPrimary: string; textSecondary: string; accent: string;
  stripes?: string[];
}

interface TemplateConfig {
  id: string; name: string; category: string; description: string; paperImage?: string; layoutVariant?: string; paperFit?: string;
  palettes: Palette[];
}

interface UserData { p1: string; p2: string; date: string; location: string; }

interface EnvelopeConfig { textureId: string; }

interface CardCustomization {
  fontPreset: string;
  label: string;
  namesText: string;
  dateText: string;
  locationText: string;
  footer: string;
  photoUrl: string;
  customPaperBg?: string;
  styles: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
}

const DEFAULT_CARD: CardCustomization = {
  fontPreset: "romantique",
  label: "save the date",
  namesText: "",
  dateText: "",
  locationText: "",
  footer: "invitation à suivre",
  photoUrl: "",
  styles: {},
};

const FONT_LIST = [
  { id: "dancing",     label: "Dancing Script",      cssVar: "var(--font-script)" },
  { id: "ballet",      label: "Ballet",               cssVar: "var(--font-ballet)" },
  { id: "birthstone",  label: "Birthstone",           cssVar: "var(--font-birthstone)" },
  { id: "great-vibes", label: "Great Vibes",          cssVar: "var(--font-great-vibes)" },
  { id: "herr",        label: "Herr Von Muellerhoff", cssVar: "var(--font-herr)" },
  { id: "allura",      label: "Allura",               cssVar: "var(--font-allura)" },
  { id: "pinyon",      label: "Pinyon Script",        cssVar: "var(--font-pinyon)" },
  { id: "cormorant",         label: "Cormorant Garamond", cssVar: "var(--font-serif)" },
  { id: "cormorant-infant",  label: "Cormorant Infant",   cssVar: "var(--font-cormorant-infant)" },
  { id: "playfair",    label: "Playfair Display",     cssVar: "var(--font-playfair)" },
  { id: "montserrat",  label: "Montserrat",           cssVar: "var(--font-montserrat)" },
];

const TEXT_COLORS = [
  { hex: "#1A1A1A", label: "Noir" },
  { hex: "#28201A", label: "Encre" },
  { hex: "#6D1D3E", label: "Rose nuit" },
  { hex: "#2A3A50", label: "Ardoise" },
  { hex: "#4A3020", label: "Sépia" },
  { hex: "#3A5030", label: "Forêt" },
  { hex: "#B89040", label: "Or" },
  { hex: "#808080", label: "Gris" },
  { hex: "#F5F5F5", label: "Blanc" },
];

const ELEMENT_LABELS: Record<string, string> = {
  label: "Intitulé",
  names: "Prénoms",
  date: "Date",
  location: "Lieu",
  footer: "Pied de carte",
};

const FONT_PRESETS = [
  { id: "romantique",  label: "Romantique",  scriptFont: "var(--font-script)",      bodyFont: "var(--font-serif)",       scriptItalic: false, sample: "save the date" },
  { id: "classique",   label: "Classique",   scriptFont: "var(--font-serif)",        bodyFont: "var(--font-serif)",       scriptItalic: true,  sample: "save the date" },
  { id: "moderne",     label: "Moderne",     scriptFont: "var(--font-playfair)",     bodyFont: "var(--font-playfair)",    scriptItalic: true,  sample: "save the date" },
  { id: "minimaliste", label: "Minimaliste", scriptFont: "var(--font-montserrat)",   bodyFont: "var(--font-montserrat)",  scriptItalic: false, sample: "SAVE THE DATE" },
];

/* ═══════════════════════════════════════════════
   TEMPLATE DATA
═══════════════════════════════════════════════ */

const TEMPLATES: TemplateConfig[] = [
  {
    id: "dentelle", name: "Photo", category: "classique",
    description: "Papier aquarelle & photo, minimalisme élégant",
    palettes: [
      { id: "blanc",      label: "Blanc",       bg: "#F5F3F0", inner: "#F5F3F0", textPrimary: "#1A1A1A", textSecondary: "#606060", accent: "#303030" },
      { id: "ardoise",    label: "Ardoise",     bg: "#EEEEF0", inner: "#EEEEF0", textPrimary: "#1E2430", textSecondary: "#506080", accent: "#2A3A50" },
      { id: "ivoire",     label: "Ivoire",      bg: "#F2EBE0", inner: "#F2EBE0", textPrimary: "#28201A", textSecondary: "#7A6A5A", accent: "#5A4A3A" },
      { id: "poudre",     label: "Poudré",      bg: "#FAE8EE", inner: "#FAE8EE", textPrimary: "#4A1828", textSecondary: "#906070", accent: "#6A2840" },
      { id: "bleu-pale",  label: "Bleu pâle",   bg: "#E8F0F8", inner: "#E8F0F8", textPrimary: "#1A2840", textSecondary: "#405878", accent: "#2A3A58" },
      { id: "vert-pale",  label: "Vert pâle",   bg: "#E8F2EC", inner: "#E8F2EC", textPrimary: "#182A20", textSecondary: "#406050", accent: "#284838" },
      { id: "sable",      label: "Sable",       bg: "#EAE0D0", inner: "#EAE0D0", textPrimary: "#2C1E10", textSecondary: "#705040", accent: "#4A3020" },
      { id: "rose",       label: "Rose",        bg: "#F4EBE8", inner: "#F4EBE8", textPrimary: "#3A1820", textSecondary: "#805060", accent: "#5A2838" },
    ],
  },
  {
    id: "rayures", name: "Bold Stripes", category: "moderne",
    description: "Rayures graphiques & typographie audacieuse",
    palettes: [
      { id: "blush",    label: "Blush",    bg: "#F5E8EC", inner: "#F5E8EC", textPrimary: "#6A1028", textSecondary: "#9A4060", accent: "#8A2040", stripes: ["#F5E8EC","#EDD8E0","#E5C8D0","#DDB8C0"] },
      { id: "nuit",     label: "Nuit",     bg: "#1A1520", inner: "#1A1520", textPrimary: "#E8DFC8", textSecondary: "#C0B898", accent: "#C4A35A", stripes: ["#1A1520","#231C2C","#2C2438","#352C44"] },
      { id: "sauge",    label: "Sauge",    bg: "#EBF0E6", inner: "#EBF0E6", textPrimary: "#1E3018", textSecondary: "#456040", accent: "#3A5030", stripes: ["#EBF0E6","#DCE8D6","#CDE0C6","#BED8B6"] },
      { id: "champagne",label: "Champagne",bg: "#F8F2E5", inner: "#F8F2E5", textPrimary: "#3A2A10", textSecondary: "#7A6030", accent: "#B89040", stripes: ["#F8F2E5","#F0E8D0","#E8DEBB","#E0D4A6"] },
    ],
  },
  {
    id: "lettre-italy", name: "Italie", category: "lettre",
    description: "Papier aquarellé, accents toscans",
    paperImage: "/papier%20lettre/lettre_italy.png",
    palettes: [
      { id: "encre",    label: "Encre",    bg: "#EDE8E0", inner: "#EDE8E0", textPrimary: "#28201A", textSecondary: "#6A5040", accent: "#8A6040" },
      { id: "bordeaux", label: "Bordeaux", bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#6D1D3E", textSecondary: "#9A4060", accent: "#8A2048" },
      { id: "sepia",    label: "Sépia",    bg: "#EEE4D4", inner: "#EEE4D4", textPrimary: "#4A3020", textSecondary: "#8A6848", accent: "#6A4820" },
    ],
  },
  {
    id: "lettre-jungle", name: "Jungle", category: "lettre",
    description: "Feuillage tropical luxuriant",
    paperImage: "/papier%20lettre/lettre_jungle.png",
    palettes: [
      { id: "foret",    label: "Forêt",    bg: "#E8EEE4", inner: "#E8EEE4", textPrimary: "#1A2A1A", textSecondary: "#406040", accent: "#3A5030" },
      { id: "encre",    label: "Encre",    bg: "#EAEAEA", inner: "#EAEAEA", textPrimary: "#1A1A1A", textSecondary: "#505050", accent: "#303030" },
      { id: "or",       label: "Or",       bg: "#F0EAD8", inner: "#F0EAD8", textPrimary: "#3A2A10", textSecondary: "#806030", accent: "#B89040" },
    ],
  },
  {
    id: "lettre-flower-big-3", name: "Bouquet I", category: "lettre",
    description: "Grands bouquets floraux aquarelle",
    paperImage: "/papier%20lettre/lettre_flower_big_3.png",
    palettes: [
      { id: "rose",     label: "Rose",     bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#4A1828", textSecondary: "#904060", accent: "#6A2840" },
      { id: "bordeaux", label: "Bordeaux", bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#6D1D3E", textSecondary: "#9A4060", accent: "#8A2048" },
      { id: "encre",    label: "Encre",    bg: "#EAEAEA", inner: "#EAEAEA", textPrimary: "#1A1A1A", textSecondary: "#505050", accent: "#303030" },
    ],
  },
  {
    id: "lettre-flower-big-2", name: "Bouquet II", category: "lettre",
    description: "Typographie graphique bold sur fond floral",
    paperImage: "/papier%20lettre/lettre_flower_big_2.png",
    layoutVariant: "bold",
    palettes: [
      { id: "rose",     label: "Rose",     bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#4A1828", textSecondary: "#904060", accent: "#6A2840" },
      { id: "ardoise",  label: "Ardoise",  bg: "#E8EEF5", inner: "#E8EEF5", textPrimary: "#1E2430", textSecondary: "#506080", accent: "#2A3A50" },
      { id: "encre",    label: "Encre",    bg: "#EAEAEA", inner: "#EAEAEA", textPrimary: "#1A1A1A", textSecondary: "#505050", accent: "#303030" },
    ],
  },
  {
    id: "lettre-olivier", name: "Olivier", category: "lettre",
    description: "Branches d'olivier sur papier doux",
    paperImage: "/papier%20lettre/lettre_olivier.png",
    palettes: [
      { id: "olive",    label: "Olive",    bg: "#EAEEE6", inner: "#EAEEE6", textPrimary: "#2A3A20", textSecondary: "#5A7A4A", accent: "#4A6A3A" },
      { id: "encre",    label: "Encre",    bg: "#EAEAEA", inner: "#EAEAEA", textPrimary: "#1A1A1A", textSecondary: "#505050", accent: "#303030" },
      { id: "sepia",    label: "Sépia",    bg: "#EEE4D4", inner: "#EEE4D4", textPrimary: "#4A3020", textSecondary: "#8A6848", accent: "#6A4820" },
    ],
  },
  {
    id: "lettre-photo", name: "Photo florale", category: "lettre",
    description: "Votre photo encadrée sur fond floral",
    paperImage: "/papier%20lettre/lettre_flower_big.png",
    layoutVariant: "photo",
    palettes: [
      { id: "encre",    label: "Encre",    bg: "#EDE8E0", inner: "#EDE8E0", textPrimary: "#28201A", textSecondary: "#6A5040", accent: "#8A6040" },
      { id: "bordeaux", label: "Bordeaux", bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#6D1D3E", textSecondary: "#9A4060", accent: "#8A2048" },
      { id: "ardoise",  label: "Ardoise",  bg: "#E8EEF5", inner: "#E8EEF5", textPrimary: "#1E2430", textSecondary: "#506080", accent: "#2A3A50" },
    ],
  },
  {
    id: "lettre-flower-1", name: "Fleurs", category: "lettre",
    description: "Petits bouquets fleuris délicats",
    paperImage: "/papier%20lettre/lettre_flower_1.png",
    palettes: [
      { id: "rose",     label: "Rose",     bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#4A1828", textSecondary: "#904060", accent: "#6A2840" },
      { id: "bordeaux", label: "Bordeaux", bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#6D1D3E", textSecondary: "#9A4060", accent: "#8A2048" },
      { id: "encre",    label: "Encre",    bg: "#EAEAEA", inner: "#EAEAEA", textPrimary: "#1A1A1A", textSecondary: "#505050", accent: "#303030" },
    ],
  },
  {
    id: "lettre-arbres", name: "Arbres", category: "lettre",
    description: "Forêt aquarelle, typographie script élégante",
    paperImage: "/papier%20lettre/arbres_1.png",
    layoutVariant: "arbres",
    palettes: [
      { id: "creme",   label: "Crème",  bg: "#2E3828", inner: "#2E3828", textPrimary: "#F0EDE4", textSecondary: "#C4C0B0", accent: "#A8A498" },
      { id: "blanc",   label: "Blanc",  bg: "#1E2420", inner: "#1E2420", textPrimary: "#FFFFFF", textSecondary: "#D8D8D0", accent: "#C0C0B8" },
      { id: "or",      label: "Or",     bg: "#282610", inner: "#282610", textPrimary: "#F0E8C0", textSecondary: "#C0A850", accent: "#A88C38" },
      { id: "rose",    label: "Rosé",   bg: "#2A2028", inner: "#2A2028", textPrimary: "#F0DDE8", textSecondary: "#C8A8B8", accent: "#B08898" },
    ],
  },
  {
    id: "lettre-elegant", name: "Élégant", category: "classique",
    description: "Papier élégant aux lignes épurées",
    paperImage: "/papier%20lettre/elegant_base.png",
    paperFit: "none",
    layoutVariant: "elegant",
    palettes: [
      { id: "bordeaux", label: "Bordeaux", bg: "#F4E8EC", inner: "#F4E8EC", textPrimary: "#5A1830", textSecondary: "#8A4858", accent: "#741A3C" },
      { id: "encre",    label: "Encre",    bg: "#ECEAE6", inner: "#ECEAE6", textPrimary: "#1A1814", textSecondary: "#585450", accent: "#383430" },
      { id: "or",       label: "Or",       bg: "#F0EAD8", inner: "#F0EAD8", textPrimary: "#2C2008", textSecondary: "#705C28", accent: "#9A7C30" },
      { id: "ardoise",  label: "Ardoise",  bg: "#E8ECF2", inner: "#E8ECF2", textPrimary: "#18202C", textSecondary: "#404C5C", accent: "#283444" },
    ],
  },
];

const FILTERS = [
  { id: null, label: "Tous" },
  { id: "classique", label: "Classique" },
  { id: "floral", label: "Floral" },
  { id: "moderne", label: "Moderne" },
  { id: "lettre", label: "Lettre" },
];

/* ═══════════════════════════════════════════════
   ENVELOPE DATA
═══════════════════════════════════════════════ */

interface EnvelopeTexture {
  id: string; label: string;
  previewHex: string;   // swatch circle color
  filter: string;       // CSS filter applied to SVG images
}

const ENVELOPE_TEXTURES: EnvelopeTexture[] = [
  { id: "naturel",   label: "Naturel",     previewHex: "#EEE4D4", filter: "" },
  { id: "blanc",     label: "Blanc nacré", previewHex: "#F0EEEA", filter: "saturate(0.6) brightness(1.06) contrast(1.04)" },
  { id: "ivoire",    label: "Ivoire",      previewHex: "#EAE0C8", filter: "sepia(0.18) brightness(0.97) contrast(1.04)" },
  { id: "champagne", label: "Champagne",   previewHex: "#D8C888", filter: "sepia(0.38) saturate(1.1) brightness(0.99) contrast(1.05)" },
  { id: "blush",     label: "Blush",       previewHex: "#F0CACE", filter: "sepia(0.28) hue-rotate(320deg) saturate(1.2) brightness(1.02) contrast(1.05)" },
  { id: "rose",      label: "Rose poudré", previewHex: "#E4ACBA", filter: "sepia(0.45) hue-rotate(312deg) saturate(1.5) brightness(0.99) contrast(1.06)" },
  { id: "sauge",     label: "Sauge",       previewHex: "#BCCEB8", filter: "sepia(0.18) hue-rotate(82deg) saturate(0.8) brightness(0.97) contrast(1.05)" },
  { id: "bleu",      label: "Bleu pâle",   previewHex: "#B4C8E0", filter: "sepia(0.12) hue-rotate(198deg) saturate(0.75) brightness(1.01) contrast(1.05)" },
  { id: "lavande",   label: "Lavande",     previewHex: "#C4BCDC", filter: "sepia(0.16) hue-rotate(242deg) saturate(0.75) brightness(1.02) contrast(1.05)" },
  { id: "graphite",  label: "Graphite",    previewHex: "#505050", filter: "grayscale(1) brightness(0.42) contrast(1.15)" },
  { id: "bordeaux",  label: "Bordeaux",    previewHex: "#8A2038", filter: "sepia(0.85) hue-rotate(296deg) saturate(1.8) brightness(0.65) contrast(1.1)" },
];

const DEFAULT_ENVELOPE: EnvelopeConfig = { textureId: "naturel" };

/* ═══════════════════════════════════════════════
   ENVELOPE BODY COMPONENT
═══════════════════════════════════════════════ */

// Natural SVG dimensions from the provided design files
const ENV_OPEN_W = 211; const ENV_OPEN_H = 278;
const ENV_CLOSED_W = 211; const ENV_CLOSED_H = 154;

function EnvelopeBody({ W, cfg, flapOpen, extraStyle }: {
  W: number; cfg?: EnvelopeConfig;
  flapOpen?: boolean; extraStyle?: React.CSSProperties;
}) {
  const isOpen = flapOpen !== false;
  const openH   = Math.round(W * ENV_OPEN_H   / ENV_OPEN_W);
  const closedH = Math.round(W * ENV_CLOSED_H / ENV_CLOSED_W);
  const H = isOpen ? openH : closedH;
  const texture = ENVELOPE_TEXTURES.find(t => t.id === (cfg?.textureId ?? "naturel")) ?? ENVELOPE_TEXTURES[0];
  const imgFilter = texture.filter || undefined;

  return (
    <div style={{ position: "relative", width: W, height: H, ...extraStyle }}>
      <img
        src="/enveloppe/ouverte.svg"
        width={W} height={openH}
        style={{
          display: "block", position: "absolute", top: 0, left: 0,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.45s ease",
          pointerEvents: "none",
          filter: imgFilter,
        }}
        alt=""
      />
      <img
        src="/enveloppe/fermee.svg"
        width={W} height={closedH}
        style={{
          display: "block", position: "absolute", top: 0, left: 0,
          opacity: isOpen ? 0 : 1,
          transition: "opacity 0.35s ease",
          pointerEvents: "none",
          filter: imgFilter,
        }}
        alt=""
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ENVELOPE CUSTOMIZER PANEL
═══════════════════════════════════════════════ */

function EnvelopeCustomizerPanel({ cfg, onChange }: {
  cfg: EnvelopeConfig;
  onChange: (next: EnvelopeConfig) => void;
}) {
  const labelStyle: React.CSSProperties = {
    fontSize: "0.6rem", fontFamily: "var(--font-display)", lineHeight: 1.2,
    textAlign: "center", maxWidth: 44, color: "inherit",
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>
        Enveloppe
      </p>

      <div>
        <p className="text-xs mb-3" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>Couleur</p>
        <div className="grid grid-cols-4 gap-x-2 gap-y-3">
          {ENVELOPE_TEXTURES.map(t => {
            const selected = cfg.textureId === t.id;
            return (
              <button key={t.id}
                onClick={() => onChange({ textureId: t.id })}
                className="flex flex-col items-center gap-1.5"
              >
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  backgroundColor: t.previewHex,
                  border: "1.5px solid rgba(0,0,0,0.08)",
                  boxShadow: selected ? "0 0 0 2.5px white, 0 0 0 4.5px #6D1D3E" : "0 1px 4px rgba(0,0,0,0.14)",
                  transform: selected ? "scale(1.15)" : "scale(1)",
                  transition: "all 140ms",
                  flexShrink: 0,
                }}/>
                <span style={{ ...labelStyle, color: selected ? "#6D1D3E" : "rgba(44,44,44,0.45)", fontWeight: selected ? 600 : 400 }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HELPER: Scallop SVG circles border
═══════════════════════════════════════════════ */

function ScallopBorder({ W, H, margin, r, color }: { W: number; H: number; margin: number; r: number; color: string }) {
  const circles: { cx: number; cy: number }[] = [];
  const d = r * 2;
  const hCount = Math.floor((W - margin * 2) / d);
  const hStep = (W - margin * 2) / hCount;
  for (let i = 0; i <= hCount; i++) circles.push({ cx: margin + i * hStep, cy: margin });
  for (let i = 0; i <= hCount; i++) circles.push({ cx: margin + i * hStep, cy: H - margin });
  const vCount = Math.floor((H - margin * 2) / d);
  const vStep = (H - margin * 2) / vCount;
  for (let i = 1; i < vCount; i++) circles.push({ cx: margin, cy: margin + i * vStep });
  for (let i = 1; i < vCount; i++) circles.push({ cx: W - margin, cy: margin + i * vStep });
  return <>{circles.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={r} fill={color} />)}</>;
}

/* ═══════════════════════════════════════════════
   HELPER: Olive Branch SVG
═══════════════════════════════════════════════ */

function OliveBranch({ x, y, rotate, scale = 1, accentColor }: { x: number; y: number; rotate: number; scale?: number; accentColor: string }) {
  const l1 = accentColor; const l2 = accentColor + "CC";
  return (
    <g transform={`translate(${x},${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0,0 C8,-6 20,-10 34,-8" stroke={accentColor} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M0,0 C6,4 16,6 28,4" stroke={accentColor} strokeWidth="1" fill="none" strokeLinecap="round"/>
      <ellipse cx="8" cy="-4" rx="7" ry="2.5" fill={l1} transform="rotate(-20 8 -4)" opacity="0.9"/>
      <ellipse cx="16" cy="-7" rx="7" ry="2.5" fill={l2} transform="rotate(-30 16 -7)" opacity="0.85"/>
      <ellipse cx="24" cy="-8" rx="6" ry="2.2" fill={l1} transform="rotate(-25 24 -8)" opacity="0.9"/>
      <ellipse cx="10" cy="3" rx="6" ry="2" fill={l2} transform="rotate(15 10 3)" opacity="0.8"/>
      <ellipse cx="20" cy="5" rx="6" ry="2" fill={l1} transform="rotate(20 20 5)" opacity="0.85"/>
      <circle cx="14" cy="-5" r="2" fill="#8B5E3C" opacity="0.7"/>
      <circle cx="26" cy="-6" r="2" fill="#6B8B3A" opacity="0.75"/>
    </g>
  );
}

/* ═══════════════════════════════════════════════
   TEMPLATE RENDERERS
═══════════════════════════════════════════════ */

function TemplateDentelle({ W, H, p, user, photoUrl, fontPreset = "romantique", label, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, onPhotoClick, elementStyles, customPaperBg }: {
  W: number; H: number; p: Palette; user: UserData; isStd?: boolean;
  photoUrl?: string; fontPreset?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  onPhotoClick?: () => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
  customPaperBg?: string;
}) {
  const fp = FONT_PRESETS.find(f => f.id === fontPreset) ?? FONT_PRESETS[0];
  const displayLabel = label ?? "save the date";
  const displayFooter = footer ?? "invitation à suivre";
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Samedi 18 octobre 2026");
  const displayLocation = locationText ?? user.location;

  const photoW = W * 0.55;
  const photoH = H * 0.37;
  const photoX = (W - photoW) / 2;
  const photoY = H * 0.30;

  const getFont = (id: string, def: string) => elementStyles?.[id]?.font ?? def;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase = (id: string, val: string) => elementStyles?.[id]?.uppercase ? val.toUpperCase() : val;
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const hl = (y: number, h: number) => (
    <rect x={W * 0.04} y={y} width={W * 0.92} height={h}
      fill="rgba(109,29,62,0.06)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <defs>
        <filter id="ptex" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* Subtle large-grain cotton paper */}
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.055" numOctaves="5" seed="3" stitchTiles="stitch" result="bigN"/>
          <feColorMatrix in="bigN" type="saturate" values="0" result="bigG"/>
          <feComponentTransfer in="bigG" result="bigS">
            <feFuncR type="linear" slope="0.06" intercept="0.94"/>
            <feFuncG type="linear" slope="0.06" intercept="0.94"/>
            <feFuncB type="linear" slope="0.06" intercept="0.94"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="bigS" mode="multiply" result="pass1"/>
          {/* Barely-visible fine surface grain */}
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" seed="7" stitchTiles="stitch" result="fineN"/>
          <feColorMatrix in="fineN" type="saturate" values="0" result="fineG"/>
          <feComponentTransfer in="fineG" result="fineS">
            <feFuncR type="linear" slope="0.035" intercept="0.965"/>
            <feFuncG type="linear" slope="0.035" intercept="0.965"/>
            <feFuncB type="linear" slope="0.035" intercept="0.965"/>
          </feComponentTransfer>
          <feBlend in="pass1" in2="fineS" mode="multiply"/>
        </filter>
      </defs>

      <rect width={W} height={H} fill={customPaperBg ?? p.bg} filter="url(#ptex)"/>

      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.065, H * 0.085)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.13} textAnchor="middle"
            fontFamily={getFont("label", fp.scriptFont)}
            fontStyle={fp.scriptItalic ? "italic" : "normal"}
            fontSize={getSize("label", W * 0.056)}
            fill={getColor("label", p.textPrimary)}
            opacity="0.88">
            {getCase("label", displayLabel)}
          </text>
        )}
      </g>

      {/* Names */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.195, H * 0.068)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={H * 0.23} textAnchor="middle"
            fontFamily={getFont("names", fp.bodyFont)}
            fontSize={getSize("names", W * 0.038)}
            fill={getColor("names", p.textPrimary)}
            letterSpacing="3" fontWeight="500">
            {getCase("names", displayNames)}
          </text>
        )}
      </g>

      {/* Photo area */}
      {photoUrl ? (
        <g onClick={onPhotoClick ? e => { e.stopPropagation(); onPhotoClick(); } : undefined}
          style={{ cursor: onPhotoClick ? "pointer" : "default" }}>
          <image href={photoUrl} x={photoX} y={photoY} width={photoW} height={photoH} preserveAspectRatio="xMidYMid slice"/>
        </g>
      ) : (
        <g onClick={onPhotoClick ? e => { e.stopPropagation(); onPhotoClick(); } : undefined}
          style={{ cursor: onPhotoClick ? "pointer" : "default" }}>
          <rect x={photoX} y={photoY} width={photoW} height={photoH} fill={p.textPrimary} opacity="0.07"/>
          <rect x={photoX} y={photoY} width={photoW} height={photoH} fill="none" stroke={p.textSecondary} strokeWidth={onPhotoClick ? "0.8" : "0.6"} strokeDasharray={onPhotoClick ? "4,3" : undefined} opacity="0.3"/>
          <text x={W / 2} y={photoY + photoH / 2 - W * 0.01} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W * 0.03} fill={p.textSecondary} opacity="0.4" fontStyle="italic">
            {onPhotoClick ? "cliquez pour ajouter" : "votre photo"}
          </text>
          <text x={W / 2} y={photoY + photoH / 2 + W * 0.032} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={W * 0.055} fill={p.textSecondary} opacity="0.18">
            📷
          </text>
        </g>
      )}

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(photoY + photoH + H * 0.055, H * 0.065)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={photoY + photoH + H * 0.095} textAnchor="middle"
            fontFamily={getFont("date", fp.bodyFont)}
            fontSize={getSize("date", W * 0.031)}
            fill={getColor("date", p.textPrimary)}
            letterSpacing="2.5" fontWeight="500">
            {getCase("date", displayDate)}
          </text>
        )}
      </g>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(photoY + photoH + H * 0.108, H * 0.062)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={photoY + photoH + H * 0.145} textAnchor="middle"
              fontFamily={getFont("location", fp.bodyFont)}
              fontSize={getSize("location", W * 0.028)}
              fill={getColor("location", p.textPrimary)}
              letterSpacing="2.5" fontWeight="500">
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}

      {/* Footer */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        {selectedElement === "footer" && hl(H * 0.875, H * 0.075)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.92} textAnchor="middle"
            fontFamily={getFont("footer", fp.scriptFont)}
            fontStyle={fp.scriptItalic ? "italic" : "normal"}
            fontSize={getSize("footer", W * 0.048)}
            fill={getColor("footer", p.textPrimary)}
            opacity="0.55">
            {getCase("footer", displayFooter)}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplateOliviers({ W, H, p, user, isStd }: { W: number; H: number; p: Palette; user: UserData; isStd: boolean }) {
  const fmtDate = user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "18 octobre 2026";
  const s = W / 400;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <rect width={W} height={H} fill={p.bg}/>
      <OliveBranch x={W*0.05} y={H*0.04} rotate={0}   scale={s*1.4} accentColor={p.accent}/>
      <OliveBranch x={W*0.32} y={H*0.02} rotate={10}  scale={s*1.2} accentColor={p.accent}/>
      <OliveBranch x={W*0.55} y={H*0.03} rotate={-15} scale={s*1.3} accentColor={p.accent}/>
      <OliveBranch x={W*0.75} y={H*0.04} rotate={5}   scale={s*1.1} accentColor={p.accent}/>
      <OliveBranch x={W*0.92} y={H*0.12} rotate={90}  scale={s*1.2} accentColor={p.accent}/>
      <OliveBranch x={W*0.94} y={H*0.35} rotate={100} scale={s*1.1} accentColor={p.accent}/>
      <OliveBranch x={W*0.92} y={H*0.58} rotate={95}  scale={s*1.2} accentColor={p.accent}/>
      <OliveBranch x={W*0.90} y={H*0.78} rotate={110} scale={s}     accentColor={p.accent}/>
      <OliveBranch x={W*0.85} y={H*0.93} rotate={180} scale={s*1.3} accentColor={p.accent}/>
      <OliveBranch x={W*0.58} y={H*0.95} rotate={175} scale={s*1.1} accentColor={p.accent}/>
      <OliveBranch x={W*0.32} y={H*0.94} rotate={170} scale={s*1.2} accentColor={p.accent}/>
      <OliveBranch x={W*0.08} y={H*0.92} rotate={190} scale={s}     accentColor={p.accent}/>
      <OliveBranch x={W*0.04} y={H*0.78} rotate={270} scale={s*1.1} accentColor={p.accent}/>
      <OliveBranch x={W*0.04} y={H*0.55} rotate={280} scale={s*1.2} accentColor={p.accent}/>
      <OliveBranch x={W*0.05} y={H*0.32} rotate={265} scale={s*1.1} accentColor={p.accent}/>
      <OliveBranch x={W*0.06} y={H*0.10} rotate={270} scale={s}     accentColor={p.accent}/>
      <text x={W/2} y={H*0.22} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W*0.032} fill={p.textSecondary} fontStyle="italic">{isStd ? "Kindly Save the Date" : "vous invitent à célébrer leur mariage"}</text>
      <text x={W/2} y={isStd ? H*0.38 : H*0.36} textAnchor="middle" fontFamily="var(--font-script)" fontSize={W*0.105} fill={p.textPrimary}>{user.p1 || "Jennifer"}</text>
      <text x={W/2} y={isStd ? H*0.47 : H*0.45} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W*0.04} fill={p.textSecondary} fontStyle="italic">and</text>
      <text x={W/2} y={isStd ? H*0.57 : H*0.55} textAnchor="middle" fontFamily="var(--font-script)" fontSize={W*0.105} fill={p.textPrimary}>{user.p2 || "Nikos"}</text>
      <text x={W/2} y={isStd ? H*0.67 : H*0.65} textAnchor="middle" fontFamily="var(--font-montserrat)" fontSize={W*0.025} fill={p.textSecondary} letterSpacing="3" style={{ textTransform:"uppercase" }}>{"sont heureux de vous annoncer leur mariage"}</text>
      <line x1={W*0.25} y1={isStd ? H*0.72 : H*0.695} x2={W*0.75} y2={isStd ? H*0.72 : H*0.695} stroke={p.accent} strokeWidth="0.6" opacity="0.5"/>
      <text x={W/2} y={isStd ? H*0.79 : H*0.755} textAnchor="middle" fontFamily="var(--font-montserrat)" fontSize={W*0.028} fill={p.textPrimary} letterSpacing="2" style={{ textTransform:"uppercase" }}>{fmtDate}</text>
      {user.location && <text x={W/2} y={isStd ? H*0.86 : H*0.82} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W*0.03} fill={p.textSecondary} fontStyle="italic">{user.location}</text>}
    </svg>
  );
}

function TemplateRayures({ W, H, p, user, isStd }: { W: number; H: number; p: Palette; user: UserData; isStd: boolean }) {
  const stripes = p.stripes ?? [p.bg, p.bg + "CC", p.bg + "99", p.bg + "66"];
  const sw = W / stripes.length;
  const fmtDate = user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Samedi 18 octobre 2026";
  const i1 = (user.p1 || "S")[0].toUpperCase(); const i2 = (user.p2 || "T")[0].toUpperCase();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      {stripes.map((c, i) => <rect key={i} x={i * sw} y={0} width={sw} height={H} fill={c}/>)}
      <circle cx={W/2} cy={H*0.10} r={W*0.065} fill="none" stroke={p.textPrimary} strokeWidth="1" opacity="0.5"/>
      <text x={W/2} y={H*0.115} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W*0.05} fill={p.textPrimary} fontStyle="italic">{i1}{i2}</text>
      <text x={W/2} y={H*0.225} textAnchor="middle" fontFamily="var(--font-montserrat)" fontSize={W*0.028} fill={p.textPrimary} letterSpacing="4" style={{ textTransform:"uppercase" }} opacity="0.7">{isStd ? "Save the Date" : "Mariage"}</text>
      <text x={W/2} y={H*(isStd?0.385:0.375)} textAnchor="middle" fontFamily="var(--font-playfair)" fontSize={W*0.13} fontWeight="700" fill={p.textPrimary} style={{ textTransform:"uppercase" }}>{user.p1 || "SOPHIA"}</text>
      <text x={W/2} y={H*(isStd?0.48:0.46)} textAnchor="middle" fontFamily="var(--font-script)" fontSize={W*0.1} fill={p.accent}>and</text>
      <text x={W/2} y={H*(isStd?0.59:0.57)} textAnchor="middle" fontFamily="var(--font-playfair)" fontSize={W*0.13} fontWeight="700" fill={p.textPrimary} style={{ textTransform:"uppercase" }}>{user.p2 || "BENNETT"}</text>
      <line x1={W*0.35} y1={H*(isStd?0.65:0.63)} x2={W*0.65} y2={H*(isStd?0.65:0.63)} stroke={p.textPrimary} strokeWidth="0.8" opacity="0.35"/>
      <text x={W/2} y={H*(isStd?0.735:0.715)} textAnchor="middle" fontFamily="var(--font-montserrat)" fontSize={W*0.027} fill={p.textPrimary} letterSpacing="2.5" style={{ textTransform:"uppercase" }} opacity="0.65">sont heureux de vous inviter</text>
      <text x={W/2} y={H*(isStd?0.815:0.79)} textAnchor="middle" fontFamily="var(--font-montserrat)" fontSize={W*0.028} fill={p.textPrimary} letterSpacing="1.5" style={{ textTransform:"uppercase" }}>{fmtDate}</text>
      {user.location && <text x={W/2} y={H*(isStd?0.88:0.855)} textAnchor="middle" fontFamily="var(--font-montserrat)" fontSize={W*0.025} fill={p.textSecondary} letterSpacing="1">{user.location}</text>}
    </svg>
  );
}

function TemplateLettre({ W, H, paperImage, p, user, fontPreset = "romantique", label, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles, paperFit = "xMidYMid slice" }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  fontPreset?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
  paperFit?: string;
}) {
  const fp = FONT_PRESETS.find(f => f.id === fontPreset) ?? FONT_PRESETS[0];
  const displayLabel = label ?? "save the date";
  const displayFooter = footer ?? "invitation à suivre";
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Samedi 18 octobre 2026");
  const displayLocation = locationText ?? user.location;

  const getFont = (id: string, def: string) => elementStyles?.[id]?.font ?? def;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase = (id: string, val: string) => elementStyles?.[id]?.uppercase ? val.toUpperCase() : val;
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const hl = (y: number, h: number) => (
    <rect x={W * 0.08} y={y} width={W * 0.84} height={h}
      fill="rgba(109,29,62,0.06)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <rect width={W} height={H} fill={p.bg}/>
      <image href={paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio={paperFit}/>

      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.155, H * 0.085)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.22} textAnchor="middle"
            fontFamily={getFont("label", fp.scriptFont)}
            fontStyle={fp.scriptItalic ? "italic" : "normal"}
            fontSize={getSize("label", W * 0.062)}
            fill={getColor("label", p.textPrimary)}
            opacity="0.9">
            {getCase("label", displayLabel)}
          </text>
        )}
      </g>

      <line x1={W * 0.32} y1={H * 0.27} x2={W * 0.68} y2={H * 0.27} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>

      {/* Names */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.305, H * 0.090)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={H * 0.38} textAnchor="middle"
            fontFamily={getFont("names", fp.scriptFont)}
            fontStyle={fp.scriptItalic ? "italic" : "normal"}
            fontSize={getSize("names", W * 0.072)}
            fill={getColor("names", p.textPrimary)}>
            {getCase("names", displayNames)}
          </text>
        )}
      </g>

      <line x1={W * 0.32} y1={H * 0.43} x2={W * 0.68} y2={H * 0.43} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.465, H * 0.075)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.52} textAnchor="middle"
            fontFamily={getFont("date", fp.bodyFont)}
            fontSize={getSize("date", W * 0.030)}
            fill={getColor("date", p.textPrimary)}
            letterSpacing="2" fontWeight="500">
            {getCase("date", displayDate)}
          </text>
        )}
      </g>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * 0.528, H * 0.068)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.577} textAnchor="middle"
              fontFamily={getFont("location", fp.bodyFont)}
              fontSize={getSize("location", W * 0.027)}
              fill={getColor("location", p.textSecondary)}
              letterSpacing="1.5" fontStyle="italic">
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}

      {/* Footer */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        {selectedElement === "footer" && hl(H * 0.785, H * 0.068)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.835} textAnchor="middle"
            fontFamily={getFont("footer", fp.scriptFont)}
            fontStyle={fp.scriptItalic ? "italic" : "normal"}
            fontSize={getSize("footer", W * 0.042)}
            fill={getColor("footer", p.textSecondary)}
            opacity="0.75">
            {getCase("footer", displayFooter)}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplateElegant({ W, H, paperImage, p, user, label, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
}) {
  const displayLabel    = label ?? "save the date";
  const displayFooter   = footer ?? "invitation à suivre";
  const rawNames        = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const parts           = rawNames.split(/\s*[&]\s*/);
  const name1Raw        = (parts[0] ?? rawNames).trim();
  const name2Raw        = (parts[1] ?? "").trim();
  const displayDate     = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Samedi 18 octobre 2026");
  const displayLocation = locationText ?? user.location;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => elementStyles?.[id]?.uppercase ? val.toUpperCase() : val;
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;

  const hl = (y: number, h: number) => (
    <rect x={W * 0.06} y={y} width={W * 0.88} height={h}
      fill="rgba(109,29,62,0.05)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  const nameCase = (id: string, val: string) =>
    elementStyles?.[id]?.uppercase === false ? val : val.toUpperCase();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <image href={paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none"/>

      {/* Outer decorative dotted border */}
      <rect x={W * 0.052} y={H * 0.032} width={W * 0.896} height={H * 0.936}
        fill="none" stroke={p.accent} strokeWidth="0.9" strokeDasharray="2,3.5" opacity="0.7"/>
      {/* Inner border line */}
      <rect x={W * 0.068} y={H * 0.042} width={W * 0.864} height={H * 0.916}
        fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.35"/>

      {/* Label — "save the date" */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.368, H * 0.055)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.408} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? "var(--font-playfair)"}
            fontStyle="italic"
            fontSize={getSize("label", W * 0.046)}
            fill={getColor("label", "#909090")}>
            {getCase("label", displayLabel)}
          </text>
        )}
      </g>

      {/* Names — NAME1 / et / NAME2 */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.460, H * 0.205)}
        {selectedElement !== "names" && (
          <g>
            <text x={W / 2} y={H * 0.500} textAnchor="middle"
              fontFamily={elementStyles?.names?.font ?? "'Times New Roman', Georgia, serif"}
              fontWeight="400"
              fontSize={getSize("names", W * 0.080)}
              fill={getColor("names", p.accent)}
              letterSpacing="3">
              {nameCase("names", name1Raw)}
            </text>
            <text x={W / 2} y={H * 0.560} textAnchor="middle"
              fontFamily="var(--font-script)"
              fontStyle="italic"
              fontSize={W * 0.054}
              fill={getColor("names", p.textSecondary)}
              opacity="0.75">
              et
            </text>
            {name2Raw && (
              <text x={W / 2} y={H * 0.648} textAnchor="middle"
                fontFamily={elementStyles?.names?.font ?? "'Times New Roman', Georgia, serif"}
                fontWeight="400"
                fontSize={getSize("names", W * 0.080)}
                fill={getColor("names", p.accent)}
                letterSpacing="3">
                {nameCase("names", name2Raw)}
              </text>
            )}
          </g>
        )}
      </g>

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.710, H * 0.055)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.752} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-montserrat)"}
            fontSize={getSize("date", W * 0.026)}
            fill={getColor("date", p.textSecondary)}
            letterSpacing="3.5"
            style={{ textTransform: "uppercase" as const }}>
            {getCase("date", displayDate)}
          </text>
        )}
      </g>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * 0.798, H * 0.055)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.840} textAnchor="middle"
              fontFamily={elementStyles?.location?.font ?? "var(--font-serif)"}
              fontStyle="italic"
              fontSize={getSize("location", W * 0.030)}
              fill={getColor("location", p.textPrimary)}>
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}

      {/* Footer */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        {selectedElement === "footer" && hl(H * 0.890, H * 0.060)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.935} textAnchor="middle"
            fontFamily={elementStyles?.footer?.font ?? "var(--font-script)"}
            fontStyle="italic"
            fontSize={getSize("footer", W * 0.052)}
            fill={getColor("footer", p.textSecondary)}
            opacity="0.75">
            {getCase("footer", displayFooter)}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplateArbre({ W, H, paperImage, p, user, label, namesText, dateText, locationText,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
}) {
  const displayLabel    = label ?? "save the date";
  const displayNames    = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate     = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "18 octobre 2026");
  const displayLocation = locationText ?? user.location;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => elementStyles?.[id]?.uppercase ? val.toUpperCase() : val;
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const hl = (y: number, h: number) => (
    <rect x={W * 0.06} y={y} width={W * 0.88} height={h}
      fill="rgba(240,237,228,0.10)" stroke="rgba(240,237,228,0.45)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <image href={paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none"/>

      {/* SAVE THE DATE */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.242, H * 0.052)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.275} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"}
            fontSize={getSize("label", W * 0.028)}
            fill={getColor("label", p.textPrimary)}
            letterSpacing="5"
            style={{ textTransform: "uppercase" as const }}
            opacity="0.9">
            {getCase("label", displayLabel)}
          </text>
        )}
      </g>

      {/* Names — large script */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.308, H * 0.108)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={H * 0.390} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "var(--font-script)"}
            fontStyle="italic"
            fontSize={getSize("names", W * 0.112)}
            fill={getColor("names", p.textPrimary)}>
            {getCase("names", displayNames)}
          </text>
        )}
      </g>

      {/* "vont se marier" — hardcoded decorative */}
      <text x={W / 2} y={H * 0.497} textAnchor="middle"
        fontFamily="var(--font-montserrat)"
        fontSize={W * 0.024}
        fill={p.textSecondary}
        letterSpacing="4"
        style={{ textTransform: "uppercase" as const }}
        opacity="0.8">
        vont se marier le
      </text>

      {/* Date — large script */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.542, H * 0.102)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.620} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-script)"}
            fontStyle="italic"
            fontSize={getSize("date", W * 0.090)}
            fill={getColor("date", p.textPrimary)}>
            {getCase("date", displayDate)}
          </text>
        )}
      </g>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * 0.718, H * 0.050)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.752} textAnchor="middle"
              fontFamily={elementStyles?.location?.font ?? "var(--font-montserrat)"}
              fontSize={getSize("location", W * 0.025)}
              fill={getColor("location", p.textSecondary)}
              letterSpacing="4"
              style={{ textTransform: "uppercase" as const }}
              opacity="0.85">
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

function TemplateLettreBold({ W, H, paperImage, p, user, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
}) {
  const rawNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const parts = rawNames.split(/\s*[&]\s*/);
  const name1Raw = (parts[0] ?? rawNames).trim();
  const name2Raw = (parts[1] ?? "").trim();

  const displayDate = dateText || (user.date
    ? (() => {
        const d = new Date(user.date + "T12:00:00");
        return `${String(d.getDate()).padStart(2, "0")} | ${String(d.getMonth() + 1).padStart(2, "0")} | ${String(d.getFullYear()).slice(-2)}`;
      })()
    : "18 | 10 | 26");
  const displayLocation = locationText ?? user.location;
  const displayFooter = footer ?? "invitation à suivre";

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => elementStyles?.[id]?.uppercase ? val.toUpperCase() : val;
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const hl = (y: number, h: number) => (
    <rect x={W * 0.05} y={y} width={W * 0.90} height={h}
      fill="rgba(109,29,62,0.06)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <image href={paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"/>

      {/* SAVE */}
      <text x={W / 2} y={H * 0.150} textAnchor="middle"
        fontFamily="var(--font-playfair)" fontWeight="700"
        fontSize={W * 0.148} fill={p.textPrimary} letterSpacing="-0.5">
        SAVE
      </text>

      {/* the */}
      <text x={W / 2} y={H * 0.212} textAnchor="middle"
        fontFamily="var(--font-script)" fontStyle="italic"
        fontSize={W * 0.062} fill={p.textSecondary} opacity="0.85">
        the
      </text>

      {/* DATE */}
      <text x={W / 2} y={H * 0.310} textAnchor="middle"
        fontFamily="var(--font-playfair)" fontWeight="700"
        fontSize={W * 0.148} fill={p.textPrimary} letterSpacing="-0.5">
        DATE
      </text>

      {/* Date line */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.338, H * 0.058)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.378} textAnchor="middle"
            fontFamily="var(--font-serif)" fontWeight="500"
            fontSize={getSize("date", W * 0.050)} fill={getColor("date", p.textPrimary)}
            letterSpacing="3">
            {getCase("date", displayDate)}
          </text>
        )}
      </g>

      {/* "pour le mariage de" */}
      <text x={W / 2} y={H * 0.430} textAnchor="middle"
        fontFamily="var(--font-serif)" fontStyle="italic"
        fontSize={W * 0.026} fill={p.textSecondary} opacity="0.7">
        pour le mariage de
      </text>

      <line x1={W * 0.30} y1={H * 0.452} x2={W * 0.70} y2={H * 0.452} stroke={p.accent} strokeWidth="0.6" opacity="0.35"/>

      {/* Names block */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.468, H * 0.252)}
        {selectedElement !== "names" && (
          <g>
            <text x={W / 2} y={H * 0.530} textAnchor="middle"
              fontFamily="var(--font-playfair)" fontWeight="700"
              fontSize={getSize("names", W * 0.088)} fill={getColor("names", p.textPrimary)}
              letterSpacing="2">
              {elementStyles?.["names"]?.uppercase === false ? name1Raw : name1Raw.toUpperCase()}
            </text>
            <text x={W / 2} y={H * 0.592} textAnchor="middle"
              fontFamily="var(--font-serif)" fontStyle="italic"
              fontSize={W * 0.026} fill={p.textSecondary} opacity="0.65">
              et
            </text>
            {name2Raw && (
              <text x={W / 2} y={H * 0.660} textAnchor="middle"
                fontFamily="var(--font-playfair)" fontWeight="700"
                fontSize={getSize("names", W * 0.088)} fill={getColor("names", p.textPrimary)}
                letterSpacing="2">
                {elementStyles?.["names"]?.uppercase === false ? name2Raw : name2Raw.toUpperCase()}
              </text>
            )}
          </g>
        )}
      </g>

      <line x1={W * 0.30} y1={H * 0.700} x2={W * 0.70} y2={H * 0.700} stroke={p.accent} strokeWidth="0.6" opacity="0.35"/>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * 0.725, H * 0.052)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.762} textAnchor="middle"
              fontFamily="var(--font-montserrat)"
              fontSize={getSize("location", W * 0.025)} fill={getColor("location", p.textPrimary)}
              letterSpacing="3.5" style={{ textTransform: "uppercase" as const }}>
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}

      {/* Footer */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        {selectedElement === "footer" && hl(H * 0.795, H * 0.052)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.832} textAnchor="middle"
            fontFamily="var(--font-serif)" fontStyle="italic"
            fontSize={getSize("footer", W * 0.024)} fill={getColor("footer", p.textSecondary)}
            opacity="0.65">
            {getCase("footer", displayFooter)}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplateLettrPhoto({ W, H, paperImage, p, user, label, namesText, dateText,
  photoUrl, selectedElement, onElementClick, onPhotoClick, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string;
  photoUrl?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  onPhotoClick?: () => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
}) {
  const displayLabel = label ?? "save the date";
  const displayDate = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "18 octobre 2026");
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;

  const fX = W * 0.225; const fY = H * 0.145;
  const fW = W * 0.550; const fH = H * 0.620;
  const pX = fX + W * 0.016; const pY = fY + H * 0.013;
  const pW = fW - W * 0.032; const pH = fH - H * 0.050;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => elementStyles?.[id]?.uppercase ? val.toUpperCase() : val;
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const hl = (y: number, h: number) => (
    <rect x={W * 0.06} y={y} width={W * 0.88} height={h}
      fill="rgba(109,29,62,0.06)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <image href={paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"/>

      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.090, H * 0.058)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.122} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? "var(--font-script)"}
            fontStyle="italic"
            fontSize={getSize("label", W * 0.042)}
            fill={getColor("label", p.textPrimary)}
            opacity="0.85">
            {getCase("label", displayLabel)}
          </text>
        )}
      </g>

      {/* Photo — no border */}
      {photoUrl ? (
        <g onClick={onPhotoClick ? e => { e.stopPropagation(); onPhotoClick(); } : undefined}
          style={{ cursor: onPhotoClick ? "pointer" : "default" }}>
          <image href={photoUrl} x={fX} y={fY} width={fW} height={fH} preserveAspectRatio="xMidYMid slice"/>
        </g>
      ) : (
        <g onClick={onPhotoClick ? e => { e.stopPropagation(); onPhotoClick(); } : undefined}
          style={{ cursor: onPhotoClick ? "pointer" : "default" }}>
          <rect x={fX} y={fY} width={fW} height={fH} fill={p.textPrimary} opacity="0.05"/>
          <rect x={fX} y={fY} width={fW} height={fH} fill="none" stroke={p.textSecondary} strokeWidth="0.8" strokeDasharray="4,3" opacity="0.22"/>
          <text x={W / 2} y={fY + fH * 0.48} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W * 0.028} fill={p.textSecondary} opacity="0.38" fontStyle="italic">
            {onPhotoClick ? "cliquez pour ajouter" : "votre photo"}
          </text>
          <text x={W / 2} y={fY + fH * 0.57} textAnchor="middle" fontSize={W * 0.052} fill={p.textSecondary} opacity="0.14">📷</text>
        </g>
      )}

      {/* Names */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(fY + fH + H * 0.008, H * 0.044)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={fY + fH + H * 0.030} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "var(--font-montserrat)"}
            fontSize={getSize("names", W * 0.026)}
            fill={getColor("names", p.textPrimary)}
            letterSpacing="3"
            style={{ textTransform: "uppercase" as const }}>
            {getCase("names", displayNames)}
          </text>
        )}
      </g>

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(fY + fH + H * 0.048, H * 0.050)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={fY + fH + H * 0.082} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-script)"}
            fontStyle="italic"
            fontSize={getSize("date", W * 0.040)}
            fill={getColor("date", p.textPrimary)}
            opacity="0.82">
            {getCase("date", displayDate)}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplateRender({ id, W, H, palette, user, isStd, photoUrl, fontPreset, label, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, onPhotoClick, elementStyles, customPaperBg }: {
  id: string; W: number; H: number; palette: Palette; user: UserData; isStd: boolean;
  photoUrl?: string; fontPreset?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  onPhotoClick?: () => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
  customPaperBg?: string;
}) {
  if (id === "dentelle") return <TemplateDentelle W={W} H={H} p={palette} user={user} photoUrl={photoUrl}
    fontPreset={fontPreset} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
    selectedElement={selectedElement} onElementClick={onElementClick} onPhotoClick={onPhotoClick} elementStyles={elementStyles}
    customPaperBg={customPaperBg}/>;
  if (id === "oliviers") return <TemplateOliviers W={W} H={H} p={palette} user={user} isStd={isStd}/>;
  if (id === "rayures")  return <TemplateRayures  W={W} H={H} p={palette} user={user} isStd={isStd}/>;
  const tplCfg = TEMPLATES.find(t => t.id === id);
  if (tplCfg?.paperImage) {
    if (tplCfg.layoutVariant === "elegant")
      return <TemplateElegant W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
        selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}/>;
    if (tplCfg.layoutVariant === "arbres")
      return <TemplateArbre W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        label={label} namesText={namesText} dateText={dateText} locationText={locationText}
        selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}/>;
    if (tplCfg.layoutVariant === "bold")
      return <TemplateLettreBold W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
        selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}/>;
    if (tplCfg.layoutVariant === "photo")
      return <TemplateLettrPhoto W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        label={label} namesText={namesText} dateText={dateText}
        photoUrl={photoUrl} selectedElement={selectedElement} onElementClick={onElementClick}
        onPhotoClick={onPhotoClick} elementStyles={elementStyles}/>;
    return <TemplateLettre W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
      fontPreset={fontPreset} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
      selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}
      paperFit={tplCfg.paperFit}/>;
  }
  return null;
}

/* ═══════════════════════════════════════════════
   ENVELOPE ANIMATION MODAL
═══════════════════════════════════════════════ */

function EnvelopeModal({ tpl, paletteId, user, isStd, envCfg, fontPreset, label, namesText, dateText, locationText, footer, photoUrl, elementStyles, customPaperBg, onClose }: {
  tpl: TemplateConfig; paletteId: string; user: UserData; isStd: boolean;
  envCfg: EnvelopeConfig; fontPreset?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string; photoUrl?: string;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }>;
  customPaperBg?: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);   // flap starts opening
    const t2 = setTimeout(() => setPhase(2), 2000);  // card starts rising
    const t3 = setTimeout(() => setPhase(3), 3900);  // final card display
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const envW     = 360;
  const openH    = Math.round(envW * ENV_OPEN_H   / ENV_OPEN_W);   // ≈ 475
  const closedH  = Math.round(envW * ENV_CLOSED_H / ENV_CLOSED_W); // ≈ 263
  const openingY = Math.round(openH * 0.455);                      // ≈ 216 — fold line
  const cardW    = Math.round(envW * 0.72);                        // ≈ 259
  const cardH    = Math.round(cardW * 1.4);                        // ≈ 363
  const envTop   = cardH - openingY;                               // ≈ 147
  const containerH = envTop + openH;                               // ≈ 622

  const texture = ENVELOPE_TEXTURES.find(t => t.id === (envCfg?.textureId ?? "naturel")) ?? ENVELOPE_TEXTURES[0];
  const imgFilter = texture.filter || undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: "rgba(8,6,14,0.92)" }}
      onClick={phase < 3 ? undefined : onClose}
    >
      <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}>
        <X size={18}/>
      </button>

      {phase < 3 ? (
        <div style={{ position: "relative", width: envW, height: containerH }}>

          {/* Card — rises slowly out of envelope */}
          <div style={{
            position: "absolute", top: 0, left: "50%",
            width: cardW, height: cardH,
            transform: `translateX(-50%) translateY(${phase >= 2 ? 0 : cardH}px)`,
            opacity: phase >= 2 ? 1 : 0,
            transition: phase >= 2
              ? "transform 1.8s cubic-bezier(0.22, 0.8, 0.35, 1), opacity 0.8s ease"
              : "none",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            overflow: "hidden", zIndex: 4,
          }}>
            <TemplateRender id={tpl.id} W={cardW} H={cardH} palette={palette} user={user} isStd={isStd}
              fontPreset={fontPreset} label={label} namesText={namesText}
              dateText={dateText} locationText={locationText} footer={footer}
              photoUrl={photoUrl} elementStyles={elementStyles} customPaperBg={customPaperBg}/>
          </div>

          {/* Envelope area */}
          <div style={{ position: "absolute", top: envTop, left: 0, zIndex: 2 }}>

            {/* Open SVG — always underneath, revealed as closed fades */}
            <img src="/enveloppe/ouverte.svg" width={envW} height={openH}
              style={{ display: "block", filter: imgFilter }} alt=""/>

            {/* Closed SVG — fades out once flap starts opening */}
            <img src="/enveloppe/fermee.svg" width={envW} height={closedH}
              style={{
                display: "block", position: "absolute", top: 0, left: 0,
                filter: imgFilter,
                opacity: phase >= 1 ? 0 : 1,
                transition: "opacity 0.8s ease 0.3s",
                pointerEvents: "none",
              }} alt=""/>

            {/* 3D flap — top openingY px of the open SVG, rotates from flat to upright */}
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: envW, height: openingY,
              transformOrigin: "center bottom",
              transform: phase >= 1
                ? "perspective(1000px) rotateX(0deg)"
                : "perspective(1000px) rotateX(-175deg)",
              transition: phase >= 1
                ? "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s"
                : "none",
              overflow: "hidden",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
              zIndex: 3,
            }}>
              <img src="/enveloppe/ouverte.svg" width={envW} height={openH}
                style={{ display: "block", position: "absolute", top: 0, left: 0, filter: imgFilter }} alt=""/>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6" style={{ animation: "invitation-appear 0.45s ease forwards" }}>
          <div style={{ width: cardW, height: cardH, boxShadow: "0 24px 80px rgba(0,0,0,0.55)", overflow: "hidden" }}>
            <TemplateRender id={tpl.id} W={cardW} H={cardH} palette={palette} user={user} isStd={isStd}
              fontPreset={fontPreset} label={label} namesText={namesText}
              dateText={dateText} locationText={locationText} footer={footer}
              photoUrl={photoUrl} elementStyles={elementStyles} customPaperBg={customPaperBg}/>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", fontFamily: "var(--font-display)" }}>Retour</button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold" style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}>
              <Sparkles size={14}/> Personnaliser
            </button>
          </div>
        </div>
      )}

      {phase < 3 && (
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          {phase === 0 && "Votre invitation arrive…"}
          {phase === 1 && "L'enveloppe s'ouvre…"}
          {phase === 2 && "Votre invitation apparaît…"}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CARD CUSTOMIZER PANEL
═══════════════════════════════════════════════ */

function CardCustomizerPanel({ tpl, paletteId, onPaletteChange, cardCustom, onCardCustomChange }: {
  tpl: TemplateConfig;
  paletteId: string;
  onPaletteChange: (id: string) => void;
  cardCustom: CardCustomization;
  onCardCustomChange: (next: CardCustomization) => void;
}) {
  const customColorRef = useRef<HTMLInputElement>(null);
  const sec: React.CSSProperties = {
    fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const,
    color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)", marginBottom: 10,
  };

  const isCustomActive = !!cardCustom.customPaperBg;
  const activeLabel = isCustomActive ? "Personnalisé" : tpl.palettes.find(p => p.id === paletteId)?.label;

  return (
    <div className="flex flex-col gap-6">

      {/* Couleur du papier */}
      <div>
        <p style={sec}>Couleur du papier</p>
        <div className="flex gap-2.5 flex-wrap">
          {tpl.palettes.map(p => {
            const active = !isCustomActive && paletteId === p.id;
            return (
              <button key={p.id} onClick={() => { onPaletteChange(p.id); onCardCustomChange({ ...cardCustom, customPaperBg: undefined }); }} title={p.label}
                style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: p.bg,
                  border: `1.5px solid rgba(0,0,0,0.08)`,
                  boxShadow: active ? `0 0 0 2.5px white, 0 0 0 4.5px #6D1D3E` : "0 1px 4px rgba(0,0,0,0.14)",
                  transform: active ? "scale(1.15)" : "scale(1)",
                  transition: "all 130ms",
                  padding: 0,
                }}
              />
            );
          })}
          {/* Custom color swatch */}
          <button
            onClick={() => customColorRef.current?.click()}
            title="Couleur personnalisée"
            style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: isCustomActive ? cardCustom.customPaperBg : "repeating-linear-gradient(45deg, #F5C0D0 0px, #F5C0D0 5px, #B8D4F0 5px, #B8D4F0 10px, #B8DEC8 10px, #B8DEC8 15px, #F0E8C0 15px, #F0E8C0 20px)",
              border: `1.5px solid rgba(0,0,0,0.08)`,
              boxShadow: isCustomActive ? `0 0 0 2.5px white, 0 0 0 4.5px #6D1D3E` : "0 1px 4px rgba(0,0,0,0.14)",
              transform: isCustomActive ? "scale(1.15)" : "scale(1)",
              transition: "all 130ms",
              padding: 0,
              cursor: "pointer",
            }}
          />
          <input ref={customColorRef} type="color"
            value={cardCustom.customPaperBg ?? "#F5F3F0"}
            onChange={e => onCardCustomChange({ ...cardCustom, customPaperBg: e.target.value })}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0 }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "rgba(44,44,44,0.38)", fontFamily: "var(--font-display)" }}>
          {activeLabel}
        </p>
      </div>


    </div>
  );
}

/* ═══════════════════════════════════════════════
   ELEMENT STYLE PANEL
═══════════════════════════════════════════════ */

function ElementStylePanel({ elementId, cardCustom, onCardCustomChange, palette, onClose }: {
  elementId: string;
  cardCustom: CardCustomization;
  onCardCustomChange: (next: CardCustomization) => void;
  palette: Palette;
  onClose: () => void;
}) {
  const style = cardCustom.styles[elementId] ?? {};

  const sec: React.CSSProperties = {
    fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const,
    color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)",
  };
  const sub: React.CSSProperties = {
    fontSize: "0.65rem", color: "rgba(44,44,44,0.42)", fontFamily: "var(--font-display)",
    fontWeight: 500, marginBottom: 6, display: "block",
  };
  function updateStyle(updates: { font?: string; color?: string; size?: number; uppercase?: boolean; dx?: number; dy?: number; hidden?: boolean }) {
    onCardCustomChange({
      ...cardCustom,
      styles: { ...cardCustom.styles, [elementId]: { ...style, ...updates } },
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p style={sec}>{ELEMENT_LABELS[elementId] ?? elementId}</p>
        <button onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ backgroundColor: "rgba(44,44,44,0.08)", color: "rgba(44,44,44,0.5)" }}>
          ✕
        </button>
      </div>

      {/* Font picker */}
      <div>
        <span style={sub}>Police</span>
        <div className="flex flex-col gap-1.5" style={{ maxHeight: 230, overflowY: "auto" }}>
          {FONT_LIST.map(f => {
            const active = style.font === f.cssVar;
            return (
              <button key={f.id}
                onClick={() => updateStyle({ font: f.cssVar })}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  backgroundColor: active ? "rgba(109,29,62,0.08)" : "rgba(255,255,255,0.7)",
                  border: `1.5px solid ${active ? "rgba(109,29,62,0.25)" : "transparent"}`,
                }}>
                <span style={{ fontFamily: f.cssVar, fontSize: "1.1rem", color: active ? "#6D1D3E" : "#2c2c2c", lineHeight: 1.4, flex: 1 }}>
                  {f.label}
                </span>
                {active && <span style={{ fontSize: "0.6rem", color: "#6D1D3E" }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <span style={sub}>Taille</span>
          <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-display)", color: "#6D1D3E", fontWeight: 600 }}>
            {Math.round((style.size ?? 1) * 100)}%
          </span>
        </div>
        <input
          type="range" min="0.5" max="2.2" step="0.05"
          value={style.size ?? 1}
          onChange={e => updateStyle({ size: parseFloat(e.target.value) })}
          style={{ width: "100%", accentColor: "#6D1D3E", cursor: "pointer" }}
        />
        <div className="flex justify-between" style={{ marginTop: 4 }}>
          {[0.7, 1.0, 1.3, 1.6, 2.0].map(v => (
            <button key={v} onClick={() => updateStyle({ size: v })}
              style={{
                fontSize: "0.6rem", fontFamily: "var(--font-display)",
                color: Math.abs((style.size ?? 1) - v) < 0.03 ? "#6D1D3E" : "rgba(44,44,44,0.35)",
                fontWeight: Math.abs((style.size ?? 1) - v) < 0.03 ? 700 : 400,
              }}>
              {Math.round(v * 100)}%
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <span style={sub}>Couleur du texte</span>
        <div className="flex gap-2.5 flex-wrap items-center">
          {TEXT_COLORS.map(c => (
            <button key={c.hex} onClick={() => updateStyle({ color: c.hex })} title={c.label}
              style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                backgroundColor: c.hex,
                border: `1.5px solid rgba(0,0,0,${c.hex === "#F5F5F5" ? 0.15 : 0.04})`,
                boxShadow: style.color === c.hex ? "0 0 0 2px white, 0 0 0 3.5px #6D1D3E" : "0 1px 3px rgba(0,0,0,0.18)",
                transform: style.color === c.hex ? "scale(1.2)" : "scale(1)",
                transition: "all 120ms",
              }}
            />
          ))}
          {/* Custom color wheel */}
          <label style={{ position: "relative", width: 24, height: 24, cursor: "pointer", flexShrink: 0 }}>
            <input type="color"
              value={style.color ?? palette.textPrimary}
              onChange={e => updateStyle({ color: e.target.value })}
              style={{ opacity: 0, position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "pointer" }}
            />
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}/>
          </label>
        </div>
      </div>

      {/* Capitalization */}
      <div>
        <span style={sub}>Casse</span>
        <div className="flex gap-2">
          {([false, true] as const).map(isUpper => (
            <button key={String(isUpper)}
              onClick={() => updateStyle({ uppercase: isUpper })}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.88rem",
                textTransform: isUpper ? "uppercase" : "none",
                backgroundColor: (style.uppercase ?? false) === isUpper ? "rgba(109,29,62,0.08)" : "rgba(255,255,255,0.7)",
                border: `1.5px solid ${(style.uppercase ?? false) === isUpper ? "rgba(109,29,62,0.25)" : "transparent"}`,
                color: (style.uppercase ?? false) === isUpper ? "#6D1D3E" : "#2c2c2c",
              }}>
              {isUpper ? "AA" : "Aa"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DETAIL VIEW
═══════════════════════════════════════════════ */

function DetailView({ tpl, paletteId, onPaletteChange, isStd, user, onUserChange, envCfg, onEnvelopeChange, cardCustom, onCardCustomChange, onAnimate, onBack }: {
  tpl: TemplateConfig; paletteId: string; onPaletteChange: (id: string) => void;
  isStd: boolean; user: UserData; onUserChange: (next: UserData) => void;
  envCfg: EnvelopeConfig; onEnvelopeChange: (next: EnvelopeConfig) => void;
  cardCustom: CardCustomization; onCardCustomChange: (next: CardCustomization) => void;
  onAnimate: () => void; onBack: () => void;
}) {
  const [tab, setTab] = useState<"card" | "envelope">("card");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];
  const cardW = 360;
  const cardH = Math.round(cardW * 1.4); // 504
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handleDelete() {
    if (!selectedElement) return;
    onCardCustomChange({
      ...cardCustom,
      styles: {
        ...cardCustom.styles,
        [selectedElement]: { ...(cardCustom.styles[selectedElement] ?? {}), hidden: true },
      },
    });
    setSelectedElement(null);
  }

  function handleMoveStart(e: React.PointerEvent) {
    if (!selectedElement) return;
    e.preventDefault();
    e.stopPropagation();
    const capturedCustom = cardCustom;
    const capturedEl = selectedElement;
    const elStyle = capturedCustom.styles[capturedEl] ?? {};
    const startDX = elStyle.dx ?? 0;
    const startDY = elStyle.dy ?? 0;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    setDragging(true);
    function onMove(ev: PointerEvent) {
      const dx = (ev.clientX - startMouseX) / cardW;
      const dy = (ev.clientY - startMouseY) / cardH;
      onCardCustomChange({
        ...capturedCustom,
        styles: {
          ...capturedCustom.styles,
          [capturedEl]: { ...(capturedCustom.styles[capturedEl] ?? {}), dx: startDX + dx, dy: startDY + dy },
        },
      });
    }
    function onUp() {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handlePhotoFile(file: File) {
    const reader = new FileReader();
    reader.onload = e => onCardCustomChange({ ...cardCustom, photoUrl: e.target?.result as string ?? "" });
    reader.readAsDataURL(file);
  }

  const tabBtn = (id: "card" | "envelope", lbl: string) => (
    <button
      onClick={() => { setTab(id); setSelectedElement(null); }}
      className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
      style={{
        fontFamily: "var(--font-display)",
        backgroundColor: tab === id ? "#6D1D3E" : "rgba(255,255,255,0.8)",
        color: tab === id ? "white" : "rgba(44,44,44,0.55)",
        boxShadow: tab === id ? "0 2px 10px rgba(109,29,62,0.22)" : "none",
        border: `1.5px solid ${tab === id ? "transparent" : "rgba(44,44,44,0.08)"}`,
      }}
    >
      {lbl}
    </button>
  );

  return (
    <div>
      {/* Hidden photo file input */}
      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ""; }}/>

      {/* Tab bar */}
      <div className="px-8 py-4 flex gap-2 border-b border-[#f0e6e2]">
        {tabBtn("card", "Personnaliser la carte")}
        {tabBtn("envelope", "Personnaliser l'enveloppe")}
      </div>

      {/* Content */}
      <div className="mx-auto px-8 py-10 flex flex-col md:flex-row gap-10 items-start" style={{ maxWidth: 860 }}>

        {/* Left: card preview */}
        <div className="flex-shrink-0 flex flex-col items-center">
          {tab === "envelope" ? (() => {
            // Natural open envelope height
            const envOpenH = Math.round(cardW * ENV_OPEN_H / ENV_OPEN_W);

            // Portrait card rendered then rotated -90° → landscape inside envelope
            // After rotation: visual width = insideH, visual height = insideW
            // Set insideH = cardW so the card exactly fills the envelope width
            const insideH = cardW; // 360 — visual width after rotation
            const insideW = Math.round(cardW / 1.4); // ≈ 257 — visual height after rotation

            // Position card inside body, bottom-aligned (12px above bottom of envelope)
            // After rotation: visual center Y = divTop + insideH/2
            const cardBottomMargin = 12;
            const cardCenterY = envOpenH - cardBottomMargin - Math.round(insideW / 2);
            const cardDivTop  = cardCenterY - Math.round(insideH / 2);
            const cardDivLeft = Math.round((cardW - insideW) / 2);

            return (
              <div style={{ position: "relative", width: cardW, height: envOpenH }}>
                {/* Card landscape (rotated portrait) behind the envelope */}
                <div style={{
                  position: "absolute",
                  top: cardDivTop, left: cardDivLeft,
                  width: insideW, height: insideH,
                  transform: "rotate(-90deg)",
                  transformOrigin: "center center",
                  overflow: "hidden",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.22)",
                  zIndex: 1,
                }}>
                  <TemplateRender id={tpl.id} W={insideW} H={insideH} palette={palette} user={user} isStd={isStd}
                    photoUrl={cardCustom.photoUrl || undefined}
                    fontPreset={cardCustom.fontPreset} label={cardCustom.label}
                    namesText={cardCustom.namesText} dateText={cardCustom.dateText}
                    locationText={cardCustom.locationText} footer={cardCustom.footer}
                    elementStyles={cardCustom.styles} customPaperBg={cardCustom.customPaperBg}/>
                </div>
                {/* Envelope on top — transparent center reveals the card */}
                <div style={{ position: "absolute", top: 0, left: 0, zIndex: 2,
                  filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))" }}>
                  <EnvelopeBody W={cardW} cfg={envCfg}/>
                </div>
              </div>
            );
          })() : (
            /* Outer relative wrapper so inline input overlay isn't clipped */
            <div style={{ position: "relative", width: cardW, height: cardH }}>
              {/* SVG card */}
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", boxShadow: "0 12px 44px rgba(109,29,62,0.15)" }}>
                <TemplateRender id={tpl.id} W={cardW} H={cardH} palette={palette} user={user} isStd={isStd}
                  photoUrl={cardCustom.photoUrl || undefined}
                  fontPreset={cardCustom.fontPreset} label={cardCustom.label}
                  namesText={cardCustom.namesText} dateText={cardCustom.dateText} locationText={cardCustom.locationText}
                  footer={cardCustom.footer}
                  selectedElement={selectedElement} onElementClick={setSelectedElement}
                  onPhotoClick={() => photoInputRef.current?.click()}
                  elementStyles={cardCustom.styles} customPaperBg={cardCustom.customPaperBg}/>
              </div>
              {/* Inline text input overlay */}
              {selectedElement && (() => {
                const fp = FONT_PRESETS.find(f => f.id === cardCustom.fontPreset) ?? FONT_PRESETS[0];
                const photoY = cardH * 0.30;
                const photoH_ = cardH * 0.37;
                type ElemCfg = { y: number; fs: number; fontType: "script" | "body"; opacity: number };
                const isLettrePhoto   = !!tpl.paperImage && tpl.layoutVariant === "photo";
                const isLettreArbres  = !!tpl.paperImage && tpl.layoutVariant === "arbres";
                const isLettreBold    = !!tpl.paperImage && tpl.layoutVariant === "bold";
                const isLettreElegant = !!tpl.paperImage && tpl.layoutVariant === "elegant";
                const isLettre = !!tpl.paperImage;
                const fY_photo = cardH * 0.145; const fH_photo = cardH * 0.620;
                const elems: Record<string, ElemCfg> = isLettreElegant ? {
                  label:    { y: cardH * 0.408, fs: cardW * 0.046, fontType: "body",   opacity: 1 },
                  names:    { y: cardH * 0.560, fs: cardW * 0.054, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.752, fs: cardW * 0.026, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.840, fs: cardW * 0.030, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.935, fs: cardW * 0.052, fontType: "script", opacity: 0.75 },
                } : isLettreArbres ? {
                  label:    { y: cardH * 0.275, fs: cardW * 0.028, fontType: "body",   opacity: 0.9 },
                  names:    { y: cardH * 0.390, fs: cardW * 0.112, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.620, fs: cardW * 0.090, fontType: "script", opacity: 1 },
                  location: { y: cardH * 0.752, fs: cardW * 0.025, fontType: "body",   opacity: 0.85 },
                } : isLettrePhoto ? {
                  label:    { y: cardH * 0.122,                       fs: cardW * 0.042, fontType: "script", opacity: 0.85 },
                  names:    { y: fY_photo + fH_photo + cardH * 0.030, fs: cardW * 0.026, fontType: "body",   opacity: 1 },
                  date:     { y: fY_photo + fH_photo + cardH * 0.082, fs: cardW * 0.040, fontType: "script", opacity: 0.82 },
                } : isLettreBold ? {
                  names:    { y: cardH * 0.592, fs: cardW * 0.088, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.378, fs: cardW * 0.050, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.762, fs: cardW * 0.025, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.832, fs: cardW * 0.024, fontType: "script", opacity: 0.65 },
                } : isLettre ? {
                  label:    { y: cardH * 0.22,  fs: cardW * 0.062, fontType: "script", opacity: 0.9 },
                  names:    { y: cardH * 0.38,  fs: cardW * 0.072, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.52,  fs: cardW * 0.030, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.577, fs: cardW * 0.027, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.835, fs: cardW * 0.042, fontType: "script", opacity: 0.75 },
                } : {
                  label:    { y: cardH * 0.13,                        fs: cardW * 0.056, fontType: "script", opacity: 0.88 },
                  names:    { y: cardH * 0.23,                        fs: cardW * 0.038, fontType: "body",   opacity: 1 },
                  date:     { y: photoY + photoH_ + cardH * 0.095,    fs: cardW * 0.031, fontType: "body",   opacity: 1 },
                  location: { y: photoY + photoH_ + cardH * 0.145,    fs: cardW * 0.028, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.92,                        fs: cardW * 0.048, fontType: "script", opacity: 0.55 },
                };
                const cfg = elems[selectedElement];
                if (!cfg) return null;
                const isScript = cfg.fontType === "script";
                const elStyle = cardCustom.styles[selectedElement] ?? {};
                const elementFont = elStyle.font ?? (isScript ? fp.scriptFont : fp.bodyFont);
                const elementColor = elStyle.color ?? palette.textPrimary;
                const fontStyle = isScript && fp.scriptItalic ? "italic" : "normal";
                const fs = cfg.fs * (elStyle.size ?? 1);
                const dyOffset = (elStyle.dy ?? 0) * cardH;
                const fmtDateFallback = user.date
                  ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                  : "Samedi 18 octobre 2026";
                const textMap: Record<string, string> = {
                  label:    cardCustom.label    || "save the date",
                  names:    cardCustom.namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`,
                  date:     cardCustom.dateText  || fmtDateFallback,
                  location: cardCustom.locationText,
                  footer:   cardCustom.footer,
                };
                const currentText = textMap[selectedElement] ?? "";
                function handleInlineChange(value: string) {
                  const next = { ...cardCustom };
                  if (selectedElement === "label") next.label = value;
                  else if (selectedElement === "names") next.namesText = value;
                  else if (selectedElement === "date") next.dateText = value;
                  else if (selectedElement === "location") next.locationText = value;
                  else if (selectedElement === "footer") next.footer = value;
                  onCardCustomChange(next);
                }
                const inputTop = cfg.y + dyOffset - fs * 0.88;
                return (
                  <>
                    {/* Toolbar: move + trash */}
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: Math.max(4, inputTop - 34),
                        right: 6,
                        display: "flex",
                        gap: 4,
                        zIndex: 10,
                      }}
                    >
                      <button
                        onPointerDown={handleMoveStart}
                        title="Déplacer"
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          backgroundColor: "rgba(255,255,255,0.92)",
                          border: "1px solid rgba(109,29,62,0.22)",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: dragging ? "grabbing" : "grab",
                          color: "#6D1D3E",
                          flexShrink: 0,
                        }}
                      >
                        <Move size={14}/>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(); }}
                        title="Supprimer"
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          backgroundColor: "rgba(255,255,255,0.92)",
                          border: "1px solid rgba(200,40,40,0.22)",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.14)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          color: "#C82828",
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                    <input
                      key={selectedElement}
                      autoFocus
                      autoComplete="off"
                      value={currentText}
                      onChange={e => handleInlineChange(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: inputTop,
                        width: "100%",
                        height: fs * 1.75,
                        background: "transparent",
                        WebkitBoxShadow: "0 0 0px 1000px transparent inset",
                        border: "none",
                        outline: "none",
                        textAlign: "center",
                        fontFamily: elementFont,
                        fontStyle,
                        fontSize: fs,
                        color: elementColor,
                        WebkitTextFillColor: elementColor,
                        opacity: cfg.opacity,
                        padding: 0,
                        lineHeight: 1,
                        boxSizing: "border-box",
                        caretColor: elementColor,
                      }}
                    />
                  </>
                );
              })()}
            </div>
          )}
          {tab === "card" && !selectedElement && (
            <p className="mt-3 text-xs text-center" style={{ color: "rgba(44,44,44,0.32)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              Cliquez sur un texte pour le modifier
            </p>
          )}
        </div>

        {/* Right: options panel */}
        <div className="flex flex-col gap-5" style={{ minWidth: 260, maxWidth: 280, flex: 1 }}>
          {tab === "card" ? (
            selectedElement ? (
              <ElementStylePanel
                elementId={selectedElement}
                cardCustom={cardCustom}
                onCardCustomChange={onCardCustomChange}
                palette={palette}
                onClose={() => setSelectedElement(null)}
              />
            ) : (
              <CardCustomizerPanel
                tpl={tpl}
                paletteId={paletteId}
                onPaletteChange={onPaletteChange}
                cardCustom={cardCustom}
                onCardCustomChange={onCardCustomChange}
              />
            )
          ) : (
            <EnvelopeCustomizerPanel cfg={envCfg} onChange={onEnvelopeChange}/>
          )}

          <div className="border-t border-[#f0e6e2] pt-1 flex flex-col gap-3">
            <button onClick={onAnimate}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-colors"
              style={{ backgroundColor: "rgba(109,29,62,0.08)", color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
              <Play size={14} fill="currentColor"/> Voir l'animation
            </button>
            <button
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
              style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}>
              <Sparkles size={14}/> Envoyer
            </button>
          </div>

          <div className="border-t border-[#f0e6e2] pt-3 flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>
              <ArrowLeft size={14}/> Tous les modèles
            </button>
            <button
              onClick={() => onCardCustomChange({
                ...cardCustom,
                fontPreset: "romantique",
                label: "save the date",
                footer: "invitation à suivre",
                styles: {},
                customPaperBg: undefined,
              })}
              className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
              style={{ color: "rgba(44,44,44,0.38)", fontFamily: "var(--font-display)" }}
              title="Revenir au design initial">
              <RotateCcw size={12}/> Design initial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GALLERY CARD
═══════════════════════════════════════════════ */

function GalleryCard({ tpl, paletteId, user, isStd, onClick }: {
  tpl: TemplateConfig; paletteId: string; user: UserData; isStd: boolean; onClick: () => void;
}) {
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];
  // Portrait format: 5:7 ratio
  const fullW = 400; const fullH = 560;
  const thumbH = 210;
  const scale = thumbH / fullH; // 0.375
  const scaledW = Math.round(fullW * scale); // 150px

  return (
    <div
      className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{ backgroundColor: "#fff", boxShadow: "0 4px 20px rgba(109,29,62,0.1)" }}
      onClick={onClick}
    >
      <div className="relative" style={{ height: thumbH + 10, overflow: "hidden", backgroundColor: "#F8F5F2" }}>
        {/* Envelope behind — offset right+down */}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(calc(-50% + 10px))", width: scaledW, height: thumbH, backgroundColor: "#FFFFFF", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 1 }}/>
        {/* Card centered */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: scaledW, height: thumbH, overflow: "hidden", zIndex: 2, boxShadow: "2px 3px 12px rgba(0,0,0,0.14)" }}>
          <div style={{ width: fullW, height: fullH, transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none" }}>
            <TemplateRender id={tpl.id} W={fullW} H={fullH} palette={palette} user={user} isStd={isStd}/>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(0,0,0,0.32)", zIndex: 3 }}>
          <span className="px-4 py-2 rounded-full text-xs font-bold" style={{ backgroundColor: "white", color: "#6D1D3E", fontFamily: "var(--font-display)" }}>Voir ce modèle →</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-bold" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{tpl.name}</p>
          <p className="text-xs" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>{tpl.description}</p>
        </div>
        <div className="flex gap-1">
          {tpl.palettes.slice(0, 4).map(p => (
            <div key={p.id} className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(135deg, ${p.textPrimary} 50%, ${p.accent} 50%)` }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════ */

const STORAGE_KEY = (uid: string) => `stm_inv_${uid}`;

export default function SaveTheDatePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [registryId, setRegistryId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<"design" | "envoyer" | "reponses">("design");
  const [mode, setMode] = useState<"gallery" | "detail" | "animate">("gallery");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteIds, setPaletteIds] = useState<Record<string, string>>({});
  const [envCfg, setEnvCfg] = useState<EnvelopeConfig>(DEFAULT_ENVELOPE);
  const [cardCustom, setCardCustom] = useState<CardCustomization>(DEFAULT_CARD);
  const [user, setUser] = useState<UserData>({ p1: "", p2: "", date: "", location: "" });

  // Send tab state
  const [guestInput, setGuestInput] = useState("");
  const [guestList, setGuestList] = useState<{ name: string; email: string }[]>([]);
  const [sendMessage, setSendMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  // Responses tab state
  const [guests, setGuests] = useState<any[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.push("/connexion"); return; }
      setUserId(u.id);
      const [{ data: prof }, { data: reg }] = await Promise.all([
        createClient().from("profiles").select("partner1_name,partner2_name,wedding_date").eq("id", u.id).single(),
        createClient().from("registries").select("id,ceremony_location").eq("user_id", u.id).single(),
      ]);
      if (reg?.id) setRegistryId(reg.id);
      setUser({ p1: prof?.partner1_name ?? "", p2: prof?.partner2_name ?? "", date: prof?.wedding_date ?? "", location: reg?.ceremony_location ?? "" });

      // Restore saved state if it exists
      try {
        const raw = localStorage.getItem(STORAGE_KEY(u.id));
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.cardCustom) setCardCustom(saved.cardCustom);
          if (saved.paletteIds) setPaletteIds(saved.paletteIds);
          if (saved.envCfg) setEnvCfg(saved.envCfg);
          return; // saved state takes full priority
        }
      } catch {}

      // First visit — apply profile defaults
      const parts = [prof?.partner1_name, prof?.partner2_name].filter(Boolean);
      const fmtDate = prof?.wedding_date
        ? new Date(prof.wedding_date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "";
      setCardCustom(prev => ({
        ...prev,
        namesText: parts.length ? parts.join(" & ") : prev.namesText,
        dateText: fmtDate || prev.dateText,
        locationText: reg?.ceremony_location ?? prev.locationText,
      }));
    });
  }, [router]);

  // Persist state on every change
  useEffect(() => {
    if (!userId) return;
    try {
      localStorage.setItem(STORAGE_KEY(userId), JSON.stringify({ cardCustom, paletteIds, envCfg }));
    } catch {}
  }, [userId, cardCustom, paletteIds, envCfg]);

  const displayed = filter ? TEMPLATES.filter(t => t.category === filter) : TEMPLATES;
  const activeTpl = TEMPLATES.find(t => t.id === selectedId);

  function getPalette(id: string) { return paletteIds[id] ?? TEMPLATES.find(t => t.id === id)!.palettes[0].id; }
  function openDetail(id: string) { setSelectedId(id); setMode("detail"); }
  function goBack() { setMode("gallery"); setSelectedId(null); }

  async function loadGuests() {
    if (!registryId) return;
    setGuestsLoading(true);
    const { data } = await createClient().from("std_guests").select("*").eq("registry_id", registryId).order("created_at", { ascending: false });
    setGuests(data ?? []);
    setGuestsLoading(false);
  }

  function parseGuestInput(raw: string): { name: string; email: string }[] {
    return raw.split(/[\n,;]+/).map(line => {
      const parts = line.trim().split(/\s+/);
      const email = parts.find(p => p.includes("@")) ?? "";
      const name = parts.filter(p => !p.includes("@")).join(" ").trim();
      return { name, email };
    }).filter(g => g.email.includes("@"));
  }

  function addGuests() {
    const parsed = parseGuestInput(guestInput);
    const existing = new Set(guestList.map(g => g.email.toLowerCase()));
    const newOnes = parsed.filter(g => !existing.has(g.email.toLowerCase()));
    setGuestList(prev => [...prev, ...newOnes]);
    setGuestInput("");
  }

  async function handleSend() {
    if (!registryId || guestList.length === 0) return;
    setSending(true);
    setSendResult(null);
    const res = await fetch("/api/std/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registryId, guests: guestList, message: sendMessage }),
    });
    const data = await res.json();
    setSendResult(data);
    setSending(false);
    setGuestList([]);
    setSendMessage("");
    if (mainTab === "reponses") loadGuests();
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>

      {/* Header */}
      <div className="px-8 pt-10 pb-5 max-w-5xl mx-auto">
        {mainTab === "design" && mode === "detail" && activeTpl ? (
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>
              <ArrowLeft size={15}/> Retour
            </button>
            <span style={{ color: "rgba(44,44,44,0.25)" }}>›</span>
            <h1 className="text-sm font-semibold" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>{activeTpl.name}</h1>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-light" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#2c2c2c" }}>Save the Date</h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>
              Vos invités reçoivent une enveloppe animée qui s'ouvre sur votre annonce.
            </p>
          </>
        )}
      </div>

      {/* Main tab bar */}
      {!(mainTab === "design" && (mode === "detail" || mode === "animate")) && (
        <div className="px-8 max-w-5xl mx-auto flex gap-2 mb-0 pb-0">
          {(["design", "envoyer", "reponses"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setMainTab(t); if (t === "reponses") loadGuests(); }}
              className="px-5 py-2.5 rounded-t-xl text-sm font-semibold transition-colors"
              style={{
                fontFamily: "var(--font-display)",
                backgroundColor: mainTab === t ? "white" : "transparent",
                color: mainTab === t ? "#6D1D3E" : "rgba(44,44,44,0.45)",
                border: mainTab === t ? "1.5px solid #f0e6e2" : "1.5px solid transparent",
                borderBottom: mainTab === t ? "1.5px solid white" : "1.5px solid transparent",
                marginBottom: mainTab === t ? "-1px" : 0,
              }}
            >
              {t === "design" ? "Design" : t === "envoyer" ? "Envoyer" : "Réponses"}
            </button>
          ))}
        </div>
      )}

      <div className="border-b border-[#f0e6e2]"/>

      {/* ── Envoyer ── */}
      {mainTab === "envoyer" && (
        <div className="px-8 py-8 max-w-2xl mx-auto">

          {sendResult && (
            <div className="rounded-2xl px-5 py-4 mb-6 text-sm" style={{ backgroundColor: sendResult.failed === 0 ? "#d4edda" : "#fff3cd", color: sendResult.failed === 0 ? "#155724" : "#856404", fontFamily: "var(--font-display)" }}>
              {sendResult.failed === 0
                ? `✓ ${sendResult.sent} email${sendResult.sent > 1 ? "s" : ""} envoyé${sendResult.sent > 1 ? "s" : ""} avec succès.`
                : `${sendResult.sent} envoyé(s), ${sendResult.failed} échec(s).`}
            </div>
          )}

          {/* Add guests */}
          <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>Ajouter des invités</p>
            <p className="text-xs mb-3" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>
              Un par ligne : <em>Prénom email@exemple.fr</em> — ou collez une liste
            </p>
            <textarea
              value={guestInput}
              onChange={e => setGuestInput(e.target.value)}
              placeholder={"Marie marie@exemple.fr\nPierre pierre@exemple.fr"}
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
              style={{ border: "1.5px solid #f0e6e2", fontFamily: "var(--font-display)", color: "#2c2c2c", backgroundColor: "#fdfaf8" }}
            />
            <button
              onClick={addGuests}
              disabled={!guestInput.trim()}
              className="mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
              style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", opacity: !guestInput.trim() ? 0.5 : 1 }}
            >
              Ajouter à la liste
            </button>
          </div>

          {/* Guest list */}
          {guestList.length > 0 && (
            <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
              <p className="text-sm font-semibold mb-3" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>
                {guestList.length} invité{guestList.length > 1 ? "s" : ""} à envoyer
              </p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {guestList.map((g, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: "#fdfaf8", border: "1px solid #f0e6e2" }}>
                    <span className="text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>
                      {g.name && <span className="font-medium">{g.name} · </span>}{g.email}
                    </span>
                    <button onClick={() => setGuestList(prev => prev.filter((_, j) => j !== i))} className="text-xs" style={{ color: "rgba(109,29,62,0.4)" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>Message personnalisé <span style={{ fontWeight: 400, color: "rgba(44,44,44,0.4)" }}>(optionnel)</span></p>
            <textarea
              value={sendMessage}
              onChange={e => setSendMessage(e.target.value)}
              placeholder="Nous sommes heureux de vous annoncer notre mariage…"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
              style={{ border: "1.5px solid #f0e6e2", fontFamily: "var(--font-display)", color: "#2c2c2c", backgroundColor: "#fdfaf8" }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || guestList.length === 0}
            className="w-full py-4 rounded-2xl text-sm font-semibold transition-opacity"
            style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", opacity: (sending || guestList.length === 0) ? 0.5 : 1 }}
          >
            {sending ? "Envoi en cours…" : `Envoyer ${guestList.length > 0 ? `à ${guestList.length} invité${guestList.length > 1 ? "s" : ""}` : ""}`}
          </button>
        </div>
      )}

      {/* ── Réponses ── */}
      {mainTab === "reponses" && (
        <div className="px-8 py-8 max-w-3xl mx-auto">
          {guestsLoading ? (
            <p className="text-sm text-center py-12" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>Chargement…</p>
          ) : guests.length === 0 ? (
            <div className="py-16 text-center rounded-2xl" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)", border: "2px dashed rgba(109,29,62,0.12)" }}>
              <p className="text-sm" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>Aucun invité pour l'instant. Envoyez votre premier Save the Date !</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Envoyés", value: guests.length, color: "#6D1D3E" },
                  { label: "Confirmés", value: guests.filter(g => g.rsvp_status === "confirmed").length, color: "#2d6a4f" },
                  { label: "Déclinés", value: guests.filter(g => g.rsvp_status === "declined").length, color: "#9a3b3b" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-5 text-center" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
                    <span className="block text-3xl font-bold" style={{ color: s.color }}>{s.value}</span>
                    <span className="text-xs mt-1 block" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
                {guests.map((g, i) => (
                  <div key={g.id} className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: i < guests.length - 1 ? "1px solid #f0e6e2" : "none" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{g.name || "—"}</p>
                      <p className="text-xs truncate" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>{g.email}</p>
                      {g.rsvp_message && <p className="text-xs italic mt-0.5 truncate" style={{ color: "rgba(44,44,44,0.55)" }}>"{g.rsvp_message}"</p>}
                    </div>
                    {g.guest_count && g.rsvp_status === "confirmed" && (
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "#f0f8f4", color: "#2d6a4f", fontFamily: "var(--font-display)" }}>
                        {g.guest_count} pers.
                      </span>
                    )}
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0" style={{
                      backgroundColor: g.rsvp_status === "confirmed" ? "#d4edda" : g.rsvp_status === "declined" ? "#f8d7da" : "#fff3cd",
                      color: g.rsvp_status === "confirmed" ? "#155724" : g.rsvp_status === "declined" ? "#721c24" : "#856404",
                      fontFamily: "var(--font-display)",
                    }}>
                      {g.rsvp_status === "confirmed" ? "Confirmé" : g.rsvp_status === "declined" ? "Décliné" : "En attente"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {mainTab === "design" && mode === "gallery" && (
        <>
          <div className="px-8 py-5 max-w-5xl mx-auto flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={String(f.id)} onClick={() => setFilter(f.id)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                style={{
                  fontFamily: "var(--font-display)",
                  backgroundColor: filter === f.id ? "rgba(109,29,62,0.1)" : "rgba(255,255,255,0.7)",
                  color: filter === f.id ? "#6D1D3E" : "rgba(44,44,44,0.55)",
                  border: filter === f.id ? "1.5px solid rgba(109,29,62,0.25)" : "1.5px solid transparent",
                }}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="px-8 pb-16 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {displayed.map(t => (
                <GalleryCard key={t.id} tpl={t} paletteId={getPalette(t.id)} user={user} isStd={true} onClick={() => openDetail(t.id)}/>
              ))}
            </div>
          </div>
        </>
      )}

      {mainTab === "design" && mode === "detail" && activeTpl && (
        <DetailView
          tpl={activeTpl}
          paletteId={getPalette(activeTpl.id)}
          onPaletteChange={pid => setPaletteIds(prev => ({ ...prev, [activeTpl.id]: pid }))}
          isStd={true}
          user={user}
          onUserChange={setUser}
          envCfg={envCfg}
          onEnvelopeChange={setEnvCfg}
          cardCustom={cardCustom}
          onCardCustomChange={setCardCustom}
          onAnimate={() => setMode("animate")}
          onBack={goBack}
        />
      )}

      {mainTab === "design" && mode === "animate" && activeTpl && (
        <EnvelopeModal
          tpl={activeTpl}
          paletteId={getPalette(activeTpl.id)}
          user={user}
          isStd={true}
          envCfg={envCfg}
          fontPreset={cardCustom.fontPreset}
          label={cardCustom.label}
          namesText={cardCustom.namesText}
          dateText={cardCustom.dateText}
          locationText={cardCustom.locationText}
          footer={cardCustom.footer}
          photoUrl={cardCustom.photoUrl || undefined}
          elementStyles={cardCustom.styles}
          customPaperBg={cardCustom.customPaperBg}
          onClose={() => setMode("detail")}
        />
      )}
    </div>
  );
}
