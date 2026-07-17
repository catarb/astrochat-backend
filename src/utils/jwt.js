import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("La variable de entorno JWT_SECRET no está definida");
  }

  return process.env.JWT_SECRET;
};

export const generateToken = (payload) => {
  const options = {};

  if (process.env.JWT_EXPIRES_IN) {
    options.expiresIn = process.env.JWT_EXPIRES_IN;
  }

  return jwt.sign(payload, getJwtSecret(), options);
};

export const verifyToken = (token) => jwt.verify(token, getJwtSecret());
