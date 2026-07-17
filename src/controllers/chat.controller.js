import * as chatService from "../services/chat.service.js";

export const send = async (req, res, next) => {
  try {
    const { userMessage, assistantMessage } = await chatService.sendMessage(
      req.params.conversationId,
      req.body.content,
      req.user._id,
    );

    res.status(201).json({
      success: true,
      message: "Mensaje procesado correctamente.",
      data: {
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};
