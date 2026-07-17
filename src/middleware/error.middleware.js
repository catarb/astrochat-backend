export const errorHandler = (error, req, res, next) => {
  const isDuplicateKeyError = error.code === 11000;
  const isJwtError =
    error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
  const duplicateField = Object.keys(
    error.keyPattern || error.keyValue || {},
  )[0];
  const duplicateMessages = {
    email: "Ya existe un usuario registrado con ese correo.",
    name: "Ya existe un astro con ese nombre.",
    slug: "Ya existe un astro con ese slug.",
  };
  const statusCode = isJwtError
    ? 401
    : isDuplicateKeyError
      ? 409
      : error.statusCode || 500;
  const message = isJwtError
    ? "Token inválido o vencido."
    : isDuplicateKeyError
      ? duplicateMessages[duplicateField] ||
        "Ya existe un registro con esos datos."
      : error.message || "Error interno del servidor";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
