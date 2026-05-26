import Link from "next/link";
import Image from "next/image";

interface Props {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const dims = {
  sm: { w: 130, h: 48, icon: 24 },
  md: { w: 180, h: 66, icon: 34 },
  lg: { w: 230, h: 84, icon: 44 },
};

export default function WedyLogo({ size = "md", href = "/" }: Props) {
  const { w, h, icon } = dims[size];

  const inner = (
    <span className="flex items-center">
      <Image src="/logo/logo1.png" alt="" width={icon} height={icon} className="object-contain" priority />
      <svg
        viewBox="0 0 220 80"
        width={w}
        height={h}
        aria-label="Weddy"
        style={{ overflow: "visible", display: "block", marginLeft: "-6px" }}
      >
        <defs>
          <path id="weddy-arc" d="M 5,72 Q 110,22 215,72" />
        </defs>
        <text style={{ fontFamily: "var(--font-logo)", fontSize: 46, fill: "#990841" }}>
          <textPath href="#weddy-arc" startOffset="50%" textAnchor="middle">
            WEDDY
          </textPath>
        </text>
      </svg>
    </span>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
