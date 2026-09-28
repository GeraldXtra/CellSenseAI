// http: helpers for HTTP responses in the shared envelope shape. Owner: Gerald.
export function ok(res, data, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
