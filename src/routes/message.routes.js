import { Router } from "express";

import * as messageController from "../controllers/message.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateMiddleware } from "../middleware/validate.middleware.js";
import {
  conversationIdValidation,
  createMessageValidation,
  messageIdValidation,
  messageQueryValidation,
} from "../validations/message.validation.js";

const router = Router();

router.post(
  "/conversation/:conversationId",
  authenticate,
  conversationIdValidation,
  createMessageValidation,
  validateMiddleware,
  messageController.create,
);

router.get(
  "/conversation/:conversationId",
  authenticate,
  conversationIdValidation,
  messageQueryValidation,
  validateMiddleware,
  messageController.getAllByConversation,
);

router.get(
  "/:messageId",
  authenticate,
  messageIdValidation,
  validateMiddleware,
  messageController.getById,
);

router.delete(
  "/:messageId",
  authenticate,
  messageIdValidation,
  validateMiddleware,
  messageController.remove,
);

export default router;
