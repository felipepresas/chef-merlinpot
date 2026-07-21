import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Chef — Tu semana, servida.",
    template: "%s · Chef",
  },
  description:
    "El planificador mágico de comidas de la semana: almuerzos y cenas, recetas con vídeo, lista de la compra y El Duelo para decidir cuando no sabes qué comer.",
  applicationName: "Chef",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  themeColor: "#6d28d9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
