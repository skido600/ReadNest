import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../configs/dbconnection.ts";
import { userSession, usersTable } from "../models/schema.ts";
import { and, eq, gt } from "drizzle-orm";
import { clearAuthCookies } from "../utils/clearCookies.ts";
import Tokens from "../utils/JWT_helper.ts";
import {
  accessCookie,
  refreshCookie,
  REFRESH_MAX_AGE,
} from "../utils/cookieOptions.ts";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

const deny = (res: Response, message: string, clear = true) => {
  if (clear) clearAuthCookies(res);
  return res.status(401).json({ success: false, message });
};

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const accessToken: string | undefined = req.cookies?.accessToken;
  const refreshToken: string | undefined = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return deny(res, "Not authenticated");
  }

  // 1. Try the access token first
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET, {
        algorithms: ["HS256"],
      }) as { id: string; email: string; role: string };

      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
      return next();
    } catch (err: any) {
      // Anything other than "expired" is a bad/tampered token
      if (err.name !== "TokenExpiredError") {
        return deny(res, "Invalid access token", false);
      }
      // expired -> fall through to refresh flow
    }
  }

  // 2. Refresh flow (access token expired OR cookie already dropped by the browser)
  if (!refreshToken) {
    return deny(res, "Session expired, please login again");
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
    }) as { id: string };

    // Session must exist, match this token, and not be expired
    const [session] = await db
      .select()
      .from(userSession)
      .where(
        and(
          eq(userSession.refreshToken, refreshToken),
          eq(userSession.userId, payload.id),
          gt(userSession.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!session) return deny(res, "Session invalid");

    const [currentUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.id))
      .limit(1);

    if (!currentUser) return deny(res, "User not found, login again");
    if (!currentUser.role) return deny(res, "User role not defined");

    const newAccessToken = Tokens.accessToken(currentUser);
    const newRefreshToken = Tokens.refreshToken(currentUser);

    // Rotate ONLY this session, and only if the old token is still current.
    // The WHERE on the old token makes rotation atomic: if two requests race,
    // only one wins and the other gets zero rows back.
    const rotated = await db
      .update(userSession)
      .set({
        refreshToken: newRefreshToken,
        lastSeen: new Date(),
        expiresAt: new Date(Date.now() + REFRESH_MAX_AGE),
      })
      .where(
        and(
          eq(userSession.id, session.id),
          eq(userSession.refreshToken, refreshToken),
        ),
      )
      .returning({ id: userSession.id });

    if (!rotated.length) return deny(res, "Session invalid");

    res.cookie("accessToken", newAccessToken, accessCookie);
    res.cookie("refreshToken", newRefreshToken, refreshCookie);

    req.user = {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
    };
    return next();
  } catch (err) {
    console.error("Auth refresh failed:", err);
    return deny(res, "Session expired, please login again");
  }
};
