import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { adminSessionCookie, isProduction, jwtAudience, jwtIssuer, jwtSecret, webOrigin } from "../env";
import { HttpError } from "../http";
import { prisma } from "../prisma/prisma.service";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticateJwt(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const [scheme, bearerToken] = header?.split(" ") ?? [];
  const token = scheme === "Bearer" && bearerToken ? bearerToken : cookie(req, adminSessionCookie);

  if (!token) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret, {
      algorithms: ["HS256"],
      audience: jwtAudience,
      issuer: jwtIssuer
    }) as jwt.JwtPayload & {
      sub?: string;
      email?: string;
      role?: string;
      name?: string;
    };

    if (!payload.sub || !payload.email || !payload.role || !payload.name) {
      throw new Error("Invalid token payload");
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true, role: true, name: true, updatedAt: true }
    });
    if (!user || user.email !== payload.email || !payload.iat || payload.iat < Math.floor(user.updatedAt.getTime() / 1000)) {
      throw new Error("Revoked token");
    }

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    next(new HttpError(401, "Unauthorized"));
  }
}

export function requireTrustedOrigin(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("Origin");
  const allowedOrigins = new Set([
    webOrigin,
    ...(!isProduction ? ["http://localhost:3000", "http://127.0.0.1:3000"] : [])
  ]);
  if (!origin || allowedOrigins.has(origin)) {
    next();
    return;
  }

  next(new HttpError(403, "Untrusted request origin"));
}

function cookie(req: Request, name: string) {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export function requireRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }
    if (user.role === "SUPER_ADMIN" || roles.includes(user.role)) {
      next();
      return;
    }
    next(new HttpError(403, "Forbidden"));
  };
}
