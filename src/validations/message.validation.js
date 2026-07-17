import { body, param, query } from "express-validator";

export const createMessageValidation = [
  body().custom((value, { req }) => {
    const allowedFields = ["role", "content", "metadata"];
    const unknownFields = Object.keys(req.body ?? {}).filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length > 0) {
      throw new Error(`Campos no permitidos: ${unknownFields.join(", ")}.`);
    }

    return true;
  }),
  body("role")
    .notEmpty()
    .withMessage("El rol es obligatorio.")
    .bail()
    .isIn(["user", "assistant"])
    .withMessage("El rol debe ser user o assistant."),
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
    .isLength({ min: 1, max: 10000 })
    .withMessage("El contenido debe tener entre 1 y 10000 caracteres."),
  body("metadata")
    .optional()
    .isObject({ strict: true })
    .withMessage("Los metadatos deben ser un objeto."),
];

export const messageIdValidation = [
  param("messageId")
    .notEmpty()
    .withMessage("El id del mensaje es obligatorio.")
    .bail()
    .isMongoId()
    .withMessage("El id del mensaje no es válido."),
];

export const conversationIdValidation = [
  param("conversationId")
    .notEmpty()
    .withMessage("El id de la conversación es obligatorio.")
    .bail()
    .isMongoId()
    .withMessage("El id de la conversación no es válido."),
];

export const messageQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un entero mayor o igual a 1.")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un entero entre 1 y 100.")
    .toInt(),
];
