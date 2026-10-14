// auth: middleware that reads the JWT from the Authorization header and attaches the user to the request, and checks the admin role. Owner: Gerald.
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
  const user = await User.findById(payload.sub);
  if (!user) return null;
  if ((payload.ver ?? 0) !== (user.tokenVersion ?? 0)) return null;
  return user;
}

export async function requireAuth(req, res, next) {
  const user = await userFromRequest(req);
  if (!user) throw httpError(401, "Please log in");
  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") throw httpError(403, "Admins only");
  next();
}

export async function optionalAuth(req, res, next) {
  req.user = await userFromRequest(req);
  next();
}
