import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const GOOGLE = "https://www.google.com";

const CONTENT_SECURITY_POLICY: Record<string, string[]> = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
    GOOGLE,
    "https://www.gstatic.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "blob:", "data:"],
  "connect-src": ["'self'", GOOGLE],
  "frame-src": [GOOGLE, "https://recaptcha.google.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
};

const contentSecurityPolicy = Object.entries(CONTENT_SECURITY_POLICY)
  .map(([directive, sources]) => [directive, ...sources].join(" "))
  .join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  headers: () =>
    Promise.resolve([{ source: "/(.*)", headers: SECURITY_HEADERS }]),
};

export default nextConfig;
