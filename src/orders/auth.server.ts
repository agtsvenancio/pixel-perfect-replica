// Admin login (email + password) and session (signed, httpOnly cookie).
//
// The default admin account is built in. Its password is stored only as a salted scrypt hash.
// Environment variables can override it on any host:
//   ADMIN_EMAIL     – admin login email
//   ADMIN_PASSWORD  – admin password (kept only on the server)
//   ADMIN_SECRET    – optional key used to sign the session cookie
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE = "ib_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const DEFAULT_EMAIL = "319030st@gmail.com";
const DEFAULT_PASSWORD_HASH =
  "3108f2c2718f18df4c0fe9b1e56015b5:817e16a9caf98689112159c72ce0259b67c9439dcfa9ba05eb5c7195f108ea75"; // salt:scrypt(password)

const env = (k: string) => process.env[k] || undefined;

function adminEmail() {
  return (env("ADMIN_EMAIL") ?? DEFAULT_EMAIL).trim().toLowerCase();
}

function secret() {
  return `ib-admin:${env("ADMIN_SECRET") ?? env("ADMIN_PASSWORD") ?? DEFAULT_PASSWORD_HASH}`;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string | Buffer, b: string | Buffer) {
  const ba = Buffer.isBuffer(a) ? a : Buffer.from(a);
  const bb = Buffer.isBuffer(b) ? b : Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function passwordMatches(pw: string) {
  const plain = env("ADMIN_PASSWORD");
  if (plain) return safeEqual(pw, plain);
  const [salt, hash] = DEFAULT_PASSWORD_HASH.split(":");
  if (!salt || !hash) return false;
  return safeEqual(scryptSync(pw, salt, 32), Buffer.from(hash, "hex"));
}

/** An admin account always exists (built-in default, or overridden by env vars). */
export function adminConfigured() {
  return true;
}

export function checkCredentials(email: string, pw: string) {
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail());
  const pwOk = passwordMatches(pw); // always evaluated, so timing doesn't reveal which part failed
  return emailOk && pwOk;
}

export function startSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  setCookie(COOKIE, `${exp}.${sign(String(exp))}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endSession() {
  deleteCookie(COOKIE, { path: "/" });
}

export function isAdmin(): boolean {
  const raw = getCookie(COOKIE);
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) * 1000 < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

export function requireAdmin() {
  if (!isAdmin()) throw new Error("UNAUTHORIZED");
}
