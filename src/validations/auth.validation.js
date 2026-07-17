import { body, param } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio.")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("El nombre debe tener entre 2 y 50 caracteres."),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El correo electrónico es obligatorio.")
    .bail()
    .isEmail()
    .withMessage("El correo electrónico debe tener un formato válido."),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria.")
    .bail()
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres.")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("La contraseña debe incluir al menos una mayúscula.")
    .bail()
    .matches(/[a-z]/)
    .withMessage("La contraseña debe incluir al menos una minúscula.")
    .bail()
    .matches(/[0-9]/)
    .withMessage("La contraseña debe incluir al menos un número."),
];

export const verifyEmailValidation = [
  param("token")
    .notEmpty()
    .withMessage("El token de verificación es obligatorio.")
    .bail()
    .isString()
    .withMessage("El token de verificación debe ser una cadena de texto.")
    .bail()
    .matches(/^[a-fA-F0-9]+$/)
    .withMessage("El token de verificación debe tener formato hexadecimal.")
    .bail()
    .isLength({ min: 64, max: 64 })
    .withMessage("El token de verificación debe tener exactamente 64 caracteres."),
];
