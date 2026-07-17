import Conversation from "../models/conversation.model.js";

const ASTRO_PUBLIC_FIELDS =
  "_id name slug type shortDescription imageUrl isActive";

const escapeRegularExpression = (text) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const create = async (conversationData) => {
  const conversation = await Conversation.create(conversationData);

  return conversation.populate("astro", ASTRO_PUBLIC_FIELDS);
};

export const findById = (id) =>
  Conversation.findById(id).populate("astro", ASTRO_PUBLIC_FIELDS);

export const findOwnedById = (id, userId) =>
  Conversation.findOne({ _id: id, user: userId }).populate(
    "astro",
    ASTRO_PUBLIC_FIELDS,
  );

export const findAllByUser = async (userId, filters, pagination) => {
  const query = { user: userId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.astro) {
    query.astro = filters.astro;
  }

  if (filters.search) {
    query.title = new RegExp(escapeRegularExpression(filters.search), "i");
  }

  const { page, limit } = pagination;
  const skip = (page - 1) * limit;
  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate("astro", ASTRO_PUBLIC_FIELDS)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(query),
  ]);

  return {
    conversations,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateById = (id, updateData) =>
  Conversation.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("astro", ASTRO_PUBLIC_FIELDS);

export const deleteById = (id) => Conversation.findByIdAndDelete(id);
