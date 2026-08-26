import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Libera o acesso ao servidor de dev (npm run dev) por IP da rede local,
  // pra dar pra testar a página pelo celular no mesmo Wi-Fi do PC.
  allowedDevOrigins: ["192.168.10.61"],
};

export default nextConfig;
