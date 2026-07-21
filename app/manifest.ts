import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chef by merlinpot",
    short_name: "Chef",
    description: "El planificador mágico de comidas de la semana.",
    start_url: "/semana",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#6D28D9",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
