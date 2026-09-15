import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 같은 와이파이의 휴대폰 등에서 개발 서버(LAN IP)로 접속할 때
  // dev 리소스(HMR 등)가 차단되지 않도록 허용.
  allowedDevOrigins: ["192.168.1.103"],
};

export default nextConfig;
