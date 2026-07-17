import * as astroRepository from "../repositories/astro.repository.js";
import * as conversationRepository from "../repositories/conversation.repository.js";

const UPDATABLE_FIELDS = ["title", "status"];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createConversation = async (data, userId) => {
  const astro = await astroRepository.findById(data.astro);

  if (!astro) {
    throw createError("Astro no encontrado.", 404);
  }

  if (!astro.isActive) {
    throw createError(
      "No se puede iniciar una conversación con un astro inactivo.",
      400,
    );
  }

  return conversationRepository.create({
    user: userId,
    astro: data.astro,
    title: data.title.trim(),
    status: "active",
    lastMessageAt: new Date(),
  });
};

export const getConversations = (query, userId) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
  const limit = Number.isNaN(parsedLimit)
    ? 10
    : Math.min(Math.max(parsedLimit, 1), 50);
  const filters = {
    status: query.status || undefined,
    astro: query.astro || undefined,
    search: query.search?.trim() || undefined,
  };

  return conversationRepository.findAllByUser(userId, filters, {
    page,
    limit,
  });
};

export const getConversationById = async (id, userId) => {
  const conversation = await conversationRepository.findOwnedById(id, userId);

  if (!conversation) {
    throw createError("Conversación no encontrada.", 404);
  }

  return conversation;
};

export const updateConversation = async (id, data, userId) => {
  const existingConversation = await conversationRepository.findOwnedById(
    id,
    userId,
  );

  if (!existingConversation) {
    throw createError("Conversación no encontrada.", 404);
  }

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([field]) => UPDATABLE_FIELDS.includes(field)),
  );

  if (Object.hasOwn(updateData, "title")) {
    updateData.title = updateData.title.trim();
  }

  const updatedConversation = await conversationRepository.updateById(
    id,
    updateData,
  );

  if (!updatedConversation) {
    throw createError("Conversación no encontrada.", 404);
  }

  return updatedConversation;
};

export const deleteConversation = async (id, userId) => {
  const conversation = await conversationRepository.findOwnedById(id, userId);

  if (!conversation) {
    throw createError("Conversación no encontrada.", 404);
  }

  await conversationRepository.deleteById(id);

  return {
    message: "Conversación eliminada correctamente.",
  };
};
