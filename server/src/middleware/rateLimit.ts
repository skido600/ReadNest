import rateLimit from "express-rate-limit";

const makeLimiter = (windowMinutes: number, limit: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true, // only failed attempts count
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

export const signupRateLimiter = makeLimiter(
  60,
  10,
  "Too many signup attempts. Try again later.",
);
export const otpRateLimiter = makeLimiter(
  15,
  5,
  "Too many code attempts. Try again later.",
);
export const forgotPasswordRateLimiter = makeLimiter(
  60,
  3,
  "Too many reset requests. Try again later.",
);
