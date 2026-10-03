import { clearCookieOptions } from "./cookieOptions";
import type { Response } from "express";
export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", clearCookieOptions);
  res.clearCookie("refreshToken", clearCookieOptions);
};
