import { Router } from "express";

import * as conversationController from "../controllers/conversation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateMiddleware } from "../middleware/validate.middleware.js";
import {
  conversationIdValidation,
  conversationQueryValidation,
  createConversationValidation,
  updateConversationValidation,
} from "../validations/conversation.validation.js";

const router = Router();

router.get(
  "/",
  authenticate,
  conversationQueryValidation,
  validateMiddleware,
  conversationController.getAll,
);

router.get(
  "/:id",
  authenticate,
  conversationIdValidation,
  validateMiddleware,
  conversationController.getById,
);

router.post(
  "/",
  authenticate,
  createConversationValidation,
  validateMiddleware,
  conversationController.create,
);

router.put(
  "/:id",
  authenticate,
  conversationIdValidation,
  updateConversationValidation,
  validateMiddleware,
  conversationController.update,
);

router.delete(
  "/:id",
  authenticate,
  conversationIdValidation,
  validateMiddleware,
  conversationController.remove,
);

export default router;
