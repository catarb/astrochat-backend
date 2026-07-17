import { Router } from "express";

import * as astroController from "../controllers/astro.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateMiddleware } from "../middleware/validate.middleware.js";
import {
  astroIdValidation,
  astroSlugValidation,
  createAstroValidation,
  updateAstroValidation,
} from "../validations/astro.validation.js";

const router = Router();

router.get("/", astroController.getAll);

router.get(
  "/slug/:slug",
  astroSlugValidation,
  validateMiddleware,
  astroController.getBySlug,
);

router.get(
  "/:id",
  astroIdValidation,
  validateMiddleware,
  astroController.getById,
);

router.post(
  "/",
  authenticate,
  createAstroValidation,
  validateMiddleware,
  astroController.create,
);

router.put(
  "/:id",
  authenticate,
  astroIdValidation,
  updateAstroValidation,
  validateMiddleware,
  astroController.update,
);

router.delete(
  "/:id",
  authenticate,
  astroIdValidation,
  validateMiddleware,
  astroController.remove,
);

export default router;
