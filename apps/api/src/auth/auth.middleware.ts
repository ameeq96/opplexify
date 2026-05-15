import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../env";
import { HttpError } from "../http";

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

export function authenticateJwt(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const [scheme, token] = header?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    next(new HttpError(401, "Unauthorized"));
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload & {
      sub?: string;
      email?: string;
      role?: string;
      name?: string;
    };

    if (!payload.sub || !payload.email || !payload.role || !payload.name) {
      throw new Error("Invalid token payload");
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
    next();
  } catch {
    next(new HttpError(401, "Unauthorized"));
  }
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
