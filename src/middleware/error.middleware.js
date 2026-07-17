export const errorHandler = (error, req, res, next) => {
  const isDuplicateKeyError = error.code === 11000;
  const statusCode = isDuplicateKeyError ? 409 : error.statusCode || 500;
  const message = isDuplicateKeyError
    ? "Ya existe un usuario registrado con ese correo."
    : error.message || "Error interno del servidor";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
