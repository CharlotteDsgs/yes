import Link from "next/link";

interface Props {
  size?: "sm" | "md" | "lg";
  href?: string;
}

const sizes = {
  sm: "1.25rem",
  md: "1.75rem",
  lg: "2.25rem",
};

export default function WedyLogo({ size = "md", href = "/" }: Props) {
  const inner = (
    <span
      style={{
        fontFamily: "var(--font-logo)",
        fontSize: sizes[size],
        fontWeight: 700,
        color: "#7A1B45",
        lineHeight: 1,
        letterSpacing: "0.01em",
      }}
    >
      WEDDY
    </span>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
