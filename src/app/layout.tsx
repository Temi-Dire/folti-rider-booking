import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Onest, Unbounded } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"], weight: ["500", "600"] });
const onest = Onest({ variable: "--font-onest", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Folti: book a ride in Lagos",
  description: "Book a ride now or schedule one for later, for yourself or someone else.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#12131c",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${unbounded.variable} ${onest.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
