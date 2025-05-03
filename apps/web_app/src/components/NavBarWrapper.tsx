"use client";
import { usePathname } from "next/navigation";
// import NavBar from "./NavBar";

export default function NavBarWrapper() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  // return <NavBar />;
} 