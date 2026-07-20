import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Salida standalone: server.js autocontenido para la imagen Docker de Dokploy.
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" }, // miniaturas de YouTube
    ],
  },
  // PWA (service worker + manifest) se añadirá al abordar la instalación offline.
};

export default nextConfig;
