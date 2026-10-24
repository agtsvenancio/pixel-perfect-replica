// Admin session: a signed, httpOnly cookie. Password comes from the ADMIN_PASSWORD env var.
import { createHmac, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE = "ib_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env["ADMIN_SECRET"] || process.env["ADMIN_PASSWORD"];
  if (!s) throw new Error("ADMIN_PASSWORD is not configured");
  return `ib-admin:${s}`;
}

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function adminConfigured() {
  return Boolean(process.env["ADMIN_PASSWORD"]);
}

export function checkPassword(pw: string) {
  const expected = process.env["ADMIN_PASSWORD"];
  return Boolean(expected) && safeEqual(pw, expected!);
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
  if (!adminConfigured()) return false;
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
