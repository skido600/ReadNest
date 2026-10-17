import express from "express";
import type { Router } from "express";
import {
  Signup,
  VerifyEmail,
  Login,
  forgotPassword,
  verifyCode,
  resetPassword,
  Logout,
} from "../controllers/user_controller.ts";
import validateRequest from "../middleware/validateRequest.ts";

import {
  CreateUserSchema,
  Otp,
  login,
  Firstemailvalidate,
  Verifycode,
  ResetPassword,
} from "../utils/validation.ts";
import {
  signupRateLimiter,
  otpRateLimiter,
  loginRateLimiter,
  forgotPasswordRateLimiter,
} from "../middleware/rateLimit.ts";
import { authMiddleware } from "../middleware/verifyToken.ts";

const authroute: Router = express.Router();
authroute.post(
  "/signup",
  signupRateLimiter,
  validateRequest(CreateUserSchema),
  Signup,
);
authroute.post(
  "/verify-email",
  otpRateLimiter,
  validateRequest(Otp),
  VerifyEmail,
);
authroute.post("/login", loginRateLimiter, validateRequest(login), Login);
authroute.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  validateRequest(Firstemailvalidate),
  forgotPassword,
);
authroute.post(
  "/verify-code",
  otpRateLimiter,
  validateRequest(Verifycode),
  verifyCode,
);
authroute.put(
  "/reset-password",
  otpRateLimiter,
  validateRequest(ResetPassword),
  resetPassword,
);
authroute.get("/logout", authMiddleware, Logout);
export default authroute;
