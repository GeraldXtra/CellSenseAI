// error: middleware that answers unknown paths with 404 and thrown errors with the envelope. Owner: Gerald.
import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({
    ok: false,
    error: { message: `No route for ${req.method} ${req.originalUrl}` },
  });
}

export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === "ValidationError" || err.name === "CastError") status = 400;
  if (err.code === 11000) {
    status = 409;
    message: "That value is already taken";
  }

  if (status >= 500) console.error(err);
  const showReal = status < 500 || env.NODE_ENV !== "production";
  res.status(status).json({
    ok: false,
    error: {
      message:
        showReal && message ? message : "Something went wrong on the server.",
    },
  });
}
