// auth: middleware that reads the JWT from the Authorization header and attaches the user to the request. Owner: Gerald.
import { User } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";
import { httpError } from "../utils/http.js";

async function userFromRequest(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer")) return null;

  let payload;
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    return null;
  }
  return User.findById(payload.sub);
}

export async function requireAuth(req, res, next) {
  const user = await userFromRequest(req);
  if (!user) throw httpError(401, "Please log in");
  req.user = user;
  next();
}

export async function optionalAuth(req, res, next) {
  req.user = await userFromRequest(req);
  next();
}
