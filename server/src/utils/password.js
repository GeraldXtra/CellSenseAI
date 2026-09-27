// password: hashes and checks passwords with bcrypt. Owner: Gerald.
import bcrypt from "bcryptjs";

const ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
