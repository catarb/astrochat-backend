import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateMiddleware } from "../middleware/validate.middleware.js";
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
} from "../validations/auth.validation.js";

const router = Router();

router.post(
  "/register",
  registerValidation,
  validateMiddleware,
  authController.register,
);

router.get(
  "/verify-email/:token",
  verifyEmailValidation,
  validateMiddleware,
  authController.verifyEmail,
);

router.post(
  "/login",
  loginValidation,
  validateMiddleware,
  authController.login,
);

router.get("/me", authenticate, authController.getMe);

export default router;
