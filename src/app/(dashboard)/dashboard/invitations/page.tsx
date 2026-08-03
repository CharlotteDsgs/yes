"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, ArrowRight, Play, Sparkles, RotateCcw, Trash2, Move, Check, Copy, Link2, Mail, Pencil, UserPlus, FileSpreadsheet, ClipboardList, AlignLeft, AlignCenter, AlignRight, AlignJustify, Info, Save, SlidersHorizontal } from "lucide-react";

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */

interface Palette {
  id: string; label: string;
  bg: string; inner: string;
  textPrimary: string; textSecondary: string; accent: string;
  stripes?: string[];
  paperImage?: string;
  swatchPos?: string;
  swatchSize?: string;
  noImageSwatch?: boolean;
}

interface TemplateConfig {
  id: string; name: string; category: string; description: string; paperImage?: string; layoutVariant?: string; paperFit?: string;
  defaultPhotoUrl?: string;
  defaultPhotoUrls?: string[];
  palettes: Palette[];
}

interface UserData { p1: string; p2: string; date: string; location: string; }

interface EnvelopeConfig { textureId: string; }

interface CardCustomization {
  fontPreset: string;
  label: string;
  namesText: string;
  namesConnector?: string;
  dateText: string;
  locationText: string;
  footer: string;
  tagline?: string;
  photoUrl: string;
  photoUrls?: string[]; // per-slot photos for photomaton
  customPaperBg?: string;
  styles: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
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
  { id: "allura",            label: "Allura",              cssVar: "var(--font-allura)" },
  { id: "ballet",            label: "Ballet",              cssVar: "var(--font-ballet)" },
  { id: "birthstone",        label: "Birthstone",          cssVar: "var(--font-birthstone)" },
  { id: "brittany",          label: "Brittany",            cssVar: "var(--font-brittany)" },
  { id: "calibri",           label: "Calibri",             cssVar: "'Calibri', 'Gill Sans', sans-serif" },
  { id: "cormorant",         label: "Cormorant Garamond",  cssVar: "var(--font-serif)" },
  { id: "cormorant-infant",  label: "Cormorant Infant",    cssVar: "var(--font-cormorant-infant)" },
  { id: "dancing",           label: "Dancing Script",      cssVar: "var(--font-script)" },
  { id: "great-vibes",       label: "Great Vibes",         cssVar: "var(--font-great-vibes)" },
  { id: "herr",              label: "Herr Von Muellerhoff",cssVar: "var(--font-herr)" },
  { id: "libre-baskerville", label: "Libre Baskerville",   cssVar: "var(--font-libre-baskerville)" },
  { id: "montserrat",        label: "Montserrat",          cssVar: "var(--font-montserrat)" },
  { id: "pinyon",            label: "Pinyon Script",       cssVar: "var(--font-pinyon)" },
  { id: "playfair",          label: "Playfair Display",    cssVar: "var(--font-playfair)" },
  { id: "times-new-roman",   label: "Times New Roman",     cssVar: "'Times New Roman', Times, serif" },
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
  lmLabel1: "Save the date",
  lmLabel2: "Sous-titre",
  lmName1: "Prénom 1",
  lmConnector: "Connecteur",
  lmName2: "Prénom 2",
  date: "Date",
  location: "Lieu",
  footer: "Pied de carte",
  tagline: "Phrase mariage",
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
    id: "dentelle", name: "Epuré", category: "classique",
    description: "Papier texturé, minimalisme élégant",
    defaultPhotoUrl: "/photo_couple/couple_9.jpg",
    palettes: [
      { id: "papier1", label: "Papier clair", bg: "#F5F3F0", inner: "#F5F3F0", textPrimary: "#1A1A1A", textSecondary: "#606060", accent: "#303030", paperImage: "/papier%20lettre/Fond%20papier/Papier_1.png" },
      { id: "papier2", label: "Papier chaud",  bg: "#EAE0D0", inner: "#EAE0D0", textPrimary: "#2C1E10", textSecondary: "#705040", accent: "#4A3020", paperImage: "/papier%20lettre/Fond%20papier/Papier_2.png" },
    ],
  },
  {
    id: "photomaton", name: "Photomaton", category: "moderne",
    description: "Bande photos façon photomaton, quatre clichés",
    defaultPhotoUrls: [
      "/photo_couple/photomaton_1.jpeg",
      "/photo_couple/Photomaton_2.jpeg",
      "/photo_couple/Photomaton_3.jpeg",
      "/photo_couple/Photomaton_4.jpeg",
    ],
    palettes: [
      { id: "film",  label: "Film",   bg: "#F4F1EC", inner: "#F4F1EC", textPrimary: "#1A1A1A", textSecondary: "#606060", accent: "#303030" },
      { id: "sepia", label: "Sépia",  bg: "#F2EBE0", inner: "#F2EBE0", textPrimary: "#2C1E10", textSecondary: "#705040", accent: "#6A4820" },
    ],
  },
  {
    id: "rayures", name: "Bold Stripes", category: "moderne",
    description: "Rayures graphiques & typographie audacieuse",
    palettes: [
      { id: "blush",    label: "Blush",    bg: "#F5E8EC", inner: "#F5E8EC", textPrimary: "#6A1028", textSecondary: "#9A4060", accent: "#8A2040", stripes: ["#F5E8EC","#EDD8E0","#E5C8D0","#DDB8C0"] },
      { id: "nuit",     label: "Nuit",     bg: "#352C44", inner: "#1A1520", textPrimary: "#E8DFC8", textSecondary: "#C0B898", accent: "#C4A35A", stripes: ["#352C44","#2C2438","#231C2C","#1A1520"] },
      { id: "sauge",    label: "Sauge",    bg: "#EBF0E6", inner: "#EBF0E6", textPrimary: "#1E3018", textSecondary: "#456040", accent: "#3A5030", stripes: ["#EBF0E6","#DCE8D6","#CDE0C6","#BED8B6"] },
      { id: "champagne",label: "Champagne",bg: "#F8F2E5", inner: "#F8F2E5", textPrimary: "#3A2A10", textSecondary: "#7A6030", accent: "#B89040", stripes: ["#F8F2E5","#F0E8D0","#E8DEBB","#E0D4A6"] },
    ],
  },
  {
    id: "lettre-moderne", name: "Rayure", category: "moderne",
    description: "Rayures festives, encadré festonné doré",
    paperImage: "/papier%20lettre/Moderne_color%C3%A9_1.png",
    palettes: [
      { id: "rouge",   label: "Rouge",   bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#4A1828", textSecondary: "#904060", accent: "#B87820", paperImage: "/papier%20lettre/Moderne_color%C3%A9_1.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "variant2",label: "Variante 2", bg: "#F5F0E8", inner: "#F5F0E8", textPrimary: "#1A2A18", textSecondary: "#4A6A38", accent: "#B87820", paperImage: "/papier%20lettre/Moderne_color%C3%A9_2.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "variant3",label: "Variante 3", bg: "#E8EEF5", inner: "#E8EEF5", textPrimary: "#18202C", textSecondary: "#3A4A5C", accent: "#B87820", paperImage: "/papier%20lettre/Moderne_color%C3%A9_3.png", swatchPos: "5% 5%", swatchSize: "600%" },
    ],
  },
  {
    id: "lettre-italy", name: "Dessins", category: "lettre",
    description: "Papier illustré, compositions graphiques",
    paperImage: "/papier%20lettre/lettre_italy.png",
    layoutVariant: "italy",
    palettes: [
      { id: "italy",  label: "Italie", bg: "#EDE8E0", inner: "#EDE8E0", textPrimary: "#28201A", textSecondary: "#6A5040", accent: "#8A6040", paperImage: "/papier%20lettre/lettre_italy.png" },
      { id: "jungle", label: "Jungle", bg: "#E8EEE4", inner: "#E8EEE4", textPrimary: "#1A2A1A", textSecondary: "#406040", accent: "#3A5030", paperImage: "/papier%20lettre/lettre_jungle.png" },
    ],
  },
  {
    id: "lettre-flower-big-3", name: "Bouquet I", category: "lettre",
    description: "Grands bouquets floraux aquarelle",
    paperImage: "/papier%20lettre/lettre_flower_big_3.png",
    layoutVariant: "elegant",
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
    layoutVariant: "italy",
    palettes: [
      { id: "olivier", label: "Olivier", bg: "#EAEEE6", inner: "#EAEEE6", textPrimary: "#2A3A20", textSecondary: "#5A7A4A", accent: "#4A6A3A", paperImage: "/papier%20lettre/lettre_olivier.png", swatchPos: "0% 0%", swatchSize: "400%" },
      { id: "fleur",   label: "Fleur",   bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#4A1828", textSecondary: "#904060", accent: "#6A2840", paperImage: "/papier%20lettre/lettre_flower_1.png", swatchPos: "0% 0%", swatchSize: "400%" },
    ],
  },
  {
    id: "lettre-photo", name: "Photo florale", category: "lettre",
    description: "Votre photo encadrée sur fond floral",
    paperImage: "/papier%20lettre/lettre_flower_big.png",
    layoutVariant: "photo",
    defaultPhotoUrl: "/photo_couple/couple_8.JPG",
    palettes: [
      { id: "encre",    label: "Encre",    bg: "#EDE8E0", inner: "#EDE8E0", textPrimary: "#28201A", textSecondary: "#6A5040", accent: "#8A6040" },
      { id: "bordeaux", label: "Bordeaux", bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#6D1D3E", textSecondary: "#9A4060", accent: "#8A2048" },
      { id: "ardoise",  label: "Ardoise",  bg: "#E8EEF5", inner: "#E8EEF5", textPrimary: "#1E2430", textSecondary: "#506080", accent: "#2A3A50" },
    ],
  },
  {
    id: "lettre-arbres", name: "Arbres", category: "lettre",
    description: "Forêt aquarelle, typographie script élégante",
    paperImage: "/papier%20lettre/arbres_1.png",
    layoutVariant: "arbres",
    palettes: [
      { id: "arbres1", label: "Forêt I",  bg: "#2E3828", inner: "#2E3828", textPrimary: "#F0EDE4", textSecondary: "#C4C0B0", accent: "#A8A498", paperImage: "/papier%20lettre/arbres_1.png" },
      { id: "arbres2", label: "Forêt II", bg: "#1E2420", inner: "#1E2420", textPrimary: "#FFFFFF",  textSecondary: "#D8D8D0", accent: "#C0C0B8", paperImage: "/papier%20lettre/arbres_2.png" },
    ],
  },
  {
    id: "lettre-elegant", name: "Élégant", category: "classique",
    description: "Papier élégant aux lignes épurées",
    paperImage: "/papier%20lettre/elegant_base.png",
    paperFit: "none",
    layoutVariant: "elegant",
    palettes: [
      { id: "rouge",   label: "Rouge", bg: "#741A3C", inner: "#F4E8EC", textPrimary: "#5A1830", textSecondary: "#8A4858", accent: "#741A3C", paperImage: "/papier%20lettre/elegant_base.png", noImageSwatch: true },
      { id: "vert",    label: "Vert",  bg: "#2A5038", inner: "#E8F0EC", textPrimary: "#1A3020", textSecondary: "#4A7058", accent: "#3A6040", paperImage: "/papier%20lettre/elegant_V2.png",  noImageSwatch: true },
      { id: "bleu",    label: "Bleu",  bg: "#1E2C48", inner: "#E8ECF2", textPrimary: "#18202C", textSecondary: "#404C5C", accent: "#283444", paperImage: "/papier%20lettre/elegant_V3.png",  noImageSwatch: true },
    ],
  },
  {
    id: "motifs", name: "Motifs", category: "motifs",
    description: "Motifs décoratifs, 7 coloris",
    paperImage: "/papier%20lettre/Motif_1.png",
    layoutVariant: "arbres",
    palettes: [
      { id: "motif1", label: "Motif 1", bg: "#EDE8E0", inner: "#EDE8E0", textPrimary: "#1a1614", textSecondary: "#5a5a5a", accent: "#1a1614", paperImage: "/papier%20lettre/Motif_1.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "motif2", label: "Motif 2", bg: "#F5E8EE", inner: "#F5E8EE", textPrimary: "#1a1614", textSecondary: "#5a5a5a", accent: "#1a1614", paperImage: "/papier%20lettre/Motif_2.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "motif3", label: "Motif 3", bg: "#F0EAD8", inner: "#F0EAD8", textPrimary: "#1a1614", textSecondary: "#5a5a5a", accent: "#1a1614", paperImage: "/papier%20lettre/Motif_3.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "motif4", label: "Motif 4", bg: "#E8EEF5", inner: "#E8EEF5", textPrimary: "#1a1614", textSecondary: "#5a5a5a", accent: "#1a1614", paperImage: "/papier%20lettre/Motif_4.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "motif5", label: "Motif 5", bg: "#E8F0EC", inner: "#E8F0EC", textPrimary: "#1a1614", textSecondary: "#5a5a5a", accent: "#1a1614", paperImage: "/papier%20lettre/Motif_5.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "motif6", label: "Motif 6", bg: "#F5F0E8", inner: "#F5F0E8", textPrimary: "#1a1614", textSecondary: "#5a5a5a", accent: "#1a1614", paperImage: "/papier%20lettre/Motif_6.png", swatchPos: "5% 5%", swatchSize: "600%" },
      { id: "motif7", label: "Motif 7", bg: "#F0E8F0", inner: "#F0E8F0", textPrimary: "#1a1614", textSecondary: "#5a5a5a", accent: "#1a1614", paperImage: "/papier%20lettre/Motif_7.png", swatchPos: "5% 5%", swatchSize: "600%" },
    ],
  },
  {
    id: "photo-texte", name: "Photo", category: "photo",
    description: "Photo et typographie épurée",
    layoutVariant: "photo-texte",
    defaultPhotoUrl: "/photo_couple/couple_4.jpg",
    palettes: [
      { id: "blanc", label: "Blanc", bg: "#FFFFFF", inner: "#FFFFFF", textPrimary: "#0A0A0A", textSecondary: "#888888", accent: "#B8924A" },
      { id: "creme", label: "Crème", bg: "#FAF8F3", inner: "#FAF8F3", textPrimary: "#1A1410", textSecondary: "#7A6A5A", accent: "#A07848" },
    ],
  },
];

const FILTERS = [
  { id: null, label: "Tous" },
  { id: "classique", label: "Classique" },
  { id: "floral", label: "Floral" },
  { id: "moderne", label: "Moderne" },
  { id: "lettre", label: "Lettre" },
  { id: "motifs", label: "Motifs" },
  { id: "photo", label: "Photo" },
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
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
  customPaperBg?: string;
}) {
  const fp = FONT_PRESETS.find(f => f.id === fontPreset) ?? FONT_PRESETS[0];
  const rawLabel = label ?? "save the date";
  const displayLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
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

  const tplDefaults: Record<string, { font?: string; size?: number }> = {
    label: { font: "var(--font-pinyon)" },
    names: { size: 1.3 },
  };
  const getFont = (id: string, def: string) => elementStyles?.[id]?.font ?? tplDefaults[id]?.font ?? def;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? tplDefaults[id]?.size ?? 1);
  const getCase = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\\b\\w/g, c => c.toUpperCase()) : val; };
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
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

      {p.paperImage
        ? <image href={p.paperImage} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice"/>
        : <rect width={W} height={H} fill={customPaperBg ?? p.bg} filter="url(#ptex)"/>
      }

      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.088, H * 0.085)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.13} textAnchor="middle"
            fontFamily={getFont("label", fp.scriptFont)}
            fontStyle={getFontStyle("label", fp.scriptItalic ? "italic" : "normal")}
            fontWeight={getFontWeight("label")}
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
        {selectedElement === "names" && hl(H * 0.196, H * 0.068)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={H * 0.23} textAnchor="middle"
            fontFamily={getFont("names", fp.bodyFont)}
            fontStyle={getFontStyle("names")}
            fontWeight={getFontWeight("names", "500")}
            fontSize={getSize("names", W * 0.038)}
            fill={getColor("names", p.textPrimary)}
            letterSpacing="3">
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
        {selectedElement === "date" && hl(photoY + photoH + H * 0.063, H * 0.065)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={photoY + photoH + H * 0.095} textAnchor="middle"
            fontFamily={getFont("date", fp.bodyFont)}
            fontStyle={getFontStyle("date")}
            fontWeight={getFontWeight("date", "500")}
            fontSize={getSize("date", W * 0.031)}
            fill={getColor("date", p.textPrimary)}
            letterSpacing="2.5">
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
          {selectedElement === "location" && hl(photoY + photoH + H * 0.114, H * 0.062)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={photoY + photoH + H * 0.145} textAnchor="middle"
              fontFamily={getFont("location", fp.bodyFont)}
              fontStyle={getFontStyle("location")}
              fontWeight={getFontWeight("location", "500")}
              fontSize={getSize("location", W * 0.028)}
              fill={getColor("location", p.textPrimary)}
              letterSpacing="2.5">
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
        {selectedElement === "footer" && hl(H * 0.883, H * 0.075)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.92} textAnchor="middle"
            fontFamily={getFont("footer", fp.scriptFont)}
            fontStyle={getFontStyle("footer", fp.scriptItalic ? "italic" : "normal")}
            fontWeight={getFontWeight("footer")}
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

function TemplatePhotomaton({ W, H, p, user, label, namesText, dateText, photoUrls,
  selectedElement, onElementClick, onPhotoClick, elementStyles, customPaperBg }: {
  W: number; H: number; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; photoUrls?: string[];
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  onPhotoClick?: (index: number) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
  customPaperBg?: string;
}) {
  const displayLabel = label ?? "save the date";
  const displayNames = namesText || `${user.p1 || "Emma"} & ${user.p2 || "Charlie"}`;
  const displayDate = dateText || (user.date
    ? (() => { const d = new Date(user.date + "T12:00:00"); return `${String(d.getDate()).padStart(2,"0")} . ${String(d.getMonth()+1).padStart(2,"0")} . ${String(d.getFullYear()).slice(-2)}`; })()
    : "22 . 10 . 26");

  const gap      = H * 0.012;
  const photoSize = (H * 0.77 - 3 * gap) / 4; // square: width = height
  const photoW   = photoSize;
  const photoH   = photoSize;
  const photoX   = (W - photoW) / 2;
  const stripY = H * 0.115;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getDX    = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY    = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  const hl = (y: number, h: number) => (
    <rect x={W * 0.08} y={y} width={W * 0.84} height={h}
      fill="rgba(109,29,62,0.06)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <defs>
        <filter id="pm_bw" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.96" intercept="0.02"/>
            <feFuncG type="linear" slope="0.96" intercept="0.02"/>
            <feFuncB type="linear" slope="0.96" intercept="0.02"/>
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width={W} height={H} fill={customPaperBg ?? p.bg}/>

      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.044, H * 0.035)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.064} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("label")}
            fontWeight={getFontWeight("label")}
            fontSize={getSize("label", W * 0.030)}
            fill={getColor("label", p.textPrimary)}
            letterSpacing="4"
            opacity="0.85">
            {elementStyles?.label?.uppercase === true ? displayLabel.toUpperCase() : elementStyles?.label?.uppercase === "capitalize" ? displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1).toLowerCase() : displayLabel.toUpperCase()}
          </text>
        )}
      </g>

      {/* Names */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.080, H * 0.030)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={H * 0.100} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("names")}
            fontWeight={getFontWeight("names")}
            fontSize={getSize("names", W * 0.022)}
            fill={getColor("names", p.textSecondary)}
            letterSpacing="3">
            {elementStyles?.names?.uppercase === false ? displayNames : elementStyles?.names?.uppercase === "capitalize" ? displayNames.charAt(0).toUpperCase() + displayNames.slice(1).toLowerCase() : elementStyles?.names?.uppercase === true ? displayNames.toUpperCase() : displayNames}
          </text>
        )}
      </g>

      {/* 4 photo slots */}
      {[0, 1, 2, 3].map(i => {
        const py = stripY + i * (photoH + gap);
        const src = photoUrls?.[i];
        return (
          <g key={i} onClick={onPhotoClick ? e => { e.stopPropagation(); onPhotoClick(i); } : undefined}
            style={{ cursor: onPhotoClick ? "pointer" : "default" }}>
            {src ? (
              <image href={src} x={photoX} y={py} width={photoW} height={photoH}
                preserveAspectRatio="xMidYMid slice" filter="url(#pm_bw)"/>
            ) : (
              <>
                <rect x={photoX} y={py} width={photoW} height={photoH} fill={p.textPrimary} opacity="0.04"/>
                <rect x={photoX} y={py} width={photoW} height={photoH} fill="none" stroke={p.textSecondary} strokeWidth="0.6" strokeDasharray="4,3" opacity="0.20"/>
                {i === 1 && (
                  <text x={W / 2} y={py + photoH * 0.58} textAnchor="middle"
                    fontFamily="var(--font-serif)" fontSize={W * 0.022} fill={p.textSecondary} opacity="0.35" fontStyle="italic">
                    {onPhotoClick ? "cliquez pour ajouter" : "votre photo"}
                  </text>
                )}
              </>
            )}
          </g>
        );
      })}

      {/* Date — handwriting */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.906, H * 0.044)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.940} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-script)"}
            fontStyle={getFontStyle("date")}
            fontWeight={getFontWeight("date")}
            fontSize={getSize("date", W * 0.046)}
            fill={getColor("date", p.textPrimary)}
            opacity="0.9">
            {displayDate}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplateOliviers({ W, H, p, user, fontPreset = "romantique", label, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; p: Palette; user: UserData; fontPreset?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}) {
  const fp = FONT_PRESETS.find(f => f.id === fontPreset) ?? FONT_PRESETS[0];
  const displayLabel = label ?? "save the date";
  const displayFooter = footer ?? "invitation à suivre";
  const displayNames = namesText || `${user.p1 || "Jennifer"} & ${user.p2 || "Nikos"}`;
  const fmtDate = user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "18 octobre 2026";
  const displayDate = dateText || fmtDate;
  const displayLocation = locationText ?? user.location;
  const s = W / 400;

  const getFont  = (id: string, def: string) => elementStyles?.[id]?.font ?? def;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getDX    = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY    = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
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

      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.185, H * 0.055)}
        {selectedElement !== "label" && (
          <text x={W/2} y={H*0.22} textAnchor="middle"
            fontFamily={getFont("label", fp.scriptFont)}
            fontStyle={getFontStyle("label", fp.scriptItalic ? "italic" : "normal")} fontWeight={getFontWeight("label")}
            fontSize={getSize("label", W*0.062)} fill={getColor("label", p.textPrimary)} opacity="0.9">
            {displayLabel}
          </text>
        )}
      </g>

      <line x1={W*0.32} y1={H*0.27} x2={W*0.68} y2={H*0.27} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>

      {/* Names */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.345, H * 0.055)}
        {selectedElement !== "names" && (
          <text x={W/2} y={H*0.38} textAnchor="middle"
            fontFamily={getFont("names", fp.scriptFont)}
            fontStyle={getFontStyle("names", fp.scriptItalic ? "italic" : "normal")} fontWeight={getFontWeight("names")}
            fontSize={getSize("names", W*0.072)} fill={getColor("names", p.textPrimary)}>
            {displayNames}
          </text>
        )}
      </g>

      <line x1={W*0.32} y1={H*0.43} x2={W*0.68} y2={H*0.43} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.497, H * 0.040)}
        {selectedElement !== "date" && (
          <text x={W/2} y={H*0.52} textAnchor="middle"
            fontFamily={getFont("date", fp.bodyFont)}
            fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")}
            fontSize={getSize("date", W*0.030)} fill={getColor("date", p.textPrimary)}
            letterSpacing="2">
            {displayDate}
          </text>
        )}
      </g>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * 0.554, H * 0.038)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W/2} y={H*0.577} textAnchor="middle"
              fontFamily={getFont("location", fp.bodyFont)}
              fontStyle={getFontStyle("location", "italic")} fontWeight={getFontWeight("location")}
              fontSize={getSize("location", W*0.027)} fill={getColor("location", p.textPrimary)}
              letterSpacing="1.5">
              {displayLocation}
            </text>
          )}
        </g>
      )}

      {/* Footer */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        {selectedElement === "footer" && hl(H * 0.806, H * 0.048)}
        {selectedElement !== "footer" && (
          <text x={W/2} y={H*0.835} textAnchor="middle"
            fontFamily={getFont("footer", fp.scriptFont)}
            fontStyle={getFontStyle("footer", fp.scriptItalic ? "italic" : "normal")} fontWeight={getFontWeight("footer")}
            fontSize={getSize("footer", W*0.042)} fill={getColor("footer", p.textSecondary)} opacity="0.75">
            {displayFooter}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplateRayures({ W, H, p, user, isStd, customPaperBg, label, namesText, namesConnector, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; p: Palette; user: UserData; isStd: boolean; customPaperBg?: string;
  label?: string; namesText?: string; namesConnector?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}) {
  let stripes: string[];
  if (customPaperBg && /^#[0-9A-Fa-f]{6}$/.test(customPaperBg)) {
    const r = parseInt(customPaperBg.slice(1, 3), 16);
    const g = parseInt(customPaperBg.slice(3, 5), 16);
    const b = parseInt(customPaperBg.slice(5, 7), 16);
    const mix = (w: number) => {
      const toHex = (v: number) => Math.round(v + (255 - v) * w).toString(16).padStart(2, "0");
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    stripes = [mix(0.65), mix(0.42), mix(0.20), customPaperBg];
  } else {
    stripes = p.stripes ?? [p.bg, p.bg + "CC", p.bg + "99", p.bg + "66"];
  }
  const sw = W / stripes.length;

  const rawNames = namesText || `${user.p1 || "SOPHIA"} & ${user.p2 || "BENNETT"}`;
  const parts = rawNames.split(/\s*(?:&|\bet\b)\s*/i);
  const name1Raw = (parts[0] ?? rawNames).trim();
  const name2Raw = (parts[1] ?? "").trim();
  const i1 = name1Raw[0]?.toUpperCase() ?? "S";
  const i2 = name2Raw[0]?.toUpperCase() ?? "T";

  const displayLabel = label || (isStd ? "Save the Date" : "Mariage");
  const fmtDate = user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Samedi 18 octobre 2026";
  const displayDate = dateText || fmtDate;
  const displayLocation = locationText ?? user.location;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getDX    = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY    = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  const hl = (y: number, h: number) => (
    <rect x={W * 0.08} y={y} width={W * 0.84} height={h}
      fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.6)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      {stripes.map((c, i) => <rect key={i} x={i * sw} y={0} width={sw} height={H} fill={c}/>)}

      {/* Monogram */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("monogram"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["monogram"]?.hidden !== false ? "none" : undefined }}>
        {selectedElement === "monogram" && hl(H * 0.038, H * 0.122)}
        <circle cx={W/2} cy={H*0.10} r={W*0.065} fill="none" stroke={p.textPrimary} strokeWidth="1" opacity="0.5"/>
        <text x={W/2} y={H*0.115} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W*0.05}
          fill={p.textPrimary} fontStyle="italic">{i1}{i2}</text>
      </g>

      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.207, H * 0.036)}
        {selectedElement !== "label" && (
          <text x={W/2} y={H*0.225} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("label")} fontWeight={getFontWeight("label")}
            fontSize={getSize("label", W * 0.028)} fill={getColor("label", p.textPrimary)}
            letterSpacing="4" style={{ textTransform:"uppercase" }} opacity="0.7">
            {displayLabel}
          </text>
        )}
      </g>

      {/* Tagline — above names */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("tagline"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("tagline")*W} ${getDY("tagline")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["tagline"]?.hidden ? "none" : undefined }}>
        {selectedElement === "tagline" && hl(H * (isStd ? 0.267 : 0.257), H * 0.042)}
        <text x={W/2} y={H*(isStd?0.290:0.280)} textAnchor="middle" fontFamily={elementStyles?.tagline?.font ?? "var(--font-montserrat)"}
          fontSize={getSize("tagline", W*0.027)} fill={getColor("tagline", p.textPrimary)} letterSpacing="2.5" style={{ textTransform:"uppercase" }} opacity="0.65">
          {footer || "sont heureux de vous inviter"}
        </text>
      </g>

      <line x1={W*0.35} y1={H*(isStd?0.345:0.335)} x2={W*0.65} y2={H*(isStd?0.345:0.335)}
        stroke={p.textPrimary} strokeWidth="0.8" opacity="0.35"/>

      {/* Names — text always visible; hl overlay appears on top when selected */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*(isStd?0.441:0.431)} textAnchor="middle"
          fontFamily={elementStyles?.names?.font ?? "var(--font-playfair)"}
          fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "700")}
          fontSize={getSize("names", W * 0.13)}
          fill={getColor("names", p.textPrimary)} style={{ textTransform:"uppercase" }}>
          {name1Raw.toUpperCase()}
        </text>
        <text x={W/2} y={H*(isStd?0.536:0.516)} textAnchor="middle"
          fontFamily="var(--font-script)" fontSize={W*0.1} fill={p.accent}>
          {namesConnector || "and"}
        </text>
        {name2Raw && (
          <text x={W/2} y={H*(isStd?0.646:0.626)} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "var(--font-playfair)"}
            fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "700")}
            fontSize={getSize("names", W * 0.13)}
            fill={getColor("names", p.textPrimary)} style={{ textTransform:"uppercase" }}>
            {name2Raw.toUpperCase()}
          </text>
        )}
        {selectedElement === "names" && hl(H * (isStd ? 0.352 : 0.342) - getDY("names")*H, H * 0.315)}
      </g>

      <line x1={W*0.35} y1={H*(isStd?0.676:0.656)} x2={W*0.65} y2={H*(isStd?0.676:0.656)}
        stroke={p.textPrimary} strokeWidth="0.8" opacity="0.35"/>

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * (isStd ? 0.762 : 0.737), H * 0.038)}
        {selectedElement !== "date" && (
          <text x={W/2} y={H*(isStd?0.780:0.755)} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")}
            fontSize={getSize("date", W * 0.028)} fill={getColor("date", p.textPrimary)}
            letterSpacing="1.5" style={{ textTransform:"uppercase" }}>
            {displayDate}
          </text>
        )}
      </g>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * (isStd ? 0.830 : 0.805), H * 0.036)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W/2} y={H*(isStd?0.848:0.823)} textAnchor="middle"
              fontFamily={elementStyles?.location?.font ?? "var(--font-montserrat)"}
              fontStyle={getFontStyle("location")} fontWeight={getFontWeight("location")}
              fontSize={getSize("location", W * 0.025)} fill={getColor("location", p.textSecondary)}
              letterSpacing="1">
              {displayLocation}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

function TemplateLettre({ W, H, paperImage, p, user, fontPreset = "romantique", label, namesText, namesConnector, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles, paperFit = "xMidYMid slice", tplId, isStd }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  fontPreset?: string;
  label?: string; namesText?: string; namesConnector?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
  paperFit?: string; tplId?: string; isStd?: boolean;
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
  const getCase = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\\b\\w/g, c => c.toUpperCase()) : val; };
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
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
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio={paperFit}/>

      {/* Label */}
      {tplId === "lettre-moderne" && isStd ? (() => {
        const lParts = (displayLabel || "save the date\ninvitation à suivre").split("\n");
        const l1 = lParts[0] ?? "save the date";
        const l2 = lParts[1] ?? "invitation à suivre";
        return (
          <>
            <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("lmLabel1"); } : undefined}
              className={onElementClick ? "eh" : undefined}
              transform={`translate(${getDX("lmLabel1")*W} ${getDY("lmLabel1")*H})`}
              style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["lmLabel1"]?.hidden ? "none" : undefined }}>
              {selectedElement === "lmLabel1" && hl(H * 0.213, H * 0.058)}
              {selectedElement !== "lmLabel1" && <text x={W / 2} y={H * 0.245} textAnchor="middle" fontFamily={getFont("lmLabel1", "var(--font-libre-baskerville)")} fontStyle={getFontStyle("lmLabel1")} fontWeight={getFontWeight("lmLabel1")} fontSize={getSize("lmLabel1", W * 0.042)} fill={getColor("lmLabel1", p.textPrimary)}>{l1}</text>}
            </g>
            {l2 && (
              <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("lmLabel2"); } : undefined}
                className={onElementClick ? "eh" : undefined}
                transform={`translate(${getDX("lmLabel2")*W} ${getDY("lmLabel2")*H})`}
                style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["lmLabel2"]?.hidden ? "none" : undefined }}>
                {selectedElement === "lmLabel2" && hl(H * 0.263, H * 0.052)}
                {selectedElement !== "lmLabel2" && <text x={W / 2} y={H * 0.295} textAnchor="middle" fontFamily={getFont("lmLabel2", "var(--font-libre-baskerville)")} fontStyle={getFontStyle("lmLabel2")} fontWeight={getFontWeight("lmLabel2")} fontSize={getSize("lmLabel2", W * 0.042)} fill={getColor("lmLabel2", p.textPrimary)}>{l2}</text>}
              </g>
            )}
          </>
        );
      })() : (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
          {selectedElement === "label" && hl(H * 0.208, H * 0.115)}
          {selectedElement !== "label" && (
            <text x={W / 2} y={H * 0.22} textAnchor="middle"
              fontFamily={getFont("label", fp.scriptFont)}
              fontStyle={getFontStyle("label", fp.scriptItalic ? "italic" : "normal")}
              fontWeight={getFontWeight("label")}
              fontSize={getSize("label", W * 0.062)}
              fill={getColor("label", p.textPrimary)}
              opacity="0.9">
              {getCase("label", displayLabel)}
            </text>
          )}
        </g>
      )}

      {tplId !== "lettre-moderne" && <line x1={W * 0.32} y1={H * 0.27} x2={W * 0.68} y2={H * 0.27} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>}

      {/* Names */}
      {tplId === "lettre-moderne" ? (() => {
        const lmParts = displayNames.split(/\s*(?:&|\bet\b)\s*/i);
        const lmN1 = (lmParts[0] ?? displayNames).trim();
        const lmN2 = (lmParts[1] ?? "").trim();
        const conn = namesConnector ?? "et";
        return (
          <>
            <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("lmName1"); } : undefined}
              className={onElementClick ? "eh" : undefined}
              transform={`translate(${getDX("lmName1")*W} ${getDY("lmName1")*H})`}
              style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["lmName1"]?.hidden ? "none" : undefined }}>
              {selectedElement === "lmName1" && hl(H * 0.38, H * 0.14)}
              {selectedElement !== "lmName1" && <text x={W/2} y={H * 0.44} textAnchor="middle" fontFamily={getFont("lmName1", "var(--font-brittany)")} fontStyle={getFontStyle("lmName1")} fontWeight={getFontWeight("lmName1")} fontSize={getSize("lmName1", W * 0.115)} fill={getColor("lmName1", p.textPrimary)}>{lmN1}</text>}
            </g>
            <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("lmConnector"); } : undefined}
              className={onElementClick ? "eh" : undefined}
              transform={`translate(${getDX("lmConnector")*W} ${getDY("lmConnector")*H})`}
              style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["lmConnector"]?.hidden ? "none" : undefined }}>
              {selectedElement === "lmConnector" && hl(H * 0.495, H * 0.07)}
              {selectedElement !== "lmConnector" && <text x={W/2} y={H * 0.535} textAnchor="middle" fontFamily={getFont("lmConnector", "var(--font-libre-baskerville)")} fontStyle={getFontStyle("lmConnector", "italic")} fontWeight={getFontWeight("lmConnector")} fontSize={getSize("lmConnector", W * 0.038)} fill={getColor("lmConnector", p.textPrimary)}>{conn}</text>}
            </g>
            {lmN2 && (
              <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("lmName2"); } : undefined}
                className={onElementClick ? "eh" : undefined}
                transform={`translate(${getDX("lmName2")*W} ${getDY("lmName2")*H})`}
                style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["lmName2"]?.hidden ? "none" : undefined }}>
                {selectedElement === "lmName2" && hl(H * 0.58, H * 0.14)}
                {selectedElement !== "lmName2" && <text x={W/2} y={H * 0.64} textAnchor="middle" fontFamily={getFont("lmName2", "var(--font-brittany)")} fontStyle={getFontStyle("lmName2")} fontWeight={getFontWeight("lmName2")} fontSize={getSize("lmName2", W * 0.115)} fill={getColor("lmName2", p.textPrimary)}>{lmN2}</text>}
              </g>
            )}
          </>
        );
      })() : (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
          <>
            {selectedElement === "names" && hl(H * 0.335, H * 0.090)}
            {selectedElement !== "names" && (
              <text x={W / 2} y={H * 0.38} textAnchor="middle"
                fontFamily={getFont("names", fp.scriptFont)}
                fontStyle={getFontStyle("names", fp.scriptItalic ? "italic" : "normal")}
                fontWeight={getFontWeight("names")}
                fontSize={getSize("names", W * 0.072)}
                fill={getColor("names", p.textPrimary)}>
                {getCase("names", displayNames)}
              </text>
            )}
          </>
        </g>
      )}

      {tplId !== "lettre-moderne" && <line x1={W * 0.32} y1={H * 0.43} x2={W * 0.68} y2={H * 0.43} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>}

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(tplId === "lettre-moderne" ? H * 0.685 : H * 0.483, H * 0.055)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={tplId === "lettre-moderne" ? H * 0.72 : H * 0.52} textAnchor="middle"
            fontFamily={tplId === "lettre-moderne" ? "var(--font-libre-baskerville)" : getFont("date", fp.bodyFont)}
            fontSize={getSize("date", W * 0.030)}
            fill={getColor("date", p.textPrimary)}
            fontStyle={getFontStyle("date", tplId === "lettre-moderne" ? "italic" : "normal")}
            letterSpacing={tplId === "lettre-moderne" ? "0" : "2"} fontWeight={getFontWeight("date")}>
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
          {selectedElement === "location" && hl(tplId === "lettre-moderne" ? H * 0.755 : H * 0.543, H * 0.055)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={tplId === "lettre-moderne" ? H * 0.79 : H * 0.577} textAnchor="middle"
              fontFamily={tplId === "lettre-moderne" ? "var(--font-libre-baskerville)" : getFont("location", fp.bodyFont)}
              fontSize={getSize("location", W * 0.028)}
              fill={getColor("location", tplId === "lettre-moderne" ? p.textPrimary : p.textSecondary)}
              fontStyle={getFontStyle("location", "italic")} fontWeight={getFontWeight("location")}
              letterSpacing={tplId === "lettre-moderne" ? "0" : "1.5"}>
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}

      {/* Footer — hidden for lettre-moderne */}
      {tplId !== "lettre-moderne" && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
          {selectedElement === "footer" && hl(H * 0.801, H * 0.068)}
          {selectedElement !== "footer" && (
            <text x={W / 2} y={H * 0.835} textAnchor="middle"
              fontFamily={getFont("footer", fp.scriptFont)}
              fontStyle={getFontStyle("footer", fp.scriptItalic ? "italic" : "normal")}
              fontWeight={getFontWeight("footer")}
              fontSize={getSize("footer", W * 0.042)}
              fill={getColor("footer", p.textSecondary)}
              opacity="0.75">
              {getCase("footer", displayFooter)}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

function TemplateElegant({ W, H, paperImage, p, user, label, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles, tplId }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
  tplId?: string;
}) {
  const isFlowerBig3    = tplId === "lettre-flower-big-3";
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
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\\b\\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };

  const hl = (y: number, h: number) => (
    <rect x={W * 0.06} y={y} width={W * 0.88} height={h}
      fill="rgba(109,29,62,0.05)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  const nameCase = (id: string, val: string) => {
    const u = elementStyles?.[id]?.uppercase;
    if (u === false) return val;
    if (u === "capitalize") return val.replace(/\\b\\w/g, c => c.toUpperCase());
    return val.toUpperCase();
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none"/>

      {/* Outer decorative dotted border — masqué pour Bouquet I (fleurs couvrent le bord) */}
      {!isFlowerBig3 && <rect x={W * 0.052} y={H * 0.032} width={W * 0.896} height={H * 0.936}
        fill="none" stroke={p.accent} strokeWidth="0.9" strokeDasharray="2,3.5" opacity="0.7"/>}
      {!isFlowerBig3 && <rect x={W * 0.068} y={H * 0.042} width={W * 0.864} height={H * 0.916}
        fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.35"/>}

      {/* Label — "save the date" */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.381, H * 0.055)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.408} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? (isFlowerBig3 ? "var(--font-pinyon)" : "var(--font-playfair)")}
            fontStyle={getFontStyle("label", "italic")}
            fontWeight={getFontWeight("label")}
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
        {selectedElement !== "names" && (<g>
          <text x={W / 2} y={H * 0.500} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "'Times New Roman', Georgia, serif"}
            fontWeight={getFontWeight("names", "400")}
            fontStyle={getFontStyle("names")}
            fontSize={getSize("names", W * 0.080)}
            fill={getColor("names", p.accent)}
            letterSpacing="3">
            {nameCase("names", name1Raw)}
          </text>
          <text x={W / 2} y={H * 0.560} textAnchor="middle"
            fontFamily="var(--font-script)"
            fontStyle={getFontStyle("names", "italic")}
            fontSize={W * 0.054}
            fill={getColor("names", p.textSecondary)}
            opacity="0.75">
            et
          </text>
          {name2Raw && (
            <text x={W / 2} y={H * 0.648} textAnchor="middle"
              fontFamily={elementStyles?.names?.font ?? "'Times New Roman', Georgia, serif"}
              fontWeight={getFontWeight("names", "400")}
              fontStyle={getFontStyle("names")}
              fontSize={getSize("names", W * 0.080)}
              fill={getColor("names", p.accent)}
              letterSpacing="3">
              {nameCase("names", name2Raw)}
            </text>
          )}
        </g>)}
      </g>

      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.725, H * 0.055)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.752} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")}
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
          {selectedElement === "location" && hl(H * 0.813, H * 0.055)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.840} textAnchor="middle"
              fontFamily={elementStyles?.location?.font ?? (isFlowerBig3 ? "var(--font-montserrat)" : "var(--font-serif)")}
              fontStyle={getFontStyle("location", isFlowerBig3 ? "normal" : "italic")}
              fontWeight={getFontWeight("location")}
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
        {selectedElement === "footer" && hl(H * 0.905, H * 0.060)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.935} textAnchor="middle"
            fontFamily={elementStyles?.footer?.font ?? (isFlowerBig3 ? "var(--font-pinyon)" : "var(--font-script)")}
            fontStyle={getFontStyle("footer", "italic")}
            fontWeight={getFontWeight("footer")}
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

function TemplateArbre({ W, H, paperImage, p, user, label, namesText, dateText, locationText, tagline,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string; tagline?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}) {
  const displayLabel    = label ?? "save the date";
  const displayNames    = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayTagline  = tagline ?? "vont se marier le";
  const displayDate     = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "18 octobre 2026");
  const displayLocation = locationText ?? user.location;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\\b\\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  const hl = (y: number, h: number) => (
    <rect x={W * 0.06} y={y} width={W * 0.88} height={h}
      fill="rgba(240,237,228,0.10)" stroke="rgba(240,237,228,0.45)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none"/>

      {/* SAVE THE DATE */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H * 0.249, H * 0.052)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.275} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("label")} fontWeight={getFontWeight("label")}
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
        {selectedElement === "names" && hl(H * 0.336, H * 0.108)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={H * 0.390} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "var(--font-script)"}
            fontStyle={getFontStyle("names", "italic")}
            fontWeight={getFontWeight("names")}
            fontSize={getSize("names", W * 0.112)}
            fill={getColor("names", p.textPrimary)}>
            {getCase("names", displayNames)}
          </text>
        )}
      </g>

      {/* "vont se marier le" — editable phrase */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("tagline"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("tagline")*W} ${getDY("tagline")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["tagline"]?.hidden ? "none" : undefined }}>
        {selectedElement === "tagline" && hl(H * 0.469, H * 0.052)}
        {selectedElement !== "tagline" && (
          <text x={W / 2} y={H * 0.497} textAnchor="middle"
            fontFamily={elementStyles?.tagline?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("tagline")} fontWeight={getFontWeight("tagline")}
            fontSize={getSize("tagline", W * 0.024)}
            fill={getColor("tagline", p.textSecondary)}
            letterSpacing="4"
            style={{ textTransform: "uppercase" as const }}
            opacity="0.8">
            {getCase("tagline", displayTagline)}
          </text>
        )}
      </g>

      {/* Date — large script */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.569, H * 0.102)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.620} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-script)"}
            fontStyle={getFontStyle("date", "italic")}
            fontWeight={getFontWeight("date")}
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
          {selectedElement === "location" && hl(H * 0.727, H * 0.050)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.752} textAnchor="middle"
              fontFamily={elementStyles?.location?.font ?? "var(--font-montserrat)"}
              fontStyle={getFontStyle("location")} fontWeight={getFontWeight("location")}
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

function TemplateItalySTD({ W, H, paperImage, p, user, label, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}) {
  const displayLabel    = label ?? "for";
  const displayFooter   = footer ?? "invitation à suivre";
  const displayNames    = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate     = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "18 octobre 2026");
  const displayLocation = locationText ?? user.location;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\\b\\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  const hl = (y: number, h: number) => (
    <rect x={W * 0.08} y={y} width={W * 0.84} height={h}
      fill="rgba(109,29,62,0.06)" stroke="rgba(109,29,62,0.35)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.eh:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <rect width={W} height={H} fill={p.bg}/>
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"/>

      {/* Static: SAVE */}
      <text x={W / 2} y={H * 0.270} textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontWeight="400"
        fontSize={W * 0.145}
        fill={p.textPrimary}
        letterSpacing="10"
        opacity="0.92">
        SAVE
      </text>

      {/* Static: "the" — script italic, sits between SAVE and DATE */}
      <text x={W / 2} y={H * 0.350} textAnchor="middle"
        fontFamily="var(--font-script)"
        fontStyle="italic"
        fontSize={W * 0.092}
        fill={p.accent}
        opacity="0.85">
        the
      </text>

      {/* Static: DATE */}
      <text x={W / 2} y={H * 0.440} textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontWeight="400"
        fontSize={W * 0.145}
        fill={p.textPrimary}
        letterSpacing="10"
        opacity="0.92">
        DATE
      </text>



      {/* Names — editable */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.522, H * 0.072)}
        {selectedElement !== "names" && (
          <text x={W / 2} y={H * 0.569} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "var(--font-serif)"}
            fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "500")}
            fontSize={getSize("names", W * 0.044)}
            fill={getColor("names", p.textPrimary)}
            letterSpacing="4">
            {getCase("names", displayNames.toUpperCase())}
          </text>
        )}
      </g>

      {/* Date — editable */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.627, H * 0.060)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.660} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-serif)"}
            fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")}
            fontSize={getSize("date", W * 0.034)}
            fill={getColor("date", p.textPrimary)}
            letterSpacing="1">
            {getCase("date", displayDate)}
          </text>
        )}
      </g>

      {/* Location — editable */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * 0.702, H * 0.055)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.735} textAnchor="middle"
              fontFamily={elementStyles?.location?.font ?? "var(--font-serif)"}
              fontStyle={getFontStyle("location", "italic")} fontWeight={getFontWeight("location")}
              fontSize={getSize("location", W * 0.028)}
              fill={getColor("location", p.textSecondary)}
              letterSpacing="1">
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}

      {/* Footer — script italic */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        {selectedElement === "footer" && hl(H * 0.840, H * 0.060)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.872} textAnchor="middle"
            fontFamily={elementStyles?.footer?.font ?? "var(--font-script)"}
            fontStyle={getFontStyle("footer", "italic")} fontWeight={getFontWeight("footer")}
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

function TemplateLettreBold({ W, H, paperImage, p, user, namesText, dateText, locationText, footer,
  selectedElement, onElementClick, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  namesText?: string; dateText?: string; locationText?: string; footer?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}) {
  const rawNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const parts = rawNames.split(/\s*(?:&|\bet\b)\s*/i);
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
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\\b\\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
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
      <text x={W / 2} y={H * 0.210} textAnchor="middle"
        fontFamily="var(--font-playfair)" fontWeight="700"
        fontSize={W * 0.148} fill={p.textPrimary} letterSpacing="-0.5">
        SAVE
      </text>

      {/* the */}
      <text x={W / 2} y={H * 0.272} textAnchor="middle"
        fontFamily="var(--font-script)" fontStyle="italic"
        fontSize={W * 0.062} fill={p.textSecondary} opacity="0.85">
        the
      </text>

      {/* DATE */}
      <text x={W / 2} y={H * 0.370} textAnchor="middle"
        fontFamily="var(--font-playfair)" fontWeight="700"
        fontSize={W * 0.148} fill={p.textPrimary} letterSpacing="-0.5">
        DATE
      </text>

      {/* Date line */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H * 0.409, H * 0.058)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={H * 0.438} textAnchor="middle"
            fontFamily="var(--font-serif)" fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date", "500")}
            fontSize={getSize("date", W * 0.050)} fill={getColor("date", p.textPrimary)}
            letterSpacing="3">
            {getCase("date", displayDate)}
          </text>
        )}
      </g>

      {/* "invitation à suivre" */}
      <text x={W / 2} y={H * 0.490} textAnchor="middle"
        fontFamily="var(--font-serif)" fontStyle="italic"
        fontSize={W * 0.026} fill={p.textSecondary} opacity="0.7">
        invitation à suivre
      </text>

      <line x1={W * 0.30} y1={H * 0.512} x2={W * 0.70} y2={H * 0.512} stroke={p.accent} strokeWidth="0.6" opacity="0.35"/>

      {/* Names block */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "eh" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H * 0.528, H * 0.252)}
        {selectedElement !== "names" && (<g>
          <text x={W / 2} y={H * 0.590} textAnchor="middle"
            fontFamily="var(--font-playfair)" fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "700")}
            fontSize={getSize("names", W * 0.088)} fill={getColor("names", p.textPrimary)}
            letterSpacing="2">
            {elementStyles?.["names"]?.uppercase === false ? name1Raw : elementStyles?.["names"]?.uppercase === "capitalize" ? name1Raw.charAt(0).toUpperCase() + name1Raw.slice(1).toLowerCase() : name1Raw.toUpperCase()}
          </text>
          <text x={W / 2} y={H * 0.652} textAnchor="middle"
            fontFamily="var(--font-serif)" fontStyle="italic"
            fontSize={W * 0.026} fill={p.textSecondary} opacity="0.65">
            et
          </text>
          {name2Raw && (
            <text x={W / 2} y={H * 0.720} textAnchor="middle"
              fontFamily="var(--font-playfair)" fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "700")}
              fontSize={getSize("names", W * 0.088)} fill={getColor("names", p.textPrimary)}
              letterSpacing="2">
              {elementStyles?.["names"]?.uppercase === false ? name2Raw : elementStyles?.["names"]?.uppercase === "capitalize" ? name2Raw.charAt(0).toUpperCase() + name2Raw.slice(1).toLowerCase() : name2Raw.toUpperCase()}
            </text>
          )}
        </g>)}
      </g>

      <line x1={W * 0.30} y1={H * 0.760} x2={W * 0.70} y2={H * 0.760} stroke={p.accent} strokeWidth="0.6" opacity="0.35"/>

      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "eh" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H * 0.796, H * 0.052)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W / 2} y={H * 0.822} textAnchor="middle"
              fontFamily="var(--font-montserrat)"
              fontStyle={getFontStyle("location")} fontWeight={getFontWeight("location")}
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
        {selectedElement === "footer" && hl(H * 0.866, H * 0.052)}
        {selectedElement !== "footer" && (
          <text x={W / 2} y={H * 0.892} textAnchor="middle"
            fontFamily="var(--font-serif)" fontStyle={getFontStyle("footer", "italic")} fontWeight={getFontWeight("footer")}
            fontSize={getSize("footer", W * 0.024)} fill={getColor("footer", p.textSecondary)}
            opacity="0.65">
            {getCase("footer", displayFooter)}
          </text>
        )}
      </g>
    </svg>
  );
}

function TemplatePhotoTexte({ W, H, p, user, label, footer, namesText, dateText, locationText, photoUrl,
  selectedElement, onElementClick, onPhotoClick, elementStyles }: {
  W: number; H: number; p: Palette; user: UserData;
  label?: string; footer?: string; namesText?: string; dateText?: string; locationText?: string; photoUrl?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  onPhotoClick?: () => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}) {
  const displayLabel    = label ?? "Save the date";
  const displayFooter   = footer || "pour célébrer le mariage de";
  const displayNames    = namesText || `${user.p1 || "Emma"} & ${user.p2 || "Charlie"}`;
  const displayDate     = dateText || (user.date ? (() => { const d = new Date(user.date + "T12:00:00"); return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; })() : "01.05.2027");
  const displayLocation = locationText ?? user.location;
  const photo           = photoUrl ?? "/photo_couple/couple_4.jpg";
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX    = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY    = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle  = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400")    => { const v = elementStyles?.[id]?.bold;   return v !== undefined ? (v ? "700"    : def)      : def; };
  const hl = (y: number, h: number) => (
    <rect x={W*0.04} y={y} width={W*0.92} height={h}
      fill="rgba(255,255,255,0.12)" stroke="rgba(0,0,0,0.30)"
      strokeWidth="0.8" strokeDasharray="3,2.5" rx="3"/>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}
      onClick={onElementClick ? () => onElementClick(null) : undefined}>
      {onElementClick && <style>{`.pth:hover text{opacity:0.45;transition:opacity 120ms}`}</style>}
      <image href={photo} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"
        onClick={(onPhotoClick || onElementClick) ? e => {
          e.stopPropagation();
          if (selectedElement && onElementClick) { onElementClick(null); }
          else if (onPhotoClick) { onPhotoClick(); }
        } : undefined}
        style={{ cursor: onPhotoClick ? "pointer" : "default" }}/>
      {/* Label */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("label"); } : undefined}
        className={onElementClick ? "pth" : undefined}
        transform={`translate(${getDX("label")*W} ${getDY("label")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {selectedElement === "label" && hl(H*0.058, H*0.096)}
        {selectedElement !== "label" && (
          <text x={W/2} y={H*0.140} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? "var(--font-brittany)"}
            fontStyle={getFontStyle("label","normal")} fontWeight={getFontWeight("label")}
            fontSize={getSize("label", W*0.120)} fill={getColor("label","#0A0A0A")}>
            {getCase("label", displayLabel)}
          </text>
        )}
      </g>
      {/* Footer subtitle */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("footer"); } : undefined}
        className={onElementClick ? "pth" : undefined}
        transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        {selectedElement === "footer" && hl(H*0.222, H*0.038)}
        {selectedElement !== "footer" && (
          <text x={W/2} y={H*0.245} textAnchor="middle"
            fontFamily={elementStyles?.footer?.font ?? "var(--font-libre-baskerville)"}
            fontStyle={getFontStyle("footer","normal")} fontWeight={getFontWeight("footer")}
            fontSize={getSize("footer", W*0.030)} fill={getColor("footer", p.accent)}>
            {getCase("footer", displayFooter)}
          </text>
        )}
      </g>
      {/* Names */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("names"); } : undefined}
        className={onElementClick ? "pth" : undefined}
        transform={`translate(${getDX("names")*W} ${getDY("names")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        {selectedElement === "names" && hl(H*0.328, H*0.058)}
        {selectedElement !== "names" && (
          <text x={W/2} y={H*0.370} textAnchor="middle"
            fontFamily={elementStyles?.names?.font ?? "var(--font-libre-baskerville)"}
            fontWeight={getFontWeight("names","700")} fontStyle={getFontStyle("names")}
            fontSize={getSize("names", W*0.070)} fill={getColor("names","#0A0A0A")}>
            {getCase("names", displayNames)}
          </text>
        )}
      </g>
      {/* Date */}
      <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("date"); } : undefined}
        className={onElementClick ? "pth" : undefined}
        transform={`translate(${getDX("date")*W} ${getDY("date")*H})`}
        style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        {selectedElement === "date" && hl(H*0.430, H*0.038)}
        {selectedElement !== "date" && (
          <text x={W/2} y={H*0.455} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-sans)"}
            fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")}
            fontSize={getSize("date", W*0.028)} fill={getColor("date", p.accent)}>
            {getCase("date", displayDate)}
          </text>
        )}
      </g>
      {/* Location */}
      {(displayLocation || onElementClick) && (
        <g onClick={onElementClick ? e => { e.stopPropagation(); onElementClick("location"); } : undefined}
          className={onElementClick ? "pth" : undefined}
          transform={`translate(${getDX("location")*W} ${getDY("location")*H})`}
          style={{ cursor: onElementClick ? "pointer" : "default", display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          {selectedElement === "location" && hl(H*0.492, H*0.038)}
          {selectedElement !== "location" && displayLocation && (
            <text x={W/2} y={H*0.515} textAnchor="middle"
              fontFamily={elementStyles?.location?.font ?? "var(--font-sans)"}
              fontStyle={getFontStyle("location")} fontWeight={getFontWeight("location")}
              fontSize={getSize("location", W*0.028)} fill={getColor("location","#333333")}>
              {getCase("location", displayLocation)}
            </text>
          )}
        </g>
      )}
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
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}) {
  const displayLabel = label ?? "save the date";
  const displayDate = dateText || (user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "18 octobre 2026");
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;

  const fX = W * 0.225; const fY = H * 0.21;
  const fW = W * 0.550; const fH = H * 0.48;
  const pX = fX + W * 0.016; const pY = fY + H * 0.013;
  const pW = fW - W * 0.032; const pH = fH - H * 0.050;

  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\\b\\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
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
        {selectedElement === "label" && hl(H * 0.093, H * 0.058)}
        {selectedElement !== "label" && (
          <text x={W / 2} y={H * 0.122} textAnchor="middle"
            fontFamily={elementStyles?.label?.font ?? "var(--font-script)"}
            fontStyle={getFontStyle("label", "italic")} fontWeight={getFontWeight("label")}
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
            fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names")}
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
        {selectedElement === "date" && hl(fY + fH + H * 0.057, H * 0.050)}
        {selectedElement !== "date" && (
          <text x={W / 2} y={fY + fH + H * 0.082} textAnchor="middle"
            fontFamily={elementStyles?.date?.font ?? "var(--font-script)"}
            fontStyle={getFontStyle("date", "italic")} fontWeight={getFontWeight("date")}
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

function TemplateRender({ id, W, H, palette, user, isStd, photoUrl, photoUrls, fontPreset, label, namesText, namesConnector, dateText, locationText, footer, tagline,
  selectedElement, onElementClick, onPhotoClick, onPhotoSlotClick, elementStyles, customPaperBg }: {
  id: string; W: number; H: number; palette: Palette; user: UserData; isStd: boolean;
  photoUrl?: string; photoUrls?: string[]; fontPreset?: string;
  label?: string; namesText?: string; namesConnector?: string; dateText?: string; locationText?: string; footer?: string; tagline?: string;
  selectedElement?: string | null;
  onElementClick?: (id: string | null) => void;
  onPhotoClick?: () => void;
  onPhotoSlotClick?: (index: number) => void;
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
  customPaperBg?: string;
}) {
  const tplCfg = TEMPLATES.find(t => t.id === id);
  const effectivePhotoUrl = photoUrl || tplCfg?.defaultPhotoUrl;
  if (id === "photomaton") {
    const defaultUrls = tplCfg?.defaultPhotoUrls ?? [];
    const urls = (photoUrls && photoUrls.length > 0)
      ? defaultUrls.map((def, i) => photoUrls[i] || def)
      : defaultUrls;
    return <TemplatePhotomaton W={W} H={H} p={palette} user={user}
      label={label} namesText={namesText} dateText={dateText} photoUrls={urls}
      selectedElement={selectedElement} onElementClick={onElementClick}
      onPhotoClick={onPhotoSlotClick} elementStyles={elementStyles} customPaperBg={customPaperBg}/>;
  }
  if (id === "dentelle") return <TemplateDentelle W={W} H={H} p={palette} user={user} photoUrl={effectivePhotoUrl}
    fontPreset={fontPreset} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
    selectedElement={selectedElement} onElementClick={onElementClick} onPhotoClick={onPhotoClick} elementStyles={elementStyles}
    customPaperBg={customPaperBg}/>;
  if (id === "oliviers") return <TemplateOliviers W={W} H={H} p={palette} user={user} fontPreset={fontPreset}
    label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
    selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}/>;
  if (id === "rayures")  return <TemplateRayures  W={W} H={H} p={palette} user={user} isStd={isStd} customPaperBg={customPaperBg}
    label={label} namesText={namesText} namesConnector={namesConnector} dateText={dateText} locationText={locationText} footer={!footer || footer === "invitation à suivre" ? "pour le mariage de" : footer}
    selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}/>;
  if (id === "photo-texte" || tplCfg?.layoutVariant === "photo-texte")
    return <TemplatePhotoTexte W={W} H={H} p={palette} user={user} label={label} footer={!footer || footer === "invitation à suivre" ? "pour le mariage de" : footer} namesText={namesText}
      dateText={dateText} locationText={locationText} photoUrl={effectivePhotoUrl}
      selectedElement={selectedElement} onElementClick={onElementClick}
      onPhotoClick={onPhotoClick ? () => onPhotoClick() : undefined}
      elementStyles={elementStyles}/>;
  if (tplCfg?.paperImage) {
    // Per-template default styles (user-saved values take priority per property)
    const _tplDefs: Record<string, Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>> = {
      "lettre-flower-big-3": {
        label:    { dy: -0.1485, font: "var(--font-pinyon)" },
        names:    { dy: -0.0780, color: "#676647" },
        date:     { dy: -0.0638, font: "var(--font-montserrat)", color: "#676647" },
        location: { dy: -0.1000, font: "var(--font-montserrat)" },
        footer:   { dy: -0.1377, font: "var(--font-pinyon)", size: 0.65, color: "#676647" },
      },
      "motifs": {
        names: { size: 0.62, font: "var(--font-montserrat)", italic: false },
      },
    };
    const _def = _tplDefs[id];
    const _effStyles = _def
      ? (() => {
          const keys = [...new Set([...Object.keys(_def), ...Object.keys(elementStyles ?? {})])];
          return Object.fromEntries(keys.map(k => [k, { ..._def[k], ...(elementStyles?.[k] ?? {}) }]));
        })()
      : elementStyles;
    if (tplCfg.layoutVariant === "elegant")
      return <TemplateElegant W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
        selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={_effStyles} tplId={id}/>;
    if (tplCfg.layoutVariant === "arbres")
      return <TemplateArbre W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        label={label} namesText={namesText} dateText={dateText} locationText={locationText} tagline={tagline}
        selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={_effStyles}/>;
    if (tplCfg.layoutVariant === "italy")
      return <TemplateItalySTD W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
        selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}/>;
    if (tplCfg.layoutVariant === "bold")
      return <TemplateLettreBold W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        namesText={namesText} dateText={dateText} locationText={locationText} footer={footer}
        selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}/>;
    if (tplCfg.layoutVariant === "photo")
      return <TemplateLettrPhoto W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
        label={label} namesText={namesText} dateText={dateText}
        photoUrl={effectivePhotoUrl} selectedElement={selectedElement} onElementClick={onElementClick}
        onPhotoClick={onPhotoClick} elementStyles={elementStyles}/>;
    return <TemplateLettre W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user}
      fontPreset={fontPreset} label={label} namesText={namesText} namesConnector={namesConnector} dateText={dateText} locationText={locationText} footer={footer}
      selectedElement={selectedElement} onElementClick={onElementClick} elementStyles={elementStyles}
      paperFit={tplCfg.paperFit} tplId={id} isStd={isStd}/>;
  }
  return null;
}

/* ═══════════════════════════════════════════════
   CARD FOLD ANIMATION MODAL
   3-act animation:
     0 → cover seule (single page, slightly tilted)
     1 → livre ouvert (2 pages côte-à-côte)
     2 → page gauche se rabat derrière page droite
     3 → page droite seule (template design)
═══════════════════════════════════════════════ */

function CardFoldModal({ tpl, paletteId, user, isStd, fontPreset, label, namesText, namesConnector, dateText, locationText, footer, tagline, photoUrl, photoUrls, elementStyles, customPaperBg, onClose, inline }: {
  tpl: TemplateConfig; paletteId: string; user: UserData; isStd: boolean;
  fontPreset?: string;
  label?: string; namesText?: string; namesConnector?: string; dateText?: string; locationText?: string; footer?: string; tagline?: string; photoUrl?: string; photoUrls?: string[];
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
  customPaperBg?: string;
  onClose: () => void;
  inline?: boolean;
}) {
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];

  const [reducedMotion] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // 0: cover seule  1: livre ouvert  2: rabattement  3: page droite seule
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(reducedMotion ? 3 : 0);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 2000 + 2200);
    const t3 = setTimeout(() => setPhase(3), 2000 + 2200 + 3000 + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [reducedMotion, restartKey]);

  function handleReplay() {
    setPhase(0);
    setRestartKey(k => k + 1);
  }

  const W = inline ? 400 : 460;
  const H = Math.round(W * 1.4);

  const displayNames = namesText || (user.p1 && user.p2 ? `${user.p1} & ${user.p2}` : "Emma & Louis");
  const displayDate  = user.date
    ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "12 juillet 2026";
  const displayLabel = label || "Save the Date";

  /* ── Géométrie — double porte (miroir du volet unique original) ─────
   z' = -x_rel · sin(θ)  (formule CSS rotateY)

   Volet gauche : left=W/2, width=W/2, pivot=right center → spine x=W
     x_rel bord gauche = -W/2  →  z' = (W/2)·sin(θ)
     phase 0 : rotateY(+180°) → covers [W,1.5W], face arrière visible ✓
     phase 1 : rotateY(0°)    → passe par 90° z'=+W/2 vers spectateur ✓
     phase 2 : rotateY(-180°) → passe par -90° z'=-W/2 → derrière ✓

   Volet droit : left=2W, width=W/2, pivot=left center → spine x=2W
     x_rel bord droit = +W/2  →  z' = -(W/2)·sin(θ)
     phase 0 : rotateY(-180°) → covers [1.5W,2W], face arrière visible ✓
     phase 1 : rotateY(0°)    → passe par -90° z'=+W/2 vers spectateur ✓
     phase 2 : rotateY(+180°) → passe par +90° z'=-W/2 → derrière ✓
   ─────────────────────────────────────────────── */

  const OPEN_EASE = "2.2s linear";
  const FOLD_EASE = "3.0s cubic-bezier(0.2, 0, 0.15, 1)";

  // Volet gauche : même logique que l'ancien volet unique
  const leftFlapAngle  = phase === 0 ?  180 : phase === 1 ? 0 : -180;
  // Volet droit : miroir exact
  const rightFlapAngle = phase === 0 ? -180 : phase === 1 ? 0 :  180;

  // Volets : s'effacent en fin de rabattement
  const flapTransition = phase === 0
    ? "transform 0.001s linear"
    : phase === 1 ? `transform ${OPEN_EASE}`
    : phase === 2 ? `transform ${FOLD_EASE}, opacity 0.8s ease 2.2s`
    : "none";

  // Sceau : disparition naturelle via backfaceVisibility en phase 1.
  // En phase 2, snap opacity:0 immédiat (sceau déjà invisible à ce moment) → ne peut plus réapparaître.
  const sealTransition = phase === 0
    ? "transform 0.001s linear"
    : phase === 1 ? `transform ${OPEN_EASE}`
    : phase === 2 ? `transform ${FOLD_EASE}, opacity 0s`
    : "none";

  const flapPaperImage = "/papier%20lettre/Fond%20papier/Papier_1.png";
  const paperFace = (position: "left" | "right", back?: boolean): React.CSSProperties => ({
    position: "absolute", inset: 0,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
    ...(back ? { transform: "rotateY(180deg)" } : {}),
    backgroundImage: `url('${flapPaperImage}')`,
    backgroundSize: `${W}px ${H}px`,
    backgroundPosition: position === "left" ? "left center" : "right center",
  });

  return (
    <div
      className={inline ? "w-full h-full flex flex-col items-center justify-center gap-6 overflow-hidden" : "fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"}
      style={inline ? {} : {
        backgroundImage: "url('/fond/marbre.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {!inline && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(109,29,62,0.12)", color: "#6D1D3E" }}
        >
          <X size={18}/>
        </button>
      )}

      {/* ── 3D scene — position:relative pour ancrer les boutons absolus ── */}
      <div style={{ position: "relative", perspective: "1800px", perspectiveOrigin: "50% 50%", overflow: "visible" }}>

        {/* Book container — 2W, centré sur le template [W,2W] via translateX(-W/2) constant */}
        <div style={{
          position: "relative",
          width: 2 * W,
          height: H,
          transformStyle: "preserve-3d",
          transform: `translateX(${-W / 2}px)`,
        }}>

          {/* ── Template ── */}
          <div style={{
            position: "absolute", left: W, top: 0, width: W, height: H,
            opacity: phase === 0 ? 0 : 1,
            transition: phase === 1 ? "opacity 0.5s ease 0s" : "none",
          }}>
            <TemplateRender
              id={tpl.id} W={W} H={H} palette={palette} user={user} isStd={isStd}
              fontPreset={fontPreset} label={label} namesText={namesText} namesConnector={namesConnector}
              dateText={dateText} locationText={locationText} footer={footer} tagline={tagline}
              photoUrl={photoUrl} photoUrls={photoUrls} elementStyles={elementStyles} customPaperBg={customPaperBg}
            />
          </div>

          {/* ── Volet gauche : left=W/2, pivot=right(x=W), +180°→0°→-180° ── */}
          <div style={{
            position: "absolute", left: W / 2, top: 0, width: W / 2, height: H,
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
            transform: `rotateY(${leftFlapAngle}deg)`,
            transition: flapTransition,
            opacity: phase >= 2 ? 0 : 1,
            boxShadow: "0 0 20px rgba(0,0,0,0.13)",
          }}>
            {/* face avant — ombre vers le pli (bord droit) */}
            <div style={paperFace("left")} />
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], background: "linear-gradient(to left, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.02) 35%, transparent 60%)", pointerEvents: "none" }} />
            {/* face arrière — ombre vers le pli (bord gauche visuel = bord droit CSS après flip) */}
            <div style={paperFace("left", true)} />
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], transform: "rotateY(180deg)", background: "linear-gradient(to right, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 35%, transparent 60%)", pointerEvents: "none" }} />
          </div>

          {/* ── Volet droit : left=2W, pivot=left(x=2W), -180°→0°→+180° ── */}
          <div style={{
            position: "absolute", left: 2 * W, top: 0, width: W / 2, height: H,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            transform: `rotateY(${rightFlapAngle}deg)`,
            transition: flapTransition,
            opacity: phase >= 2 ? 0 : 1,
            boxShadow: "0 0 20px rgba(0,0,0,0.13)",
          }}>
            {/* face avant — ombre vers le pli (bord gauche) */}
            <div style={paperFace("right")} />
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], background: "linear-gradient(to right, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.02) 35%, transparent 60%)", pointerEvents: "none" }} />
            {/* face arrière — ombre vers le pli (bord droit visuel = bord gauche CSS après flip) */}
            <div style={paperFace("right", true)} />
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], transform: "rotateY(180deg)", background: "linear-gradient(to left, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 35%, transparent 60%)", pointerEvents: "none" }} />
          </div>

          {/* ── Sceau en cire ──────────────────────────────────────────────────
               Élément indépendant dans le book container.
               Wrapper à left=W (= pivot du volet gauche, x=W dans le book).
               Le sceau est placé à W/2 à droite du pivot = joint entre les volets (x=1.5W).
               Rotation = leftFlapAngle+180° : visible quand la face arrière du volet est vers nous,
               invisible (backfaceVisibility:hidden) quand la face avant est vers nous.
               Pas de débordement possible car le sceau est libre dans le contexte 3D. ── */}
          <div style={{
            position: "absolute", left: W, top: 0, width: 0, height: H,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            transform: `rotateY(${leftFlapAngle + 180}deg)`,
            transition: sealTransition,
            opacity: phase >= 2 ? 0 : 1,
          }}>
            <div style={{
              position: "absolute",
              left: W / 2,
              top: "50%",
              width: Math.round(W * 0.42),
              height: Math.round(W * 0.42),
              transform: "translate(-50%, -50%)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
              pointerEvents: "none",
            }}>
              <img
                src="/papier%20lettre/Cire/cire-rouge.png"
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>

        </div>

      {/* Buttons — à droite de la carte (modal) ou dessous (inline) */}
      {phase === 3 && !inline && (
        <div style={{
          position: "absolute",
          left: Math.round(W * 1.5) + 32,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          animation: "invitation-appear 0.45s ease forwards",
        }}>
          <button onClick={handleReplay} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
            style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>
            <RotateCcw size={14}/> Revoir l'animation
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{ backgroundColor: "rgba(109,29,62,0.08)", color: "#6D1D3E", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>
            Retour
          </button>
        </div>
      )}

      </div>{/* fin 3D scene */}

      {/* Bouton rejouer en mode inline — absolu bas gauche */}
      {inline && phase === 3 && (
        <button onClick={handleReplay}
          className="absolute flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ left: 28, top: "50%", transform: "translateY(-50%)", backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px rgba(109,29,62,0.3)", animation: "invitation-appear 0.45s ease forwards" }}>
          <RotateCcw size={14}/> Revoir
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CARD FLIP ANIMATION (inline)
═══════════════════════════════════════════════ */

function CardFlipScene({ tpl, paletteId, user, isStd, fontPreset, label, namesText, namesConnector, dateText, locationText, footer, tagline, photoUrl, photoUrls, elementStyles, customPaperBg }: {
  tpl: TemplateConfig; paletteId: string; user: UserData; isStd: boolean;
  fontPreset?: string; label?: string; namesText?: string; namesConnector?: string; dateText?: string;
  locationText?: string; footer?: string; tagline?: string; photoUrl?: string; photoUrls?: string[];
  elementStyles?: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
  customPaperBg?: string;
}) {
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];
  const W = 400; const H = Math.round(W * 1.4);
  const [flipped, setFlipped] = useState(true);
  const [done, setDone]       = useState(false);
  const [key, setKey]         = useState(0);

  useEffect(() => {
    setFlipped(true); setDone(false);
    const t1 = setTimeout(() => setFlipped(false), 700);
    const t2 = setTimeout(() => setDone(true), 700 + 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [key]);

  const backImage = "/papier%20lettre/Fond%20papier/Papier_1.png";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ position: "relative", perspective: "1400px" }}>
      <div style={{
        width: W, height: H,
        transformStyle: "preserve-3d",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        transition: flipped ? "none" : "transform 3s cubic-bezier(0.4, 0, 0.15, 1)",
        boxShadow: "0 12px 44px rgba(0,0,0,0.28)",
      }}>
        {/* Front */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", overflow: "hidden" }}>
          <TemplateRender id={tpl.id} W={W} H={H} palette={palette} user={user} isStd={isStd}
            fontPreset={fontPreset} label={label} namesText={namesText} namesConnector={namesConnector}
            dateText={dateText} locationText={locationText} footer={footer} tagline={tagline}
            photoUrl={photoUrl} photoUrls={photoUrls}
            elementStyles={elementStyles} customPaperBg={customPaperBg}/>
        </div>
        {/* Back */}
        <div style={{
          position: "absolute", inset: 0,
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          backgroundImage: `url('${backImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}/>
      </div>

      {done && (
        <button onClick={() => setKey(k => k + 1)}
          className="absolute flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ left: 28, top: "50%", transform: "translateY(-50%)", backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px rgba(109,29,62,0.3)", animation: "invitation-appear 0.45s ease forwards" }}>
          <RotateCcw size={14}/> Revoir
        </button>
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

  const hasPaperImages = tpl.palettes.every(p => p.paperImage);
  const isCustomActive = !hasPaperImages && !!cardCustom.customPaperBg;
  const activeLabel = isCustomActive ? "Personnalisé" : tpl.palettes.find(p => p.id === paletteId)?.label;
  // Masquer "Fond du papier" si le template a une image papier fixe (pas modifiable par palette)
  const hidePaperBg = !!tpl.paperImage && !hasPaperImages;

  return (
    <div className="flex flex-col gap-6">

      {/* Couleur du papier */}
      {!hidePaperBg && (tpl.palettes.length > 1 || !hasPaperImages) && <div>
        <p style={sec}>Fond du papier</p>
        <div className="flex gap-2.5 flex-wrap">
          {tpl.palettes.map(p => {
            const active = !isCustomActive && paletteId === p.id;
            return (
              <button key={p.id} onClick={() => { onPaletteChange(p.id); onCardCustomChange({ ...cardCustom, customPaperBg: undefined }); }} title={p.label}
                style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: p.bg,
                  backgroundImage: (!p.noImageSwatch && p.paperImage) ? `url(${p.paperImage})` : undefined,
                  backgroundSize: p.swatchSize ?? "cover",
                  backgroundPosition: p.swatchPos ?? "center",
                  border: `1.5px solid rgba(0,0,0,0.08)`,
                  boxShadow: active ? `0 0 0 2.5px white, 0 0 0 4.5px #6D1D3E` : "0 1px 4px rgba(0,0,0,0.14)",
                  transform: active ? "scale(1.15)" : "scale(1)",
                  transition: "all 130ms",
                  padding: 0,
                }}
              />
            );
          })}
          {/* Custom color swatch — hidden for paper-image templates */}
          {!hasPaperImages && (
            <>
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
            </>
          )}
        </div>
        <p className="text-xs mt-2" style={{ color: "rgba(44,44,44,0.38)", fontFamily: "var(--font-display)" }}>
          {activeLabel}
        </p>
      </div>}


    </div>
  );
}

/* ═══════════════════════════════════════════════
   ELEMENT STYLE PANEL
═══════════════════════════════════════════════ */

function ElementStylePanel({ elementId, cardCustom, onCardCustomChange, palette, user, onClose }: {
  elementId: string;
  cardCustom: CardCustomization;
  onCardCustomChange: (next: CardCustomization) => void;
  palette: Palette;
  user: UserData;
  onClose: () => void;
}) {
  // Backup au montage — "Annuler" restaure cet état
  const [backup] = useState<CardCustomization>(() => cardCustom);
  const style = cardCustom.styles[elementId] ?? {};

  const sec: React.CSSProperties = {
    fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const,
    color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)",
  };
  const sub: React.CSSProperties = {
    fontSize: "0.65rem", color: "rgba(44,44,44,0.42)", fontFamily: "var(--font-display)",
    fontWeight: 500, marginBottom: 6, display: "block",
  };
  function updateStyle(updates: { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }) {
    onCardCustomChange({
      ...cardCustom,
      styles: { ...cardCustom.styles, [elementId]: { ...style, ...updates } },
    });
  }
  function handleCancel() { onCardCustomChange(backup); onClose(); }
  function handleConfirm() { onClose(); }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p style={sec}>{ELEMENT_LABELS[elementId] ?? elementId}</p>
        <div className="flex items-center gap-2">
          <button onClick={handleCancel}
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "rgba(44,44,44,0.07)", color: "rgba(44,44,44,0.55)", fontFamily: "var(--font-display)" }}>
            Annuler
          </button>
          <button onClick={handleConfirm}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#6D1D3E", color: "white" }}>
            <Check size={13} strokeWidth={2.5}/>
          </button>
        </div>
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
        <span style={sub}>Majuscule</span>
        <div className="flex gap-2">
          {(["capitalize", true] as const).map(variant => {
            const isActive = style.uppercase === variant;
            return (
              <button key={String(variant)}
                onClick={() => updateStyle({ uppercase: isActive ? undefined : variant })}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.88rem",
                  textTransform: variant === true ? "uppercase" : "none",
                  backgroundColor: isActive ? "rgba(109,29,62,0.08)" : "rgba(255,255,255,0.7)",
                  border: `1.5px solid ${isActive ? "rgba(109,29,62,0.25)" : "transparent"}`,
                  color: isActive ? "#6D1D3E" : "#2c2c2c",
                }}>
                {variant === true ? "AA" : "Aa"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Style */}
      <div>
        <span style={sub}>Style</span>
        <div className="flex gap-2">
          <button
            onClick={() => updateStyle({ italic: style.italic === true ? undefined : true })}
            className="flex-1 py-2 rounded-xl text-sm transition-all"
            style={{
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: "0.9rem",
              backgroundColor: style.italic === true ? "rgba(109,29,62,0.08)" : "rgba(255,255,255,0.7)",
              border: `1.5px solid ${style.italic === true ? "rgba(109,29,62,0.25)" : "transparent"}`,
              color: style.italic === true ? "#6D1D3E" : "#2c2c2c",
              fontWeight: 500,
            }}>
            I
          </button>
          <button
            onClick={() => updateStyle({ bold: style.bold === true ? undefined : true })}
            className="flex-1 py-2 rounded-xl text-sm transition-all"
            style={{
              fontWeight: style.bold === true ? 700 : 500,
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              backgroundColor: style.bold === true ? "rgba(109,29,62,0.08)" : "rgba(255,255,255,0.7)",
              border: `1.5px solid ${style.bold === true ? "rgba(109,29,62,0.25)" : "transparent"}`,
              color: style.bold === true ? "#6D1D3E" : "#2c2c2c",
            }}>
            G
          </button>
        </div>
      </div>

      {/* Date format — shown only when editing the date element */}
      {elementId === "date" && (() => {
        const d = user.date ? new Date(user.date + "T12:00:00") : null;
        const pad = (n: number) => String(n).padStart(2, "0");
        const formats = d ? [
          {
            label: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)}`,
            value: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)}`,
          },
          {
            label: `${pad(d.getDate())} | ${pad(d.getMonth() + 1)} | ${d.getFullYear()}`,
            value: `${pad(d.getDate())} | ${pad(d.getMonth() + 1)} | ${d.getFullYear()}`,
          },
          {
            label: d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
            value: d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          },
          {
            label: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
            value: d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
          },
        ] : [
          { label: "26.07.27", value: "26.07.27" },
          { label: "01 | 01 | 2026", value: "01 | 01 | 2026" },
          { label: "1 janvier 2026", value: "1 janvier 2026" },
          { label: "Jeudi 1er janvier 2026", value: "Jeudi 1er janvier 2026" },
        ];
        return (
          <div>
            <span style={sub}>Format de date</span>
            <div className="flex flex-col gap-1.5">
              {formats.map(f => {
                const isActive = (cardCustom.dateText || "") === f.value;
                return (
                  <button key={f.value}
                    onClick={() => onCardCustomChange({ ...cardCustom, dateText: f.value })}
                    className="px-3 py-2 rounded-xl text-left transition-all"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.78rem",
                      backgroundColor: isActive ? "rgba(109,29,62,0.08)" : "rgba(255,255,255,0.7)",
                      border: `1.5px solid ${isActive ? "rgba(109,29,62,0.25)" : "transparent"}`,
                      color: isActive ? "#6D1D3E" : "#2c2c2c",
                    }}>
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DETAIL VIEW
═══════════════════════════════════════════════ */

function DetailView({ tpl, paletteId, onPaletteChange, isStd, user, onUserChange, envCfg, onEnvelopeChange, cardCustom, onCardCustomChange, onAnimate, onBack, onSave, cardSaved }: {
  tpl: TemplateConfig; paletteId: string; onPaletteChange: (id: string) => void;
  isStd: boolean; user: UserData; onUserChange: (next: UserData) => void;
  envCfg: EnvelopeConfig; onEnvelopeChange: (next: EnvelopeConfig) => void;
  cardCustom: CardCustomization; onCardCustomChange: (next: CardCustomization) => void;
  onAnimate: () => void; onBack: () => void;
  onSave?: () => void; cardSaved?: boolean;
}) {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];
  const cardW = 360;
  const cardH = Math.round(cardW * 1.4); // 504
  const photoInputRef = useRef<HTMLInputElement>(null);
  const currentPhotoSlot = useRef<number | null>(null);

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
    reader.onload = e => {
      const url = e.target?.result as string ?? "";
      const slot = currentPhotoSlot.current;
      if (slot !== null) {
        const tplCfg = TEMPLATES.find(t => t.id === tpl.id);
        const base = cardCustom.photoUrls?.length ? [...cardCustom.photoUrls] : (tplCfg?.defaultPhotoUrls ? [...tplCfg.defaultPhotoUrls] : ["", "", "", ""]);
        while (base.length < 4) base.push("");
        base[slot] = url;
        onCardCustomChange({ ...cardCustom, photoUrls: base });
      } else {
        onCardCustomChange({ ...cardCustom, photoUrl: url });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      {/* Hidden photo file input */}
      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { if (e.target.files?.[0]) handlePhotoFile(e.target.files[0]); e.target.value = ""; }}/>

      {/* Content */}
      <div className="mx-auto px-8 py-10 flex flex-col md:flex-row gap-10 items-start" style={{ maxWidth: 860 }}>

        {/* Left: card preview */}
        <div className="flex-shrink-0 flex flex-col items-center">
          {(
            /* Outer relative wrapper so inline input overlay isn't clipped */
            <div style={{ position: "relative", width: cardW, height: cardH }}>
              {/* SVG card */}
              <div style={{ position: "absolute", inset: 0, overflow: "hidden", boxShadow: "0 12px 44px rgba(109,29,62,0.15)" }}>
                <TemplateRender id={tpl.id} W={cardW} H={cardH} palette={palette} user={user} isStd={isStd}
                  photoUrl={cardCustom.photoUrl || undefined}
                  photoUrls={cardCustom.photoUrls}
                  fontPreset={cardCustom.fontPreset} label={cardCustom.label}
                  namesText={cardCustom.namesText} namesConnector={cardCustom.namesConnector}
                  dateText={cardCustom.dateText} locationText={cardCustom.locationText || undefined}
                  footer={cardCustom.footer || undefined} tagline={cardCustom.tagline}
                  selectedElement={selectedElement} onElementClick={setSelectedElement}
                  onPhotoClick={() => { currentPhotoSlot.current = null; photoInputRef.current?.click(); }}
                  onPhotoSlotClick={i => { currentPhotoSlot.current = i; photoInputRef.current?.click(); }}
                  elementStyles={cardCustom.styles} customPaperBg={cardCustom.customPaperBg}/>
              </div>
              {/* Inline text input overlay */}
              {selectedElement && (() => {
                const fp = FONT_PRESETS.find(f => f.id === cardCustom.fontPreset) ?? FONT_PRESETS[0];
                const photoY = cardH * 0.30;
                const photoH_ = cardH * 0.37;
                type ElemCfg = { y: number; fs: number; fontType: "script" | "body"; opacity: number };
                const isPhotomaton    = tpl.id === "photomaton";
                const isLettrModerne  = tpl.id === "lettre-moderne";
                const isRayures       = tpl.id === "rayures";
                const isOliviers      = tpl.id === "oliviers";
                const isPhotoTexte    = tpl.id === "photo-texte";
                const isLettrePhoto   = !!tpl.paperImage && tpl.layoutVariant === "photo";
                const isLettreArbres  = !!tpl.paperImage && tpl.layoutVariant === "arbres";
                const isLettreBold    = !!tpl.paperImage && tpl.layoutVariant === "bold";
                const isLettreElegant = !!tpl.paperImage && tpl.layoutVariant === "elegant";
                const isFlowerBig3    = tpl.id === "lettre-flower-big-3";
                const isLettreItaly   = !!tpl.paperImage && tpl.layoutVariant === "italy";
                const isLettre = !!tpl.paperImage;
                const fY_photo = cardH * 0.21; const fH_photo = cardH * 0.48;
                const elems: Record<string, ElemCfg> = isPhotomaton ? {
                  label: { y: cardH * 0.064, fs: cardW * 0.030, fontType: "body",   opacity: 0.85 },
                  names: { y: cardH * 0.100, fs: cardW * 0.022, fontType: "body",   opacity: 1 },
                  date:  { y: cardH * 0.940, fs: cardW * 0.046, fontType: "script", opacity: 0.9 },
                } : isRayures ? {
                  monogram: { y: cardH * 0.115, fs: cardW * 0.050, fontType: "body",   opacity: 1 },
                  label:    { y: cardH * 0.225, fs: cardW * 0.028, fontType: "body",   opacity: 0.7 },
                  names:    { y: cardH * 0.536, fs: cardW * 0.060, fontType: "body",   opacity: 1 },
                  tagline:  { y: cardH * 0.290, fs: cardW * 0.027, fontType: "body",   opacity: 0.65 },
                  date:     { y: cardH * 0.780, fs: cardW * 0.028, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.848, fs: cardW * 0.025, fontType: "body",   opacity: 1 },
                } : isOliviers ? {
                  label:    { y: cardH * 0.22,  fs: cardW * 0.062, fontType: "script", opacity: 0.9 },
                  names:    { y: cardH * 0.38,  fs: cardW * 0.072, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.52,  fs: cardW * 0.030, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.577, fs: cardW * 0.027, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.835, fs: cardW * 0.042, fontType: "script", opacity: 0.75 },
                } : isLettreElegant ? {
                  label:    { y: cardH * 0.408, fs: cardW * 0.046, fontType: "body",   opacity: 1 },
                  names:    { y: cardH * 0.560, fs: cardW * 0.054, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.752, fs: cardW * 0.026, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.840, fs: cardW * 0.030, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.935, fs: cardW * 0.052, fontType: "script", opacity: 0.75 },
                } : isLettreArbres ? {
                  label:    { y: cardH * 0.275, fs: cardW * 0.028, fontType: "body",   opacity: 0.9 },
                  names:    { y: cardH * 0.390, fs: cardW * 0.112, fontType: "script", opacity: 1 },
                  tagline:  { y: cardH * 0.497, fs: cardW * 0.024, fontType: "body",   opacity: 0.8 },
                  date:     { y: cardH * 0.620, fs: cardW * 0.090, fontType: "script", opacity: 1 },
                  location: { y: cardH * 0.752, fs: cardW * 0.025, fontType: "body",   opacity: 0.85 },
                } : isLettrePhoto ? {
                  label:    { y: cardH * 0.122,                       fs: cardW * 0.042, fontType: "script", opacity: 0.85 },
                  names:    { y: fY_photo + fH_photo + cardH * 0.030, fs: cardW * 0.026, fontType: "body",   opacity: 1 },
                  date:     { y: fY_photo + fH_photo + cardH * 0.082, fs: cardW * 0.040, fontType: "script", opacity: 0.82 },
                } : isLettreBold ? {
                  names:    { y: cardH * 0.652, fs: cardW * 0.088, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.438, fs: cardW * 0.050, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.822, fs: cardW * 0.025, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.892, fs: cardW * 0.024, fontType: "script", opacity: 0.65 },
                } : isLettreItaly ? {
                  label:    { y: cardH * 0.497, fs: cardW * 0.030, fontType: "body",   opacity: 0.75 },
                  names:    { y: cardH * 0.569, fs: cardW * 0.044, fontType: "body",   opacity: 1 },
                  date:     { y: cardH * 0.660, fs: cardW * 0.034, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.735, fs: cardW * 0.028, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.872, fs: cardW * 0.042, fontType: "script", opacity: 0.75 },
                } : isLettrModerne ? {
                  lmLabel1:    { y: cardH * 0.245, fs: cardW * 0.042, fontType: "body",   opacity: 0.9 },
                  lmLabel2:    { y: cardH * 0.295, fs: cardW * 0.042, fontType: "body",   opacity: 1 },
                  lmName1:     { y: cardH * 0.44,  fs: cardW * 0.115, fontType: "script", opacity: 1 },
                  lmConnector: { y: cardH * 0.535, fs: cardW * 0.038, fontType: "body",   opacity: 1 },
                  lmName2:     { y: cardH * 0.64,  fs: cardW * 0.115, fontType: "script", opacity: 1 },
                  date:        { y: cardH * 0.72,  fs: cardW * 0.030, fontType: "body",   opacity: 1 },
                  location:    { y: cardH * 0.79,  fs: cardW * 0.028, fontType: "body",   opacity: 1 },
                } : isLettre ? {
                  label:    { y: cardH * 0.22,  fs: cardW * 0.062, fontType: "script", opacity: 0.9 },
                  names:    { y: cardH * 0.38,  fs: cardW * 0.072, fontType: "script", opacity: 1 },
                  date:     { y: cardH * 0.52,  fs: cardW * 0.030, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.577, fs: cardW * 0.027, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.835, fs: cardW * 0.042, fontType: "script", opacity: 0.75 },
                } : isPhotoTexte ? {
                  label:    { y: cardH * 0.140, fs: cardW * 0.120, fontType: "script", opacity: 1 },
                  footer:   { y: cardH * 0.245, fs: cardW * 0.030, fontType: "body",   opacity: 1 },
                  names:    { y: cardH * 0.370, fs: cardW * 0.070, fontType: "body",   opacity: 1 },
                  date:     { y: cardH * 0.455, fs: cardW * 0.028, fontType: "body",   opacity: 1 },
                  location: { y: cardH * 0.515, fs: cardW * 0.028, fontType: "body",   opacity: 1 },
                } : {
                  label:    { y: cardH * 0.13,                        fs: cardW * 0.056, fontType: "script", opacity: 0.88 },
                  names:    { y: cardH * 0.23,                        fs: cardW * 0.038, fontType: "body",   opacity: 1 },
                  date:     { y: photoY + photoH_ + cardH * 0.095,    fs: cardW * 0.031, fontType: "body",   opacity: 1 },
                  location: { y: photoY + photoH_ + cardH * 0.145,    fs: cardW * 0.028, fontType: "body",   opacity: 1 },
                  footer:   { y: cardH * 0.92,                        fs: cardW * 0.048, fontType: "script", opacity: 0.55 },
                };
                const cfg = elems[selectedElement];
                if (!cfg) return null;
                // Monogram: toolbar only (initials derive from names, not independently editable)
                if (selectedElement === "monogram") {
                  return (
                    <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: Math.max(4, cardH * 0.038 - 34), right: 6, display: "flex", gap: 4, zIndex: 10 }}>
                      <button onClick={e => { e.stopPropagation(); handleDelete(); }} title="Supprimer"
                        style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid rgba(200,40,40,0.22)", boxShadow: "0 1px 4px rgba(0,0,0,0.14)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#C82828" }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  );
                }
                const isScript = cfg.fontType === "script";
                const elStyle = cardCustom.styles[selectedElement] ?? {};

                const isDentelle = !isLettre && !isRayures && !isOliviers;
                const tplSizeDef: Record<string, number> = {
                  ...(isDentelle ? { names: 1.3 } : {}),
                  ...(tpl.id === "motifs" ? { names: 0.62 } : {}),
                };
                const fs = cfg.fs * (elStyle.size ?? tplSizeDef[selectedElement] ?? 1);

                // Per-template default font/style/weight — must match what the SVG renders
                type TplFontDef = { font: string; style: string; weight: string };
                const tplFontMap: Record<string, TplFontDef> = isPhotomaton ? {
                  label: { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  names: { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  date:  { font: "var(--font-script)",     style: "normal", weight: "400" },
                } : isRayures ? {
                  monogram: { font: "var(--font-serif)",      style: "italic", weight: "400" },
                  label:    { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  names:    { font: "var(--font-playfair)",   style: "normal", weight: "700" },
                  tagline:  { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  date:     { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  location: { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                } : isLettreElegant ? {
                  label:    { font: isFlowerBig3 ? "var(--font-pinyon)"     : "var(--font-playfair)",              style: "italic", weight: "400" },
                  names:    { font: "'Times New Roman', Georgia, serif",  style: "normal", weight: "400" },
                  date:     { font: "var(--font-montserrat)",             style: "normal", weight: "400" },
                  location: { font: isFlowerBig3 ? "var(--font-montserrat)" : "var(--font-serif)",                style: isFlowerBig3 ? "normal" : "italic", weight: "400" },
                  footer:   { font: isFlowerBig3 ? "var(--font-pinyon)"     : "var(--font-script)",               style: "italic", weight: "400" },
                } : isLettreArbres ? {
                  label:    { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  names:    { font: tpl.id === "motifs" ? "var(--font-montserrat)" : "var(--font-script)", style: tpl.id === "motifs" ? "normal" : "italic", weight: "400" },
                  tagline:  { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  date:     { font: "var(--font-script)",     style: "italic", weight: "400" },
                  location: { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                } : isLettreBold ? {
                  names:    { font: "var(--font-playfair)",   style: "normal", weight: "700" },
                  date:     { font: "var(--font-serif)",      style: "normal", weight: "500" },
                  location: { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  footer:   { font: "var(--font-serif)",      style: "italic", weight: "400" },
                } : isLettreItaly ? {
                  label:    { font: "var(--font-serif)",  style: "italic", weight: "400" },
                  names:    { font: "var(--font-serif)",  style: "normal", weight: "500" },
                  date:     { font: "var(--font-serif)",  style: "normal", weight: "400" },
                  location: { font: "var(--font-serif)",  style: "italic", weight: "400" },
                  footer:   { font: "var(--font-script)", style: "italic", weight: "400" },
                } : isLettrePhoto ? {
                  label:    { font: "var(--font-script)",     style: "italic", weight: "400" },
                  names:    { font: "var(--font-montserrat)", style: "normal", weight: "400" },
                  date:     { font: "var(--font-script)",     style: "italic", weight: "400" },
                } : isLettrModerne ? {
                  lmLabel1:    { font: "var(--font-libre-baskerville)", style: "normal", weight: "400" },
                  lmLabel2:    { font: "var(--font-libre-baskerville)", style: "normal", weight: "400" },
                  lmName1:     { font: "var(--font-brittany)",          style: "normal", weight: "400" },
                  lmConnector: { font: "var(--font-libre-baskerville)", style: "italic", weight: "400" },
                  lmName2:     { font: "var(--font-brittany)",          style: "normal", weight: "400" },
                  date:        { font: "var(--font-libre-baskerville)", style: "italic", weight: "400" },
                  location:    { font: "var(--font-libre-baskerville)", style: "italic", weight: "400" },
                } : isPhotoTexte ? {
                  label:    { font: "var(--font-brittany)",          style: "normal", weight: "400" },
                  footer:   { font: "var(--font-libre-baskerville)", style: "normal", weight: "400" },
                  names:    { font: "var(--font-libre-baskerville)", style: "normal", weight: "700" },
                  date:     { font: "var(--font-sans)",             style: "normal", weight: "400" },
                  location: { font: "var(--font-sans)",             style: "normal", weight: "400" },
                } : isOliviers ? {
                  label:    { font: fp.scriptFont, style: fp.scriptItalic ? "italic" : "normal", weight: "400" },
                  names:    { font: fp.scriptFont, style: fp.scriptItalic ? "italic" : "normal", weight: "400" },
                  date:     { font: fp.bodyFont,   style: "normal", weight: "400" },
                  location: { font: fp.bodyFont,   style: "italic", weight: "400" },
                  footer:   { font: fp.scriptFont, style: fp.scriptItalic ? "italic" : "normal", weight: "400" },
                } : isDentelle ? {
                  label:    { font: "var(--font-pinyon)",  style: "normal", weight: "400" },
                  names:    { font: fp.bodyFont,           style: "normal", weight: "400" },
                  date:     { font: fp.bodyFont,           style: "normal", weight: "400" },
                  location: { font: fp.bodyFont,           style: "normal", weight: "400" },
                  footer:   { font: fp.scriptFont,         style: fp.scriptItalic ? "italic" : "normal", weight: "400" },
                } : {
                  // TemplateLettre — uses fontPreset
                  label:    { font: fp.scriptFont, style: fp.scriptItalic ? "italic" : "normal", weight: "400" },
                  names:    { font: fp.scriptFont, style: fp.scriptItalic ? "italic" : "normal", weight: "400" },
                  date:     { font: fp.bodyFont,   style: "normal", weight: "500" },
                  location: { font: fp.bodyFont,   style: "italic", weight: "400" },
                  footer:   { font: fp.scriptFont, style: fp.scriptItalic ? "italic" : "normal", weight: "400" },
                };
                const tplDef = tplFontMap[selectedElement];
                const hasUserFont = !!elStyle.font;
                const elementFont  = elStyle.font ?? tplDef?.font ?? (isScript ? fp.scriptFont : fp.bodyFont);
                const tplFontStyle = hasUserFont ? (isScript && fp.scriptItalic ? "italic" : "normal") : (tplDef?.style ?? "normal");
                const tplFontWeight = hasUserFont ? "400" : (tplDef?.weight ?? "400");
                const fontStyle    = elStyle.italic !== undefined ? (elStyle.italic ? "italic" : "normal") : tplFontStyle;
                const fontWeight   = elStyle.bold   !== undefined ? (elStyle.bold   ? "700"    : "400")    : tplFontWeight;
                const elementColor = elStyle.color ?? palette.textPrimary;

                // Per-template default visual style (textTransform + letterSpacing) — must match SVG
                type TplVisualDef = { textTransform: string; letterSpacing: number };
                const tplVisualMap: Record<string, TplVisualDef> = isPhotomaton ? {
                  label: { textTransform: "uppercase", letterSpacing: 4 },
                  names: { textTransform: "none",      letterSpacing: 3 },
                  date:  { textTransform: "none",      letterSpacing: 0 },
                } : isRayures ? {
                  monogram: { textTransform: "none",      letterSpacing: 0 },
                  label:    { textTransform: "uppercase", letterSpacing: 4 },
                  names:    { textTransform: "uppercase", letterSpacing: 0 },
                  tagline:  { textTransform: "uppercase", letterSpacing: 2.5 },
                  date:     { textTransform: "uppercase", letterSpacing: 1.5 },
                  location: { textTransform: "none",      letterSpacing: 1 },
                } : isOliviers ? {
                  label:    { textTransform: "none", letterSpacing: 0 },
                  names:    { textTransform: "none", letterSpacing: 0 },
                  date:     { textTransform: "none", letterSpacing: 2 },
                  location: { textTransform: "none", letterSpacing: 1.5 },
                  footer:   { textTransform: "none", letterSpacing: 0 },
                } : isLettreElegant ? {
                  label:    { textTransform: "none",      letterSpacing: 0 },
                  names:    { textTransform: "uppercase", letterSpacing: 3 },
                  date:     { textTransform: "uppercase", letterSpacing: 3.5 },
                  location: { textTransform: "none",      letterSpacing: 0 },
                  footer:   { textTransform: "none",      letterSpacing: 0 },
                } : isLettreArbres ? {
                  label:    { textTransform: "uppercase", letterSpacing: 5 },
                  names:    { textTransform: "none",      letterSpacing: 0 },
                  tagline:  { textTransform: "uppercase", letterSpacing: 4 },
                  date:     { textTransform: "none",      letterSpacing: 0 },
                  location: { textTransform: "uppercase", letterSpacing: 4 },
                } : isLettreItaly ? {
                  label:    { textTransform: "none",      letterSpacing: 0 },
                  names:    { textTransform: "uppercase", letterSpacing: 4 },
                  date:     { textTransform: "none",      letterSpacing: 1 },
                  location: { textTransform: "none",      letterSpacing: 1 },
                  footer:   { textTransform: "none",      letterSpacing: 0 },
                } : isLettreBold ? {
                  names:    { textTransform: "uppercase", letterSpacing: 2 },
                  date:     { textTransform: "none",      letterSpacing: 3 },
                  location: { textTransform: "uppercase", letterSpacing: 3.5 },
                  footer:   { textTransform: "none",      letterSpacing: 0 },
                } : isLettrePhoto ? {
                  label:    { textTransform: "none",      letterSpacing: 0 },
                  names:    { textTransform: "uppercase", letterSpacing: 3 },
                  date:     { textTransform: "none",      letterSpacing: 0 },
                } : isDentelle ? {
                  label:    { textTransform: "none",      letterSpacing: 0 },
                  names:    { textTransform: "none",      letterSpacing: 3 },
                  date:     { textTransform: "none",      letterSpacing: 2.5 },
                  location: { textTransform: "none",      letterSpacing: 2.5 },
                  footer:   { textTransform: "none",      letterSpacing: 0 },
                } : isLettrModerne ? {
                  lmLabel1:    { textTransform: "none", letterSpacing: 0 },
                  lmLabel2:    { textTransform: "none", letterSpacing: 0 },
                  lmName1:     { textTransform: "none", letterSpacing: 0 },
                  lmConnector: { textTransform: "none", letterSpacing: 0 },
                  lmName2:     { textTransform: "none", letterSpacing: 0 },
                  date:        { textTransform: "none", letterSpacing: 0 },
                  location:    { textTransform: "none", letterSpacing: 0 },
                } : isPhotoTexte ? {
                  label:    { textTransform: "none", letterSpacing: 0 },
                  footer:   { textTransform: "none", letterSpacing: 0 },
                  names:    { textTransform: "none", letterSpacing: 0 },
                  date:     { textTransform: "none", letterSpacing: 0 },
                  location: { textTransform: "none", letterSpacing: 0 },
                } : {
                  // TemplateLettre (autres)
                  label:    { textTransform: "none", letterSpacing: 0 },
                  names:    { textTransform: "none", letterSpacing: 0 },
                  date:     { textTransform: "none", letterSpacing: 2 },
                  location: { textTransform: "none", letterSpacing: 1.5 },
                  footer:   { textTransform: "none", letterSpacing: 0 },
                };
                const tplVisualDef = tplVisualMap[selectedElement] ?? { textTransform: "none", letterSpacing: 0 };
                const effectiveTextTransform = elStyle.uppercase === true ? "uppercase"
                  : elStyle.uppercase === "capitalize" ? "capitalize"
                  : elStyle.uppercase === false ? "none"
                  : tplVisualDef.textTransform;
                const dyOffset = (elStyle.dy ?? 0) * cardH;
                const _d = user.date ? new Date(user.date + "T12:00:00") : null;
                const pad2 = (n: number) => String(n).padStart(2, "0");
                const fmtDateFallback = _d
                  ? _d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                  : "Samedi 18 octobre 2026";
                const fmtDateShort = _d
                  ? _d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  : "18 octobre 2026";
                const fmtDateBold = _d
                  ? `${pad2(_d.getDate())} | ${pad2(_d.getMonth()+1)} | ${String(_d.getFullYear()).slice(-2)}`
                  : "18 | 10 | 26";
                const fmtDatePhotomaton = _d
                  ? `${pad2(_d.getDate())} . ${pad2(_d.getMonth()+1)} . ${String(_d.getFullYear()).slice(-2)}`
                  : "22 . 10 . 26";
                const fmtDatePhotoTexte = _d
                  ? `${pad2(_d.getDate())}.${pad2(_d.getMonth()+1)}.${_d.getFullYear()}`
                  : "01.05.2027";
                const defaultDate = cardCustom.dateText || (
                  isPhotomaton   ? fmtDatePhotomaton :
                  isLettreBold   ? fmtDateBold :
                  isPhotoTexte   ? fmtDatePhotoTexte :
                  (isOliviers || isLettreItaly || isLettrePhoto) ? fmtDateShort :
                  fmtDateFallback
                );
                const rawLabelText = cardCustom.label ?? "save the date";
                const lmLabelParts = (cardCustom.label ?? "save the date\ninvitation à suivre").split("\n");
                const lmLabel1Val = lmLabelParts[0] ?? "save the date";
                const lmLabel2Val = lmLabelParts[1] ?? "invitation à suivre";
                const lmNameParts = (cardCustom.namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`).split(/\s*(?:&|\bet\b)\s*/i);
                const lmN1Val = (lmNameParts[0] ?? "").trim() || (user.p1 || "Ève");
                const lmN2Val = (lmNameParts[1] ?? "").trim() || (user.p2 || "Antoine");
                const lmConnVal = cardCustom.namesConnector ?? "et";
                const textMap: Record<string, string> = {
                  label:       isDentelle ? rawLabelText.charAt(0).toUpperCase() + rawLabelText.slice(1) : rawLabelText,
                  names: (() => {
                    const raw = cardCustom.namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
                    if (isLettreElegant || isRayures || isOliviers || isLettreBold) return raw.replace(/\s*&\s*/g, " et ");
                    return raw;
                  })(),
                  lmLabel1:    lmLabel1Val,
                  lmLabel2:    lmLabel2Val,
                  lmName1:     lmN1Val,
                  lmConnector: lmConnVal,
                  lmName2:     lmN2Val,
                  date:        defaultDate,
                  location:    cardCustom.locationText || user.location,
                  footer:      (isPhotoTexte || isRayures) ? (!cardCustom.footer || cardCustom.footer === "invitation à suivre" ? "pour le mariage de" : cardCustom.footer) : (cardCustom.footer ?? "invitation à suivre"),
                  tagline:     isLettreArbres ? (cardCustom.tagline ?? "vont se marier le") : ((!cardCustom.footer || cardCustom.footer === "invitation à suivre") && isRayures ? "pour le mariage de" : (cardCustom.footer ?? "sont heureux de vous inviter")),
                };
                const currentText = textMap[selectedElement] ?? "";
                function handleInlineChange(value: string) {
                  const next = { ...cardCustom };
                  if (selectedElement === "label") next.label = value;
                  else if (selectedElement === "lmLabel1") next.label = value + "\n" + lmLabel2Val;
                  else if (selectedElement === "lmLabel2") next.label = lmLabel1Val + "\n" + value;
                  else if (selectedElement === "names") next.namesText = value;
                  else if (selectedElement === "lmName1") next.namesText = value + (lmN2Val ? " & " + lmN2Val : "");
                  else if (selectedElement === "lmName2") next.namesText = (lmN1Val ? lmN1Val + " & " : "") + value;
                  else if (selectedElement === "lmConnector") next.namesConnector = value;
                  else if (selectedElement === "date") next.dateText = value;
                  else if (selectedElement === "location") next.locationText = value;
                  else if (selectedElement === "tagline") { if (isLettreArbres) next.tagline = value; else next.footer = value; }
                  else if (selectedElement === "footer") next.footer = value;
                  onCardCustomChange(next);
                }
                const isRayuresNames     = isRayures && selectedElement === "names";
                const isLettreMoLabel    = isLettrModerne && selectedElement === "label";
                const isLettreMoLabel1   = isLettrModerne && selectedElement === "lmLabel1";
                const isLettreMoLabel2   = isLettrModerne && selectedElement === "lmLabel2";
                const isLettreMoName1    = isLettrModerne && selectedElement === "lmName1";
                const isLettreMoConn     = isLettrModerne && selectedElement === "lmConnector";
                const isLettreMoName2    = isLettrModerne && selectedElement === "lmName2";
                const inputTop = isRayuresNames
                  ? cardH * 0.352 + dyOffset
                  : cfg.y + dyOffset - fs * 1.5;
                const inputHeight = isRayuresNames ? cardH * 0.315 : fs * 3;
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
                    {isLettreMoLabel1 ? (() => {
                      const f = cardW * 0.042;
                      const color = cardCustom.styles?.lmLabel1?.color ?? palette.textPrimary;
                      const font = cardCustom.styles?.lmLabel1?.font ?? "var(--font-libre-baskerville)";
                      return (
                        <input autoFocus autoComplete="off" value={lmLabel1Val}
                          onChange={e => handleInlineChange(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", left: 0, width: "100%", background: "transparent", WebkitBoxShadow: "0 0 0px 1000px transparent inset", border: "none", outline: "none", textAlign: "center", color, WebkitTextFillColor: color, caretColor: color, padding: 0, boxSizing: "border-box", lineHeight: "1", top: cardH * 0.245 - f * 0.82, height: f * 1.4, fontFamily: font, fontSize: f }}
                        />
                      );
                    })() : isLettreMoLabel2 ? (() => {
                      const f = cardW * 0.042;
                      const color = cardCustom.styles?.lmLabel2?.color ?? palette.textPrimary;
                      const font = cardCustom.styles?.lmLabel2?.font ?? "var(--font-libre-baskerville)";
                      return (
                        <input autoFocus autoComplete="off" value={lmLabel2Val}
                          onChange={e => handleInlineChange(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", left: 0, width: "100%", background: "transparent", WebkitBoxShadow: "0 0 0px 1000px transparent inset", border: "none", outline: "none", textAlign: "center", color, WebkitTextFillColor: color, caretColor: color, padding: 0, boxSizing: "border-box", lineHeight: "1", top: cardH * 0.295 - f * 0.82, height: f * 1.4, fontFamily: font, fontSize: f }}
                        />
                      );
                    })() : isLettreMoName1 ? (() => {
                      const nameFs = cardW * 0.115;
                      const nameFont = cardCustom.styles?.lmName1?.font ?? "var(--font-brittany)";
                      const nameColor = cardCustom.styles?.lmName1?.color ?? palette.textPrimary;
                      return (
                        <input autoFocus autoComplete="off" value={lmN1Val}
                          onChange={e => handleInlineChange(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", left: 0, width: "100%", background: "transparent", WebkitBoxShadow: "0 0 0px 1000px transparent inset", border: "none", outline: "none", textAlign: "center", color: nameColor, WebkitTextFillColor: nameColor, caretColor: nameColor, padding: 0, boxSizing: "border-box", lineHeight: "1", top: cardH * 0.44 - nameFs * 0.82, height: nameFs * 1.4, fontFamily: nameFont, fontSize: nameFs }}
                        />
                      );
                    })() : isLettreMoConn ? (() => {
                      const connFs = cardW * 0.038;
                      const connColor = cardCustom.styles?.lmConnector?.color ?? palette.textPrimary;
                      return (
                        <input autoFocus autoComplete="off" value={lmConnVal}
                          onChange={e => handleInlineChange(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", left: 0, width: "100%", background: "transparent", WebkitBoxShadow: "0 0 0px 1000px transparent inset", border: "none", outline: "none", textAlign: "center", color: connColor, WebkitTextFillColor: connColor, caretColor: connColor, padding: 0, boxSizing: "border-box", lineHeight: "1", top: cardH * 0.535 - connFs * 0.82, height: connFs * 1.4, fontFamily: "var(--font-libre-baskerville)", fontSize: connFs, fontStyle: "italic" }}
                        />
                      );
                    })() : isLettreMoName2 ? (() => {
                      const nameFs = cardW * 0.115;
                      const nameFont = cardCustom.styles?.lmName2?.font ?? "var(--font-brittany)";
                      const nameColor = cardCustom.styles?.lmName2?.color ?? palette.textPrimary;
                      return (
                        <input autoFocus autoComplete="off" value={lmN2Val}
                          onChange={e => handleInlineChange(e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", left: 0, width: "100%", background: "transparent", WebkitBoxShadow: "0 0 0px 1000px transparent inset", border: "none", outline: "none", textAlign: "center", color: nameColor, WebkitTextFillColor: nameColor, caretColor: nameColor, padding: 0, boxSizing: "border-box", lineHeight: "1", top: cardH * 0.64 - nameFs * 0.82, height: nameFs * 1.4, fontFamily: nameFont, fontSize: nameFs }}
                        />
                      );
                    })() : isLettreMoLabel ? (() => {
                      const lParts = currentText.split("\n");
                      const l1 = lParts[0] ?? "save the date";
                      const l2 = lParts[1] ?? "invitation à suivre";
                      const fs1 = cardW * 0.042;
                      const fs2 = cardW * 0.042;
                      const labelFont = cardCustom.styles?.label?.font ?? "var(--font-libre-baskerville)";
                      const labelColor = cardCustom.styles?.label?.color ?? palette.textPrimary;
                      const sharedStyle: React.CSSProperties = {
                        position: "absolute",
                        left: 0,
                        width: "100%",
                        background: "transparent",
                        WebkitBoxShadow: "0 0 0px 1000px transparent inset",
                        border: "none",
                        outline: "none",
                        textAlign: "center",
                        color: labelColor,
                        WebkitTextFillColor: labelColor,
                        caretColor: labelColor,
                        padding: 0,
                        boxSizing: "border-box",
                        fontStyle: "italic",
                        lineHeight: "1",
                      };
                      return (
                        <>
                          <input
                            autoFocus
                            autoComplete="off"
                            value={l1}
                            onChange={e => {
                              const next = { ...cardCustom };
                              next.label = e.target.value + "\n" + l2;
                              onCardCustomChange(next);
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              ...sharedStyle,
                              top: cardH * 0.245 - fs1 * 0.82,
                              height: fs1 * 1.4,
                              fontFamily: labelFont,
                              fontSize: fs1,
                            }}
                          />
                          <input
                            autoComplete="off"
                            value={l2}
                            onChange={e => {
                              const next = { ...cardCustom };
                              next.label = l1 + "\n" + e.target.value;
                              onCardCustomChange(next);
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              ...sharedStyle,
                              top: cardH * 0.295 - fs2 * 0.82,
                              height: fs2 * 1.4,
                              fontFamily: labelFont,
                              fontSize: fs2,
                            }}
                          />
                        </>
                      );
                    })() : isRayuresNames ? (() => {
                      // 3 separate inputs, each matching the exact SVG font/size of its row,
                      // so cursor x-position aligns with the visible glyphs.
                      const rParts = currentText.split(/\s*[&]\s*/);
                      const n1 = (rParts[0] ?? "").trim();
                      const n2 = (rParts[1] ?? "").trim();
                      const conn = cardCustom.namesConnector ?? "and";
                      const nameFs = cardW * 0.13;
                      const connFs = cardW * 0.1;
                      const nameFont = cardCustom.styles?.names?.font ?? "var(--font-playfair)";
                      const sharedInputStyle: React.CSSProperties = {
                        position: "absolute",
                        left: 0,
                        width: "100%",
                        background: "transparent",
                        WebkitBoxShadow: "0 0 0px 1000px transparent inset",
                        border: "none",
                        outline: "none",
                        textAlign: "center",
                        color: "transparent",
                        WebkitTextFillColor: "transparent",
                        caretColor: palette.textPrimary,
                        padding: 0,
                        boxSizing: "border-box",
                      };
                      return (
                        <>
                          {/* name1 — Playfair bold uppercase */}
                          <input
                            autoFocus
                            autoComplete="off"
                            value={n1}
                            onChange={e => {
                              const next = { ...cardCustom };
                              next.namesText = e.target.value + (n2.trim() ? " & " + n2 : "");
                              onCardCustomChange(next);
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              ...sharedInputStyle,
                              top: cardH * 0.375 - nameFs * 0.9,
                              height: nameFs * 1.2,
                              fontFamily: nameFont,
                              fontWeight: "700",
                              fontSize: nameFs,
                              lineHeight: nameFs * 1.2 + "px",
                              textTransform: "uppercase",
                            }}
                          />
                          {/* connector — script font, matches SVG "and" */}
                          <input
                            autoComplete="off"
                            value={conn}
                            onChange={e => {
                              const next = { ...cardCustom };
                              next.namesConnector = e.target.value;
                              onCardCustomChange(next);
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              ...sharedInputStyle,
                              top: cardH * 0.46 - connFs * 0.85,
                              height: connFs * 1.2,
                              fontFamily: "var(--font-script)",
                              fontWeight: "400",
                              fontSize: connFs,
                              lineHeight: connFs * 1.2 + "px",
                            }}
                          />
                          {/* name2 — Playfair bold uppercase */}
                          <input
                            autoComplete="off"
                            value={n2}
                            onChange={e => {
                              const next = { ...cardCustom };
                              next.namesText = (n1.trim() ? n1 + " & " : "") + e.target.value;
                              onCardCustomChange(next);
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{
                              ...sharedInputStyle,
                              top: cardH * 0.57 - nameFs * 0.9,
                              height: nameFs * 1.2,
                              fontFamily: nameFont,
                              fontWeight: "700",
                              fontSize: nameFs,
                              lineHeight: nameFs * 1.2 + "px",
                              textTransform: "uppercase",
                            }}
                          />
                        </>
                      );
                    })() : (
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
                          height: inputHeight,
                          background: "transparent",
                          WebkitBoxShadow: "0 0 0px 1000px transparent inset",
                          border: "none",
                          outline: "none",
                          textAlign: "center",
                          fontFamily: elementFont,
                          fontStyle,
                          fontWeight,
                          fontSize: fs,
                          color: elementColor,
                          WebkitTextFillColor: elementColor,
                          opacity: cfg.opacity,
                          padding: 0,
                          lineHeight: "normal",
                          boxSizing: "border-box",
                          caretColor: elementColor,
                          textTransform: effectiveTextTransform as React.CSSProperties["textTransform"],
                          letterSpacing: tplVisualDef.letterSpacing,
                        }}
                      />
                    )}
                  </>
                );
              })()}
            </div>
          )}
          {!selectedElement && (
            <p className="mt-3 text-xs text-center" style={{ color: "rgba(44,44,44,0.32)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              Cliquez sur un texte pour le modifier
            </p>
          )}
        </div>

        {/* Right: options panel */}
        <div className="flex flex-col gap-5" style={{ minWidth: 260, maxWidth: 280, flex: 1 }}>
          {selectedElement ? (
            <ElementStylePanel
              elementId={selectedElement}
              cardCustom={cardCustom}
              onCardCustomChange={onCardCustomChange}
              palette={palette}
              user={user}
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
          )}

          <div className="border-t border-[#f0e6e2] pt-1 flex flex-col gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: cardSaved ? "#2a7a4b" : "rgba(109,29,62,0.08)", color: cardSaved ? "white" : "#6D1D3E", fontFamily: "var(--font-display)", border: `1.5px solid ${cardSaved ? "#2a7a4b" : "rgba(109,29,62,0.2)"}` }}
              >
                {cardSaved ? <><Check size={14}/> Enregistré</> : <><Save size={14}/> Enregistrer</>}
              </button>
            )}
            <button onClick={onAnimate}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}>
              <span>Choisir l&apos;animation</span>
              <ArrowRight size={16}/>
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
              className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
              style={{ color: "rgba(44,44,44,0.38)", fontFamily: "var(--font-display)" }}
              title="Revenir au design initial">
              <RotateCcw size={14}/> Design initial
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

function GalleryCard({ tpl, paletteId, user, isStd, isChosen, onClick }: {
  tpl: TemplateConfig; paletteId: string; user: UserData; isStd: boolean; isChosen?: boolean; onClick: () => void;
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
      style={{
        backgroundColor: "#fff",
        boxShadow: isChosen ? "0 0 0 2.5px #6D1D3E, 0 4px 20px rgba(109,29,62,0.18)" : "0 4px 20px rgba(109,29,62,0.1)",
      }}
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
        {isChosen && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold z-10"
            style={{ backgroundColor: "#6D1D3E", color: "#fff", fontFamily: "var(--font-display)", boxShadow: "0 2px 8px rgba(109,29,62,0.35)" }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Design choisi
          </div>
        )}
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
            <div key={p.id} className="w-3 h-3 rounded-full" style={{
              backgroundColor: p.bg,
              backgroundImage: (!p.noImageSwatch && p.paperImage) ? `url(${p.paperImage})` : undefined,
              backgroundSize: p.swatchSize ?? "cover",
              backgroundPosition: p.swatchPos ?? "center",
              border: "1px solid rgba(0,0,0,0.12)",
            }}/>
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
  const [stdPlan, setStdPlan] = useState<"essentiel" | "premium" | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingContext, setPricingContext] = useState<"publish" | "invites">("publish");
  const [checkoutLoading, setCheckoutLoading] = useState<"essentiel" | "premium" | null>(null);
  const [stdPaidSuccess, setStdPaidSuccess] = useState<"essentiel" | "premium" | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<"accueil" | "design" | "personnalisation" | "animation" | "envoi" | "invites" | "reponses">("accueil");
  const [mode, setMode] = useState<"gallery" | "detail" | "animate">("gallery");
  const [animationType, setAnimationType] = useState<"ouverture" | "retournement" | "rien">("ouverture");
  const [animBg, setAnimBg] = useState<string>("marble");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);
  const [cardSaved, setCardSaved] = useState(false);
  const [paletteIds, setPaletteIds] = useState<Record<string, string>>({});
  const [envCfg, setEnvCfg] = useState<EnvelopeConfig>(DEFAULT_ENVELOPE);
  const [cardCustom, setCardCustom] = useState<CardCustomization>(DEFAULT_CARD);
  const [user, setUser] = useState<UserData>({ p1: "", p2: "", date: "", location: "" });

  // Send tab state
  const [rsvpEnabled, setRsvpEnabled] = useState(false);
  const [rsvpLabels, setRsvpLabels] = useState(["Je participe", "Je participe et je serai accompagné.e", "Je ne participe pas"]);
  const [rsvpEditingIdx, setRsvpEditingIdx] = useState<number | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<null | "new" | "csv" | "paste">(null);
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [csvError, setCsvError] = useState<string | null>(null);
  const [guestInput, setGuestInput] = useState("");
  const [editingGuestIndex, setEditingGuestIndex] = useState<number | null>(null);
  const [editingLabels, setEditingLabels] = useState<string[] | null>(null);
  const [editingNote, setEditingNote] = useState<string>("");
  const [guestList, setGuestList] = useState<{ name: string; email: string; plus1: boolean; sent?: boolean; customLabels?: string[]; customNote?: string }[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("wedy_guest_list") ?? "[]"); } catch { return []; }
  });
  const [contactsSaved, setContactsSaved] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const [sendMessageAlign, setSendMessageAlign] = useState<"left" | "center" | "right" | "justify">("left");
  const [messageSaved, setMessageSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("wedy_guest_list", JSON.stringify(guestList));
  }, [guestList]);

  function saveContacts() {
    setContactsSaved(true);
    setTimeout(() => setContactsSaved(false), 2500);
  }

  // Responses tab state
  const [guests, setGuests] = useState<any[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);

  // Handle Stripe redirect with ?std_paid=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("std_paid");
    if (paid === "essentiel" || paid === "premium") {
      setStdPlan(paid);
      setStdPaidSuccess(paid);
      setTimeout(() => setStdPaidSuccess(null), 6000);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { router.push("/connexion"); return; }
      setUserId(u.id);
      const [{ data: prof }, { data: reg }] = await Promise.all([
        createClient().from("profiles").select("partner1_name,partner2_name,wedding_date").eq("id", u.id).single(),
        createClient().from("registries").select("id,ceremony_location,std_config,std_plan").eq("user_id", u.id).single(),
      ]);
      if (reg?.id) setRegistryId(reg.id);
      if ((reg as any)?.std_plan) setStdPlan((reg as any).std_plan);
      setUser({ p1: prof?.partner1_name ?? "", p2: prof?.partner2_name ?? "", date: prof?.wedding_date ?? "", location: reg?.ceremony_location ?? "" });
      const cfg = (reg as any)?.std_config;
      if (cfg?.rsvp_note) { setSendMessage(cfg.rsvp_note); setMessageSaved(true); }
      if (cfg?.rsvp_note_align) setSendMessageAlign(cfg.rsvp_note_align);
      if (cfg?.rsvp_enabled !== undefined) setRsvpEnabled(cfg.rsvp_enabled);
      if (cfg?.rsvp_labels?.length) setRsvpLabels(cfg.rsvp_labels);
      if (cfg?.template_id) { setSavedTemplateId(cfg.template_id); setSelectedId(cfg.template_id); setHasBeenPublished(true); }
      if (cfg?.anim_bg) setAnimBg(cfg.anim_bg);

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
  function openDetail(id: string) { setSelectedId(id); setMode("detail"); setMainTab("personnalisation"); }
  function goBack() { setMode("gallery"); setSelectedId(null); setMainTab("design"); }

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
    setGuestList(prev => [...prev, ...newOnes.map(g => ({ ...g, plus1: false }))]);
    setGuestInput("");
  }

  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [hasBeenPublished, setHasBeenPublished] = useState(false);

  async function saveMessage() {
    if (!registryId) return;
    const { data: reg } = await createClient().from("registries").select("std_config").eq("id", registryId).single();
    const existing = (reg as any)?.std_config ?? {};
    await createClient().from("registries").update({
      std_config: { ...existing, rsvp_note: sendMessage, rsvp_note_align: sendMessageAlign }
    } as any).eq("id", registryId);
    setMessageSaved(true);
  }

  async function saveStdConfig() {
    if (!registryId || !selectedId) return;
    const stdConfig = {
      animation_type: animationType,
      anim_bg: animBg,
      rsvp_enabled: rsvpEnabled,
      rsvp_labels: rsvpLabels,
      rsvp_note: sendMessage,
      rsvp_note_align: sendMessageAlign,
      template_id: selectedId,
      palette_id: getPalette(selectedId),
      card_custom: cardCustom,
    };
    await createClient().from("registries").update({ std_config: stdConfig }).eq("id", registryId);
    setSavedTemplateId(selectedId);
    setCardSaved(true);
    setTimeout(() => setCardSaved(false), 2500);
  }

  async function publishStdConfig() {
    if (!registryId || !selectedId) return;
    setPublishing(true);
    await saveStdConfig();
    setPublishing(false);
    setPublished(true);
    setHasBeenPublished(true);
    setTimeout(() => setPublished(false), 2500);
  }

  async function handleSend(targets?: { name: string; email: string }[]) {
    const list = targets ?? guestList;
    if (!registryId || list.length === 0) return;
    setSending(true);
    setSendResult(null);
    const res = await fetch("/api/std/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registryId, guests: list }),
    });
    const data = await res.json();
    setSendResult(data);
    setSending(false);
    const sentEmails = new Set((targets ?? guestList).map(g => g.email.toLowerCase()));
    setGuestList(prev => prev.map(g => sentEmails.has(g.email.toLowerCase()) ? { ...g, sent: true } : g));
    if (!targets) setSendMessage("");
    loadGuests();
  }

  async function startCheckout(plan: "essentiel" | "premium") {
    if (!registryId) {
      alert("Impossible de charger votre registre. Rechargez la page et réessayez.");
      return;
    }
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/std/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, registryId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? `Erreur ${res.status}`);
      if (!json.url) throw new Error("URL de paiement manquante");
      window.location.href = json.url;
    } catch (e: any) {
      alert(e.message);
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>

      {/* Tab bar — same style as dashboard */}
      <div className="bg-white border-b border-[#f0e6e2]">
        <div className="w-full px-6 lg:px-10 flex items-center gap-0">
          {([
            { id: "accueil",         label: "Accueil" },
            { id: "design",          label: "Design" },
            { id: "personnalisation",label: "Personnalisation" },
            { id: "animation",       label: "Animation" },
            { id: "envoi",           label: "Message & RSVP" },
            { id: "invites",         label: "Gestion des invités" },
            { id: "reponses",        label: "Gestion des réponses" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setMainTab(tab.id); if (tab.id === "reponses" || tab.id === "invites") loadGuests(); }}
              className="relative px-6 py-4 font-semibold transition-colors whitespace-nowrap"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                color: mainTab === tab.id ? "#6D1D3E" : "rgba(109,29,62,0.38)",
              }}
            >
              {tab.label}
              {mainTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "#6D1D3E" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bandeau succès paiement ── */}
      {stdPaidSuccess && (
        <div className="flex items-center justify-center gap-3 px-6 py-3" style={{ backgroundColor: "#1a4731", color: "#d1fae5" }}>
          <Check size={16} />
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Paiement confirmé — Formule {stdPaidSuccess === "essentiel" ? "Essentielle" : "Premium"} activée !
          </span>
        </div>
      )}

      {/* ── Accueil ── */}
      {mainTab === "accueil" && (
        <div style={{ background: "linear-gradient(160deg, #FFF5F0 0%, #FFE8EE 100%)" }}>

          {/* Hero */}
          <div className="max-w-5xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-light leading-tight mb-6" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#2c2c2c" }}>
                Annoncez votre mariage<br />
                <em style={{ color: "#6D1D3E" }}>avec élégance</em>
              </h1>
              <p className="text-base font-light mb-8 leading-relaxed" style={{ color: "rgba(44,44,44,0.6)", fontFamily: "var(--font-display)", maxWidth: "420px" }}>
                Envoyez un Save the Date digital à vos invités, suivez leurs réponses en temps réel, le tout depuis votre espace Weddy.
              </p>
              <button
                onClick={() => setMainTab("design")}
                className="px-8 py-4 rounded-full text-sm font-bold text-white transition-all"
                style={{ backgroundColor: "#6D1D3E", fontFamily: "var(--font-display)", boxShadow: "0 4px 20px rgba(109,29,62,0.3)" }}
              >
                Choisir mon design →
              </button>
            </div>

            {/* Bouquet I card preview */}
            {(() => {
              const W = 260;
              const H = Math.round(W * 1.4);
              const tpl = TEMPLATES.find(t => t.id === "lettre-flower-big-3")!;
              const palette = tpl.palettes[0];
              const previewUser = { p1: "Emma", p2: "Charlie", date: "2027-05-01", location: "Paris, France" };
              return (
                <div className="flex-shrink-0 relative" style={{ width: W + 24, height: H + 24, flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 20, left: 20, width: W, height: H, backgroundColor: "#EABACB", borderRadius: "12px", transform: "rotate(-4deg)" }} />
                  <div style={{ position: "absolute", top: 10, left: 10, width: W, height: H, backgroundColor: "#D4789A", borderRadius: "12px", transform: "rotate(-2deg)" }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, borderRadius: "12px", boxShadow: "0 20px 60px rgba(109,29,62,0.25)", overflow: "hidden" }}>
                    <TemplateRender id="lettre-flower-big-3" W={W} H={H} palette={palette} user={previewUser} isStd={true} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Features */}
          <div className="max-w-5xl mx-auto px-8 pb-16">
            <h2 className="text-2xl font-light text-center mb-10" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#2c2c2c" }}>
              Tout ce dont vous avez besoin
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  emoji: "✉️",
                  title: "Designs élégants",
                  desc: "Des dizaines de modèles personnalisables — couleurs, typographies, photo.",
                },
                {
                  emoji: "💌",
                  title: "Envoi par email",
                  desc: "Chaque invité reçoit un email avec une enveloppe animée qui s'ouvre sur votre annonce.",
                },
                {
                  emoji: "✅",
                  title: "Suivi des réponses",
                  desc: "Visualisez en un coup d'œil qui a confirmé, décliné ou n'a pas encore répondu.",
                },
                {
                  emoji: "🎨",
                  title: "Personnalisation complète",
                  desc: "Textes, polices, couleurs, photo — chaque détail est ajustable.",
                },
                {
                  emoji: "📱",
                  title: "Compatible mobile",
                  desc: "Vos invités ouvrent et répondent depuis leur téléphone en quelques secondes.",
                },
                {
                  emoji: "🔗",
                  title: "Lien unique par invité",
                  desc: "Chaque lien de réponse est personnel et sécurisé — aucun compte requis pour vos invités.",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl p-6" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.07)" }}>
                  <span style={{ fontSize: "28px" }}>{f.emoji}</span>
                  <h3 className="text-base font-semibold mt-3 mb-2" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{f.title}</h3>
                  <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(44,44,44,0.6)", fontFamily: "var(--font-display)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="max-w-4xl mx-auto px-8 pb-20">
            <h2 className="text-2xl font-light text-center mb-3" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#2c2c2c" }}>
              Tarifs
            </h2>
            <p className="text-sm text-center mb-10" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>
              Simple et transparent.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "Essentiel",
                  price: "À définir",
                  desc: "Pour commencer",
                  features: ["Jusqu'à X invités", "Tous les designs", "Suivi des réponses", "Enveloppe animée"],
                  cta: "Commencer",
                  highlight: false,
                },
                {
                  name: "Premium",
                  price: "À définir",
                  desc: "Pour les grandes listes",
                  features: ["Invités illimités", "Tous les designs", "Suivi des réponses", "Enveloppe animée", "Relances automatiques (bientôt)"],
                  cta: "Choisir Premium",
                  highlight: true,
                },
              ].map((plan) => (
                <div key={plan.name} className="rounded-2xl p-8 flex flex-col" style={{
                  backgroundColor: plan.highlight ? "#6D1D3E" : "white",
                  boxShadow: plan.highlight ? "0 8px 40px rgba(109,29,62,0.25)" : "0 4px 20px rgba(109,29,62,0.08)",
                }}>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "rgba(109,29,62,0.45)", fontFamily: "var(--font-display)" }}>{plan.desc}</p>
                  <h3 className="text-2xl font-bold mb-1" style={{ color: plan.highlight ? "white" : "#2c2c2c", fontFamily: "var(--font-display)" }}>{plan.name}</h3>
                  <p className="text-3xl font-light mb-6" style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "#6D1D3E", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>{plan.price}</p>
                  <ul className="flex flex-col gap-2 mb-8 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm" style={{ color: plan.highlight ? "rgba(255,255,255,0.75)" : "rgba(44,44,44,0.7)", fontFamily: "var(--font-display)" }}>
                        <span style={{ color: plan.highlight ? "rgba(255,255,255,0.5)" : "#EABACB", fontSize: "16px" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setMainTab("design")}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: plan.highlight ? "white" : "#6D1D3E",
                      color: plan.highlight ? "#6D1D3E" : "white",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── Envoi ── */}
      {mainTab === "envoi" && (
        <div className="px-8 py-10 max-w-5xl mx-auto flex flex-col gap-5">

          {/* ── 0. Message pour les invités ── */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>
              Message pour les invités <span style={{ fontWeight: 400, color: "rgba(44,44,44,0.4)" }}>(optionnel)</span>
            </p>
            <p className="text-xs mt-1 mb-3" style={{ color: "rgba(44,44,44,0.45)", fontFamily: "var(--font-display)" }}>
              Ce texte s&apos;affiche sur la page web de l&apos;invitation, sous les boutons de réponse. Il ne figure pas dans le mail.
            </p>
            <div className="flex gap-1 mb-3">
              {([
                { val: "left",    Icon: AlignLeft },
                { val: "center",  Icon: AlignCenter },
                { val: "right",   Icon: AlignRight },
                { val: "justify", Icon: AlignJustify },
              ] as const).map(({ val, Icon }) => (
                <button key={val} onClick={() => { setSendMessageAlign(val); setMessageSaved(false); }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
                  style={{
                    backgroundColor: sendMessageAlign === val ? "#e8d5de" : "rgba(109,29,62,0.06)",
                    color: sendMessageAlign === val ? "#6D1D3E" : "rgba(44,44,44,0.45)",
                    border: sendMessageAlign === val ? "1.5px solid #c9a0b0" : "1.5px solid transparent",
                  }}>
                  <Icon size={15}/>
                </button>
              ))}
            </div>
            <textarea
              value={sendMessage}
              onChange={e => { setSendMessage(e.target.value); setMessageSaved(false); }}
              placeholder="Merci de nous répondre avant le 15 janvier. Nous avons hâte de vous retrouver !"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
              style={{ border: "1.5px solid #f0e6e2", fontFamily: "var(--font-display)", color: "#2c2c2c", backgroundColor: "#fdfaf8", textAlign: sendMessageAlign }}
            />
            <div className="flex justify-end mt-2">
              <button onClick={saveMessage}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  fontFamily: "var(--font-display)",
                  backgroundColor: messageSaved ? "rgba(34,197,94,0.12)" : "#6D1D3E",
                  color: messageSaved ? "#16a34a" : "white",
                }}>
                {messageSaved ? "✓ Enregistré" : "Enregistrer"}
              </button>
            </div>
          </div>

          {/* ── 1. RSVP ── */}
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
            {/* Toggle row */}
            <div className="flex items-center justify-between gap-4 p-6">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Inclure un formulaire RSVP</p>
                  {stdPlan !== "premium" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}>Premium</span>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: "rgba(44,44,44,0.45)", fontFamily: "var(--font-display)" }}>
                  {rsvpEnabled ? "Les invités pourront confirmer ou décliner leur présence." : "Le Save the Date sera envoyé sans demande de réponse."}
                </p>
              </div>
              <button
                onClick={() => setRsvpEnabled(v => !v)}
                className="flex-shrink-0 relative rounded-full transition-colors"
                style={{ width: 44, height: 24, backgroundColor: rsvpEnabled ? "#6D1D3E" : "rgba(44,44,44,0.15)" }}
              >
                <span className="absolute top-0.5 rounded-full bg-white transition-all"
                  style={{ width: 20, height: 20, left: rsvpEnabled ? 22 : 2 }}
                />
              </button>
            </div>

            {/* Options RSVP — s'ouvre si activé */}
            {rsvpEnabled && (
              <div className="px-6 pb-6 pt-2 flex flex-col gap-3" style={{ borderTop: "1px solid #f0e6e2" }}>
                <p className="text-xs font-bold uppercase tracking-widest pt-2" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>
                  Options proposées aux invités
                </p>
                <div className="flex flex-col gap-2">
                  {rsvpLabels.map((opt, idx) => (
                    <div key={idx} className="relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-visible" style={{ backgroundColor: "#fdfaf8", border: "1.5px solid #f0e6e2" }}>
                      <span className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "rgba(109,29,62,0.3)" }} />
                      {rsvpEditingIdx === idx ? (
                        <input
                          autoFocus
                          value={opt}
                          onChange={e => setRsvpLabels(prev => prev.map((l, i) => i === idx ? e.target.value : l))}
                          onBlur={() => setRsvpEditingIdx(null)}
                          onKeyDown={e => e.key === "Enter" && setRsvpEditingIdx(null)}
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}
                        />
                      ) : (
                        <>
                          <span className="flex-1 text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{opt}</span>
                          {opt.toLowerCase().includes("accompagné") && (
                            <div className="relative flex-shrink-0 group/info">
                              <button className="p-1 rounded-lg flex items-center justify-center" style={{ color: "rgba(109,29,62,0.4)" }}>
                                <Info size={13} />
                              </button>
                              <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-56 opacity-0 group-hover/info:opacity-100 transition-opacity duration-150 z-50">
                                <div className="rounded-xl px-3 py-2.5 text-xs leading-relaxed shadow-lg" style={{ backgroundColor: "#2c1a22", color: "#f5e9ee", fontFamily: "var(--font-display)" }}>
                                  Chaque invité peut avoir ses propres options — à définir depuis la liste d'invités.
                                  <div className="absolute right-2.5 top-full w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #2c1a22" }} />
                                </div>
                              </div>
                            </div>
                          )}
                          <button onClick={() => setRsvpEditingIdx(idx)} className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-[rgba(109,29,62,0.06)]">
                            <Pencil size={13} style={{ color: "rgba(109,29,62,0.35)" }} />
                          </button>
                          <button onClick={() => setRsvpLabels(prev => prev.filter((_, i) => i !== idx))} className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-[rgba(200,40,40,0.08)]">
                            <Trash2 size={13} style={{ color: "rgba(200,40,40,0.35)" }} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => { setRsvpLabels(prev => [...prev, ""]); setRsvpEditingIdx(rsvpLabels.length); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-colors hover:bg-[rgba(109,29,62,0.04)]"
                    style={{ color: "rgba(109,29,62,0.35)", fontFamily: "var(--font-display)", border: "1.5px dashed rgba(109,29,62,0.15)" }}
                  >
                    + Ajouter une option
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Prévisualiser ── */}
          {registryId && (
            <div className="rounded-2xl p-6 flex items-center justify-between gap-4" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Prévisualiser l&apos;invitation</p>
                <p className="text-xs" style={{ color: "rgba(44,44,44,0.45)", fontFamily: "var(--font-display)" }}>
                  Sauvegarde et affiche exactement ce que verront vos invités.
                </p>
              </div>
              <button
                onClick={async () => {
                  await saveStdConfig();
                  window.open(`/rsvp/open/${registryId}`, "_blank");
                }}
                disabled={!selectedId}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                style={{ backgroundColor: "rgba(109,29,62,0.07)", color: "#6D1D3E", fontFamily: "var(--font-display)", border: "1.5px solid rgba(109,29,62,0.15)", opacity: !selectedId ? 0.4 : 1 }}
              >
                <Play size={13} fill="#6D1D3E" /> Prévisualiser
              </button>
            </div>
          )}

          {/* ── Publier ── */}
          <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
            {stdPlan ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Publier l&apos;invitation</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: stdPlan === "premium" ? "#6D1D3E" : "rgba(109,29,62,0.1)", color: stdPlan === "premium" ? "white" : "#6D1D3E", fontFamily: "var(--font-display)" }}>
                    {stdPlan === "premium" ? "Premium" : "Essentielle"}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "rgba(44,44,44,0.45)", fontFamily: "var(--font-display)" }}>
                  Sauvegarde le design, l&apos;animation et les options RSVP pour que les invités voient la bonne version.
                </p>
                {hasBeenPublished ? (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#2d6a4f", fontFamily: "var(--font-display)" }}>
                      ✓ Invitation publiée
                    </span>
                    <button
                      onClick={publishStdConfig}
                      disabled={publishing || !selectedId}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                      style={{
                        backgroundColor: published ? "#2d6a4f" : "#6D1D3E",
                        color: "white",
                        fontFamily: "var(--font-display)",
                        opacity: !selectedId ? 0.4 : 1,
                        transition: "background-color 0.3s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {publishing ? "Mise à jour…" : published ? "✓ Mis à jour !" : "Publier les modifications"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={publishStdConfig}
                    disabled={publishing || !selectedId}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      backgroundColor: "#6D1D3E",
                      color: "white",
                      fontFamily: "var(--font-display)",
                      opacity: !selectedId ? 0.4 : 1,
                    }}
                  >
                    {publishing ? "Publication…" : "Publier l'invitation"}
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Publier l&apos;invitation</p>
                <p className="text-xs" style={{ color: "rgba(44,44,44,0.45)", fontFamily: "var(--font-display)" }}>
                  Choisissez une formule pour rendre votre invitation accessible à vos invités.
                </p>
                <button
                  onClick={() => { setPricingContext("publish"); setShowPricingModal(true); }}
                  disabled={!selectedId}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", opacity: !selectedId ? 0.4 : 1 }}
                >
                  Choisir une formule →
                </button>
              </>
            )}
          </div>

          {/* ── Partage du lien ── */}
          {stdPlan && (() => {
            const publicUrl = registryId
              ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://weddy.fr"}/rsvp/open/${registryId}`
              : null;
            return (
              <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Link2 size={14} style={{ color: "#6D1D3E" }} />
                  <p className="text-sm font-semibold" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Partage du lien</p>
                </div>
                <p className="text-xs" style={{ color: "rgba(44,44,44,0.45)", fontFamily: "var(--font-display)" }}>
                  Partagez ce lien par WhatsApp, SMS ou réseaux sociaux.
                </p>
                {publicUrl ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "#fdfaf8", border: "1.5px solid #f0e6e2" }}>
                    <span className="flex-1 text-sm truncate" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>{publicUrl}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(publicUrl); setUrlCopied(true); setTimeout(() => setUrlCopied(false), 2000); }}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ backgroundColor: urlCopied ? "#d4edda" : "#6D1D3E", color: urlCopied ? "#155724" : "white", fontFamily: "var(--font-display)" }}>
                      {urlCopied ? <><Check size={13}/> Copié</> : <><Copy size={13}/> Copier</>}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>Chargement du lien…</p>
                )}
              </div>
            );
          })()}

        </div>
      )}

      {/* ── Gestion des invités ── */}
      {mainTab === "invites" && (
        <div className="px-8 py-10 max-w-5xl mx-auto flex flex-col gap-5">

          {/* ── Paywall si pas Premium ── */}
          {stdPlan !== "premium" && (
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
              <div className="px-8 py-12 flex flex-col items-center text-center gap-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(109,29,62,0.08)" }}>
                  <Mail size={22} style={{ color: "#6D1D3E" }} />
                </div>
                <div>
                  <p className="text-xl font-light mb-2" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "#2c2c2c" }}>
                    Envoyez vos invitations par email
                  </p>
                  <p className="text-sm" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)", maxWidth: 380, margin: "0 auto" }}>
                    Ajoutez vos invités, suivez les envois et gérez les RSVP — disponible avec la Formule Premium.
                  </p>
                </div>
                <button
                  onClick={() => { setPricingContext("invites"); setShowPricingModal(true); }}
                  className="px-8 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}
                >
                  Découvrir la Formule Premium →
                </button>
              </div>
            </div>
          )}

          {/* ── Envoyer par email (Premium uniquement) ── */}
          {stdPlan === "premium" && (
          <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ backgroundColor: "white", boxShadow: "0 4px 20px rgba(109,29,62,0.08)" }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Mail size={14} style={{ color: "#6D1D3E" }} />
                <p className="text-sm font-semibold" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>Envoyer par email</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveContacts}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ backgroundColor: contactsSaved ? "rgba(45,106,79,0.1)" : "rgba(109,29,62,0.07)", color: contactsSaved ? "#2d6a4f" : "#6D1D3E", fontFamily: "var(--font-display)", border: "1.5px solid", borderColor: contactsSaved ? "rgba(45,106,79,0.2)" : "rgba(109,29,62,0.15)" }}
                >
                  {contactsSaved ? <><Check size={12}/> Enregistré</> : "Enregistrer"}
                </button>
                <button
                  onClick={() => { setAddModalOpen(true); setAddMode(null); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                  style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}
                >
                  + Ajouter des contacts
                </button>
              </div>
            </div>

            {sendResult && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: sendResult.failed === 0 ? "#d4edda" : "#fff3cd", color: sendResult.failed === 0 ? "#155724" : "#856404", fontFamily: "var(--font-display)" }}>
                {sendResult.failed === 0
                  ? `✓ ${sendResult.sent} email${sendResult.sent > 1 ? "s" : ""} envoyé${sendResult.sent > 1 ? "s" : ""} avec succès.`
                  : `${sendResult.sent} envoyé(s), ${sendResult.failed} échec(s).`}
              </div>
            )}

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid #f0e6e2" }}>
              <div className="grid text-xs font-bold uppercase tracking-wider px-4 py-2.5" style={{
                gridTemplateColumns: "1fr 2fr 110px 110px 140px",
                backgroundColor: "#fdfaf8",
                color: "rgba(109,29,62,0.4)",
                fontFamily: "var(--font-display)",
                borderBottom: "1px solid #f0e6e2",
              }}>
                <span>Nom</span>
                <span>Email</span>
                <span className="text-center">Statut</span>
                <span className="text-center">Personnaliser</span>
                <span className="text-center">Actions</span>
              </div>
              {guestList.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-xs" style={{ color: "rgba(44,44,44,0.3)", fontFamily: "var(--font-display)" }}>Aucun contact ajouté</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {guestList.map((g, i) => (
                    <div key={i} style={{ borderBottom: i < guestList.length - 1 ? "1px solid #f0e6e2" : "none" }}>
                      <div className="grid items-center px-4 py-3" style={{
                        gridTemplateColumns: "1fr 2fr 110px 110px 140px",
                        backgroundColor: "white",
                      }}>
                        <span className="text-sm font-medium truncate" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{g.name || "—"}</span>
                        <span className="text-sm truncate" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>{g.email}</span>
                        <span className="flex justify-center items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.sent ? "#2d6a4f" : "rgba(44,44,44,0.2)" }}/>
                          <span className="text-xs" style={{ color: g.sent ? "#2d6a4f" : "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)", fontWeight: g.sent ? 600 : 400 }}>
                            {g.sent ? "Envoyé" : "Non envoyé"}
                          </span>
                        </span>
                        <span className="flex justify-center items-center">
                          <button
                            onClick={() => { setEditingGuestIndex(i); setEditingLabels([...(g.customLabels ?? rsvpLabels)]); setEditingNote(g.customNote ?? sendMessage ?? ""); }}
                            className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(109,29,62,0.07)]"
                            title="Personnaliser l'invitation"
                          >
                            <SlidersHorizontal size={14} style={{ color: g.customLabels || g.customNote ? "#6D1D3E" : "rgba(44,44,44,0.35)" }}/>
                          </button>
                        </span>
                        <span className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleSend([{ name: g.name, email: g.email }])}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
                            style={{ backgroundColor: g.sent ? "transparent" : "#6D1D3E", color: g.sent ? "#6D1D3E" : "white", border: g.sent ? "1.5px solid rgba(109,29,62,0.25)" : "none", fontFamily: "var(--font-display)" }}
                            title={g.sent ? "Renvoyer l'invitation" : "Envoyer l'invitation"}
                          >
                            <Mail size={11}/> {g.sent ? "Renvoyer" : "Envoyer"}
                          </button>
                          <button
                            onClick={() => setGuestList(prev => prev.filter((_, j) => j !== i))}
                            className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(180,40,40,0.07)]"
                          >
                            <Trash2 size={14} style={{ color: "rgba(180,40,40,0.45)" }}/>
                          </button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => handleSend()} disabled={sending || guestList.length === 0}
              className="w-full py-4 rounded-2xl text-sm font-semibold transition-opacity"
              style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", opacity: (sending || guestList.length === 0) ? 0.5 : 1 }}>
              {sending ? "Envoi en cours…" : `Envoyer ${guestList.length > 0 ? `à ${guestList.length} invité${guestList.length > 1 ? "s" : ""}` : ""}`}
            </button>
          </div>
          )}

        </div>
      )}

      {/* ── Modal personnalisation options RSVP par invité ── */}
      {editingGuestIndex !== null && editingLabels !== null && (() => {
        const g = guestList[editingGuestIndex];
        if (!g) return null;
        const isCustom = !!g.customLabels;
        function close() { setEditingGuestIndex(null); setEditingLabels(null); setEditingNote(""); }
        function save() {
          setGuestList(prev => prev.map((guest, j) => j === editingGuestIndex ? {
            ...guest,
            customLabels: editingLabels ?? undefined,
            customNote: editingNote !== (sendMessage ?? "") ? editingNote : undefined,
          } : guest));
          close();
        }
        function resetToDefault() {
          setEditingLabels([...rsvpLabels]);
          setEditingNote(sendMessage ?? "");
        }
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(10,10,10,0.45)", backdropFilter: "blur(4px)" }}
            onClick={e => { if (e.target === e.currentTarget) close(); }}
          >
            <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "20px", padding: "32px 28px 28px", boxShadow: "0 24px 64px rgba(109,29,62,0.18)" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "6px" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 700, color: "#2c2c2c", margin: 0 }}>
                    Options de réponse
                  </p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(44,44,44,0.45)", margin: "3px 0 0", letterSpacing: "0.05em" }}>
                    {g.name || g.email}
                  </p>
                </div>
                <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                  <X size={18} style={{ color: "rgba(44,44,44,0.4)" }}/>
                </button>
              </div>

              <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.1em", color: "#9e6b5c", textTransform: "uppercase", margin: "20px 0 10px" }}>
                Options proposées à cet invité
              </p>

              {/* Labels list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {editingLabels.map((label, li) => (
                  <div key={li} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "11px", color: "rgba(44,44,44,0.35)", minWidth: "16px" }}>{li + 1}.</span>
                    <input
                      value={label}
                      onChange={e => setEditingLabels(prev => prev!.map((l, j) => j === li ? e.target.value : l))}
                      style={{ flex: 1, padding: "10px 12px", border: "1.5px solid #f0e6e2", borderRadius: "8px", fontSize: "13px", fontFamily: "var(--font-display)", color: "#2c2c2c", background: "#fdfaf8", outline: "none" }}
                    />
                    <button
                      onClick={() => { if (editingLabels.length > 1) setEditingLabels(prev => prev!.filter((_, j) => j !== li)); }}
                      style={{ padding: "6px", background: "none", border: "none", cursor: editingLabels.length <= 1 ? "not-allowed" : "pointer", opacity: editingLabels.length <= 1 ? 0.25 : 0.5, flexShrink: 0 }}
                    >
                      <X size={13} style={{ color: "#9a3b3b" }}/>
                    </button>
                  </div>
                ))}
              </div>

              {/* Ajouter une option */}
              <button
                onClick={() => setEditingLabels(prev => [...(prev ?? []), ""])}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "1.5px dashed rgba(109,29,62,0.25)", borderRadius: "8px", padding: "8px 14px", fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.1em", color: "rgba(109,29,62,0.6)", cursor: "pointer", marginBottom: "20px" }}
              >
                + Ajouter une option
              </button>

              {/* Note personnalisée */}
              <p style={{ fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.1em", color: "#9e6b5c", textTransform: "uppercase", margin: "4px 0 10px" }}>
                Message affiché sous les boutons
              </p>
              <textarea
                value={editingNote}
                onChange={e => setEditingNote(e.target.value)}
                rows={4}
                placeholder={sendMessage || "Laisser vide pour utiliser le message par défaut…"}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #f0e6e2", borderRadius: "8px", fontSize: "13px", fontFamily: "Georgia, serif", color: "#2c2c2c", background: "#fdfaf8", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", marginBottom: "20px" }}
              />

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={save}
                  style={{ width: "100%", padding: "13px", background: "#6D1D3E", color: "white", border: "none", borderRadius: "10px", fontFamily: "var(--font-display)", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Enregistrer les modifications
                </button>
                <button
                  onClick={resetToDefault}
                  style={{ width: "100%", padding: "11px", background: "none", color: "#6D1D3E", border: "1.5px solid rgba(109,29,62,0.2)", borderRadius: "10px", fontFamily: "var(--font-display)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Revenir au texte par défaut
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Modal Ajouter des contacts ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ backgroundColor: "rgba(10,10,10,0.5)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setAddModalOpen(false); setAddMode(null); setGuestInput(""); setNewContactName(""); setNewContactEmail(""); } }}>
          <div className="relative w-full sm:max-w-sm mx-0 sm:mx-4 rounded-t-3xl sm:rounded-3xl"
            style={{ backgroundColor: "white", boxShadow: "0 32px 80px rgba(0,0,0,0.25)" }}>

            {/* Barre de glissement mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.12)" }}/>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div className="flex items-center gap-3">
                {addMode !== null && (
                  <button onClick={() => setAddMode(null)} className="rounded-full p-1.5 transition-colors hover:bg-[rgba(109,29,62,0.06)]">
                    <ArrowLeft size={16} style={{ color: "#6D1D3E" }}/>
                  </button>
                )}
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, fontFamily: "var(--font-display)", color: "#1a1a1a" }}>
                  {addMode === "new" ? "Nouveau contact" : addMode === "csv" ? "Importer un fichier" : addMode === "paste" ? "Coller des emails" : "Ajouter des contacts"}
                </h2>
              </div>
              <button onClick={() => { setAddModalOpen(false); setAddMode(null); setGuestInput(""); setNewContactName(""); setNewContactEmail(""); }}
                className="rounded-full p-1.5 transition-colors hover:bg-[rgba(0,0,0,0.06)]">
                <X size={16} style={{ color: "#9a9a9a" }}/>
              </button>
            </div>

            <div className="px-6 pb-7">

              {/* Menu principal */}
              {addMode === null && (
                <div className="flex flex-col gap-2">
                  {([
                    { id: "new"   as const, label: "Créer un contact",       desc: "Ajouter manuellement nom et email",     Icon: UserPlus },
                    { id: "csv"   as const, label: "Importer un CSV ou Excel", desc: "Importer une liste depuis un fichier", Icon: FileSpreadsheet },
                    { id: "paste" as const, label: "Coller des emails",        desc: "Coller une liste depuis vos contacts", Icon: ClipboardList },
                  ] as { id: "new" | "csv" | "paste"; label: string; desc: string; Icon: React.ElementType }[]).map(opt => (
                    <button key={opt.id} onClick={() => setAddMode(opt.id)}
                      className="flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all hover:bg-[rgba(109,29,62,0.04)]"
                      style={{ border: "1.5px solid #f0e6e2" }}>
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(109,29,62,0.07)" }}>
                        <opt.Icon size={18} style={{ color: "#6D1D3E" }}/>
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#1a1a1a", fontFamily: "var(--font-display)" }}>{opt.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(44,44,44,0.45)", fontFamily: "var(--font-display)" }}>{opt.desc}</p>
                      </div>
                      <ArrowRight size={14} className="ml-auto flex-shrink-0" style={{ color: "rgba(44,44,44,0.25)" }}/>
                    </button>
                  ))}
                </div>
              )}

              {/* Créer un contact */}
              {addMode === "new" && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>Prénom & Nom</label>
                    <input value={newContactName} onChange={e => setNewContactName(e.target.value)}
                      placeholder="Marie Dupont" autoFocus
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                      style={{ border: "1.5px solid #f0e6e2", fontFamily: "var(--font-display)", color: "#2c2c2c", backgroundColor: "#fdfaf8" }}/>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(109,29,62,0.5)", fontFamily: "var(--font-display)" }}>Email</label>
                    <input value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)}
                      placeholder="marie@exemple.fr" type="email"
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                      style={{ border: "1.5px solid #f0e6e2", fontFamily: "var(--font-display)", color: "#2c2c2c", backgroundColor: "#fdfaf8" }}/>
                  </div>
                  <button onClick={() => {
                    if (newContactEmail.includes("@")) {
                      setGuestList(prev => [...prev, { name: newContactName.trim(), email: newContactEmail.trim(), plus1: false }]);
                      setNewContactName(""); setNewContactEmail("");
                      setAddModalOpen(false); setAddMode(null);
                    }
                  }} disabled={!newContactEmail.includes("@")}
                    className="w-full mt-1 py-3 rounded-xl text-sm font-semibold transition-opacity"
                    style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", opacity: !newContactEmail.includes("@") ? 0.45 : 1 }}>
                    Ajouter le contact
                  </button>
                </div>
              )}

              {/* Importer CSV */}
              {addMode === "csv" && (
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl cursor-pointer transition-colors hover:bg-[rgba(109,29,62,0.03)]"
                    style={{ border: `2px dashed ${csvError ? "rgba(180,40,40,0.35)" : "rgba(109,29,62,0.2)"}` }}
                    onClick={() => setCsvError(null)}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(109,29,62,0.07)" }}>
                      <FileSpreadsheet size={22} style={{ color: "#6D1D3E" }}/>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>Choisir un fichier CSV</p>
                      <p className="text-xs mt-1" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>Format : nom, email (une ligne par invité)</p>
                    </div>
                    <input type="file" accept=".csv" className="hidden" onChange={e => {
                      setCsvError(null);
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.name.toLowerCase().endsWith(".csv")) {
                        setCsvError("Format non supporté. Exportez votre fichier Excel en CSV (Fichier → Exporter → CSV).");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const text = ev.target?.result as string ?? "";
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
                        const parsed = lines.map(line => {
                          const cols = line.split(/[,;	]/).map(c => c.replace(/^["']|["']$/g, "").trim());
                          const email = cols.find(c => emailRegex.test(c)) ?? "";
                          const name = cols.filter(c => !emailRegex.test(c) && c.length > 0).join(" ").trim();
                          return { name, email, plus1: false as const };
                        }).filter(g => emailRegex.test(g.email));
                        if (parsed.length === 0) {
                          setCsvError("Aucun email valide trouvé. Vérifiez que votre fichier contient bien une colonne email.");
                          return;
                        }
                        const existing = new Set(guestList.map(g => g.email.toLowerCase()));
                        setGuestList(prev => [...prev, ...parsed.filter(g => !existing.has(g.email.toLowerCase()))]);
                        setAddModalOpen(false); setAddMode(null); setCsvError(null);
                      };
                      reader.readAsText(file, "UTF-8");
                    }}/>
                  </label>
                  {csvError && (
                    <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: "#fff0f0", border: "1px solid rgba(180,40,40,0.2)", color: "#b42828", fontFamily: "var(--font-display)", lineHeight: 1.6 }}>
                      {csvError}
                    </div>
                  )}
                  <p className="text-xs text-center" style={{ color: "rgba(44,44,44,0.35)", fontFamily: "var(--font-display)" }}>
                    Excel non supporté directement — exportez en CSV depuis Excel ou Google Sheets.
                  </p>
                </div>
              )}

              {/* Coller des emails */}
              {addMode === "paste" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>
                    Un par ligne : <em>Prénom email@exemple.fr</em>
                  </p>
                  <textarea value={guestInput} onChange={e => setGuestInput(e.target.value)}
                    placeholder={"Marie marie@exemple.fr\nPierre pierre@exemple.fr"}
                    rows={5} autoFocus
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
                    style={{ border: "1.5px solid #f0e6e2", fontFamily: "var(--font-display)", color: "#2c2c2c", backgroundColor: "#fdfaf8" }}/>
                  <button onClick={() => { addGuests(); setAddModalOpen(false); setAddMode(null); }} disabled={!guestInput.trim()}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
                    style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", opacity: !guestInput.trim() ? 0.45 : 1 }}>
                    Ajouter
                  </button>
                </div>
              )}

            </div>
          </div>
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

      {/* ── Animation ── */}
      {mainTab === "animation" && (() => {
        const animTpl = activeTpl;
        const animPalette = animTpl ? (animTpl.palettes.find(p => p.id === getPalette(animTpl.id)) ?? animTpl.palettes[0]) : null;
        const cardW = 400;
        const cardH = Math.round(cardW * 1.4);
        type BgEntry = { id: string; label: string; image?: string; color?: string };
        const ANIM_BG_CATS: { label: string; items: BgEntry[] }[] = [
          { label: "Texturé", items: [
            { id: "marble",     label: "Marbre",     image: "/fond/marbre.png" },
            { id: "granite",    label: "Granite",    image: "/fond/granite.png" },
            { id: "bois_clair", label: "Bois clair", image: "/fond/bois_clair.png" },
            { id: "bois_fonce", label: "Bois foncé", image: "/fond/bois_fonce.png" },
          ]},
          { label: "Aquarelle", items: [
            { id: "aquarelle",  label: "Kaki",  image: "/fond/aquarelle_kaki.png" },
            { id: "aquarelle2", label: "Beige", image: "/fond/aquarelle_beige.png" },
            { id: "aquarelle3", label: "Rose",  image: "/fond/aquarelle_rose.png" },
            { id: "aquarelle4", label: "Bleu",  image: "/fond/aquarelle_bleu.png" },
          ]},
          { label: "Uni", items: [
            { id: "white",  label: "Blanc",      color: "#FFFFFF" },
            { id: "beige",  label: "Beige",      color: "#F5EFE4" },
            { id: "grey",   label: "Gris perle", color: "#ECEAE6" },
            { id: "blush",  label: "Rose",       color: "#F8EDE8" },
          ]},
          { label: "Motif", items: [
            { id: "vichy1",   label: "Vichy 1",   image: "/fond/vichy_1.jpg" },
            { id: "vichy2",   label: "Vichy 2",   image: "/fond/vichy_2.jpg" },
            { id: "vichy3",   label: "Vichy 3",   image: "/fond/vichy_3.jpg" },
            { id: "rayure1",  label: "Rayure 1",  image: "/fond/rayures_1.jpg" },
            { id: "rayure2",  label: "Rayure 2",  image: "/fond/rayure_2.jpg" },
            { id: "rayure3",  label: "Rayure 3",  image: "/fond/rayure_3.jpg" },
            { id: "rayure4",  label: "Rayure 4",  image: "/fond/rayure_4.jpg" },
            { id: "liberty1", label: "Liberty 1", image: "/fond/liberty_1.png" },
            { id: "liberty2", label: "Liberty 2", image: "/fond/liberty_2.png" },
            { id: "liberty3", label: "Liberty 3", image: "/fond/liberty_3.png" },
          ]},
        ];
        const allBgs = ANIM_BG_CATS.flatMap(c => c.items);
        const currentBg = allBgs.find(b => b.id === animBg) ?? allBgs[0];
        const bgStyle: React.CSSProperties = currentBg?.image
          ? { backgroundImage: `url('${currentBg.image}')`, backgroundSize: "cover", backgroundPosition: "center" }
          : { backgroundColor: currentBg?.color ?? "#ECEAE6" };
        return (
          <div className="flex items-stretch" style={{ height: "calc(100vh - 57px)" }}>
            {/* Left panel — background preview */}
            <div className="relative flex flex-col items-center justify-center" style={{ flex: 1, height: "100%", ...bgStyle }}>
              {animTpl && animPalette ? (
                mode === "animate" && animationType === "ouverture" ? (
                  <CardFoldModal
                    tpl={animTpl}
                    paletteId={getPalette(animTpl.id)}
                    user={user} isStd={true}
                    fontPreset={cardCustom.fontPreset} label={cardCustom.label}
                    namesText={cardCustom.namesText} namesConnector={cardCustom.namesConnector}
                    dateText={cardCustom.dateText}
                    locationText={cardCustom.locationText} footer={cardCustom.footer} tagline={cardCustom.tagline}
                    photoUrl={cardCustom.photoUrl || undefined} photoUrls={cardCustom.photoUrls}
                    elementStyles={cardCustom.styles} customPaperBg={cardCustom.customPaperBg}
                    onClose={() => setMode("detail")}
                    inline
                  />
                ) : mode === "animate" && animationType === "retournement" ? (
                  <CardFlipScene
                    tpl={animTpl}
                    paletteId={getPalette(animTpl.id)}
                    user={user} isStd={true}
                    fontPreset={cardCustom.fontPreset} label={cardCustom.label}
                    namesText={cardCustom.namesText} namesConnector={cardCustom.namesConnector}
                    dateText={cardCustom.dateText}
                    locationText={cardCustom.locationText} footer={cardCustom.footer} tagline={cardCustom.tagline}
                    photoUrl={cardCustom.photoUrl || undefined} photoUrls={cardCustom.photoUrls}
                    elementStyles={cardCustom.styles} customPaperBg={cardCustom.customPaperBg}
                  />
                ) : (
                  <>
                    <div style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 12px 48px rgba(0,0,0,0.22)", borderRadius: 2, overflow: "hidden" }}>
                      <TemplateRender
                        id={animTpl.id} W={cardW} H={cardH}
                        palette={animPalette} user={user} isStd={true}
                        fontPreset={cardCustom.fontPreset} label={cardCustom.label}
                        namesText={cardCustom.namesText} namesConnector={cardCustom.namesConnector}
                        dateText={cardCustom.dateText}
                        locationText={cardCustom.locationText} footer={cardCustom.footer} tagline={cardCustom.tagline}
                        photoUrl={cardCustom.photoUrl || undefined} photoUrls={cardCustom.photoUrls}
                        elementStyles={cardCustom.styles} customPaperBg={cardCustom.customPaperBg}
                      />
                    </div>
                    {(animationType === "ouverture" || animationType === "retournement") && (
                      <button
                        onClick={() => setMode("animate")}
                        className="absolute flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                        style={{ left: 28, top: "50%", transform: "translateY(-50%)", backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px rgba(109,29,62,0.3)" }}
                      >
                        <Play size={14} fill="currentColor" /> Voir l&apos;animation
                      </button>
                    )}
                  </>
                )
              ) : (
                <div className="text-center px-8">
                  <p className="text-sm mb-4" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>
                    Choisissez d&apos;abord un design dans l&apos;onglet <strong>Personnalisation</strong>.
                  </p>
                  <button onClick={() => setMainTab("personnalisation")}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}>
                    Personnaliser →
                  </button>
                </div>
              )}
            </div>

            {/* Right 1/3 — options panel */}
            <div className="flex flex-col px-5 py-8 gap-4 overflow-y-auto" style={{ width: "22%", minWidth: 220, backgroundColor: "#FFF0F4" }}>

              <button
                onClick={() => setMainTab("envoi")}
                className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}
              >
                <span>Envoyer la carte</span>
                <ArrowRight size={16}/>
              </button>

              {/* Animation type */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>
                  Type d&apos;animation
                </p>
                {([
                  { id: "ouverture"    as const, label: "Ouverture" },
                  { id: "retournement" as const, label: "Retournement" },
                  { id: "rien"         as const, label: "Pas d'animation" },
                ]).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setAnimationType(opt.id); setMode("detail"); }}
                    className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                    style={{
                      backgroundColor: animationType === opt.id ? "rgba(109,29,62,0.07)" : "white",
                      border: animationType === opt.id ? "2px solid rgba(109,29,62,0.3)" : "2px solid rgba(109,29,62,0.08)",
                      boxShadow: animationType === opt.id ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: animationType === opt.id ? "#6D1D3E" : "rgba(109,29,62,0.25)" }}>
                      {animationType === opt.id && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#6D1D3E" }}/>}
                    </span>
                    <p className="font-semibold text-sm" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{opt.label}</p>
                  </button>
                ))}
              </div>

              {/* Background picker — par catégorie */}
              <div className="flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(109,29,62,0.4)", fontFamily: "var(--font-display)" }}>
                  Fond de page
                </p>
                {ANIM_BG_CATS.map(cat => (
                  <div key={cat.label} className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold" style={{ color: "rgba(109,29,62,0.35)", fontFamily: "var(--font-display)", letterSpacing: "0.08em" }}>
                      {cat.label}
                    </p>
                    {cat.items.length === 0 ? (
                      <p className="text-xs italic" style={{ color: "rgba(44,44,44,0.3)", fontFamily: "var(--font-display)" }}>Bientôt disponible</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-0.5 w-full">
                        {cat.items.map(bg => (
                          <button
                            key={bg.id}
                            onClick={() => setAnimBg(bg.id)}
                            className="flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all w-full"
                            style={{
                              border: animBg === bg.id ? "2px solid #6D1D3E" : "2px solid transparent",
                              backgroundColor: animBg === bg.id ? "rgba(109,29,62,0.06)" : "transparent",
                            }}
                          >
                            <div
                              className="rounded-md"
                              style={{
                                width: 36, height: 36,
                                backgroundImage: bg.image ? `url('${bg.image}')` : undefined,
                                backgroundColor: bg.color,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                                border: bg.id === "white" ? "1px solid rgba(0,0,0,0.08)" : "none",
                              }}
                            />
                            <span className="text-xs" style={{ color: animBg === bg.id ? "#6D1D3E" : "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)", fontWeight: animBg === bg.id ? 700 : 400 }}>
                              {bg.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Design (galerie) ── */}
      {mainTab === "design" && (
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
                <GalleryCard key={t.id} tpl={t} paletteId={getPalette(t.id)} user={user} isStd={true} isChosen={t.id === savedTemplateId} onClick={() => openDetail(t.id)}/>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Personnalisation ── */}
      {mainTab === "personnalisation" && !activeTpl && (
        <div className="px-8 py-16 text-center max-w-xl mx-auto">
          <p className="text-sm mb-4" style={{ color: "rgba(44,44,44,0.5)", fontFamily: "var(--font-display)" }}>
            Choisissez d'abord un design dans l'onglet <strong>Design</strong>.
          </p>
          <button
            onClick={() => setMainTab("design")}
            className="px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}
          >
            Choisir un design →
          </button>
        </div>
      )}
      {mainTab === "personnalisation" && activeTpl && mode !== "animate" && (
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
          onAnimate={() => setMainTab("animation")}
          onBack={goBack}
          onSave={registryId ? saveStdConfig : undefined}
          cardSaved={cardSaved}
        />
      )}

      {mainTab === "personnalisation" && mode === "animate" && activeTpl && (
        <CardFoldModal
          tpl={activeTpl}
          paletteId={getPalette(activeTpl.id)}
          user={user}
          isStd={true}
          fontPreset={cardCustom.fontPreset}
          label={cardCustom.label}
          namesText={cardCustom.namesText}
          dateText={cardCustom.dateText}
          locationText={cardCustom.locationText}
          footer={cardCustom.footer}
          tagline={cardCustom.tagline}
          photoUrl={cardCustom.photoUrl || undefined}
          photoUrls={cardCustom.photoUrls}
          elementStyles={cardCustom.styles}
          customPaperBg={cardCustom.customPaperBg}
          onClose={() => setMode("detail")}
        />
      )}

      {/* ── Modal Tarifs ── */}
      {showPricingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(10,6,8,0.72)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowPricingModal(false); }}
        >
          <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden" style={{ backgroundColor: "white", boxShadow: "0 40px 100px rgba(0,0,0,0.35)" }}>
            {/* Close */}
            <button onClick={() => setShowPricingModal(false)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[rgba(44,44,44,0.08)]">
              <X size={16} style={{ color: "rgba(44,44,44,0.45)" }} />
            </button>

            {/* Header */}
            <div className="px-8 pt-10 pb-6 text-center" style={{ background: "linear-gradient(135deg, #6D1D3E 0%, #9e3d60 100%)" }}>
              <p className="text-xs font-bold tracking-[0.35em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-display)" }}>Weddy · Save the Date</p>
              <h2 className="text-3xl font-light" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "white" }}>
                Activez votre invitation
              </h2>
              <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-display)" }}>
                Paiement unique · Accès à vie
              </p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-2 gap-5 p-8">

              {/* Essentielle */}
              <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: pricingContext === "invites" ? "1.5px solid #e0d0d6" : "2px solid #6D1D3E", opacity: pricingContext === "invites" ? 0.7 : 1 }}>
                <div className="px-6 py-5" style={{ backgroundColor: pricingContext === "invites" ? "#fdfaf8" : "#fdf5f8" }}>
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#6D1D3E", fontFamily: "var(--font-display)" }}>Essentielle</p>
                  <p className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "#2c2c2c" }}>25 <span className="text-xl">€</span></p>
                  <p className="text-xs mt-1" style={{ color: "rgba(44,44,44,0.4)", fontFamily: "var(--font-display)" }}>paiement unique</p>
                </div>
                <div className="flex flex-col gap-2.5 px-6 py-5 flex-1" style={{ backgroundColor: "white" }}>
                  {["Carte animée au choix", "Lien de partage public", "Prévisualisation invité"].map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={13} style={{ color: "#2d6a4f", flexShrink: 0, marginTop: 2 }} />
                      <span className="text-xs" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{f}</span>
                    </div>
                  ))}
                  {["RSVP", "Gestion des invités", "Envoi email"].map(f => (
                    <div key={f} className="flex items-start gap-2" style={{ opacity: 0.35 }}>
                      <span className="text-xs mt-0.5 w-3 text-center" style={{ color: "#999" }}>✕</span>
                      <span className="text-xs" style={{ color: "#999", fontFamily: "var(--font-display)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6" style={{ backgroundColor: "white" }}>
                  <button
                    onClick={() => startCheckout("essentiel")}
                    disabled={checkoutLoading !== null || pricingContext === "invites"}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: pricingContext === "invites" ? "rgba(109,29,62,0.08)" : "#6D1D3E",
                      color: pricingContext === "invites" ? "rgba(109,29,62,0.4)" : "white",
                      fontFamily: "var(--font-display)",
                      cursor: pricingContext === "invites" ? "default" : "pointer",
                    }}
                  >
                    {checkoutLoading === "essentiel" ? "Chargement…" : pricingContext === "invites" ? "Non inclus" : "Choisir l'Essentielle"}
                  </button>
                </div>
              </div>

              {/* Premium */}
              <div className="flex flex-col rounded-2xl overflow-hidden" style={{ border: "2px solid #6D1D3E", boxShadow: "0 8px 32px rgba(109,29,62,0.15)" }}>
                <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #6D1D3E 0%, #9e3d60 100%)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-display)" }}>Premium</p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white", fontFamily: "var(--font-display)" }}>Recommandé</span>
                  </div>
                  <p className="text-4xl font-light" style={{ fontFamily: "var(--font-serif)", color: "white" }}>70 <span className="text-xl">€</span></p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-display)" }}>paiement unique</p>
                </div>
                <div className="flex flex-col gap-2.5 px-6 py-5 flex-1" style={{ backgroundColor: "white" }}>
                  {["Carte animée au choix", "Lien de partage public", "Prévisualisation invité", "Formulaire RSVP", "Gestion des invités", "Envoi par email"].map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={13} style={{ color: "#2d6a4f", flexShrink: 0, marginTop: 2 }} />
                      <span className="text-xs" style={{ color: "#2c2c2c", fontFamily: "var(--font-display)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6" style={{ backgroundColor: "white" }}>
                  <button
                    onClick={() => startCheckout("premium")}
                    disabled={checkoutLoading !== null}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: "#6D1D3E", color: "white", fontFamily: "var(--font-display)" }}
                  >
                    {checkoutLoading === "premium" ? "Chargement…" : "Choisir le Premium"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs pb-6" style={{ color: "rgba(44,44,44,0.35)", fontFamily: "var(--font-display)" }}>
              Paiement sécurisé par Stripe · Aucun abonnement
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
