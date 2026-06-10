import { NextResponse, type NextRequest } from "next/server";

const preferredHost = "opplexify.com";
const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (!host || localHosts.has(host)) return NextResponse.next();

  const forwardedProto = request.headers.get("x-forwarded-proto")?.toLowerCase();
  const shouldRedirectHost = host === `www.${preferredHost}`;
  const shouldRedirectProtocol = forwardedProto === "http";

  if (!shouldRedirectHost && !shouldRedirectProtocol) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.protocol = "https";
  url.host = preferredHost;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/:path*"]
};
