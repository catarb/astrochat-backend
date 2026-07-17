import * as conversationService from "../services/conversation.service.js";

export const create = async (req, res, next) => {
  try {
    const conversation = await conversationService.createConversation(
      req.body,
      req.user._id,
    );

    res.status(201).json({
      success: true,
      message: "Conversación creada correctamente.",
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const { conversations, total, page, limit, totalPages } =
      await conversationService.getConversations(req.query, req.user._id);

    res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversationById(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const conversation = await conversationService.updateConversation(
      req.params.id,
      req.body,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Conversación actualizada correctamente.",
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { message } = await conversationService.deleteConversation(
      req.params.id,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};
