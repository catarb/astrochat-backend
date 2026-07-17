import * as messageService from "../services/message.service.js";

export const create = async (req, res, next) => {
  try {
    const message = await messageService.createMessage(
      req.params.conversationId,
      req.body,
      req.user._id,
    );

    res.status(201).json({
      success: true,
      message: "Mensaje creado correctamente.",
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllByConversation = async (req, res, next) => {
  try {
    const { messages, total, page, limit, totalPages } =
      await messageService.getMessages(
        req.params.conversationId,
        req.query,
        req.user._id,
      );

    res.status(200).json({
      success: true,
      data: {
        messages,
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
    const message = await messageService.getMessageById(
      req.params.messageId,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { message } = await messageService.deleteMessage(
      req.params.messageId,
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
