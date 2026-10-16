import type { NextConfig } from "next";

// Vive en conejo-motors.web.app/ac (temporal, mientras se paga hosting
// propio) — necesita basePath para que sus rutas/assets calcen con lo
// que Firebase Hosting reenvía. Cloud Run necesita output standalone.
const nextConfig: NextConfig = {
  basePath: "/ac",
  output: "standalone",
};

export default nextConfig;
