import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";
import { validateMiddleware } from "../middleware/validate.middleware.js";
import {
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

export default router;
