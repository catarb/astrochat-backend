import { body, param, query } from "express-validator";

const UPDATABLE_FIELDS = ["title", "status"];

const titleValidation = (optional = false) => {
  const validation = body("title");

  if (optional) {
    validation.optional();
  } else {
    validation
      .notEmpty()
      .withMessage("El título es obligatorio.")
      .bail();
  }

  return validation
    .isString()
    .withMessage("El título debe ser una cadena de texto.")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("El título es obligatorio.")
    .bail()
    .isLength({ min: 2, max: 120 })
    .withMessage("El título debe tener entre 2 y 120 caracteres.");
};

export const createConversationValidation = [
  body().custom((value, { req }) => {
    const unknownFields = Object.keys(req.body ?? {}).filter(
      (field) => !["astro", "title"].includes(field),
    );

    if (unknownFields.length > 0) {
      throw new Error(`Campos no permitidos: ${unknownFields.join(", ")}.`);
    }

    return true;
  }),
  body("astro")
    .notEmpty()
    .withMessage("El astro es obligatorio.")
    .bail()
    .isMongoId()
    .withMessage("El id del astro no es válido."),
  titleValidation(),
];

export const updateConversationValidation = [
  body().custom((value, { req }) => {
    const fields = Object.keys(req.body ?? {});

    if (fields.length === 0) {
      throw new Error("Debe enviar al menos un campo para actualizar.");
    }

    const unknownFields = fields.filter(
      (field) => !UPDATABLE_FIELDS.includes(field),
    );

    if (unknownFields.length > 0) {
      throw new Error(`Campos no permitidos: ${unknownFields.join(", ")}.`);
    }

    return true;
  }),
  titleValidation(true),
  body("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("El estado debe ser active o archived."),
];

export const conversationIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("El id de la conversación es obligatorio.")
    .bail()
    .isMongoId()
    .withMessage("El id de la conversación no es válido."),
];

export const conversationQueryValidation = [
  query("status")
    .optional()
    .isIn(["active", "archived"])
    .withMessage("El estado debe ser active o archived."),
  query("astro")
    .optional()
    .isMongoId()
    .withMessage("El id del astro no es válido."),
  query("search")
    .optional()
    .isString()
    .withMessage("La búsqueda debe ser una cadena de texto.")
    .bail()
    .trim()
    .isLength({ max: 120 })
    .withMessage("La búsqueda debe tener como máximo 120 caracteres."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un entero mayor o igual a 1.")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("El límite debe ser un entero entre 1 y 50.")
    .toInt(),
];
