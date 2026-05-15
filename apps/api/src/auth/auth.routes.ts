import { Router } from "express";
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

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      res.json(await auth.login(validateLoginDto(req.body)));
    })
  );

  router.post(
    "/forgot-password",
    asyncHandler(async (req, res) => {
      res.json(await auth.forgotPassword(validateForgotPasswordDto(req.body)));
    })
  );

  router.post(
    "/reset-password",
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
