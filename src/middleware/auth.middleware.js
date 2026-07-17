import * as userRepository from "../repositories/user.repository.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");

  if (!authorizationHeader) {
    const error = new Error("Token de autenticación requerido.");
    error.statusCode = 401;
    return next(error);
  }

  if (!/^Bearer [^\s]+$/.test(authorizationHeader)) {
    const error = new Error("Formato de token inválido.");
    error.statusCode = 401;
    return next(error);
  }

  const token = authorizationHeader.slice("Bearer ".length);
  let decoded;

  try {
    decoded = verifyToken(token);
  } catch (error) {
    const authenticationError = new Error("Token inválido o vencido.");
    authenticationError.statusCode = 401;
    return next(authenticationError);
  }

  try {
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      const error = new Error("Usuario no autorizado.");
      error.statusCode = 401;
      return next(error);
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
