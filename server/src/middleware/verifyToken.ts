import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../configs/dbconnection.ts";
import { userSession, usersTable } from "../models/schema.ts";
import { eq } from "drizzle-orm";
import { clearAuthCookies } from "../utils/clearCookies.ts";
import Tokens from "../utils/JWT_helper.ts";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  // No access token
  if (!accessToken && !refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  try {
    //  Verify access token
    if (accessToken) {
      const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as any;

      req.user = decoded;
      return next();
    }
  } catch (err: any) {
    //  Access token expired → try refresh token
    if (err.name !== "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid access token" });
    }

    // No refresh token → logout
    if (!refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
    }

    try {
      //  Verify refresh token
      const refreshPayload = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET
      ) as any;
      //  Validate session in DB
      const session = await db
        .select()
        .from(userSession)
        .where(eq(userSession.refreshToken, refreshToken));

      if (!session.length) {
        clearAuthCookies(res);
        return res
          .status(401)
          .json({ success: false, message: "Session invalid" });
      }
      // Get user from DB
      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, refreshPayload.id));

      if (!user.length) {
        clearAuthCookies(res);
        return res
          .status(401)
          .json({ success: false, message: "User not found, login again" });
      }

      const currentUser = user[0];
      if (!currentUser) {
        throw new Error("User not found");
      }

      //  Generate NEW access token
      const newAccessToken = Tokens.accessToken(currentUser);
      const newRefreshToken = Tokens.refreshToken(currentUser);
      await db
        .update(userSession)
        .set({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          lastSeen: new Date(),
        })
        .where(eq(userSession.userId, currentUser.id));
      //  Set new access token cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      //  Attach user and continue
      if (!currentUser.role) {
        throw new Error("User role not defined");
      }
      req.user = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      };
      return next();
    } catch {
      //  Refresh token expired or invalid → logout
      clearAuthCookies(res);
      return res.status(401).json({
        message: "Session expired, please login again",
      });
    }
  }
};
