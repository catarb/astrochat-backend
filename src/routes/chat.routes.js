import { Router } from "express";

import * as chatController from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateMiddleware } from "../middleware/validate.middleware.js";
import {
  chatConversationIdValidation,
  sendChatMessageValidation,
} from "../validations/chat.validation.js";

const router = Router();

router.post(
  "/conversation/:conversationId",
  authenticate,
  chatConversationIdValidation,
  sendChatMessageValidation,
  validateMiddleware,
  chatController.send,
);

export default router;
