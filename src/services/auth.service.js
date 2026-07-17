import bcrypt from "bcrypt";
import crypto from "crypto";

import * as userRepository from "../repositories/user.repository.js";
import { generateToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "./email.service.js";

const REGISTRATION_MESSAGE =
  "Usuario registrado correctamente. Revisá tu correo para verificar la cuenta.";

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error(
      "Ya existe un usuario registrado con ese correo.",
    );
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const createdUser = await userRepository.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    verificationToken,
    verificationTokenExpires,
  });

  try {
    await sendVerificationEmail({
      email: normalizedEmail,
      name,
      token: verificationToken,
    });
  } catch (error) {
    console.error(`Error al enviar el correo de verificación: ${error.message}`);

    const emailError = new Error(
      "No se pudo enviar el correo de verificación.",
    );
    emailError.statusCode = 500;
    throw emailError;
  }

  const user = createdUser.toObject();

  delete user.password;
  delete user.verificationToken;
  delete user.verificationTokenExpires;

  return {
    user,
    message: REGISTRATION_MESSAGE,
  };
};

export const verifyEmail = async (token) => {
  if (!token) {
    const error = new Error("El token de verificación no es válido.");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByVerificationToken(token);

  if (!user) {
    const error = new Error("El token de verificación no es válido.");
    error.statusCode = 400;
    throw error;
  }

  if (
    !user.verificationTokenExpires ||
    user.verificationTokenExpires <= new Date()
  ) {
    const error = new Error("El token de verificación venció.");
    error.statusCode = 400;
    throw error;
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;

  await userRepository.save(user);

  return {
    message: "Correo verificado correctamente.",
  };
};

export const loginUser = async ({ email, password }) => {
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    const error = new Error("El correo y la contraseña son obligatorios.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const foundUser = await userRepository.findByEmail(normalizedEmail, true);

  if (!foundUser) {
    const error = new Error("Correo o contraseña incorrectos.");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, foundUser.password);

  if (!passwordMatches) {
    const error = new Error("Correo o contraseña incorrectos.");
    error.statusCode = 401;
    throw error;
  }

  if (!foundUser.isVerified) {
    const error = new Error(
      "Debés verificar tu correo antes de iniciar sesión.",
    );
    error.statusCode = 403;
    throw error;
  }

  const user = {
    _id: foundUser._id,
    name: foundUser.name,
    email: foundUser.email,
    isVerified: foundUser.isVerified,
    createdAt: foundUser.createdAt,
    updatedAt: foundUser.updatedAt,
  };
  const token = generateToken({ userId: foundUser._id });

  return {
    user,
    token,
    message: "Inicio de sesión exitoso.",
  };
};
