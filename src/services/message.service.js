import * as conversationRepository from "../repositories/conversation.repository.js";
import * as messageRepository from "../repositories/message.repository.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const findOwnedConversation = async (conversationId, userId) => {
  const conversation = await conversationRepository.findOwnedById(
    conversationId,
    userId,
  );

  if (!conversation) {
    throw createError("Conversación no encontrada.", 404);
  }

  return conversation;
};

const findOwnedMessage = async (messageId, userId) => {
  const message = await messageRepository.findById(messageId);

  if (!message) {
    throw createError("Mensaje no encontrado.", 404);
  }

  const conversation = await conversationRepository.findOwnedById(
    message.conversation,
    userId,
  );

  if (!conversation) {
    throw createError("Mensaje no encontrado.", 404);
  }

  return message;
};

export const createMessage = async (conversationId, data, userId) => {
  const conversation = await findOwnedConversation(conversationId, userId);

  if (conversation.status === "archived") {
    throw createError(
      "No se pueden agregar mensajes a una conversación archivada.",
      400,
    );
  }

  const message = await messageRepository.create({
    conversation: conversationId,
    role: data.role,
    content: data.content.trim(),
    metadata: data.metadata || {},
  });
  const messageDate = new Date();

  await conversationRepository.updateLastMessageAt(
    conversationId,
    messageDate,
  );

  return message;
};

export const getMessages = async (conversationId, query, userId) => {
  await findOwnedConversation(conversationId, userId);

  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
  const limit = Number.isNaN(parsedLimit)
    ? 20
    : Math.min(Math.max(parsedLimit, 1), 100);

  return messageRepository.findByConversation(conversationId, {
    page,
    limit,
  });
};

export const getMessageById = (messageId, userId) =>
  findOwnedMessage(messageId, userId);

export const deleteMessage = async (messageId, userId) => {
  await findOwnedMessage(messageId, userId);
  await messageRepository.deleteById(messageId);

  return {
    message: "Mensaje eliminado correctamente.",
  };
};
