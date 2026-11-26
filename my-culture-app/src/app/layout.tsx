import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Culture Academy Make a change",
  description: "Culture Academy",
  keywords: "Culture Academy",
  authors: [{ name: "Wayne de Villiers" }],
  other: { "content-language": "de", copyright: "\u00a9 Culture Academy" },
  icons: { shortcut: "/logo/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
