import {
  type Request,
  type Response,
  type NextFunction,
  response,
} from "express";

import { userSession } from "../models/schema.ts";
import { db } from "../configs/dbconnection.ts";
import { HandleResponse } from "../utils/HandleResponse.ts";
import {
  registerUser,
  VerifyEmailService,
  LoginService,
  forgotPasswordService,
  verifyCodeService,
  resetPasswordService,
} from "../services/auth_service.ts";
import { eq } from "drizzle-orm";
import { clearAuthCookies } from "../utils/clearCookies.ts";

//regiter
export async function Signup(
  req: any,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user_name, email, password }: any = req.body;
    await registerUser(user_name, email, password);
    HandleResponse(
      res,
      true,
      201,
      "User registered successfully. Check your email for verification.",
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User already exists") {
        return HandleResponse(res, false, 409, error.message);
      } else {
        next(error);
      }
    }
  }
}

//verifyemail
export async function VerifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, code } = req.body;

    await VerifyEmailService(email, code);
    return HandleResponse(res, true, 200, "Email verified successfully");
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "User not found":
          return HandleResponse(res, false, 404, error.message);

        case "User already verified":
          return HandleResponse(res, false, 409, error.message);

        case "OTP expiry not set":
          return HandleResponse(res, false, 400, error.message);

        case "OTP expired":
          return HandleResponse(res, false, 410, error.message);

        case "Invalid verification code":
          return HandleResponse(res, false, 401, error.message);

        default:
          return HandleResponse(
            res,
            false,
            500,
            error.message || "Something went wrong",
          );
      }
    } else {
      next(error);
    }
  }
}

//login
export async function Login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const userIP = req.ip;
    const response = await LoginService(email, password);
    await db.insert(userSession).values({
      userId: response.user.id,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      ip_address: userIP || "unknown",
      lastSeen: new Date(),
    });
    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });
    const user = {
      user_id: response.user.id,
      email: response.user.email,
      user_name: response.user.user_name,
      role: response.user.role,
    };
    HandleResponse(res, true, 200, "Login successful", {
      ...user,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "User not found":
          return HandleResponse(res, false, 404, error.message);

        case "Your OTP expired. A new verification code has been sent to your email. Please check your inbox.":
          return HandleResponse(res, false, 403, error.message);

        case "check your email box and verify your email before logging in.":
          return HandleResponse(res, false, 403, error.message);

        case "Invalid email or password":
          return HandleResponse(res, false, 400, error.message);

        default:
          return HandleResponse(
            res,
            false,
            500,
            error.message || "Something went wrong",
          );
      }
    } else {
      next(error);
    }
  }
}

//forget password
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;
    const forgetpasswordres = await forgotPasswordService(email);

    return HandleResponse(
      res,
      true,
      200,
      forgetpasswordres.message,
      forgetpasswordres.email,
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found invalid email or username") {
        return HandleResponse(res, false, 400, error.message);
      } else {
        next(error);
      }
    }
  }
};
//  verifyCode
export const verifyCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, code } = req.body;
    const { forgetpasswordToken } = await verifyCodeService(email, code);

    return HandleResponse(
      res,
      true,
      200,
      "Code verified sucessfully",
      forgetpasswordToken,
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return HandleResponse(res, false, 404, error.message);
      } else if (error.message === "OTP expiry not set") {
        return HandleResponse(res, false, 400, error.message);
      } else if (error.message === "OTP expired") {
        return HandleResponse(res, false, 410, error.message);
      } else if (error.message === "Invalid verification code") {
        return HandleResponse(res, false, 400, error.message);
      } else {
        next(error);
      }
    }
  }
};

//reset password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { resetToken, newPassword, confirmNewpassword }: any = req.body;

    await resetPasswordService(resetToken, newPassword, confirmNewpassword);

    return HandleResponse(res, true, 200, "Password reset successful");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Passwords do not match") {
        return HandleResponse(res, false, 400, error.message);
      } else if (error.message === "User not found") {
        return HandleResponse(res, false, 404, error.message);
      } else if (error.message === "Invalid or expired reset token") {
        return HandleResponse(res, false, 400, error.message);
      } else if (error.message === "Reset token expired") {
        return HandleResponse(res, false, 400, error.message);
      } else {
        next(error);
      }
    }
  }
};

export const Logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // OPTIONAL: remove session from DB
    if (refreshToken) {
      await db
        .delete(userSession)
        .where(eq(userSession.refreshToken, refreshToken));
    }
    // Clear cookies (must match cookie options)
    clearAuthCookies(res);

    return HandleResponse(res, true, 200, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};
