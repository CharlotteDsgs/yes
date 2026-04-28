import Image from "next/image";
import Link from "next/link";

interface Props {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: { text: "1.25rem", fox: 32 },
  md: { text: "1.75rem", fox: 44 },
  lg: { text: "2.25rem", fox: 56 },
};

export default function WedyLogo({ size = "md", href = "/" }: Props) {
  const s = sizes[size];

  const inner = (
    <span className="flex items-center gap-1">
      <span
        style={{
          fontFamily: "var(--font-bagel)",
          fontSize: s.text,
          color: "#7A1B45",
          lineHeight: 1,
          letterSpacing: "0.01em",
        }}
      >
        WEDY
      </span>
      <Image
        src="/fox_no-bg.png"
        alt="Wedy fox"
        width={s.fox}
        height={s.fox}
        className="object-contain"
        priority
      />
    </span>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
