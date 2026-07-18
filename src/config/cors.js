const LOCAL_FRONTEND_ORIGIN = "http://localhost:5173";

const normalizeOrigin = (origin) => origin?.trim().replace(/\/+$/, "");

const getAllowedOrigins = () =>
  new Set(
    [LOCAL_FRONTEND_ORIGIN, process.env.FRONTEND_URL]
      .map(normalizeOrigin)
      .filter(Boolean),
  );

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || getAllowedOrigins().has(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    const error = new Error("Origen no permitido por CORS.");
    error.statusCode = 403;
    callback(error);
  },
};
