import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Instrument_Serif,
} from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { SITE_JSON_LD } from "@/lib/jsonld";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-mono",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://albanyaiguy.com"),
  title: {
    default:
      "Albany AI Guy | Albany trunk line & AI voice receptionist for local businesses",
    template: "%s | Albany AI Guy",
  },
  description:
    "One local number for Albany, NY, and an AI phone receptionist that answers and books for Capital Region shops. Coming soon — join the pilot.",
  applicationName: "Albany AI Guy",
  authors: [
    {
      name: "Chad Lenseth",
      url: "https://www.linkedin.com/in/chad-lenseth-26b55938",
    },
  ],
  creator: "Chad Lenseth",
  openGraph: {
    type: "website",
    siteName: "Albany AI Guy",
    locale: "en_US",
    url: "https://albanyaiguy.com/",
    title: "Albany AI Guy",
    description:
      "Albany trunk-line concierge and AI voice receptionist for local businesses. Coming soon — join the pilot.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Albany AI Guy — coming soon, join the pilot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Albany AI Guy",
    description:
      "Albany trunk-line concierge and AI voice receptionist for local businesses. Coming soon — join the pilot.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, "<" escaped
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SITE_JSON_LD).replace(/</g, "\\u003c"),
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
