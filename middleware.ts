import type { NextRequest } from "next/server";
import intlMiddleware from "./i18n/middleware";

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Next.js internals (_next, _vercel)
  // - Files with extensions (public assets)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
