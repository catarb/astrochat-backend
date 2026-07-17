import { body, param } from "express-validator";

import { ASTRO_TYPES } from "../models/astro.model.js";

const UPDATABLE_FIELDS = [
  "name",
  "type",
  "description",
  "shortDescription",
  "imageUrl",
  "scientificName",
  "distance",
  "constellation",
  "isActive",
];

const optionalString = (field, label, maxLength) =>
  body(field)
    .optional({ values: "null" })
    .isString()
    .withMessage(`${label} debe ser una cadena de texto.`)
    .bail()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${label} debe tener como máximo ${maxLength} caracteres.`);

const nameValidation = (optional = false) => {
  const validation = body("name");

  if (optional) {
    validation.optional();
  }

  return validation
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .bail()
    .isLength({ min: 2, max: 80 })
    .withMessage("El nombre debe tener entre 2 y 80 caracteres.");
};

const typeValidation = (optional = false) => {
  const validation = body("type");

  if (optional) {
    validation.optional();
  }

  return validation
    .notEmpty()
    .withMessage("El tipo es obligatorio.")
    .bail()
    .isIn(ASTRO_TYPES)
    .withMessage("El tipo de astro no es válido.");
};

const descriptionValidation = (optional = false) => {
  const validation = body("description");

  if (optional) {
    validation.optional();
  }

  return validation
    .trim()
    .notEmpty()
    .withMessage("La descripción es obligatoria.")
    .bail()
    .isLength({ min: 20, max: 1500 })
    .withMessage("La descripción debe tener entre 20 y 1500 caracteres.");
};

const shortDescriptionValidation = (optional = false) => {
  const validation = body("shortDescription");

  if (optional) {
    validation.optional();
  }

  return validation
    .trim()
    .notEmpty()
    .withMessage("La descripción corta es obligatoria.")
    .bail()
    .isLength({ min: 10, max: 250 })
    .withMessage(
      "La descripción corta debe tener entre 10 y 250 caracteres.",
    );
};

const imageUrlValidation = (optional = false) => {
  const validation = body("imageUrl");

  if (optional) {
    validation.optional();
  }

  return validation
    .trim()
    .notEmpty()
    .withMessage("La URL de la imagen es obligatoria.")
    .bail()
    .isURL()
    .withMessage("La URL de la imagen debe ser válida.");
};

const isActiveValidation = (optional = true) => {
  const validation = body("isActive");

  if (optional) {
    validation.optional();
  }

  return validation
    .isBoolean()
    .withMessage("El estado activo debe ser booleano.")
    .toBoolean();
};

export const createAstroValidation = [
  nameValidation(),
  typeValidation(),
  descriptionValidation(),
  shortDescriptionValidation(),
  imageUrlValidation(),
  optionalString("scientificName", "El nombre científico", 150),
  optionalString("distance", "La distancia", 150),
  optionalString("constellation", "La constelación", 100),
  isActiveValidation(),
];

export const updateAstroValidation = [
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
  nameValidation(true),
  typeValidation(true),
  descriptionValidation(true),
  shortDescriptionValidation(true),
  imageUrlValidation(true),
  optionalString("scientificName", "El nombre científico", 150),
  optionalString("distance", "La distancia", 150),
  optionalString("constellation", "La constelación", 100),
  isActiveValidation(),
];

export const astroIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("El id del astro es obligatorio.")
    .bail()
    .isMongoId()
    .withMessage("El id del astro no es válido."),
];

export const astroSlugValidation = [
  param("slug")
    .notEmpty()
    .withMessage("El slug es obligatorio.")
    .bail()
    .isString()
    .withMessage("El slug debe ser una cadena de texto.")
    .bail()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("El slug solo puede contener minúsculas, números y guiones."),
];
