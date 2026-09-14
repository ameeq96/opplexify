import { NextFunction, Request, Response, Router } from "express";
import { asyncHandler } from "../http";
import { AuthService } from "./auth.service";
import { authenticateJwt } from "./auth.middleware";
import {
  validateForgotPasswordDto,
  validateLoginDto,
  validateResetPasswordDto,
  validateUpdateProfileDto
} from "./dto/login.dto";

export function createAuthRouter(auth = new AuthService()) {
  const router = Router();
  const loginRateLimit = createIpRateLimit(15 * 60 * 1000, 10);
  const forgotPasswordRateLimit = createIpRateLimit(60 * 60 * 1000, 5);
  const resetPasswordRateLimit = createIpRateLimit(15 * 60 * 1000, 10);

  router.post(
    "/login",
    loginRateLimit,
    asyncHandler(async (req, res) => {
      res.json(await auth.login(validateLoginDto(req.body)));
    })
  );

  router.post(
    "/forgot-password",
    forgotPasswordRateLimit,
    asyncHandler(async (req, res) => {
      res.json(await auth.forgotPassword(validateForgotPasswordDto(req.body)));
    })
  );

  router.post(
    "/reset-password",
    resetPasswordRateLimit,
    asyncHandler(async (req, res) => {
      res.json(await auth.resetPassword(validateResetPasswordDto(req.body)));
    })
  );

  router.get(
    "/me",
    authenticateJwt,
    asyncHandler(async (req, res) => {
      res.json(await auth.me(req.user!.id));
    })
  );

  router.patch(
    "/profile",
    authenticateJwt,
    asyncHandler(async (req, res) => {
      res.json(await auth.updateProfile(req.user!.id, validateUpdateProfileDto(req.body)));
    })
  );

  return router;
}

function createIpRateLimit(windowMs: number, maxRequests: number) {
  const clients = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let client = clients.get(key);

    if (!client || client.resetAt <= now) {
      if (clients.size >= 10_000) pruneRateLimitClients(clients, now);
      if (clients.size >= 10_000) clients.delete(clients.keys().next().value!);
      client = { count: 0, resetAt: now + windowMs };
      clients.set(key, client);
    }

    client.count += 1;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(maxRequests - client.count, 0));
    res.setHeader("X-RateLimit-Reset", Math.ceil(client.resetAt / 1000));

    if (client.count > maxRequests) {
      res.setHeader("Retry-After", Math.max(Math.ceil((client.resetAt - now) / 1000), 1));
      res.status(429).json({ message: "Too many authentication requests. Please try again later." });
      return;
    }

    next();
  };
}

function pruneRateLimitClients(clients: Map<string, { resetAt: number }>, now: number) {
  for (const [key, client] of clients) {
    if (client.resetAt <= now) clients.delete(key);
  }
}
