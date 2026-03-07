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
import { loginRateLimiter } from "../middleware/rateLimit.ts";

const authroute: Router = express.Router();
authroute.post("/signup", validateRequest(CreateUserSchema), Signup);
authroute.post("/verifyemail", validateRequest(Otp), VerifyEmail);
authroute.post("/login", validateRequest(login), Login);
authroute.post(
  "/forget-password",
  validateRequest(Firstemailvalidate),
  forgotPassword
);
authroute.post("/verifycode", validateRequest(Verifycode), verifyCode);
authroute.put("/resetpassword", validateRequest(ResetPassword), resetPassword);
authroute.get("/logout", Logout);
export default authroute;
