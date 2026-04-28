"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const EXCLUDED = ["/dashboard", "/mariage/"];

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hidden = EXCLUDED.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;
  return <Navbar />;
}
