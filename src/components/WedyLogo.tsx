import Link from "next/link";

interface Props {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const dims = {
  sm: { w: 130, h: 48 },
  md: { w: 180, h: 66 },
  lg: { w: 230, h: 84 },
};

export default function WedyLogo({ size = "md", href = "/" }: Props) {
  const { w, h } = dims[size];

  const inner = (
    <svg
      viewBox="0 0 220 80"
      width={w}
      height={h}
      aria-label="Weddy"
      style={{ overflow: "visible", display: "block" }}
    >
      <defs>
        <path id="weddy-arc" d="M 5,72 Q 110,22 215,72" />
      </defs>
      <text style={{ fontFamily: "var(--font-logo)", fontSize: 46, fill: "#7A1B45" }}>
        <textPath href="#weddy-arc" startOffset="50%" textAnchor="middle">
          weddy
        </textPath>
      </text>
    </svg>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
