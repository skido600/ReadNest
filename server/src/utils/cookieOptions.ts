// utils/cookieOptions.ts
import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

const base: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const ACCESS_MAX_AGE = 15 * 60 * 1000;
export const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const accessCookie: CookieOptions = { ...base, maxAge: ACCESS_MAX_AGE };
export const refreshCookie: CookieOptions = {
  ...base,
  maxAge: REFRESH_MAX_AGE,
};

// for clearing: same options, but without maxAge
export const clearCookieOptions: CookieOptions = base;
