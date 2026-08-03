"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";

export interface Palette {
  id: string; label: string;
  bg: string; inner: string;
  textPrimary: string; textSecondary: string; accent: string;
  stripes?: string[];
  paperImage?: string;
  swatchPos?: string;
  swatchSize?: string;
  noImageSwatch?: boolean;
}

export interface TemplateConfig {
  id: string; name: string; category: string; description: string; paperImage?: string; layoutVariant?: string; paperFit?: string;
  defaultPhotoUrl?: string;
  defaultPhotoUrls?: string[];
  palettes: Palette[];
}

export interface UserData { p1: string; p2: string; date: string; location: string; }

export interface CardCustomization {
  fontPreset: string;
  label: string;
  namesText: string;
  dateText: string;
  locationText: string;
  footer: string;
  tagline?: string;
  photoUrl: string;
  photoUrls?: string[];
  customPaperBg?: string;
  styles: Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;
}

export const FONT_PRESETS = [
  { id: "romantique",  label: "Romantique",  scriptFont: "var(--font-script)",      bodyFont: "var(--font-serif)",       scriptItalic: false },
  { id: "classique",   label: "Classique",   scriptFont: "var(--font-serif)",        bodyFont: "var(--font-serif)",       scriptItalic: true  },
  { id: "moderne",     label: "Moderne",     scriptFont: "var(--font-playfair)",     bodyFont: "var(--font-playfair)",    scriptItalic: true  },
  { id: "minimaliste", label: "Minimaliste", scriptFont: "var(--font-montserrat)",   bodyFont: "var(--font-montserrat)",  scriptItalic: false },
];

export const TEMPLATES: TemplateConfig[] = [
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
  {
    id: "save-the-date", name: "Save the Date", category: "photo",
    description: "Photo plein format, typographie Save the Date",
    layoutVariant: "save-photo",
    defaultPhotoUrl: "/photo_couple/couple_4.jpg",
    palettes: [
      { id: "lumiere", label: "Lumière", bg: "#f0ece6", inner: "#f0ece6", textPrimary: "#1a1610", textSecondary: "#5a5040", accent: "#2c2418" },
      { id: "nuit",    label: "Nuit",    bg: "#1a1a2e", inner: "#1a1a2e", textPrimary: "rgba(255,255,255,0.92)", textSecondary: "rgba(255,255,255,0.65)", accent: "rgba(255,255,255,0.45)" },
    ],
  },
];

export interface EnvelopeTexture { id: string; label: string; previewHex: string; filter: string; }

export const ENVELOPE_TEXTURES: EnvelopeTexture[] = [
  { id: "naturel",   label: "Naturel",     previewHex: "#EEE4D4", filter: "" },
  { id: "blanc",     label: "Blanc nacré", previewHex: "#F0EEEA", filter: "saturate(0.6) brightness(1.06) contrast(1.04)" },
  { id: "ivoire",    label: "Ivoire",      previewHex: "#EAE0C8", filter: "sepia(0.18) brightness(0.97) contrast(1.04)" },
  { id: "champagne", label: "Champagne",   previewHex: "#D8C888", filter: "sepia(0.38) saturate(1.1) brightness(0.99) contrast(1.05)" },
  { id: "blush",     label: "Blush",       previewHex: "#F0CACE", filter: "sepia(0.28) hue-rotate(320deg) saturate(1.2) brightness(1.02) contrast(1.05)" },
];

export interface EnvelopeConfig { textureId: string; }
export const DEFAULT_ENVELOPE: EnvelopeConfig = { textureId: "naturel" };

const ENV_OPEN_W = 211; const ENV_OPEN_H = 278;
const ENV_CLOSED_W = 211; const ENV_CLOSED_H = 154;

export function EnvelopeBody({ W, cfg, flapOpen, extraStyle }: { W: number; cfg?: EnvelopeConfig; flapOpen?: boolean; extraStyle?: React.CSSProperties; }) {
  const isOpen = flapOpen !== false;
  const openH   = Math.round(W * ENV_OPEN_H   / ENV_OPEN_W);
  const closedH = Math.round(W * ENV_CLOSED_H / ENV_CLOSED_W);
  const H = isOpen ? openH : closedH;
  const texture = ENVELOPE_TEXTURES.find(t => t.id === (cfg?.textureId ?? "naturel")) ?? ENVELOPE_TEXTURES[0];
  const imgFilter = texture.filter || undefined;
  return (
    <div style={{ position: "relative", width: W, height: H, ...extraStyle }}>
      <img src="/enveloppe/ouverte.svg" width={W} height={openH} style={{ display: "block", position: "absolute", top: 0, left: 0, opacity: isOpen ? 1 : 0, transition: "opacity 0.45s ease", pointerEvents: "none", filter: imgFilter }} alt="" />
      <img src="/enveloppe/fermee.svg" width={W} height={closedH} style={{ display: "block", position: "absolute", top: 0, left: 0, opacity: isOpen ? 0 : 1, transition: "opacity 0.35s ease", pointerEvents: "none", filter: imgFilter }} alt="" />
    </div>
  );
}

export function ScallopBorder({ W, H, margin, r, color }: { W: number; H: number; margin: number; r: number; color: string }) {
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

export function OliveBranch({ x, y, rotate, scale = 1, accentColor }: { x: number; y: number; rotate: number; scale?: number; accentColor: string }) {
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

type ElStyles = Record<string, { font?: string; color?: string; size?: number; uppercase?: boolean | "capitalize"; dx?: number; dy?: number; hidden?: boolean; italic?: boolean; bold?: boolean }>;

function TemplateDentelle({ W, H, p, user, photoUrl, fontPreset = "romantique", label, namesText, dateText, locationText, footer, elementStyles, customPaperBg }: {
  W: number; H: number; p: Palette; user: UserData;
  photoUrl?: string; fontPreset?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string;
  elementStyles?: ElStyles; customPaperBg?: string;
}) {
  const fp = FONT_PRESETS.find(f => f.id === fontPreset) ?? FONT_PRESETS[0];
  const displayLabel = (label ?? "save the date").charAt(0).toUpperCase() + (label ?? "save the date").slice(1);
  const displayFooter = footer ?? "invitation à suivre";
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Samedi 18 octobre 2026");
  const displayLocation = locationText ?? user.location;
  const photoW = W * 0.55; const photoH = H * 0.37; const photoX = (W - photoW) / 2; const photoY = H * 0.30;
  const tplDefaults: Record<string, { font?: string; size?: number }> = { label: { font: "var(--font-pinyon)" }, names: { size: 1.3 } };
  const getFont = (id: string, def: string) => elementStyles?.[id]?.font ?? tplDefaults[id]?.font ?? def;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? tplDefaults[id]?.size ?? 1);
  const getCase = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <defs>
        <filter id="ptex" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.055" numOctaves="5" seed="3" stitchTiles="stitch" result="bigN"/>
          <feColorMatrix in="bigN" type="saturate" values="0" result="bigG"/>
          <feComponentTransfer in="bigG" result="bigS">
            <feFuncR type="linear" slope="0.06" intercept="0.94"/>
            <feFuncG type="linear" slope="0.06" intercept="0.94"/>
            <feFuncB type="linear" slope="0.06" intercept="0.94"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="bigS" mode="multiply" result="pass1"/>
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
      {p.paperImage ? <image href={p.paperImage} x="0" y="0" width={W} height={H} preserveAspectRatio="xMidYMid slice"/> : <rect width={W} height={H} fill={customPaperBg ?? p.bg} filter="url(#ptex)"/>}
      <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.13} textAnchor="middle" fontFamily={getFont("label", fp.scriptFont)} fontStyle={fp.scriptItalic ? "italic" : "normal"} fontSize={getSize("label", W * 0.056)} fill={getColor("label", p.textPrimary)} opacity="0.88">{getCase("label", displayLabel)}</text>
      </g>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.23} textAnchor="middle" fontFamily={getFont("names", fp.bodyFont)} fontSize={getSize("names", W * 0.038)} fill={getColor("names", p.textPrimary)} letterSpacing="3" fontWeight="500">{getCase("names", displayNames)}</text>
      </g>
      {photoUrl ? (
        <image href={photoUrl} x={photoX} y={photoY} width={photoW} height={photoH} preserveAspectRatio="xMidYMid slice"/>
      ) : (
        <>
          <rect x={photoX} y={photoY} width={photoW} height={photoH} fill={p.textPrimary} opacity="0.07"/>
          <rect x={photoX} y={photoY} width={photoW} height={photoH} fill="none" stroke={p.textSecondary} strokeWidth="0.6" opacity="0.3"/>
          <text x={W / 2} y={photoY + photoH / 2 + W * 0.032} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={W * 0.055} fill={p.textSecondary} opacity="0.18">📷</text>
        </>
      )}
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={photoY + photoH + H * 0.095} textAnchor="middle" fontFamily={getFont("date", fp.bodyFont)} fontSize={getSize("date", W * 0.031)} fill={getColor("date", p.textPrimary)} letterSpacing="2.5" fontWeight="500">{getCase("date", displayDate)}</text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={photoY + photoH + H * 0.145} textAnchor="middle" fontFamily={getFont("location", fp.bodyFont)} fontSize={getSize("location", W * 0.028)} fill={getColor("location", p.textPrimary)} letterSpacing="2.5" fontWeight="500">{getCase("location", displayLocation)}</text>
        </g>
      )}
      <g transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`} style={{ display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.92} textAnchor="middle" fontFamily={getFont("footer", fp.scriptFont)} fontStyle={fp.scriptItalic ? "italic" : "normal"} fontSize={getSize("footer", W * 0.048)} fill={getColor("footer", p.textPrimary)} opacity="0.55">{getCase("footer", displayFooter)}</text>
      </g>
    </svg>
  );
}

function TemplatePhotomaton({ W, H, p, user, label, namesText, dateText, photoUrls, elementStyles, customPaperBg }: {
  W: number; H: number; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; photoUrls?: string[];
  elementStyles?: ElStyles; customPaperBg?: string;
}) {
  const displayLabel = label ?? "save the date";
  const displayNames = namesText || `${user.p1 || "Emma"} & ${user.p2 || "Charlie"}`;
  const displayDate = dateText || (user.date ? (() => { const d = new Date(user.date + "T12:00:00"); return `${String(d.getDate()).padStart(2,"0")} . ${String(d.getMonth()+1).padStart(2,"0")} . ${String(d.getFullYear()).slice(-2)}`; })() : "22 . 10 . 26");
  const gap = H * 0.012; const photoSize = (H * 0.77 - 3 * gap) / 4;
  const photoW = photoSize; const photoH = photoSize; const photoX = (W - photoW) / 2; const stripY = H * 0.115;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <defs><filter id="pm_bw" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="0.96" intercept="0.02"/><feFuncG type="linear" slope="0.96" intercept="0.02"/><feFuncB type="linear" slope="0.96" intercept="0.02"/></feComponentTransfer></filter></defs>
      <rect width={W} height={H} fill={customPaperBg ?? p.bg}/>
      <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.064} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"} fontSize={getSize("label", W * 0.030)} fill={getColor("label", p.textPrimary)} letterSpacing="4" opacity="0.85">
          {elementStyles?.label?.uppercase === true ? displayLabel.toUpperCase() : displayLabel.toUpperCase()}
        </text>
      </g>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.100} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "var(--font-montserrat)"} fontSize={getSize("names", W * 0.022)} fill={getColor("names", p.textSecondary)} letterSpacing="3">{displayNames}</text>
      </g>
      {[0, 1, 2, 3].map(i => {
        const py = stripY + i * (photoH + gap);
        const src = photoUrls?.[i];
        return (
          <g key={i}>
            {src ? <image href={src} x={photoX} y={py} width={photoW} height={photoH} preserveAspectRatio="xMidYMid slice" filter="url(#pm_bw)"/> : <rect x={photoX} y={py} width={photoW} height={photoH} fill={p.textPrimary} opacity="0.04"/>}
          </g>
        );
      })}
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.940} textAnchor="middle" fontFamily={elementStyles?.date?.font ?? "var(--font-script)"} fontSize={getSize("date", W * 0.046)} fill={getColor("date", p.textPrimary)} opacity="0.9">{displayDate}</text>
      </g>
    </svg>
  );
}

function TemplateOliviers({ W, H, p, user, fontPreset = "romantique", namesText, dateText, locationText, footer, elementStyles }: {
  W: number; H: number; p: Palette; user: UserData; fontPreset?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string; elementStyles?: ElStyles;
}) {
  const displayFooter = footer ?? "invitation à suivre";
  const displayNames = namesText || `${user.p1 || "Jennifer"} & ${user.p2 || "Nikos"}`;
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "18 octobre 2026");
  const displayLocation = locationText ?? user.location;
  const s = W / 400;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <rect width={W} height={H} fill={p.bg}/>
      <OliveBranch x={W*0.05} y={H*0.04} rotate={0}   scale={s*1.4} accentColor={p.accent}/>
      <OliveBranch x={W*0.32} y={H*0.02} rotate={10}  scale={s*1.2} accentColor={p.accent}/>
      <OliveBranch x={W*0.55} y={H*0.03} rotate={-15} scale={s*1.3} accentColor={p.accent}/>
      <OliveBranch x={W*0.75} y={H*0.04} rotate={5}   scale={s*1.1} accentColor={p.accent}/>
      <OliveBranch x={W*0.92} y={H*0.12} rotate={90}  scale={s*1.2} accentColor={p.accent}/>
      <OliveBranch x={W*0.85} y={H*0.93} rotate={180} scale={s*1.3} accentColor={p.accent}/>
      <OliveBranch x={W*0.08} y={H*0.92} rotate={190} scale={s}     accentColor={p.accent}/>
      <OliveBranch x={W*0.04} y={H*0.55} rotate={280} scale={s*1.2} accentColor={p.accent}/>
      <text x={W/2} y={H*0.270} textAnchor="middle" fontFamily="var(--font-serif)" fontWeight="400" fontSize={W*0.145} fill={p.textPrimary} letterSpacing="10" opacity="0.92">SAVE</text>
      <text x={W/2} y={H*0.350} textAnchor="middle" fontFamily="var(--font-script)" fontStyle="italic" fontSize={W*0.092} fill={p.accent} opacity="0.85">the</text>
      <text x={W/2} y={H*0.440} textAnchor="middle" fontFamily="var(--font-serif)" fontWeight="400" fontSize={W*0.145} fill={p.textPrimary} letterSpacing="10" opacity="0.92">DATE</text>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*0.569} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "var(--font-serif)"} fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "500")} fontSize={getSize("names", W*0.044)} fill={getColor("names", p.textPrimary)} letterSpacing="4">{displayNames.toUpperCase()}</text>
      </g>
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*0.660} textAnchor="middle" fontFamily={elementStyles?.date?.font ?? "var(--font-serif)"} fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")} fontSize={getSize("date", W*0.034)} fill={getColor("date", p.textPrimary)} letterSpacing="1">{displayDate}</text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W/2} y={H*0.735} textAnchor="middle" fontFamily={elementStyles?.location?.font ?? "var(--font-serif)"} fontStyle={getFontStyle("location", "italic")} fontWeight={getFontWeight("location")} fontSize={getSize("location", W*0.028)} fill={getColor("location", p.textSecondary)} letterSpacing="1">{displayLocation}</text>
        </g>
      )}
      <g transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`} style={{ display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*0.872} textAnchor="middle" fontFamily={elementStyles?.footer?.font ?? "var(--font-script)"} fontStyle={getFontStyle("footer", "italic")} fontWeight={getFontWeight("footer")} fontSize={getSize("footer", W*0.042)} fill={getColor("footer", p.textSecondary)} opacity="0.75">{displayFooter}</text>
      </g>
    </svg>
  );
}

function TemplateRayures({ W, H, p, user, isStd, customPaperBg, label, namesText, dateText, locationText, footer, elementStyles }: {
  W: number; H: number; p: Palette; user: UserData; isStd: boolean; customPaperBg?: string;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string; elementStyles?: ElStyles;
}) {
  let stripes: string[];
  if (customPaperBg && /^#[0-9A-Fa-f]{6}$/.test(customPaperBg)) {
    const r = parseInt(customPaperBg.slice(1, 3), 16); const g = parseInt(customPaperBg.slice(3, 5), 16); const b = parseInt(customPaperBg.slice(5, 7), 16);
    const mix = (w: number) => { const toHex = (v: number) => Math.round(v + (255 - v) * w).toString(16).padStart(2, "0"); return `#${toHex(r)}${toHex(g)}${toHex(b)}`; };
    stripes = [mix(0.65), mix(0.42), mix(0.20), customPaperBg];
  } else { stripes = p.stripes ?? [p.bg, p.bg + "CC", p.bg + "99", p.bg + "66"]; }
  const sw = W / stripes.length;
  const rawNames = namesText || `${user.p1 || "SOPHIA"} & ${user.p2 || "BENNETT"}`;
  const parts = rawNames.split(/\s*(?:&|\bet\b)\s*/i); const name1Raw = (parts[0] ?? rawNames).trim(); const name2Raw = (parts[1] ?? "").trim();
  const i1 = name1Raw[0]?.toUpperCase() ?? "S"; const i2 = name2Raw[0]?.toUpperCase() ?? "T";
  const displayLabel = label || (isStd ? "Save the Date" : "Mariage");
  const fmtDate = user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Samedi 18 octobre 2026";
  const displayDate = dateText || fmtDate; const displayLocation = locationText ?? user.location;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0;
  const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      {stripes.map((c, i) => <rect key={i} x={i * sw} y={0} width={sw} height={H} fill={c}/>)}
      {elementStyles?.["monogram"]?.hidden === false && (
        <g>
          <circle cx={W/2} cy={H*0.10} r={W*0.065} fill="none" stroke={p.textPrimary} strokeWidth="1" opacity="0.5"/>
          <text x={W/2} y={H*0.115} textAnchor="middle" fontFamily="var(--font-serif)" fontSize={W*0.05} fill={p.textPrimary} fontStyle="italic">{i1}{i2}</text>
        </g>
      )}
      <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        {isStd ? (
          <>
            <text x={W/2} y={H*0.205} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"} fontStyle="italic" fontSize={getSize("label", W * 0.028)} fill={getColor("label", p.textPrimary)} letterSpacing="4" style={{ textTransform:"uppercase" as const }} opacity="0.7">Save the Date</text>
            <text x={W/2} y={H*0.248} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"} fontSize={getSize("label", W * 0.022)} fill={getColor("label", p.textPrimary)} letterSpacing="2" style={{ textTransform:"uppercase" as const }} opacity="0.55">pour le mariage de</text>
          </>
        ) : (
          <text x={W/2} y={H*0.225} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"} fontSize={getSize("label", W * 0.028)} fill={getColor("label", p.textPrimary)} letterSpacing="4" style={{ textTransform:"uppercase" as const }} opacity="0.7">{displayLabel}</text>
        )}
      </g>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*(isStd?0.385:0.375)} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "var(--font-playfair)"} fontSize={getSize("names", W * 0.13)} fontWeight="700" fill={getColor("names", p.textPrimary)} style={{ textTransform:"uppercase" as const }}>{name1Raw.toUpperCase()}</text>
        <text x={W/2} y={H*(isStd?0.48:0.46)} textAnchor="middle" fontFamily="var(--font-script)" fontSize={W*0.1} fill={p.accent}>and</text>
        {name2Raw && <text x={W/2} y={H*(isStd?0.59:0.57)} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "var(--font-playfair)"} fontSize={getSize("names", W * 0.13)} fontWeight="700" fill={getColor("names", p.textPrimary)} style={{ textTransform:"uppercase" as const }}>{name2Raw.toUpperCase()}</text>}
      </g>
      {!elementStyles?.["tagline"]?.hidden && (
        <text x={W/2} y={H*(isStd?0.735:0.715)} textAnchor="middle" fontFamily={elementStyles?.tagline?.font ?? "var(--font-montserrat)"}
          fontSize={getSize("tagline", W*0.027)} fill={getColor("tagline", p.textPrimary)} letterSpacing="2.5" style={{ textTransform:"uppercase" as const }} opacity="0.65">
          {footer || "sont heureux de vous inviter"}
        </text>
      )}
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*(isStd?0.815:0.79)} textAnchor="middle" fontFamily={elementStyles?.date?.font ?? "var(--font-montserrat)"} fontSize={getSize("date", W * 0.028)} fill={getColor("date", p.textPrimary)} letterSpacing="1.5" style={{ textTransform:"uppercase" as const }}>{displayDate}</text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W/2} y={H*(isStd?0.88:0.855)} textAnchor="middle" fontFamily={elementStyles?.location?.font ?? "var(--font-montserrat)"} fontSize={getSize("location", W * 0.025)} fill={getColor("location", p.textSecondary)} letterSpacing="1">{displayLocation}</text>
        </g>
      )}
    </svg>
  );
}

function TemplateLettre({ W, H, paperImage, p, user, fontPreset = "romantique", label, namesText, namesConnector, dateText, locationText, footer, elementStyles, paperFit = "xMidYMid slice", tplId, isStd }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData; fontPreset?: string;
  label?: string; namesText?: string; namesConnector?: string; dateText?: string; locationText?: string; footer?: string;
  elementStyles?: ElStyles; paperFit?: string; tplId?: string; isStd?: boolean;
}) {
  const fp = FONT_PRESETS.find(f => f.id === fontPreset) ?? FONT_PRESETS[0];
  const displayLabel = label ?? "save the date"; const displayFooter = footer ?? "invitation à suivre";
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Samedi 18 octobre 2026");
  const displayLocation = locationText ?? user.location;
  const getFont = (id: string, def: string) => elementStyles?.[id]?.font ?? def;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX = (id: string) => elementStyles?.[id]?.dx ?? 0; const getDY = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <rect width={W} height={H} fill={p.bg}/>
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio={paperFit}/>
      {tplId === "lettre-moderne" && isStd ? (() => {
        const lParts = (displayLabel || "save the date\ninvitation à suivre").split("\n");
        const l1 = lParts[0] ?? "save the date";
        const l2 = lParts[1] ?? "invitation à suivre";
        return (
          <>
            <g transform={`translate(${getDX("lmLabel1")*W} ${getDY("lmLabel1")*H})`} style={{ display: elementStyles?.["lmLabel1"]?.hidden ? "none" : undefined }}>
              <text x={W / 2} y={H * 0.245} textAnchor="middle" fontFamily={getFont("lmLabel1", "var(--font-montserrat)")} fontStyle={getFontStyle("lmLabel1", "italic")} fontWeight={getFontWeight("lmLabel1")} fontSize={getSize("lmLabel1", W * 0.058)} fill={getColor("lmLabel1", p.textPrimary)}>{l1}</text>
            </g>
            {l2 && (
              <g transform={`translate(${getDX("lmLabel2")*W} ${getDY("lmLabel2")*H})`} style={{ display: elementStyles?.["lmLabel2"]?.hidden ? "none" : undefined }}>
                <text x={W / 2} y={H * 0.305} textAnchor="middle" fontFamily={getFont("lmLabel2", "var(--font-libre-baskerville)")} fontStyle={getFontStyle("lmLabel2", "italic")} fontWeight={getFontWeight("lmLabel2")} fontSize={getSize("lmLabel2", W * 0.042)} fill={getColor("lmLabel2", p.textPrimary)}>{l2}</text>
              </g>
            )}
          </>
        );
      })() : (
        <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={H * 0.22} textAnchor="middle" fontFamily={getFont("label", fp.scriptFont)} fontStyle={getFontStyle("label", fp.scriptItalic ? "italic" : "normal")} fontWeight={getFontWeight("label")} fontSize={getSize("label", W * 0.062)} fill={getColor("label", p.textPrimary)} opacity="0.9">{getCase("label", displayLabel)}</text>
        </g>
      )}
      {tplId !== "lettre-moderne" && <line x1={W * 0.32} y1={H * 0.27} x2={W * 0.68} y2={H * 0.27} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>}
      {tplId === "lettre-moderne" ? (() => {
        const lmParts = displayNames.split(/\s*(?:&|\bet\b)\s*/i);
        const lmN1 = (lmParts[0] ?? displayNames).trim();
        const lmN2 = (lmParts[1] ?? "").trim();
        const conn = namesConnector ?? "et";
        return (
          <>
            <g transform={`translate(${getDX("lmName1")*W} ${getDY("lmName1")*H})`} style={{ display: elementStyles?.["lmName1"]?.hidden ? "none" : undefined }}>
              <text x={W/2} y={H * 0.44} textAnchor="middle" fontFamily={getFont("lmName1", "var(--font-brittany)")} fontStyle={getFontStyle("lmName1")} fontWeight={getFontWeight("lmName1")} fontSize={getSize("lmName1", W * 0.115)} fill={getColor("lmName1", p.textPrimary)}>{lmN1}</text>
            </g>
            <g transform={`translate(${getDX("lmConnector")*W} ${getDY("lmConnector")*H})`} style={{ display: elementStyles?.["lmConnector"]?.hidden ? "none" : undefined }}>
              <text x={W/2} y={H * 0.535} textAnchor="middle" fontFamily={getFont("lmConnector", "var(--font-libre-baskerville)")} fontSize={getSize("lmConnector", W * 0.038)} fill={getColor("lmConnector", p.textPrimary)} fontStyle={getFontStyle("lmConnector", "italic")} fontWeight={getFontWeight("lmConnector")}>{conn}</text>
            </g>
            {lmN2 && (
              <g transform={`translate(${getDX("lmName2")*W} ${getDY("lmName2")*H})`} style={{ display: elementStyles?.["lmName2"]?.hidden ? "none" : undefined }}>
                <text x={W/2} y={H * 0.64} textAnchor="middle" fontFamily={getFont("lmName2", "var(--font-brittany)")} fontStyle={getFontStyle("lmName2")} fontWeight={getFontWeight("lmName2")} fontSize={getSize("lmName2", W * 0.115)} fill={getColor("lmName2", p.textPrimary)}>{lmN2}</text>
              </g>
            )}
          </>
        );
      })() : (
        <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={H * 0.38} textAnchor="middle" fontFamily={getFont("names", fp.scriptFont)} fontStyle={getFontStyle("names", fp.scriptItalic ? "italic" : "normal")} fontWeight={getFontWeight("names")} fontSize={getSize("names", W * 0.072)} fill={getColor("names", p.textPrimary)}>{getCase("names", displayNames)}</text>
        </g>
      )}
      {tplId !== "lettre-moderne" && <line x1={W * 0.32} y1={H * 0.43} x2={W * 0.68} y2={H * 0.43} stroke={p.accent} strokeWidth="0.7" opacity="0.45"/>}
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={tplId === "lettre-moderne" ? H * 0.72 : H * 0.52} textAnchor="middle"
          fontFamily={tplId === "lettre-moderne" ? "var(--font-libre-baskerville)" : getFont("date", fp.bodyFont)}
          fontSize={getSize("date", W * 0.030)} fill={getColor("date", p.textPrimary)}
          fontStyle={getFontStyle("date", tplId === "lettre-moderne" ? "italic" : "normal")}
          letterSpacing={tplId === "lettre-moderne" ? "0" : "2"} fontWeight={getFontWeight("date")}>
          {getCase("date", displayDate)}
        </text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={tplId === "lettre-moderne" ? H * 0.79 : H * 0.577} textAnchor="middle"
            fontFamily={tplId === "lettre-moderne" ? "var(--font-libre-baskerville)" : getFont("location", fp.bodyFont)}
            fontSize={getSize("location", tplId === "lettre-moderne" ? W * 0.028 : W * 0.027)}
            fill={getColor("location", p.textPrimary)}
            letterSpacing={tplId === "lettre-moderne" ? "0" : "1.5"} fontStyle={getFontStyle("location", "italic")} fontWeight={getFontWeight("location")}>
            {getCase("location", displayLocation)}
          </text>
        </g>
      )}
      {tplId !== "lettre-moderne" && (
        <g transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`} style={{ display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={H * 0.835} textAnchor="middle" fontFamily={getFont("footer", fp.scriptFont)} fontStyle={getFontStyle("footer", fp.scriptItalic ? "italic" : "normal")} fontWeight={getFontWeight("footer")} fontSize={getSize("footer", W * 0.042)} fill={getColor("footer", p.textSecondary)} opacity="0.75">{getCase("footer", displayFooter)}</text>
        </g>
      )}
    </svg>
  );
}

function TemplateElegant({ W, H, paperImage, p, user, label, namesText, dateText, locationText, footer, elementStyles, tplId }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string; elementStyles?: ElStyles;
  tplId?: string;
}) {
  const isFlowerBig3 = tplId === "lettre-flower-big-3";
  const displayLabel = label ?? "save the date"; const displayFooter = footer ?? "invitation à suivre";
  const rawNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const parts = rawNames.split(/\s*(?:&|\bet\b)\s*/i); const name1Raw = (parts[0] ?? rawNames).trim(); const name2Raw = (parts[1] ?? "").trim();
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Samedi 18 octobre 2026");
  const displayLocation = locationText ?? user.location;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0; const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  const nameCase = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; if (u === false) return val; if (u === "capitalize") return val.replace(/\b\w/g, c => c.toUpperCase()); return val.toUpperCase(); };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}>
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none"/>
      {!isFlowerBig3 && <rect x={W * 0.052} y={H * 0.032} width={W * 0.896} height={H * 0.936} fill="none" stroke={p.accent} strokeWidth="0.9" strokeDasharray="2,3.5" opacity="0.7"/>}
      {!isFlowerBig3 && <rect x={W * 0.068} y={H * 0.042} width={W * 0.864} height={H * 0.916} fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.35"/>}
      <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.408} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? (isFlowerBig3 ? "var(--font-pinyon)" : "var(--font-playfair)")} fontStyle={getFontStyle("label", "italic")} fontWeight={getFontWeight("label")} fontSize={getSize("label", W * 0.046)} fill={getColor("label", "#909090")}>{getCase("label", displayLabel)}</text>
      </g>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.500} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "'Times New Roman', Georgia, serif"} fontWeight={getFontWeight("names", "400")} fontSize={getSize("names", W * 0.080)} fill={getColor("names", p.accent)} letterSpacing="3">{nameCase("names", name1Raw)}</text>
        <text x={W / 2} y={H * 0.560} textAnchor="middle" fontFamily="var(--font-script)" fontStyle={getFontStyle("names", "italic")} fontSize={W * 0.054} fill={getColor("names", p.textSecondary)} opacity="0.75">et</text>
        {name2Raw && <text x={W / 2} y={H * 0.648} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "'Times New Roman', Georgia, serif"} fontWeight={getFontWeight("names", "400")} fontSize={getSize("names", W * 0.080)} fill={getColor("names", p.accent)} letterSpacing="3">{nameCase("names", name2Raw)}</text>}
      </g>
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.752} textAnchor="middle" fontFamily={elementStyles?.date?.font ?? "var(--font-montserrat)"} fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")} fontSize={getSize("date", W * 0.026)} fill={getColor("date", p.textSecondary)} letterSpacing="3.5" style={{ textTransform: "uppercase" as const }}>{getCase("date", displayDate)}</text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={H * 0.840} textAnchor="middle" fontFamily={elementStyles?.location?.font ?? (isFlowerBig3 ? "var(--font-montserrat)" : "var(--font-serif)")} fontStyle={getFontStyle("location", isFlowerBig3 ? "normal" : "italic")} fontWeight={getFontWeight("location")} fontSize={getSize("location", W * 0.030)} fill={getColor("location", p.textPrimary)}>{getCase("location", displayLocation)}</text>
        </g>
      )}
      <g transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`} style={{ display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.935} textAnchor="middle" fontFamily={elementStyles?.footer?.font ?? (isFlowerBig3 ? "var(--font-pinyon)" : "var(--font-script)")} fontStyle={getFontStyle("footer", "italic")} fontWeight={getFontWeight("footer")} fontSize={getSize("footer", W * 0.052)} fill={getColor("footer", p.textSecondary)} opacity="0.75">{getCase("footer", displayFooter)}</text>
      </g>
    </svg>
  );
}

function TemplateArbre({ W, H, paperImage, p, user, label, namesText, dateText, locationText, tagline, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string; tagline?: string; elementStyles?: ElStyles;
}) {
  const displayLabel = label ?? "save the date";
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "18 octobre 2026");
  const displayLocation = locationText ?? user.location;
  const displayTagline = tagline ?? "vont se marier le";
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0; const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}>
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none"/>
      <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.275} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? "var(--font-montserrat)"} fontStyle={getFontStyle("label")} fontWeight={getFontWeight("label")} fontSize={getSize("label", W * 0.028)} fill={getColor("label", p.textPrimary)} letterSpacing="5" style={{ textTransform: "uppercase" as const }} opacity="0.9">{getCase("label", displayLabel)}</text>
      </g>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.390} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "var(--font-script)"} fontStyle={getFontStyle("names", "italic")} fontWeight={getFontWeight("names")} fontSize={getSize("names", W * 0.112)} fill={getColor("names", p.textPrimary)}>{getCase("names", displayNames)}</text>
      </g>
      {!elementStyles?.["tagline"]?.hidden && (
        <g transform={`translate(${(elementStyles?.tagline?.dx ?? 0)*W} ${(elementStyles?.tagline?.dy ?? 0)*H})`}>
          <text x={W / 2} y={H * 0.497} textAnchor="middle"
            fontFamily={elementStyles?.tagline?.font ?? "var(--font-montserrat)"}
            fontStyle={getFontStyle("tagline")} fontWeight={getFontWeight("tagline")}
            fontSize={getSize("tagline", W * 0.024)} fill={getColor("tagline", p.textSecondary)}
            letterSpacing="4" style={{ textTransform: "uppercase" as const }} opacity="0.8">
            {displayTagline}
          </text>
        </g>
      )}
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.620} textAnchor="middle" fontFamily={elementStyles?.date?.font ?? "var(--font-script)"} fontStyle={getFontStyle("date", "italic")} fontWeight={getFontWeight("date")} fontSize={getSize("date", W * 0.090)} fill={getColor("date", p.textPrimary)}>{getCase("date", displayDate)}</text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={H * 0.752} textAnchor="middle" fontFamily={elementStyles?.location?.font ?? "var(--font-montserrat)"} fontStyle={getFontStyle("location")} fontWeight={getFontWeight("location")} fontSize={getSize("location", W * 0.025)} fill={getColor("location", p.textSecondary)} letterSpacing="4" style={{ textTransform: "uppercase" as const }} opacity="0.85">{getCase("location", displayLocation)}</text>
        </g>
      )}
    </svg>
  );
}

function TemplateItalySTD({ W, H, paperImage, p, user, label, namesText, dateText, locationText, footer, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string; elementStyles?: ElStyles;
}) {
  const displayFooter = footer ?? "invitation à suivre";
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "18 octobre 2026");
  const displayLocation = locationText ?? user.location;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0; const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}>
      <rect width={W} height={H} fill={p.bg}/>
      <image href={p.paperImage ?? paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"/>
      <text x={W / 2} y={H * 0.270} textAnchor="middle" fontFamily="var(--font-serif)" fontWeight="400" fontSize={W * 0.145} fill={p.textPrimary} letterSpacing="10" opacity="0.92">SAVE</text>
      <text x={W / 2} y={H * 0.350} textAnchor="middle" fontFamily="var(--font-script)" fontStyle="italic" fontSize={W * 0.092} fill={p.accent} opacity="0.85">the</text>
      <text x={W / 2} y={H * 0.440} textAnchor="middle" fontFamily="var(--font-serif)" fontWeight="400" fontSize={W * 0.145} fill={p.textPrimary} letterSpacing="10" opacity="0.92">DATE</text>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.569} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "var(--font-serif)"} fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "500")} fontSize={getSize("names", W * 0.044)} fill={getColor("names", p.textPrimary)} letterSpacing="4">{getCase("names", displayNames.toUpperCase())}</text>
      </g>
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.660} textAnchor="middle" fontFamily={elementStyles?.date?.font ?? "var(--font-serif)"} fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")} fontSize={getSize("date", W * 0.034)} fill={getColor("date", p.textPrimary)} letterSpacing="1">{getCase("date", displayDate)}</text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={H * 0.735} textAnchor="middle" fontFamily={elementStyles?.location?.font ?? "var(--font-serif)"} fontStyle={getFontStyle("location", "italic")} fontWeight={getFontWeight("location")} fontSize={getSize("location", W * 0.028)} fill={getColor("location", p.textSecondary)} letterSpacing="1">{getCase("location", displayLocation)}</text>
        </g>
      )}
      <g transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`} style={{ display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.872} textAnchor="middle" fontFamily={elementStyles?.footer?.font ?? "var(--font-script)"} fontStyle={getFontStyle("footer", "italic")} fontWeight={getFontWeight("footer")} fontSize={getSize("footer", W * 0.042)} fill={getColor("footer", p.textSecondary)} opacity="0.75">{getCase("footer", displayFooter)}</text>
      </g>
    </svg>
  );
}

function TemplateLettreBold({ W, H, paperImage, p, user, namesText, dateText, locationText, footer, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  namesText?: string; dateText?: string; locationText?: string; footer?: string; elementStyles?: ElStyles;
}) {
  const rawNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const parts = rawNames.split(/\s*(?:&|\bet\b)\s*/i); const name1Raw = (parts[0] ?? rawNames).trim(); const name2Raw = (parts[1] ?? "").trim();
  const displayDate = dateText || (user.date ? (() => { const d = new Date(user.date + "T12:00:00"); return `${String(d.getDate()).padStart(2, "0")} | ${String(d.getMonth() + 1).padStart(2, "0")} | ${String(d.getFullYear()).slice(-2)}`; })() : "18 | 10 | 26");
  const displayLocation = locationText ?? user.location; const displayFooter = footer ?? "invitation à suivre";
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0; const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <image href={paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"/>
      <text x={W / 2} y={H * 0.210} textAnchor="middle" fontFamily="var(--font-playfair)" fontWeight="700" fontSize={W * 0.148} fill={p.textPrimary} letterSpacing="-0.5">SAVE</text>
      <text x={W / 2} y={H * 0.272} textAnchor="middle" fontFamily="var(--font-script)" fontStyle="italic" fontSize={W * 0.062} fill={p.textSecondary} opacity="0.85">the</text>
      <text x={W / 2} y={H * 0.370} textAnchor="middle" fontFamily="var(--font-playfair)" fontWeight="700" fontSize={W * 0.148} fill={p.textPrimary} letterSpacing="-0.5">DATE</text>
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.438} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date", "500")} fontSize={getSize("date", W * 0.050)} fill={getColor("date", p.textPrimary)} letterSpacing="3">{getCase("date", displayDate)}</text>
      </g>
      <text x={W / 2} y={H * 0.490} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize={W * 0.026} fill={p.textSecondary} opacity="0.7">invitation à suivre</text>
      <line x1={W * 0.30} y1={H * 0.512} x2={W * 0.70} y2={H * 0.512} stroke={p.accent} strokeWidth="0.6" opacity="0.35"/>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.590} textAnchor="middle" fontFamily="var(--font-playfair)" fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "700")} fontSize={getSize("names", W * 0.088)} fill={getColor("names", p.textPrimary)} letterSpacing="2">{elementStyles?.["names"]?.uppercase === false ? name1Raw : name1Raw.toUpperCase()}</text>
        <text x={W / 2} y={H * 0.652} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize={W * 0.026} fill={p.textSecondary} opacity="0.65">et</text>
        {name2Raw && <text x={W / 2} y={H * 0.720} textAnchor="middle" fontFamily="var(--font-playfair)" fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names", "700")} fontSize={getSize("names", W * 0.088)} fill={getColor("names", p.textPrimary)} letterSpacing="2">{elementStyles?.["names"]?.uppercase === false ? name2Raw : name2Raw.toUpperCase()}</text>}
      </g>
      <line x1={W * 0.30} y1={H * 0.760} x2={W * 0.70} y2={H * 0.760} stroke={p.accent} strokeWidth="0.6" opacity="0.35"/>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W / 2} y={H * 0.822} textAnchor="middle" fontFamily="var(--font-montserrat)" fontStyle={getFontStyle("location")} fontWeight={getFontWeight("location")} fontSize={getSize("location", W * 0.025)} fill={getColor("location", p.textPrimary)} letterSpacing="3.5" style={{ textTransform: "uppercase" as const }}>{getCase("location", displayLocation)}</text>
        </g>
      )}
      <g transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`} style={{ display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.892} textAnchor="middle" fontFamily="var(--font-serif)" fontStyle={getFontStyle("footer", "italic")} fontWeight={getFontWeight("footer")} fontSize={getSize("footer", W * 0.024)} fill={getColor("footer", p.textSecondary)} opacity="0.65">{getCase("footer", displayFooter)}</text>
      </g>
    </svg>
  );
}

function TemplateLettrPhoto({ W, H, paperImage, p, user, label, namesText, dateText, photoUrl, elementStyles }: {
  W: number; H: number; paperImage: string; p: Palette; user: UserData;
  label?: string; namesText?: string; dateText?: string; photoUrl?: string; elementStyles?: ElStyles;
}) {
  const displayLabel = label ?? "save the date";
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "18 octobre 2026");
  const displayNames = namesText || `${user.p1 || "Ève"} & ${user.p2 || "Antoine"}`;
  const fX = W * 0.225; const fY = H * 0.21; const fW = W * 0.550; const fH = H * 0.48;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);
  const getCase  = (id: string, val: string) => { const u = elementStyles?.[id]?.uppercase; return u === true ? val.toUpperCase() : u === "capitalize" ? val.replace(/\b\w/g, c => c.toUpperCase()) : val; };
  const getDX  = (id: string) => elementStyles?.[id]?.dx ?? 0; const getDY  = (id: string) => elementStyles?.[id]?.dy ?? 0;
  const getFontStyle = (id: string, def = "normal") => { const v = elementStyles?.[id]?.italic; return v !== undefined ? (v ? "italic" : "normal") : def; };
  const getFontWeight = (id: string, def = "400") => { const v = elementStyles?.[id]?.bold; return v !== undefined ? (v ? "700" : def) : def; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <image href={paperImage} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"/>
      <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={H * 0.122} textAnchor="middle" fontFamily={elementStyles?.label?.font ?? "var(--font-script)"} fontStyle={getFontStyle("label", "italic")} fontWeight={getFontWeight("label")} fontSize={getSize("label", W * 0.042)} fill={getColor("label", p.textPrimary)} opacity="0.85">{getCase("label", displayLabel)}</text>
      </g>
      {photoUrl ? <image href={photoUrl} x={fX} y={fY} width={fW} height={fH} preserveAspectRatio="xMidYMid slice"/> : <rect x={fX} y={fY} width={fW} height={fH} fill={p.textPrimary} opacity="0.05"/>}
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={fY + fH + H * 0.030} textAnchor="middle" fontFamily={elementStyles?.names?.font ?? "var(--font-montserrat)"} fontStyle={getFontStyle("names")} fontWeight={getFontWeight("names")} fontSize={getSize("names", W * 0.026)} fill={getColor("names", p.textPrimary)} letterSpacing="3" style={{ textTransform: "uppercase" as const }}>{getCase("names", displayNames)}</text>
      </g>
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W / 2} y={fY + fH + H * 0.082} textAnchor="middle" fontFamily={elementStyles?.date?.font ?? "var(--font-script)"} fontStyle={getFontStyle("date", "italic")} fontWeight={getFontWeight("date")} fontSize={getSize("date", W * 0.040)} fill={getColor("date", p.textPrimary)} opacity="0.82">{getCase("date", displayDate)}</text>
      </g>
    </svg>
  );
}

function TemplatePhotoTexte({ W, H, p, user, label, footer, namesText, dateText, locationText, photoUrl, elementStyles }: {
  W: number; H: number; p: Palette; user: UserData;
  label?: string; footer?: string; namesText?: string; dateText?: string; locationText?: string; photoUrl?: string;
  elementStyles?: ElStyles;
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
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block", outline: "none" }}>
      <image href={photo} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid slice"/>
      <g transform={`translate(${getDX("label")*W} ${getDY("label")*H})`} style={{ display: elementStyles?.["label"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*0.140} textAnchor="middle"
          fontFamily={elementStyles?.label?.font ?? "var(--font-brittany)"}
          fontStyle={getFontStyle("label","normal")} fontWeight={getFontWeight("label")}
          fontSize={getSize("label", W*0.120)} fill={getColor("label","#0A0A0A")}>
          {getCase("label", displayLabel)}
        </text>
      </g>
      <g transform={`translate(${getDX("footer")*W} ${getDY("footer")*H})`} style={{ display: elementStyles?.["footer"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*0.245} textAnchor="middle"
          fontFamily={elementStyles?.footer?.font ?? "var(--font-libre-baskerville)"}
          fontStyle={getFontStyle("footer","normal")} fontWeight={getFontWeight("footer")}
          fontSize={getSize("footer", W*0.030)} fill={getColor("footer", p.accent)}>
          {getCase("footer", displayFooter)}
        </text>
      </g>
      <g transform={`translate(${getDX("names")*W} ${getDY("names")*H})`} style={{ display: elementStyles?.["names"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*0.370} textAnchor="middle"
          fontFamily={elementStyles?.names?.font ?? "var(--font-libre-baskerville)"}
          fontWeight={getFontWeight("names","700")} fontStyle={getFontStyle("names")}
          fontSize={getSize("names", W*0.070)} fill={getColor("names","#0A0A0A")}>
          {getCase("names", displayNames)}
        </text>
      </g>
      <g transform={`translate(${getDX("date")*W} ${getDY("date")*H})`} style={{ display: elementStyles?.["date"]?.hidden ? "none" : undefined }}>
        <text x={W/2} y={H*0.455} textAnchor="middle"
          fontFamily={elementStyles?.date?.font ?? "var(--font-sans)"}
          fontStyle={getFontStyle("date")} fontWeight={getFontWeight("date")}
          fontSize={getSize("date", W*0.028)} fill={getColor("date", p.accent)}>
          {getCase("date", displayDate)}
        </text>
      </g>
      {displayLocation && (
        <g transform={`translate(${getDX("location")*W} ${getDY("location")*H})`} style={{ display: elementStyles?.["location"]?.hidden ? "none" : undefined }}>
          <text x={W/2} y={H*0.515} textAnchor="middle"
            fontFamily={elementStyles?.location?.font ?? "var(--font-sans)"}
            fontStyle={getFontStyle("location")} fontWeight={getFontWeight("location")}
            fontSize={getSize("location", W*0.028)} fill={getColor("location","#333333")}>
            {getCase("location", displayLocation)}
          </text>
        </g>
      )}
    </svg>
  );
}

function TemplateSaveTheDatePhoto({ W, H, p, user, namesText, dateText, photoUrl, elementStyles }: {
  W: number; H: number; p: Palette; user: UserData;
  namesText?: string; dateText?: string; photoUrl?: string; elementStyles?: ElStyles;
}) {
  const displayNames = namesText || `${user.p1 || "Emma"} & ${user.p2 || "Charlie"}`;
  const displayDate = dateText || (user.date ? new Date(user.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "18 octobre 2026");
  const photo = photoUrl ?? "/photo_couple/couple_4.jpg";
  const col = p.textPrimary;
  const getColor = (id: string, def: string) => elementStyles?.[id]?.color ?? def;
  const getSize  = (id: string, def: number) => def * (elementStyles?.[id]?.size ?? 1);

  const bigSize    = W * 0.215;
  const scriptSize = W * 0.115;
  const namesSize  = W * 0.036;
  const dateSize   = W * 0.030;

  const saveY    = H * 0.305;
  const theY     = H * 0.428;
  const dateWordY = H * 0.572;
  const lineY    = H * 0.820;
  const namesY   = H * 0.868;
  const dateLineY = H * 0.913;

  const lineLen = W * 0.13;
  const cx = W / 2;

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#1a1814" }}>
      <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, transparent 30%, transparent 68%, rgba(0,0,0,0.28) 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, display: "block" }}>
        {/* SAVE */}
        <text x={cx} y={saveY} textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={getSize("label", bigSize)} fontWeight="400"
          letterSpacing={W * 0.02}
          fill="none" stroke={getColor("label", col)} strokeWidth={Math.max(1, W * 0.0038)}
        >SAVE</text>

        {/* lines + the + lines */}
        <line x1={cx - lineLen - W * 0.065} y1={theY - scriptSize * 0.28} x2={cx - W * 0.065} y2={theY - scriptSize * 0.28} stroke={getColor("label", col)} strokeWidth={0.8} opacity={0.55}/>
        <line x1={cx + W * 0.065} y1={theY - scriptSize * 0.28} x2={cx + lineLen + W * 0.065} y2={theY - scriptSize * 0.28} stroke={getColor("label", col)} strokeWidth={0.8} opacity={0.55}/>
        <text x={cx} y={theY} textAnchor="middle"
          fontFamily="var(--font-script), Georgia, serif"
          fontSize={getSize("label", scriptSize)} fontStyle="italic"
          fill={getColor("label", col)}
        >the</text>

        {/* DATE */}
        <text x={cx} y={dateWordY} textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={getSize("label", bigSize)} fontWeight="400"
          letterSpacing={W * 0.02}
          fill="none" stroke={getColor("label", col)} strokeWidth={Math.max(1, W * 0.0038)}
        >DATE</text>

        {/* thin rule before names */}
        <line x1={cx - W * 0.12} y1={lineY} x2={cx + W * 0.12} y2={lineY} stroke={getColor("names", col)} strokeWidth={0.7} opacity={0.45}/>

        {/* names */}
        <text x={cx} y={namesY} textAnchor="middle"
          fontFamily="var(--font-display), 'Helvetica Neue', sans-serif"
          fontSize={getSize("names", namesSize)} letterSpacing={W * 0.045}
          fill={getColor("names", col)}
        >{displayNames.toUpperCase()}</text>

        {/* date line */}
        <text x={cx} y={dateLineY} textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize={getSize("date", dateSize)} letterSpacing={W * 0.014}
          fill={getColor("date", col)} opacity={0.72}
        >{displayDate}</text>
      </svg>
    </div>
  );
}

export function TemplateRender({ id, W, H, palette, user, isStd, photoUrl, photoUrls, fontPreset, label, namesText, namesConnector, dateText, locationText, footer, tagline, elementStyles, customPaperBg }: {
  id: string; W: number; H: number; palette: Palette; user: UserData; isStd: boolean;
  photoUrl?: string; photoUrls?: string[]; fontPreset?: string;
  label?: string; namesText?: string; namesConnector?: string; dateText?: string; locationText?: string; footer?: string; tagline?: string;
  elementStyles?: ElStyles; customPaperBg?: string;
}) {
  const tplCfg = TEMPLATES.find(t => t.id === id);
  const effectivePhotoUrl = photoUrl || tplCfg?.defaultPhotoUrl;
  // Per-template default styles (applied as base; user-saved values take priority per property)
  const tplDefaultStyles: Record<string, ElStyles> = {
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
  const tplDefs = tplDefaultStyles[id];
  const effectiveStyles: ElStyles | undefined = tplDefs
    ? (() => {
        const keys = [...new Set([...Object.keys(tplDefs), ...Object.keys(elementStyles ?? {})])];
        return Object.fromEntries(keys.map(k => [k, { ...tplDefs[k], ...(elementStyles?.[k] ?? {}) }]));
      })()
    : elementStyles;
  if (id === "photo-texte" || tplCfg?.layoutVariant === "photo-texte")
    return <TemplatePhotoTexte W={W} H={H} p={palette} user={user} label={label} footer={!footer || footer === "invitation à suivre" ? "pour le mariage de" : footer} namesText={namesText} dateText={dateText} locationText={locationText} photoUrl={effectivePhotoUrl} elementStyles={elementStyles}/>;
  if (id === "save-the-date") return <TemplateSaveTheDatePhoto W={W} H={H} p={palette} user={user} namesText={namesText} dateText={dateText} photoUrl={effectivePhotoUrl} elementStyles={elementStyles}/>;
  if (id === "photomaton") {
    const defaultUrls = tplCfg?.defaultPhotoUrls ?? [];
    const urls = (photoUrls && photoUrls.length > 0) ? defaultUrls.map((def, i) => photoUrls[i] || def) : defaultUrls;
    return <TemplatePhotomaton W={W} H={H} p={palette} user={user} label={label} namesText={namesText} dateText={dateText} photoUrls={urls} elementStyles={elementStyles} customPaperBg={customPaperBg}/>;
  }
  if (id === "dentelle") return <TemplateDentelle W={W} H={H} p={palette} user={user} photoUrl={effectivePhotoUrl} fontPreset={fontPreset} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer} elementStyles={elementStyles} customPaperBg={customPaperBg}/>;
  if (id === "oliviers") return <TemplateOliviers W={W} H={H} p={palette} user={user} fontPreset={fontPreset} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer} elementStyles={elementStyles}/>;
  if (id === "rayures")  return <TemplateRayures  W={W} H={H} p={palette} user={user} isStd={isStd} customPaperBg={customPaperBg} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={!footer || footer === "invitation à suivre" ? "pour le mariage de" : footer} elementStyles={elementStyles}/>;
  if (tplCfg?.paperImage) {
    if (tplCfg.layoutVariant === "elegant") return <TemplateElegant W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer} elementStyles={effectiveStyles} tplId={id}/>;
    if (tplCfg.layoutVariant === "arbres")  return <TemplateArbre W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user} label={label} namesText={namesText} dateText={dateText} locationText={locationText} tagline={tagline} elementStyles={effectiveStyles}/>;
    if (tplCfg.layoutVariant === "italy")   return <TemplateItalySTD W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer} elementStyles={elementStyles}/>;
    if (tplCfg.layoutVariant === "bold")    return <TemplateLettreBold W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer} elementStyles={elementStyles}/>;
    if (tplCfg.layoutVariant === "photo")   return <TemplateLettrPhoto W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user} label={label} namesText={namesText} dateText={dateText} photoUrl={effectivePhotoUrl} elementStyles={elementStyles}/>;
    return <TemplateLettre W={W} H={H} paperImage={tplCfg.paperImage} p={palette} user={user} fontPreset={fontPreset} label={label} namesText={namesText} namesConnector={namesConnector} dateText={dateText} locationText={locationText} footer={footer} elementStyles={elementStyles} paperFit={tplCfg.paperFit} tplId={id} isStd={isStd}/>;
  }
  return null;
}

export function CardFoldModal({ tpl, paletteId, user, isStd, fontPreset, label, namesText, dateText, locationText, footer, tagline, photoUrl, photoUrls, elementStyles, customPaperBg, onClose, onAnimationDone, inline, cardWidth }: {
  tpl: TemplateConfig; paletteId: string; user: UserData; isStd: boolean;
  fontPreset?: string; label?: string; namesText?: string; dateText?: string; locationText?: string; footer?: string; tagline?: string; photoUrl?: string; photoUrls?: string[];
  elementStyles?: ElStyles; customPaperBg?: string;
  onClose: () => void; onAnimationDone?: () => void; inline?: boolean; cardWidth?: number;
}) {
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];
  const [reducedMotion] = useState<boolean>(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(reducedMotion ? 3 : 0);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    if (reducedMotion) { onAnimationDone?.(); return; }
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 2000 + 2200);
    const t3 = setTimeout(() => { setPhase(3); onAnimationDone?.(); }, 2000 + 2200 + 3000 + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [reducedMotion, restartKey]);

  function handleReplay() { setPhase(0); setRestartKey(k => k + 1); }

  const W = cardWidth ?? (inline ? 400 : 460); const H = Math.round(W * 1.4);
  const OPEN_EASE = "2.2s linear"; const FOLD_EASE = "3.0s cubic-bezier(0.2, 0, 0.15, 1)";
  const leftFlapAngle  = phase === 0 ?  180 : phase === 1 ? 0 : -180;
  const rightFlapAngle = phase === 0 ? -180 : phase === 1 ? 0 :  180;
  const flapTransition = phase === 0 ? "transform 0.001s linear" : phase === 1 ? `transform ${OPEN_EASE}` : phase === 2 ? `transform ${FOLD_EASE}, opacity 0.8s ease 2.2s` : "none";
  const sealTransition = phase === 0 ? "transform 0.001s linear" : phase === 1 ? `transform ${OPEN_EASE}` : phase === 2 ? `transform ${FOLD_EASE}, opacity 0s` : "none";
  const flapPaperImage = "/papier%20lettre/Fond%20papier/Papier_1.png";
  const paperFace = (position: "left" | "right", back?: boolean): React.CSSProperties => ({
    position: "absolute", inset: 0, backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"],
    ...(back ? { transform: "rotateY(180deg)" } : {}),
    backgroundImage: `url('${flapPaperImage}')`,
    backgroundSize: `${W}px ${H}px`,
    backgroundPosition: position === "left" ? "left center" : "right center",
  });

  return (
    <div className={inline ? "w-full h-full flex flex-col items-center justify-center gap-6" : "fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"}
      style={inline ? {} : { backgroundImage: "url('/fond/marbre.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div style={{ position: "relative", perspective: "1800px", perspectiveOrigin: "50% 50%", overflow: "visible" }}>
        <div style={{ position: "relative", width: 2 * W, height: H, transformStyle: "preserve-3d", transform: `translateX(${-W / 2}px)` }}>
          <div style={{ position: "absolute", left: W, top: 0, width: W, height: H, opacity: phase === 0 ? 0 : 1, transition: phase === 1 ? "opacity 0.5s ease 0s" : "none", boxShadow: "0 4px 16px rgba(0,0,0,0.12), 0 12px 48px rgba(0,0,0,0.24)" }}>
            <TemplateRender id={tpl.id} W={W} H={H} palette={palette} user={user} isStd={isStd} fontPreset={fontPreset} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer} tagline={tagline} photoUrl={photoUrl} photoUrls={photoUrls} elementStyles={elementStyles} customPaperBg={customPaperBg}/>
          </div>
          <div style={{ position: "absolute", left: W / 2, top: 0, width: W / 2, height: H, transformOrigin: "right center", transformStyle: "preserve-3d", transform: `rotateY(${leftFlapAngle}deg)`, transition: flapTransition, opacity: phase >= 2 ? 0 : 1, boxShadow: "0 0 20px rgba(0,0,0,0.13)" }}>
            <div style={paperFace("left")} /><div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], background: "linear-gradient(to left, rgba(0,0,0,0.10) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div style={paperFace("left", true)} /><div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], transform: "rotateY(180deg)", background: "linear-gradient(to right, rgba(0,0,0,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
          </div>
          <div style={{ position: "absolute", left: 2 * W, top: 0, width: W / 2, height: H, transformOrigin: "left center", transformStyle: "preserve-3d", transform: `rotateY(${rightFlapAngle}deg)`, transition: flapTransition, opacity: phase >= 2 ? 0 : 1, boxShadow: "0 0 20px rgba(0,0,0,0.13)" }}>
            <div style={paperFace("right")} /><div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], background: "linear-gradient(to right, rgba(0,0,0,0.10) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div style={paperFace("right", true)} /><div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], transform: "rotateY(180deg)", background: "linear-gradient(to left, rgba(0,0,0,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
          </div>
          <div style={{ position: "absolute", left: W, top: 0, width: 0, height: H, transformOrigin: "left center", transformStyle: "preserve-3d", transform: `rotateY(${leftFlapAngle + 180}deg)`, transition: sealTransition, opacity: phase >= 2 ? 0 : 1 }}>
            <div style={{ position: "absolute", left: W / 2, top: "50%", width: Math.round(W * 0.42), height: Math.round(W * 0.42), transform: "translate(-50%, -50%)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as React.CSSProperties["WebkitBackfaceVisibility"], pointerEvents: "none" }}>
              <img src="/papier%20lettre/Cire/cire-rouge.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>
        </div>
        {phase === 3 && !inline && (
          <div style={{ position: "absolute", left: Math.round(W * 1.5) + 32, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={handleReplay} style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1.5px solid rgba(109,29,62,0.18)", borderRadius: "50%", color: "#6D1D3E", cursor: "pointer" }}>
              <Play size={16} fill="#6D1D3E" />
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(109,29,62,0.08)", color: "#6D1D3E", fontFamily: "var(--font-display)", whiteSpace: "nowrap" }}>Retour</button>
          </div>
        )}
      </div>
      {inline && phase === 3 && (
        <button onClick={handleReplay} style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1.5px solid rgba(109,29,62,0.18)", borderRadius: "50%", color: "#6D1D3E", cursor: "pointer" }}>
          <Play size={16} fill="#6D1D3E" />
        </button>
      )}
    </div>
  );
}

export function CardFlipScene({ tpl, paletteId, user, isStd, fontPreset, label, namesText, dateText, locationText, footer, tagline, photoUrl, photoUrls, elementStyles, customPaperBg, onAnimationDone, cardWidth }: {
  tpl: TemplateConfig; paletteId: string; user: UserData; isStd: boolean;
  fontPreset?: string; label?: string; namesText?: string; dateText?: string;
  locationText?: string; footer?: string; tagline?: string; photoUrl?: string; photoUrls?: string[];
  elementStyles?: ElStyles; customPaperBg?: string;
  onAnimationDone?: () => void; cardWidth?: number;
}) {
  const palette = tpl.palettes.find(p => p.id === paletteId) ?? tpl.palettes[0];
  const W = cardWidth ?? 400; const H = Math.round(W * 1.4);
  const [flipped, setFlipped] = useState(true);
  const [done, setDone]       = useState(false);
  const [key, setKey]         = useState(0);

  useEffect(() => {
    setFlipped(true); setDone(false);
    const t1 = setTimeout(() => setFlipped(false), 700);
    const t2 = setTimeout(() => { setDone(true); onAnimationDone?.(); }, 700 + 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [key]);

  const backImage = "/papier%20lettre/Fond%20papier/Papier_1.png";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ position: "relative", perspective: "1400px" }}>
      <div style={{ width: W, height: H, transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: flipped ? "none" : "transform 3s cubic-bezier(0.4, 0, 0.15, 1)", boxShadow: "0 12px 44px rgba(0,0,0,0.28)" }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", overflow: "hidden" }}>
          <TemplateRender id={tpl.id} W={W} H={H} palette={palette} user={user} isStd={isStd} fontPreset={fontPreset} label={label} namesText={namesText} dateText={dateText} locationText={locationText} footer={footer} tagline={tagline} photoUrl={photoUrl} photoUrls={photoUrls} elementStyles={elementStyles} customPaperBg={customPaperBg}/>
        </div>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundImage: `url('${backImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}/>
      </div>
      {done && (
        <button onClick={() => { setKey(k => k + 1); onAnimationDone && (setDone(false)); }} style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "1.5px solid rgba(109,29,62,0.18)", borderRadius: "50%", color: "#6D1D3E", cursor: "pointer" }}>
          <Play size={16} fill="#6D1D3E" />
        </button>
      )}
    </div>
  );
}
