import Message from "../models/message.model.js";

export const create = (messageData) => Message.create(messageData);

export const findById = (id) => Message.findById(id);

export const findByConversation = async (conversationId, pagination) => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const query = { conversation: conversationId };
  const [messages, total] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments(query),
  ]);

  return {
    messages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const deleteById = (id) => Message.findByIdAndDelete(id);

export const deleteManyByConversation = (conversationId) =>
  Message.deleteMany({ conversation: conversationId });

export const findRecentByConversation = async (conversationId, limit) => {
  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return messages.reverse();
};
