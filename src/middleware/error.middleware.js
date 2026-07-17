export const errorHandler = (error, req, res, next) => {
  const isDuplicateKeyError = error.code === 11000;
  const isJwtError =
    error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
  const statusCode = isJwtError
    ? 401
    : isDuplicateKeyError
      ? 409
      : error.statusCode || 500;
  const message = isJwtError
    ? "Token inválido o vencido."
    : isDuplicateKeyError
      ? "Ya existe un usuario registrado con ese correo."
      : error.message || "Error interno del servidor";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
