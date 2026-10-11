import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { consoleEnabled } from "@/lib/console-flag";

export const metadata: Metadata = {
  title: "Console",
  robots: { index: false, follow: false },
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Staging only: the public site 404s here unless CONSOLE_ENABLED=on.
  if (!consoleEnabled()) notFound();
  return children;
}
