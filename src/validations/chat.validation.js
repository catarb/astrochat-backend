import { body, param } from "express-validator";

export const chatConversationIdValidation = [
  param("conversationId")
    .notEmpty()
    .withMessage("El id de la conversación es obligatorio.")
    .bail()
    .isMongoId()
    .withMessage("El id de la conversación no es válido."),
];

export const sendChatMessageValidation = [
  body().custom((value, { req }) => {
    const fields = Object.keys(req.body ?? {});

    if (fields.length === 0) {
      throw new Error("Debe enviar el contenido del mensaje.");
    }

    const unknownFields = fields.filter((field) => field !== "content");

    if (unknownFields.length > 0) {
      throw new Error(`Campos no permitidos: ${unknownFields.join(", ")}.`);
    }

    return true;
  }),
  body("content")
    .notEmpty()
    .withMessage("El contenido es obligatorio.")
    .bail()
    .isString()
    .withMessage("El contenido debe ser una cadena de texto.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("El contenido es obligatorio.")
    .bail()
    .isLength({ min: 1, max: 4000 })
    .withMessage("El contenido debe tener entre 1 y 4000 caracteres."),
];
