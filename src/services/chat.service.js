import * as conversationRepository from "../repositories/conversation.repository.js";
import * as messageRepository from "../repositories/message.repository.js";
import { generateResponse } from "./gemini.service.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getHistoryLimit = () => {
  const configuredLimit = Number(process.env.AI_HISTORY_LIMIT) || 20;

  return Math.min(Math.max(Math.trunc(configuredLimit), 1), 50);
};

export const sendMessage = async (conversationId, content, userId) => {
  const conversation = await conversationRepository.findOwnedById(
    conversationId,
    userId,
  );

  if (!conversation) {
    throw createError("Conversación no encontrada.", 404);
  }

  if (conversation.status === "archived") {
    throw createError(
      "No se pueden enviar mensajes a una conversación archivada.",
      400,
    );
  }

  if (!conversation.astro) {
    throw createError("Astro no encontrado.", 404);
  }

  const userMessage = await messageRepository.create({
    conversation: conversationId,
    role: "user",
    content: content.trim(),
  });

  await conversationRepository.updateLastMessageAt(
    conversationId,
    new Date(),
  );

  const messages = await messageRepository.findRecentByConversation(
    conversationId,
    getHistoryLimit(),
  );

  let result;

  try {
    result = await generateResponse({
      astro: conversation.astro,
      messages,
    });
  } catch (error) {
    console.error("Error al consultar Gemini:", {
      status: error?.status,
      code: error?.code,
      name: error?.name,
      message: error?.message,
    });

    if (
      error.statusCode === 503 &&
      error.message ===
        "El servicio de inteligencia artificial no está configurado."
    ) {
      throw error;
    }

    throw createError("No se pudo obtener una respuesta del asistente.", 502);
  }

  const assistantMessage = await messageRepository.create({
    conversation: conversationId,
    role: "assistant",
    content: result.text,
    metadata: {
      provider: "google",
      model: result.model,
    },
  });

  await conversationRepository.updateLastMessageAt(
    conversationId,
    new Date(),
  );

  return {
    userMessage,
    assistantMessage,
  };
};
